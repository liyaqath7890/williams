import { Op } from 'sequelize';
import { Alert, MissingPerson, Resource, Shelter, SosIncident, User } from '../models/index.js';

function dateWhere(query) {
  const where = {};
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt[Op.gte] = new Date(query.from);
    if (query.to) where.createdAt[Op.lte] = new Date(query.to);
  }
  return where;
}

function between(query) {
  return dateWhere(query);
}

function summarizeStatus(rows, key = 'status') {
  return rows.reduce((acc, row) => {
    const value = row[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export async function buildReport(query = {}) {
  const type = query.type || 'dashboard';
  const where = between(query);
  const [incidents, volunteers, shelters, resources, missingPersons, alerts] = await Promise.all([
    SosIncident.findAll({ where, order: [['createdAt', 'DESC']] }),
    User.findAll({ where: { role: 'helper', ...where }, order: [['createdAt', 'DESC']] }),
    Shelter.findAll({ where, order: [['createdAt', 'DESC']] }),
    Resource.findAll({ where, order: [['createdAt', 'DESC']] }),
    MissingPerson.findAll({ where, order: [['createdAt', 'DESC']] }),
    Alert.findAll({ where, order: [['createdAt', 'DESC']] })
  ]);

  const datasets = {
    dashboard: { incidents, volunteers, shelters, resources, missingPersons, alerts },
    incidents,
    volunteers,
    shelters,
    resources,
    missingPersons,
    alerts,
    analytics: {
      incidentStatus: summarizeStatus(incidents),
      shelterStatus: summarizeStatus(shelters),
      resourceStatus: summarizeStatus(resources),
      missingPersonStatus: summarizeStatus(missingPersons),
      alertSeverity: summarizeStatus(alerts, 'severity')
    }
  };

  return {
    type,
    generatedAt: new Date().toISOString(),
    filters: { from: query.from || null, to: query.to || null },
    summary: {
      incidents: incidents.length,
      volunteers: volunteers.length,
      shelters: shelters.length,
      shelterCapacity: shelters.reduce((sum, s) => sum + Number(s.capacity || 0), 0),
      shelterOccupancy: shelters.reduce((sum, s) => sum + Number(s.occupancy || 0), 0),
      resources: resources.length,
      resourceUnits: resources.reduce((sum, r) => sum + Number(r.quantity || 0), 0),
      missingPersons: missingPersons.length,
      alerts: alerts.length
    },
    data: datasets[type] || datasets.dashboard
  };
}

function flattenValue(value) {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function rowsForExport(report) {
  const data = Array.isArray(report.data) ? report.data : Object.entries(report.summary).map(([metric, value]) => ({ metric, value }));
  return data.map((row) => row.toJSON ? row.toJSON() : row);
}

export function toCsv(report) {
  const rows = rowsForExport(report);
  if (!rows.length) return 'No data\n';
  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((key) => set.add(key));
    return set;
  }, new Set()));
  const escape = (value) => `"${flattenValue(value).replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
}

export function toPdfBuffer(report) {
  const lines = [
    'AEGIS Disaster Platform Report',
    `Type: ${report.type}`,
    `Generated: ${report.generatedAt}`,
    'Summary',
    ...Object.entries(report.summary).map(([key, value]) => `${key}: ${value}`)
  ].slice(0, 32);
  const text = lines.map((line, index) => `BT /F1 12 Tf 50 ${760 - index * 18} Td (${String(line).replace(/[()\\]/g, '')}) Tj ET`).join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(text)} >> stream\n${text}\nendstream endobj`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}


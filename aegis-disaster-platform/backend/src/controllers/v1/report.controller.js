import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { buildReport, toCsv, toPdfBuffer } from '../../services/report.service.js';

export const getReport = asyncHandler(async (req, res) => {
  sendSuccess(res, await buildReport(req.query), 'Report loaded');
});

export const exportReport = asyncHandler(async (req, res) => {
  const report = await buildReport(req.query);
  const format = req.params.format;
  if (format === 'csv' || format === 'xlsx') {
    const csv = toCsv(report);
    res.setHeader('Content-Type', format === 'xlsx' ? 'application/vnd.ms-excel' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="aegis-${report.type}.${format === 'xlsx' ? 'xls' : 'csv'}"`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="aegis-${report.type}.pdf"`);
    return res.send(toPdfBuffer(report));
  }
  const error = new Error('Unsupported export format');
  error.statusCode = 400;
  throw error;
});


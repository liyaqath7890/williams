import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Calendar, Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import AegisTable from '../../components/common/AegisTable';
import { operationsService } from '../../services/operationsService';

const TYPES = [
  ['dashboard', 'Dashboard'],
  ['incidents', 'Incidents'],
  ['volunteers', 'Volunteers'],
  ['shelters', 'Shelters'],
  ['resources', 'Resources'],
  ['missingPersons', 'Missing Persons'],
  ['analytics', 'Analytics']
];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [filters, setFilters] = useState({ type: 'dashboard', from: '', to: '' });
  const [report, setReport] = useState(null);
  const [notice, setNotice] = useState('');
  const load = () => operationsService.getReport(filters).then((r) => setReport(r.data.data)).catch((e) => setNotice(e.response?.data?.message || 'Unable to load report'));
  useEffect(() => { load(); }, [filters.type]);
  const rows = useMemo(() => {
    if (!report) return [];
    if (Array.isArray(report.data)) return report.data;
    if (filters.type === 'analytics') return Object.entries(report.data).map(([metric, values]) => ({ metric, values: JSON.stringify(values) }));
    return Object.entries(report.summary).map(([metric, value]) => ({ metric, value }));
  }, [report, filters.type]);
  const columns = useMemo(() => {
    if (!rows.length) return [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }];
    return Object.keys(rows[0]).filter((key) => !['passwordHash', 'verificationToken'].includes(key)).slice(0, 6).map((key) => ({ key, label: key.replace(/([A-Z])/g, ' $1'), render: (value) => typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '') }));
  }, [rows]);
  const exportAs = async (format) => {
    const response = await operationsService.exportReport(format, filters);
    downloadBlob(response.data, `aegis-${filters.type}.${format === 'xlsx' ? 'xls' : format}`);
  };
  const summary = report?.summary || {};
  return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><PageHeader title="Reports" description="Live operational reports with filtered dashboards and export support." /><button onClick={() => window.print()} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600"><Printer className="h-4 w-4" />Print</button></div>{notice && <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</div>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard icon={BarChart3} label="Incidents" value={String(summary.incidents || 0)} helper="In date range" tone="danger" /><StatCard icon={FileText} label="Shelters" value={String(summary.shelters || 0)} helper={`${summary.shelterOccupancy || 0}/${summary.shelterCapacity || 0} occupied`} tone="indigo" /><StatCard icon={FileSpreadsheet} label="Resources" value={String(summary.resourceUnits || 0)} helper="Total units" tone="amber" /><StatCard icon={Calendar} label="Missing Persons" value={String(summary.missingPersons || 0)} helper="Tracked cases" tone="slate" /><StatCard icon={Download} label="Alerts" value={String(summary.alerts || 0)} helper="Published warnings" /></div><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4"><div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between"><div className="flex flex-wrap gap-2">{TYPES.map(([value, label]) => <button key={value} onClick={() => setFilters((f) => ({ ...f, type: value }))} className={`rounded-xl px-3 py-2 text-xs font-bold ${filters.type === value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{label}</button>)}</div><div className="flex flex-wrap gap-2"><input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" /><input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" /><button onClick={load} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Apply</button></div></div><div className="flex flex-wrap gap-2"><button onClick={() => exportAs('csv')} className="rounded-xl border px-3 py-2 text-xs font-bold text-slate-600">CSV Export</button><button onClick={() => exportAs('xlsx')} className="rounded-xl border px-3 py-2 text-xs font-bold text-slate-600">Excel Export</button><button onClick={() => exportAs('pdf')} className="rounded-xl border px-3 py-2 text-xs font-bold text-slate-600">PDF Export</button></div></section><AegisTable title="Report Results" columns={columns} data={rows} /></div>;
}

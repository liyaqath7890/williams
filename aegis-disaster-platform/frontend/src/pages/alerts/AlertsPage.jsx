import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AlertTriangle, Bell, Radio, ShieldAlert, Trash2, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { pushAlert } from '../../redux/features/alerts/alertsSlice';
import { operationsService } from '../../services/operationsService';
import { socket } from '../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../sockets/socketEvents';

const SEVERITY = { info: { label: 'Info', bg: 'bg-blue-100 text-blue-700', bar: 'bg-blue-400' }, warning: { label: 'Warning', bg: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400' }, danger: { label: 'Danger', bg: 'bg-red-100 text-red-700', bar: 'bg-red-500' }, critical: { label: 'Critical', bg: 'bg-rose-200 text-rose-800', bar: 'bg-rose-600' } };
const EMPTY = { title: '', message: '', severity: 'warning', region: '', audience: ['victim', 'helper', 'authority', 'admin'] };
const AUDIENCES = ['victim', 'helper', 'authority', 'admin'];

export default function AlertsPage() {
  const dispatch = useDispatch();
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState('');

  useEffect(() => { operationsService.listAlerts().then((r) => setAlerts(r.data.data)).catch((e) => setNotice(e.response?.data?.message || 'Unable to load alerts')); }, []);
  useEffect(() => {
    const upsert = (alert) => setAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)]);
    const remove = ({ id }) => setAlerts((prev) => prev.filter((a) => a.id !== id));
    socket.on(SOCKET_EVENTS.ALERT_BROADCAST, upsert);
    socket.on(SOCKET_EVENTS.ALERT_DELETED, remove);
    return () => { socket.off(SOCKET_EVENTS.ALERT_BROADCAST, upsert); socket.off(SOCKET_EVENTS.ALERT_DELETED, remove); };
  }, []);

  const toggleAudience = (role) => setForm((f) => ({ ...f, audience: f.audience.includes(role) ? f.audience.filter((r) => r !== role) : [...f.audience, role] }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await operationsService.publishAlert(form);
    const saved = response.data.data;
    setAlerts((prev) => [saved, ...prev]);
    dispatch(pushAlert(saved));
    setNotice('Alert published');
    setForm(EMPTY);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    await operationsService.deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setNotice('Alert deleted');
  };

  const visible = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);
  const counts = { critical: alerts.filter((a) => a.severity === 'critical').length, danger: alerts.filter((a) => a.severity === 'danger').length, warning: alerts.filter((a) => a.severity === 'warning').length };

  return <div className="space-y-6"><PageHeader title="Emergency Alerts" description="Publish targeted warnings with severity levels and real-time notifications." />{notice && <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</div>}<div className="grid gap-4 sm:grid-cols-3"><StatCard icon={ShieldAlert} label="Critical Alerts" value={String(counts.critical)} helper="Require immediate action" tone="danger" /><StatCard icon={AlertTriangle} label="Danger Warnings" value={String(counts.danger)} helper="High-risk advisories" tone="amber" /><StatCard icon={Bell} label="All Active" value={String(alerts.length)} helper="Across all regions" /></div><div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 h-fit"><div className="flex items-center gap-2 mb-1"><Radio className="h-5 w-5 text-indigo-600" /><h3 className="font-black text-slate-900">Alert Composer</h3></div><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /><input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Region" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} /><div className="grid grid-cols-4 gap-2">{Object.keys(SEVERITY).map((s) => <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, severity: s }))} className={`py-2 rounded-xl text-xs font-bold capitalize border-2 ${form.severity === s ? `${SEVERITY[s].bg} border-current` : 'border-slate-200 text-slate-500'}`}>{s}</button>)}</div><textarea required rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none" placeholder="Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} /><div className="flex flex-wrap gap-2">{AUDIENCES.map((role) => <button key={role} type="button" onClick={() => toggleAudience(role)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${form.audience.includes(role) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{role}</button>)}</div><button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl"><Plus className="h-4 w-4" />Publish Alert</button></form><div className="space-y-3"><div className="flex items-center gap-2 flex-wrap">{['all', ...Object.keys(SEVERITY)].map((s) => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{s}</button>)}</div>{visible.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" /><p className="text-slate-500 text-sm">No alerts in this category.</p></div> : visible.map((alert) => { const cfg = SEVERITY[alert.severity] || SEVERITY.warning; return <article key={alert.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"><div className={`h-1 ${cfg.bar}`} /><div className="p-4 flex items-start justify-between gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><h3 className="font-bold text-slate-900 text-sm">{alert.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${cfg.bg}`}>{cfg.label}</span></div><p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{alert.message}</p>{alert.region && <p className="mt-2 text-xs text-slate-400 font-semibold">Region: {alert.region}</p>}<div className="mt-2 flex gap-1.5 flex-wrap">{alert.audience?.map((role) => <span key={role} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 capitalize">{role}</span>)}</div></div><button onClick={() => handleDelete(alert.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="h-4 w-4" /></button></div></article>; })}</div></div></div>;
}

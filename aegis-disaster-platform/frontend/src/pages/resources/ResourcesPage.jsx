import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Package, Droplets, Heart, Wrench, Truck, Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import AegisTable from '../../components/common/AegisTable';
import { operationsService } from '../../services/operationsService';
import { socket } from '../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../sockets/socketEvents';

const CATEGORY_ICONS = { food: Package, water: Droplets, medical: Heart, equipment: Wrench, transport: Truck, vehicle: Truck, other: Package };
const STATUS_COLORS = { available: 'bg-green-100 text-green-700', reserved: 'bg-amber-100 text-amber-700', deployed: 'bg-blue-100 text-blue-700', depleted: 'bg-red-100 text-red-700' };
const EMPTY = { name: '', category: 'food', quantity: '', unit: '', status: 'available', assignedTo: '' };

export default function ResourcesPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [query, setQuery] = useState({ search: '', status: 'all', category: 'all', page: 1, limit: 10 });
  const [page, setPage] = useState({ page: 1, totalPages: 1 });
  const [notice, setNotice] = useState('');

  const load = () => operationsService.listResources(query).then((r) => { const data = r.data.data; setItems(data.rows || data); setPage({ page: data.page || 1, totalPages: data.totalPages || 1 }); }).catch((e) => setNotice(e.response?.data?.message || 'Unable to load resources'));
  useEffect(() => { load(); }, [query.status, query.category, query.page]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [query.search]);
  useEffect(() => {
    const handler = ({ action, resource }) => {
      if (action === 'deleted') setItems((prev) => prev.filter((r) => r.id !== resource.id));
      if (action === 'created') setItems((prev) => [resource, ...prev.filter((r) => r.id !== resource.id)]);
      if (action === 'updated') setItems((prev) => prev.map((r) => r.id === resource.id ? resource : r));
    };
    socket.on(SOCKET_EVENTS.RESOURCE_CHANGED, handler);
    return () => socket.off(SOCKET_EVENTS.RESOURCE_CHANGED, handler);
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, category: row.category, quantity: row.quantity, unit: row.unit || '', status: row.status, assignedTo: row.assignedTo || '' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form, quantity: Number(form.quantity), assignment: form.assignedTo ? { assignedAt: new Date().toISOString(), assignedTo: form.assignedTo } : {} };
    const response = editing ? await operationsService.updateResource(editing.id, payload) : await operationsService.createResource(payload);
    const saved = response.data.data;
    setItems((prev) => editing ? prev.map((r) => r.id === saved.id ? saved : r) : [saved, ...prev]);
    setNotice(editing ? 'Resource updated' : 'Resource created');
    closeModal();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Remove "${row.name}" from inventory?`)) return;
    await operationsService.deleteResource(row.id);
    setItems((prev) => prev.filter((r) => r.id !== row.id));
    setNotice('Resource deleted');
  };

  const totals = useMemo(() => ({ available: items.filter((r) => r.status === 'available').length, deployed: items.filter((r) => r.status === 'deployed').length, reserved: items.filter((r) => r.status === 'reserved').length }), [items]);
  const columns = [
    { key: 'name', label: 'Resource', render: (val, row) => { const Icon = CATEGORY_ICONS[row.category] || Package; return <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Icon className="h-4 w-4 text-indigo-600" /></div><span className="font-bold text-slate-900 text-sm">{val}</span></div>; } },
    { key: 'category', label: 'Category', render: (val) => <span className="capitalize text-sm text-slate-600">{val}</span> },
    { key: 'quantity', label: 'Quantity', render: (val, row) => <span className="font-semibold text-slate-800">{val} <span className="text-slate-400 font-normal text-xs">{row.unit}</span></span> },
    { key: 'assignedTo', label: 'Assigned To', render: (val) => val || 'Unassigned' },
    { key: 'status', label: 'Status', render: (val) => <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[val] || 'bg-slate-100 text-slate-600'}`}>{val}</span> }
  ];

  return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><PageHeader title="Resource Management" description="Live inventory, assignment, status, and dispatch tracking." /><button onClick={openAdd} className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200"><Plus className="w-4 h-4" />Add Resource</button></div>{notice && <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</div>}<div className="grid gap-4 sm:grid-cols-4"><StatCard icon={Package} label="Total Items" value={String(items.length)} helper="In inventory" /><StatCard icon={Package} label="Available" value={String(totals.available)} helper="Ready for dispatch" tone="indigo" /><StatCard icon={Truck} label="Deployed" value={String(totals.deployed)} helper="In active use" tone="amber" /><StatCard icon={Heart} label="Reserved" value={String(totals.reserved)} helper="Allocated to ops" tone="slate" /></div><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Search resources" value={query.search} onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))} /></div><select className="bg-white border border-slate-200 rounded-xl px-3 text-sm" value={query.category} onChange={(e) => setQuery((q) => ({ ...q, category: e.target.value, page: 1 }))}><option value="all">All categories</option>{Object.keys(CATEGORY_ICONS).map((c) => <option key={c} value={c}>{c}</option>)}</select><select className="bg-white border border-slate-200 rounded-xl px-3 text-sm" value={query.status} onChange={(e) => setQuery((q) => ({ ...q, status: e.target.value, page: 1 }))}><option value="all">All status</option>{Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}</select></div><AegisTable title="Resource Inventory" columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} /><div className="flex justify-end gap-2"><button disabled={query.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40">Prev</button><span className="px-3 py-2 text-sm font-bold">{page.page}/{page.totalPages}</span><button disabled={query.page >= page.totalPages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40">Next</button></div>{modal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} /><div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"><div className="bg-indigo-600 px-6 py-5 text-white flex justify-between items-center"><h3 className="text-xl font-bold">{editing ? 'Update Resource' : 'Add Resource'}</h3><button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button></div><form onSubmit={handleSave} className="p-6 space-y-4"><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Resource name" /><div className="grid grid-cols-2 gap-4"><select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm">{Object.keys(CATEGORY_ICONS).map((c) => <option key={c} value={c}>{c}</option>)}</select><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm">{Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><input required type="number" min="0" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Quantity" /><input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Unit" /></div><input value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Assigned team or shelter" /><button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl">Save Resource</button></form></div></div>}</div>;
}

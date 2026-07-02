import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import AegisTable from '../../components/common/AegisTable';
import { Warehouse, Plus, Users, Heart, Package, X, Search } from 'lucide-react';
import { operationsService } from '../../services/operationsService';
import { socket } from '../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../sockets/socketEvents';

const EMPTY = { name: '', capacity: '', occupancy: '', contactNumber: '', address: '', foodStockDays: '', medicalStockLevel: 'adequate', status: 'open' };

const normalize = (payload) => ({
  name: payload.name,
  capacity: Number(payload.capacity) || 0,
  occupancy: Number(payload.occupancy) || 0,
  contactNumber: payload.contactNumber,
  location: { address: payload.address },
  foodStockDays: Number(payload.foodStockDays) || 0,
  medicalStockLevel: payload.medicalStockLevel,
  status: payload.status
});

export default function ShelterPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [query, setQuery] = useState({ search: '', status: 'all', page: 1, limit: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY);
  const [notice, setNotice] = useState('');

  const load = () => operationsService.listShelters(query).then((r) => {
    const data = r.data.data;
    setItems(data.rows || data);
    setPagination({ page: data.page || 1, totalPages: data.totalPages || 1 });
  }).catch((error) => setNotice(error.response?.data?.message || 'Unable to load shelters'));

  useEffect(() => { load(); }, [query.page, query.status]);
  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [query.search]);
  useEffect(() => {
    const handler = ({ action, shelter }) => {
      if (action === 'deleted') setItems((prev) => prev.filter((item) => item.id !== shelter.id));
      if (action === 'created') setItems((prev) => [shelter, ...prev.filter((item) => item.id !== shelter.id)]);
      if (action === 'updated') setItems((prev) => prev.map((item) => item.id === shelter.id ? shelter : item));
    };
    socket.on(SOCKET_EVENTS.SHELTER_CHANGED, handler);
    return () => socket.off(SOCKET_EVENTS.SHELTER_CHANGED, handler);
  }, []);

  const columns = [
    { key: 'name', label: 'Shelter Name', render: (val) => <span className="font-bold text-slate-900">{val}</span> },
    { key: 'location', label: 'Location', render: (loc) => loc?.address || 'Unassigned' },
    { key: 'occupancy', label: 'Occupancy', render: (val, row) => {
      const percent = row.capacity ? Math.round((val / row.capacity) * 100) : 0;
      return <div className="w-32"><div className="flex justify-between text-[10px] mb-1 font-bold text-slate-500"><span>{val}/{row.capacity}</span><span>{percent}%</span></div><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div></div>;
    } },
    { key: 'status', label: 'Availability', render: (val) => <span className="capitalize font-bold text-slate-700">{val}</span> },
    { key: 'foodStockDays', label: 'Food Supply', render: (val) => <span className={`font-bold ${val < 3 ? 'text-red-600' : 'text-slate-700'}`}>{val} days</span> },
    { key: 'medicalStockLevel', label: 'Medical', render: (val) => <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 text-indigo-700">{val}</span> }
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = normalize(formData);
    const response = editingItem ? await operationsService.updateShelter(editingItem.id, payload) : await operationsService.createShelter(payload);
    const saved = response.data.data;
    setItems((prev) => editingItem ? prev.map((i) => i.id === saved.id ? saved : i) : [saved, ...prev]);
    setNotice(editingItem ? 'Shelter updated' : 'Shelter created');
    closeModal();
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item, address: item.location?.address || '' } : EMPTY);
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); };
  const handleDelete = async (row) => {
    if (!window.confirm(`Decommission ${row.name}?`)) return;
    await operationsService.deleteShelter(row.id);
    setItems((prev) => prev.filter((i) => i.id !== row.id));
    setNotice('Shelter deleted');
  };

  const totalCapacity = useMemo(() => items.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0), [items]);
  const totalOccupancy = useMemo(() => items.reduce((acc, curr) => acc + (Number(curr.occupancy) || 0), 0), [items]);
  const avgFood = items.length ? (items.reduce((a, s) => a + Number(s.foodStockDays || 0), 0) / items.length).toFixed(1) : '0';

  return <div className="space-y-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"><PageHeader title="Shelter Logistics" description="Live evacuation center capacity, availability, and supply management." /><button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl shadow-xl shadow-indigo-200 flex items-center gap-2"><Plus className="w-5 h-5" />Add Shelter</button></div>
    {notice && <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</div>}
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"><StatCard icon={Warehouse} label="Total Shelters" value={String(items.length)} helper="Operational centers" tone="indigo" /><StatCard icon={Users} label="Current Occupancy" value={String(totalOccupancy)} helper={`Out of ${totalCapacity} spots`} tone={totalOccupancy / Math.max(totalCapacity, 1) > 0.8 ? 'danger' : 'indigo'} /><StatCard icon={Package} label="Avg Food Stock" value={avgFood} helper="Days of supply left" tone="amber" /><StatCard icon={Heart} label="Open Shelters" value={String(items.filter((s) => s.status === 'open').length)} helper="Accepting evacuees" tone="slate" /></div>
    <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Search shelters" value={query.search} onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))} /></div><select className="bg-white border border-slate-200 rounded-xl px-3 text-sm" value={query.status} onChange={(e) => setQuery((q) => ({ ...q, status: e.target.value, page: 1 }))}><option value="all">All status</option><option value="open">Open</option><option value="full">Full</option><option value="closed">Closed</option></select></div>
    <AegisTable title="Evacuation Inventory" columns={columns} data={items} onEdit={openModal} onDelete={handleDelete} />
    <div className="flex justify-end gap-2"><button disabled={query.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40">Prev</button><span className="px-3 py-2 text-sm font-bold">{pagination.page}/{pagination.totalPages}</span><button disabled={query.page >= pagination.totalPages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40">Next</button></div>
    {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} /><div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"><div className="bg-indigo-600 p-6 text-white flex justify-between items-center"><h3 className="text-xl font-bold">{editingItem ? 'Update Shelter' : 'Register Shelter'}</h3><button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-6 h-6" /></button></div><form onSubmit={handleSave} className="p-8 space-y-4"><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm" placeholder="Shelter name" /><input value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm" placeholder="Address" /><div className="grid grid-cols-2 gap-4"><input type="number" required value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm" placeholder="Capacity" /><input type="number" required value={formData.occupancy} onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm" placeholder="Occupancy" /></div><div className="grid grid-cols-2 gap-4"><input type="number" value={formData.foodStockDays} onChange={(e) => setFormData({ ...formData, foodStockDays: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm" placeholder="Food days" /><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm"><option value="open">Open</option><option value="full">Full</option><option value="closed">Closed</option></select></div><select value={formData.medicalStockLevel} onChange={(e) => setFormData({ ...formData, medicalStockLevel: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm"><option value="adequate">Adequate</option><option value="low">Low</option><option value="critical">Critical</option><option value="plentiful">Plentiful</option></select><button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl">Save Shelter</button></form></div></div>}
  </div>;
}

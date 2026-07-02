import { useEffect, useState } from 'react';
import { Search, Plus, X, UserX, Eye, CheckCircle, AlertCircle, Clock, Upload } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { operationsService } from '../../services/operationsService';
import { socket } from '../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../sockets/socketEvents';

const STATUS_CONFIG = { missing: { label: 'Missing', color: 'bg-red-100 text-red-700', icon: AlertCircle }, sighted: { label: 'Sighted', color: 'bg-amber-100 text-amber-700', icon: Eye }, found: { label: 'Found', color: 'bg-green-100 text-green-700', icon: CheckCircle } };
const EMPTY_FORM = { fullName: '', age: '', gender: 'Unknown', lastSeenAddress: '', description: '', status: 'missing', familyName: '', familyPhone: '', notesText: '', photoUrl: '' };

export default function MissingPersonsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState({ search: '', status: 'all', page: 1, limit: 10 });
  const [page, setPage] = useState({ page: 1, totalPages: 1 });
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [notice, setNotice] = useState('');

  const load = () => operationsService.listMissingPersons(query).then((r) => { const data = r.data.data; setItems(data.rows || data); setPage({ page: data.page || 1, totalPages: data.totalPages || 1 }); }).catch((e) => setNotice(e.response?.data?.message || 'Unable to load cases'));
  useEffect(() => { load(); }, [query.status, query.page]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [query.search]);
  useEffect(() => {
    const handler = ({ action, person }) => {
      if (action === 'deleted') setItems((prev) => prev.filter((p) => p.id !== person.id));
      if (action === 'created') {
        setItems((prev) => {
          const exists = prev.some((p) => p.id === person.id);
          return exists ? prev : [person, ...prev];
        });
      }
      if (action === 'updated') setItems((prev) => prev.map((p) => p.id === person.id ? person : p));
    };
    socket.on(SOCKET_EVENTS.MISSING_PERSON_CHANGED, handler);
    return () => socket.off(SOCKET_EVENTS.MISSING_PERSON_CHANGED, handler);
  }, []);

  const counts = { missing: items.filter((p) => p.status === 'missing').length, sighted: items.filter((p) => p.status === 'sighted').length, found: items.filter((p) => p.status === 'found').length };
  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ fullName: p.fullName, age: p.age || '', gender: p.gender || 'Unknown', lastSeenAddress: p.lastSeenLocation?.address || '', description: p.description || '', status: p.status, familyName: p.familyContact?.name || '', familyPhone: p.familyContact?.phone || '', notesText: (p.notes || []).map((n) => n.text).join('\n'), photoUrl: p.photoUrl || '' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    const response = await operationsService.uploadFile(data);
    setForm((f) => ({ ...f, photoUrl: response.data.data.url }));
  };

  const payloadFromForm = () => ({
    fullName: form.fullName,
    age: Number(form.age) || null,
    gender: form.gender,
    lastSeenLocation: { address: form.lastSeenAddress },
    description: form.description,
    status: form.status,
    photoUrl: form.photoUrl,
    familyContact: { name: form.familyName, phone: form.familyPhone },
    notes: form.notesText.split('\n').filter(Boolean).map((text) => ({ at: new Date().toISOString(), text }))
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const response = editing ? await operationsService.updateMissingPerson(editing.id, payloadFromForm()) : await operationsService.createMissingPerson(payloadFromForm());
    const saved = response.data.data;
    setItems((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev];
    });
    setNotice(editing ? 'Case updated' : 'Case created');
    closeModal();
  };

  const cycleStatus = async (person) => {
    const order = ['missing', 'sighted', 'found'];
    const next = order[(order.indexOf(person.status) + 1) % order.length];
    const response = await operationsService.updateMissingPersonStatus(person.id, next);
    const saved = response.data.data;
    setItems((prev) => prev.map((p) => p.id === saved.id ? saved : p));
  };
  const handleDelete = async (id) => { if (!window.confirm('Remove this missing person report?')) return; await operationsService.deleteMissingPerson(id); setItems((prev) => prev.filter((p) => p.id !== id)); setNotice('Case deleted'); };

  return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><PageHeader title="Missing Person Tracking" description="Persisted case records, sightings, family contacts, images, timelines, and notes." /><button onClick={openAdd} className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200"><Plus className="w-4 h-4" />Report Missing Person</button></div>{notice && <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</div>}<div className="grid gap-4 sm:grid-cols-3"><StatCard icon={AlertCircle} label="Still Missing" value={String(counts.missing)} helper="Active search cases" tone="danger" /><StatCard icon={Eye} label="Sighted" value={String(counts.sighted)} helper="Awaiting confirmation" tone="amber" /><StatCard icon={CheckCircle} label="Found" value={String(counts.found)} helper="Successfully reunited" tone="indigo" /></div><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Search cases" value={query.search} onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))} /></div><div className="flex gap-2">{['all', 'missing', 'sighted', 'found'].map((s) => <button key={s} onClick={() => setQuery((q) => ({ ...q, status: s, page: 1 }))} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize ${query.status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{s}</button>)}</div></div>{items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center"><UserX className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-slate-500 font-semibold">No reports match your filters.</p></div> : <div className="grid gap-4 lg:grid-cols-2">{items.map((person) => { const cfg = STATUS_CONFIG[person.status] || STATUS_CONFIG.missing; const StatusIcon = cfg.icon; return <article key={person.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3">{person.photoUrl ? <img src={person.photoUrl} className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg">{person.fullName?.charAt(0) || '?'}</div>}<div><h3 className="font-bold text-slate-900">{person.fullName}</h3><p className="text-xs text-slate-500">{person.age ? `Age ${person.age}` : 'Age unknown'} - {person.gender || 'Unknown'}</p></div></div><button onClick={() => cycleStatus(person)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${cfg.color}`}><StatusIcon className="h-3 w-3" />{cfg.label}</button></div>{person.description && <p className="mt-3 text-sm text-slate-600 leading-relaxed">{person.description}</p>}<div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><Clock className="inline h-3 w-3 text-slate-400 mr-1" />Last seen: {person.lastSeenLocation?.address || 'Unknown location'}</div>{person.familyContact?.phone && <p className="mt-2 text-xs text-slate-500 font-semibold">Family: {person.familyContact.name} - {person.familyContact.phone}</p>}{person.notes && person.notes.length > 0 && <div className="mt-3 space-y-1"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sightings Timeline</p><div className="space-y-1 mt-1 max-h-24 overflow-y-auto pr-1">{person.notes.map((note, noteIdx) => <div key={noteIdx} className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-[11px] text-slate-600"><span className="font-bold text-indigo-600">Sighting: </span>{note.text}</div>)}</div></div>}<div className="mt-4 flex gap-2"><button onClick={() => openEdit(person)} className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600">Edit Report</button><button onClick={() => handleDelete(person.id)} className="rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-500"><X className="h-3.5 w-3.5" /></button></div></article>; })}</div>}<div className="flex justify-end gap-2"><button disabled={query.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40">Prev</button><span className="px-3 py-2 text-sm font-bold">{page.page}/{page.totalPages}</span><button disabled={query.page >= page.totalPages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40">Next</button></div>{modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} /><div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"><div className="bg-indigo-600 px-6 py-5 text-white flex justify-between items-center"><h3 className="text-xl font-bold">{editing ? 'Update Report' : 'Register Missing Person'}</h3><button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button></div><form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"><input required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Full name" /><div className="grid grid-cols-2 gap-4"><input type="number" min="0" max="120" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Age" /><select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm"><option>Unknown</option><option>Male</option><option>Female</option><option>Other</option></select></div><input value={form.lastSeenAddress} onChange={(e) => setForm((f) => ({ ...f, lastSeenAddress: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Last seen location" /><textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm resize-none" placeholder="Description" /><div className="grid grid-cols-2 gap-4"><input value={form.familyName} onChange={(e) => setForm((f) => ({ ...f, familyName: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Family contact" /><input value={form.familyPhone} onChange={(e) => setForm((f) => ({ ...f, familyPhone: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm" placeholder="Family phone" /></div><textarea rows={3} value={form.notesText} onChange={(e) => setForm((f) => ({ ...f, notesText: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm resize-none" placeholder="Notes, one per line" /><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 cursor-pointer"><Upload className="h-4 w-4" />Upload image<input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0])} /></label><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm"><option value="missing">Missing</option><option value="sighted">Sighted</option><option value="found">Found</option></select><button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl">Save Case</button></form></div></div>}</div>;
}

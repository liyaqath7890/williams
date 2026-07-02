import { useEffect, useState } from 'react';
import { CloudUpload, Download, FileImage, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { operationsService } from '../../services/operationsService';

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/csv'];

export default function UploadCenterPage() {
  const [uploads, setUploads] = useState([]);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [notice, setNotice] = useState('');

  const load = () => operationsService.listUploads().then((r) => setUploads(r.data.data)).catch((e) => setNotice(e.response?.data?.message || 'Unable to load uploads'));
  useEffect(() => { load(); }, []);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED.includes(file.type)) { setNotice('Unsupported file type'); return; }
    if (file.size > MAX_SIZE) { setNotice('File must be 10 MB or smaller'); return; }
    setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    const data = new FormData();
    data.append('file', file);
    data.append('metadata', JSON.stringify({ source: 'upload-center' }));
    setStatus('loading');
    setProgress(0);
    try {
      const response = await operationsService.uploadFile(data, (evt) => setProgress(Math.round((evt.loaded / Math.max(evt.total || file.size, 1)) * 100)));
      setUploads((prev) => [response.data.data, ...prev]);
      setNotice('Upload complete');
    } catch (error) {
      setNotice(error.response?.data?.message || 'Upload failed');
    } finally {
      setStatus('idle');
    }
  };

  const deleteUpload = async (id) => {
    if (!window.confirm('Delete this upload?')) return;
    await operationsService.deleteUpload(id);
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
    setNotice('Upload deleted');
  };

  return <div className="space-y-6"><PageHeader title="File Upload Center" description="Cloudinary-backed evidence, case image, and document storage." />{notice && <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</div>}<section className="rounded-lg border border-slate-200 bg-white p-6"><label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center hover:bg-slate-100"><CloudUpload className="h-10 w-10 text-aegis-primary" /><span className="mt-3 font-bold text-slate-950">{status === 'loading' ? `Uploading ${progress}%` : 'Choose evidence image or document'}</span><span className="mt-1 text-sm text-slate-500">Images, PDF, or CSV up to 10 MB.</span><input className="hidden" onChange={handleUpload} type="file" accept={ALLOWED.join(',')} /></label>{status === 'loading' && <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div>}{preview && <img src={preview} alt="Upload preview" className="mt-6 max-h-64 rounded-xl border border-slate-200 object-contain" />}</section><section className="grid gap-4 lg:grid-cols-2">{uploads.map((upload) => <article key={upload.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3 min-w-0">{upload.mimeType?.startsWith('image/') ? <img src={upload.url} className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-indigo-50 flex items-center justify-center"><FileImage className="h-6 w-6 text-indigo-600" /></div>}<div className="min-w-0"><p className="font-bold text-slate-900 truncate">{upload.originalName}</p><p className="text-xs text-slate-500">{Math.round((upload.size || 0) / 1024)} KB - {upload.storageProvider}</p></div></div><div className="flex gap-2"><a href={upload.url} download target="_blank" rel="noreferrer" className="rounded-xl border p-2 text-slate-500 hover:text-indigo-600"><Download className="h-4 w-4" /></a><button onClick={() => deleteUpload(upload.id)} className="rounded-xl border border-red-100 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></div></article>)}</section></div>;
}

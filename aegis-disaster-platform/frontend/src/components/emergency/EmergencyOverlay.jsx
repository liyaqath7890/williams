import { AlertTriangle, RadioTower, X } from 'lucide-react';

export default function EmergencyOverlay({ incident, onClose, visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/80 p-4">
      <div className="absolute inset-0 animate-pulse bg-red-600/20" />
      <section className="relative w-full max-w-lg rounded-lg border border-red-300 bg-white p-6 shadow-2xl">
        <button className="absolute right-3 top-3 rounded-md p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
          <X className="h-5 w-5" />
        </button>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-950">Emergency SOS transmitted</h2>
        <p className="mt-2 text-slate-600">
          Your distress request is live. Authorities are being notified through the rescue operations channel.
        </p>
        <div className="mt-5 rounded-md border border-red-100 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <RadioTower className="h-4 w-4" />
            Live incident
          </div>
          <p className="mt-2 text-sm text-red-700">{incident?.disasterType || 'Emergency rescue'} · {incident?.severity || 'critical'}</p>
          <p className="mt-1 text-xs text-red-600">{incident?.location?.address || 'Location shared'}</p>
        </div>
      </section>
    </div>
  );
}

const defaultIncidents = [
  { id: 'INC-2041', title: 'Flood rescue request', meta: 'East Bank sector', priority: 'critical' },
  { id: 'INC-2038', title: 'Medical aid needed', meta: 'Shelter 12 triage desk', priority: 'high' },
  { id: 'INC-2031', title: 'Shelter capacity update', meta: 'Central High School', priority: 'normal' }
];

const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  normal: 'bg-slate-100 text-slate-600'
};

export default function IncidentList({ incidents = defaultIncidents, title = 'Active Incidents' }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-950">{title}</h3>
      </div>
      {incidents.map((incident) => (
        <div key={incident.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0">
          <div>
            <p className="font-medium text-slate-900">{incident.title}</p>
            <p className="text-sm text-slate-500">{incident.id} · {incident.meta}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[incident.priority]}`}>
            {incident.priority}
          </span>
        </div>
      ))}
    </div>
  );
}

const resources = [
  { label: 'Food packs', value: 680, max: 900, color: 'bg-teal-600' },
  { label: 'Water units', value: 1240, max: 1500, color: 'bg-cyan-600' },
  { label: 'Medical kits', value: 214, max: 320, color: 'bg-red-600' },
  { label: 'Rescue gear', value: 88, max: 120, color: 'bg-amber-500' }
];

export default function ResourceSnapshot() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-950">Resource Snapshot</h3>
      <div className="mt-4 space-y-4">
        {resources.map((resource) => {
          const percent = Math.round((resource.value / resource.max) * 100);
          return (
            <div key={resource.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{resource.label}</span>
                <span className="text-slate-500">{percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${resource.color}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

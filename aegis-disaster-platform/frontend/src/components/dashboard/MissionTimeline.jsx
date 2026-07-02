import { CheckCircle2, CircleDot, Clock3 } from 'lucide-react';

const statusIcons = {
  completed: CheckCircle2,
  active: CircleDot,
  pending: Clock3
};

const statusStyles = {
  completed: 'text-teal-700 bg-teal-50',
  active: 'text-red-700 bg-red-50',
  pending: 'text-amber-700 bg-amber-50'
};

export default function MissionTimeline({ items }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-950">Mission Timeline</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const Icon = statusIcons[item.status];
          return (
            <article key={item.title} className="flex gap-3 px-4 py-4">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${statusStyles[item.status]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                <p className="mt-2 text-xs font-medium text-slate-400">{item.time}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

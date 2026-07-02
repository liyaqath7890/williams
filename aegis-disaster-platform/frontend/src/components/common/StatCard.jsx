import React from 'react';

const toneClasses = {
  indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-indigo-100/50',
  danger: 'text-red-600 bg-red-50 border-red-100 shadow-red-100/50',
  amber: 'text-amber-600 bg-amber-50 border-amber-100 shadow-amber-100/50',
  slate: 'text-slate-600 bg-slate-50 border-slate-100 shadow-slate-100/50'
};

export default function StatCard({ icon: Icon, label, value, helper, tone = 'indigo', trend }) {
  const currentTone = toneClasses[tone] || toneClasses.indigo;

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{value}</p>
            {trend && <span className="text-[10px] font-bold text-indigo-600 ml-1">{trend}</span>}
          </div>
        </div>
        
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-lg transition-transform group-hover:scale-110 ${currentTone}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {helper && (
        <div className="mt-5 pt-4 border-t border-slate-50">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            {helper}
          </p>
        </div>
      )}
    </div>
  );
}

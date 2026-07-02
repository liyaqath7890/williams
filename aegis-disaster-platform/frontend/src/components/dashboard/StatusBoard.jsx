export default function StatusBoard({ title, items }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

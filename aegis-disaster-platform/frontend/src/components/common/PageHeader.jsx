export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-5 sm:mb-6">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-aegis-primary sm:text-sm">{eyebrow}</p>}
      <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
    </div>
  );
}

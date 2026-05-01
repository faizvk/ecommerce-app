export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-brand-dark leading-tight">{title}</h1>
        {subtitle && <p className="text-[0.82rem] text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

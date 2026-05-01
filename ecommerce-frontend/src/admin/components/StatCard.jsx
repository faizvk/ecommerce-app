export default function StatCard({ value, label, icon: Icon, color = "text-brand", iconBg = "bg-brand-light", iconColor = "text-brand" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card flex items-start gap-4 hover:border-brand/20 transition-colors">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={iconColor} />
        </div>
      )}
      <div className="min-w-0">
        <h2 className={`text-2xl font-extrabold ${color} leading-none mb-1`}>{value}</h2>
        <p className="text-[0.8rem] text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

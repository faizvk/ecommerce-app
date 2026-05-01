export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-white rounded-2xl border border-gray-100">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon size={24} className="text-gray-300" />
        </div>
      )}
      <div>
        <p className="text-base font-semibold text-gray-700">{title}</p>
        {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

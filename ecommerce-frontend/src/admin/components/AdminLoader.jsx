export default function AdminLoader({ className = "py-20" }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
    </div>
  );
}

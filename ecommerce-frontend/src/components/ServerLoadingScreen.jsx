export default function ServerLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-light px-6 text-center">
      <div className="animate-spin w-14 h-14 rounded-full border-4 border-brand-medium border-t-brand mb-6" />
      <h2 className="text-2xl font-bold text-brand-dark mb-2">Starting backend…</h2>
      <p className="text-gray-600 mb-1">Render free tier sleeps after inactivity. Please wait.</p>
      <p className="text-gray-600 mb-1">Meanwhile UI screenshots are available in my GitHub repo.</p>
      <a
        href="https://github.com/faizvk/ecommerce-app"
        target="_blank"
        rel="noreferrer"
        className="mt-2 text-brand hover:text-brand-dark font-medium underline break-all"
      >
        https://github.com/faizvk/ecommerce-app
      </a>
    </div>
  );
}

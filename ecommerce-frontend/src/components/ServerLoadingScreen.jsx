export default function ServerLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark px-6 text-center">
      <div className="animate-spin w-14 h-14 rounded-full border-[3px] border-white/20 border-t-white mb-8" />
      <h2 className="text-2xl font-bold text-white mb-2">Starting backend…</h2>
      <p className="text-white/60 text-sm mb-1 max-w-xs">
        Render free tier sleeps after inactivity. Please wait a moment.
      </p>
      <p className="text-white/60 text-sm mb-6 max-w-xs">
        Meanwhile, UI screenshots are available in the GitHub repo.
      </p>
      <a
        href="https://github.com/faizvk/ecommerce-app"
        target="_blank"
        rel="noreferrer"
        className="px-5 py-2.5 bg-white/10 border border-white/20 text-white/80 rounded-full text-sm font-medium hover:bg-white/20 transition-all no-underline"
      >
        View on GitHub
      </a>
    </div>
  );
}

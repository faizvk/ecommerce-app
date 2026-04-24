export default function ServerLoadingScreen({ elapsed = 0 }) {
  // After 10 s tell the user it's waking up, not just loading
  const isSlowStart = elapsed >= 10;
  // Progress capped at 95% so it never looks "done" until actually ready
  const progress = Math.min(95, Math.round((elapsed / 90) * 100));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark px-6 text-center">
      <div className="animate-spin w-14 h-14 rounded-full border-[3px] border-white/20 border-t-white mb-8" />

      <h2 className="text-2xl font-bold text-white mb-2">
        {isSlowStart ? "Waking up the backend…" : "Starting up…"}
      </h2>

      <p className="text-white/60 text-sm max-w-xs mb-1">
        {isSlowStart
          ? "The server was sleeping (Render free tier). This can take up to 60 seconds."
          : "Connecting to the server, please wait."}
      </p>

      {/* Progress bar */}
      <div className="w-56 h-1.5 bg-white/15 rounded-full mt-6 overflow-hidden">
        <div
          className="h-full bg-white/70 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {elapsed > 0 && (
        <p className="text-white/30 text-xs mt-3">{elapsed}s</p>
      )}

      <a
        href="https://github.com/faizvk/ecommerce-app"
        target="_blank"
        rel="noreferrer"
        className="mt-8 px-5 py-2.5 bg-white/10 border border-white/20 text-white/70 rounded-full text-sm font-medium hover:bg-white/20 transition-all no-underline"
      >
        View on GitHub
      </a>
    </div>
  );
}

export default function ServerLoadingScreen({ elapsed = 0 }) {
  const isSlowStart = elapsed >= 10;
  const progress = Math.min(95, Math.round((elapsed / 90) * 100));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark px-6 text-center">
      {/* Brand mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 22 C16 17.582 19.582 14 24 14 C28.418 14 32 17.582 32 22" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
            <rect x="12" y="22" width="24" height="16" rx="4" fill="white"/>
            <circle cx="24" cy="31" r="2.8" fill="#4f46e5"/>
          </svg>
        </div>
        <p className="text-2xl font-extrabold tracking-tight">
          <span className="text-white">Nex</span><span className="text-brand-medium">Kart</span>
        </p>
      </div>

      <div className="animate-spin w-10 h-10 rounded-full border-[3px] border-white/20 border-t-white mb-6" />

      <h2 className="text-lg font-semibold text-white mb-2">
        {isSlowStart ? "Waking up the backend…" : "Starting up…"}
      </h2>

      <p className="text-white/50 text-sm max-w-xs mb-1">
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

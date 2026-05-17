import { Smartphone, Apple, Play, QrCode } from "lucide-react";

/**
 * App download promo — typical 'Get the NexKart app' banner near the page
 * bottom. Store badges are decorative for now; replace with real App Store
 * and Play Store deep links when the apps ship.
 *
 * QR is a static placeholder (api.qrserver.com generates a QR pointing at
 * the storefront URL). For a real launch, swap with a signed/branded QR.
 */

const STOREFRONT_URL = "https://ecommerce-app-neon-eight.vercel.app";
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(STOREFRONT_URL)}`;

export default function AppDownloadBanner() {
  return (
    <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        {/* Decorative orbs */}
        <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 p-6 md:p-10 items-center">
          {/* LEFT — pitch + store badges */}
          <div>
            <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[0.7rem] font-extrabold uppercase tracking-[0.18em]">
              <Smartphone size={12} /> NexKart App
            </div>

            <h2 className="text-2xl md:text-[2rem] font-extrabold leading-tight mb-3">
              Shop faster on the app
            </h2>
            <p className="text-white/75 text-[0.92rem] md:text-base max-w-xl mb-5 leading-relaxed">
              Get exclusive in-app offers, faster checkout, and order tracking notifications.
              Available free on iOS and Android.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* App Store badge */}
              <button
                type="button"
                onClick={() => { /* placeholder — wire up to real App Store link */ }}
                className="group inline-flex items-center gap-2.5 px-4 py-2.5 bg-white text-gray-900 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform border-0 shadow-md"
              >
                <Apple size={22} strokeWidth={1.6} />
                <div className="text-left leading-tight">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-gray-500">Download on the</p>
                  <p className="text-[0.95rem] font-extrabold">App Store</p>
                </div>
              </button>

              {/* Play Store badge */}
              <button
                type="button"
                onClick={() => { /* placeholder — wire up to real Play Store link */ }}
                className="group inline-flex items-center gap-2.5 px-4 py-2.5 bg-white text-gray-900 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform border-0 shadow-md"
              >
                <Play size={20} strokeWidth={1.8} className="fill-gray-900" />
                <div className="text-left leading-tight">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-gray-500">Get it on</p>
                  <p className="text-[0.95rem] font-extrabold">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT — QR code in a white card, hidden on small screens */}
          <div className="hidden md:flex flex-col items-center gap-2 bg-white p-3 rounded-2xl shadow-lg flex-shrink-0">
            <img
              src={QR_SRC}
              alt="QR code to download the NexKart app"
              width={140}
              height={140}
              loading="lazy"
              className="w-[140px] h-[140px]"
            />
            <div className="flex items-center gap-1.5 text-gray-700">
              <QrCode size={12} className="text-brand" />
              <span className="text-[0.7rem] font-bold uppercase tracking-wider">Scan to download</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

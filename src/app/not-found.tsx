import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center p-6 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-lg bg-[#0D111A] border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl relative text-center space-y-6">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-amber-500/5 rounded-2xl blur-2xl pointer-events-none" />

        {/* Code Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>STATUS: 404 // RESOURCE_NOT_FOUND</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            The requested route or architecture module does not exist in this repository. Verify the URL or return to the main portfolio.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono transition-colors shadow-lg shadow-amber-500/20"
          >
            ← Return to Portfolio
          </Link>
          <Link
            href="/admin/login"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-xs font-mono transition-colors"
          >
            Admin Console
          </Link>
        </div>
      </div>
    </main>
  );
}

import React from 'react';
import Link from 'next/link';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0F1523] border-r border-white/10 flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-amber-500/20">
              MK
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-slate-100">
                MK Admin
              </h2>
              <p className="text-[10px] text-amber-500 font-mono">
                SUPABASE CMS CONTROL PLANE
              </p>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-medium">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-not-allowed">
              <span>📝</span>
              <span>Content</span>
              <span className="ml-auto text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-500">
                Phase 2
              </span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-not-allowed">
              <span>🖼️</span>
              <span>Media</span>
              <span className="ml-auto text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-500">
                Phase 2
              </span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-not-allowed">
              <span>⚙️</span>
              <span>Settings</span>
              <span className="ml-auto text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-500">
                Phase 2
              </span>
            </div>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <span>←</span>
            <span>View Public Site</span>
          </Link>

          {/* Functional Server Logout Form */}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono transition-colors"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-[#080B11]">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="text-amber-500">RLS ENFORCED</span>
            <span>{'//'}</span>
            <span>ADMIN AUTHORIZATION ACTIVE</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-300">Phase 1 Verified</span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-slate-400 hover:text-red-400 font-mono transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

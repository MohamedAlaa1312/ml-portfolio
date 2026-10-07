'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminPlaceholderModal } from './AdminPlaceholderModal';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  isImplemented: boolean;
  phase?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊', isImplemented: true },
  { label: 'Profile & Hero', href: '/admin/profile', icon: '👤', isImplemented: true },
  { label: 'About', href: '/admin/about', icon: '📝', isImplemented: true },
  { label: 'Experience', href: '/admin/experience', icon: '💼', isImplemented: true },
  { label: 'Skills', href: '/admin/skills', icon: '🛠️', isImplemented: true },
  { label: 'Projects', href: '/admin/projects', icon: '🚀', isImplemented: true },
  { label: 'Certifications', href: '/admin/certifications', icon: '📜', isImplemented: true },
  { label: 'Contact', href: '/admin/contact', icon: '✉️', isImplemented: true },
  { label: 'Sections', href: '/admin/sections', icon: '📑', isImplemented: true },
  { label: 'Publishing', href: '/admin/publishing', icon: '🌐', isImplemented: true },
  { label: 'Media', href: '/admin/media', icon: '🖼️', isImplemented: true },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️', isImplemented: true },
  { label: 'Themes', href: '/admin/themes', icon: '🎨', isImplemented: true },
];

interface AdminSidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onItemClick, className = '' }) => {
  const pathname = usePathname();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    moduleName: string;
    phase?: string;
  }>({
    isOpen: false,
    title: '',
    moduleName: '',
  });

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (!item.isImplemented) {
      e.preventDefault();
      setModalState({
        isOpen: true,
        title: `${item.label} Editor`,
        moduleName: `${item.label} Management`,
        phase: item.phase,
      });
      return;
    }
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <>
      <aside
        className={`w-64 bg-[#0B0F19] border-r border-white/10 flex flex-col justify-between h-full ${className}`}
      >
        {/* Brand Monogram & Admin Header */}
        <div>
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-amber-500/20">
              MK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm leading-none">MK Admin</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-semibold">
                  v5.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Control Plane</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Admin Navigation" className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-colors focus-ring min-h-[44px] ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base" role="img" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {!item.isImplemented && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 border border-white/5 font-mono">
                      Soon
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer & Session Sign Out */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
          >
            <span>Public Portfolio</span>
            <span>↗</span>
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono transition-colors cursor-pointer min-h-[40px]"
            >
              <span>Sign Out</span>
              <span>🚪</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Placeholder Modal for Upcoming Modules */}
      <AdminPlaceholderModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        moduleName={modalState.moduleName}
        targetPhase={modalState.phase}
      />
    </>
  );
};

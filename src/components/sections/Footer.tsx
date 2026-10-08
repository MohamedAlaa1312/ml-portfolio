import React from 'react';
import Link from 'next/link';
import { TextLink } from '@/components/ui/TextLink';

interface FooterProps {
  name?: string;
  role?: string;
}

export const Footer: React.FC<FooterProps> = ({
  name = 'Mohamed Alaa',
  role = 'Machine Learning Engineer',
}) => {
  return (
    <footer className="border-t border-white/10 bg-[#080B11] py-14 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-amber-500/20">
            MA
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200 leading-tight">
              {name}
            </p>
            <p className="text-[11px] text-amber-500/90 font-mono">
              {role}
            </p>
          </div>
        </div>

        {/* Quick Nav Anchors */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <a href="#hero" className="hover:text-amber-400 transition-colors">Home</a>
          <a href="#about" className="hover:text-amber-400 transition-colors">About</a>
          <a href="#experience" className="hover:text-amber-400 transition-colors">Experience</a>
          <a href="#skills" className="hover:text-amber-400 transition-colors">Skills</a>
          <a href="#projects" className="hover:text-amber-400 transition-colors">Projects</a>
          <a href="#certifications" className="hover:text-amber-400 transition-colors">Certifications</a>
          <a href="#contact" className="hover:text-amber-400 transition-colors">Contact</a>
        </div>

        {/* Technical Status & Copyright */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <span>© {new Date().getFullYear()} {name}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface AdminPlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  moduleName: string;
  targetPhase?: string;
  description?: string;
}

export const AdminPlaceholderModal: React.FC<AdminPlaceholderModalProps> = ({
  isOpen,
  onClose,
  title,
  moduleName,
  targetPhase = 'Phase 6',
  description = 'This content editor module is part of the phased CMS roadmap and will be activated in upcoming phases.',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="space-y-4 text-slate-300">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-400 mx-auto">
          ⚙️
        </div>

        <div className="text-center space-y-2">
          <p className="font-mono text-xs text-amber-500 font-bold uppercase tracking-wider">
            {targetPhase} Module
          </p>
          <h4 className="text-lg font-bold text-slate-100">{moduleName}</h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#131926] border border-white/5 space-y-1 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Current Status:</span>
            <span className="text-amber-400">Phase 5 (Foundation Shell)</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Editor Activation:</span>
            <span className="text-slate-200">{targetPhase} & Beyond</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose} className="w-full text-xs font-mono">
            Understood
          </Button>
        </div>
      </div>
    </Modal>
  );
};

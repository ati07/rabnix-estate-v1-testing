'use client';

import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="bg-[#0F2A43] px-6 py-4 flex items-center justify-between text-white border-b border-[#163b5c]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#18A67D] rounded-md flex items-center justify-center text-white font-black text-xs rotate-45">
              <div className="-rotate-45">R</div>
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Rabnix Estate Account</h2>
              <p className="text-[11px] text-slate-300">Access shortlisted homes, direct owner contacts & price alerts</p>
            </div>
          </div>

          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with AuthForm */}
        <div className="max-h-[85vh] overflow-y-auto">
          <AuthForm 
            initialMode={initialMode} 
            onSuccess={onClose} 
            isModal={true} 
          />
        </div>
      </div>
    </div>
  );
}

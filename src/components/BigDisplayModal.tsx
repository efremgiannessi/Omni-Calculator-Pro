import React from 'react';
import { X, Maximize2, Copy, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface BigDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mainValue: string;
  mainLabel: string;
  secondaryItems?: { label: string; value: string }[];
  settings: AppSettings;
  showToast: (text: string) => void;
}

export const BigDisplayModal: React.FC<BigDisplayModalProps> = ({
  isOpen,
  onClose,
  title,
  mainValue,
  mainLabel,
  secondaryItems = [],
  settings,
  showToast
}) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mainValue);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl p-6 sm:p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between pb-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Maximize2 className="w-4 h-4 text-emerald-600" />
            <span>{settings.language === 'it' ? 'Display Schermo Cassa' : 'Customer Big Display'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-zinc-100 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Big numbers area */}
        <div className="my-8 sm:my-12 space-y-2">
          <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            {mainLabel || title}
          </span>
          <div className="text-5xl sm:text-7xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight leading-none select-all">
            {mainValue}
          </div>
        </div>

        {/* Secondary items */}
        {secondaryItems.length > 0 && (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 mb-6">
            {secondaryItems.map((item, idx) => (
              <div key={idx} className="p-2">
                <span className="text-xs text-slate-400 block font-medium truncate">
                  {item.label}
                </span>
                <span className="font-mono text-base font-bold text-slate-800 dark:text-zinc-200 block truncate mt-0.5">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            type="button"
            onClick={handleCopy}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Copy className="w-4 h-4" />
            <span>{settings.language === 'it' ? 'Copia Valore' : 'Copy Value'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-sm rounded-xl transition-all"
          >
            {settings.language === 'it' ? 'Chiudi Display' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

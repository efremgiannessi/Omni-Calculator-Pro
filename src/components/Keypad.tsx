import React from 'react';
import { Delete, X } from 'lucide-react';
import { AppSettings } from '../types';

interface KeypadProps {
  settings: AppSettings;
  onKeyPress: (key: string) => void;
  onClose: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ settings, onKeyPress, onClose }) => {
  const keys = [
    ['7', '8', '9', 'C'],
    ['4', '5', '6', 'DEL'],
    ['1', '2', '3', '%'],
    ['0', '00', settings.decimalSeparator, '=']
  ];

  const quickPcts = ['+5%', '+10%', '+20%', '-10%', '-20%', '-50%'];

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 max-w-sm mx-auto transition-all animate-in slide-in-from-bottom-3 duration-200">
      {/* Top bar with quick buttons & close */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {quickPcts.map((qp) => (
            <button
              key={qp}
              type="button"
              onClick={() => onKeyPress(qp)}
              className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 ml-1 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {keys.flat().map((k, idx) => {
          const isDel = k === 'DEL';
          const isC = k === 'C';
          const isEquals = k === '=';
          const isOp = isC || isDel || isEquals || k === '%';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onKeyPress(k)}
              className={`h-11 rounded-xl font-mono text-sm font-semibold flex items-center justify-center transition-all active:scale-95 ${
                isEquals
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : isC
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                  : isDel
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
                  : isOp
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                  : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {isDel ? <Delete className="w-4 h-4" /> : k}
            </button>
          );
        })}
      </div>
    </div>
  );
};

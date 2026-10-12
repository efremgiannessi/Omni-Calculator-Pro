import React from 'react';
import {
  Layers,
  Keyboard,
  Search,
  Clock,
  Settings as SettingsIcon
} from 'lucide-react';
import { AppSettings, CalculatorCategory } from '../../types';

interface MobileBottomBarProps {
  onOpenSelector: () => void;
  onToggleKeypad: () => void;
  isKeypadActive: boolean;
  onOpenSearch: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenSettings: () => void;
  settings: AppSettings;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenSelector,
  onToggleKeypad,
  isKeypadActive,
  onOpenSearch,
  onOpenHistory,
  historyCount,
  onOpenSettings,
  settings
}) => {
  return (
    <nav
      aria-label="Navigazione mobile rapida"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-zinc-800 px-3 py-1.5 shadow-lg flex items-center justify-around safe-area-bottom"
    >
      {/* 1. Calcolatori Drawer */}
      <button
        type="button"
        onClick={onOpenSelector}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition-all cursor-pointer min-w-[56px]"
      >
        <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <Layers className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Moduli</span>
      </button>

      {/* 2. Keypad Toggle */}
      <button
        type="button"
        onClick={onToggleKeypad}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl active:scale-95 transition-all cursor-pointer min-w-[56px] ${
          isKeypadActive
            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
            : 'text-slate-600 dark:text-zinc-400 hover:text-emerald-600'
        }`}
      >
        <div className={`p-1 rounded-lg ${isKeypadActive ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-zinc-800'}`}>
          <Keyboard className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Tastiera</span>
      </button>

      {/* 3. Search Palette */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition-all cursor-pointer min-w-[56px]"
      >
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
          <Search className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Cerca</span>
      </button>

      {/* 4. History */}
      <button
        type="button"
        onClick={onOpenHistory}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition-all cursor-pointer relative min-w-[56px]"
      >
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 relative">
          <Clock className="w-5 h-5" />
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">Storico</span>
      </button>

      {/* 5. Settings */}
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition-all cursor-pointer min-w-[56px]"
      >
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Opzioni</span>
      </button>
    </nav>
  );
};

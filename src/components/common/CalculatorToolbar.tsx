import React from 'react';
import {
  Star,
  Share2,
  Layers,
  Sparkles,
  Percent
} from 'lucide-react';
import { CalculatorId } from '../../types';

interface CalculatorToolbarProps {
  id: CalculatorId;
  title: string;
  description: string;
  categoryLabel: string;
  badge?: string;
  iconComponent: React.ComponentType<{ className?: string }>;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenMobileSelector: () => void;
  onCopyShareLink: () => void;
}

export const CalculatorToolbar: React.FC<CalculatorToolbarProps> = ({
  id,
  title,
  description,
  categoryLabel,
  badge,
  iconComponent: IconComp,
  isFavorite,
  onToggleFavorite,
  onOpenMobileSelector,
  onCopyShareLink
}) => {
  return (
    <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Icon, Category Breadcrumb, Title & Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs flex items-center justify-center">
          <IconComp className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                {badge}
              </span>
            )}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
              {categoryLabel}
            </span>
            <span>•</span>
            <span className="truncate">{description}</span>
          </div>
        </div>
      </div>

      {/* Right: Coherent Action Buttons Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
        {/* Favorite Button */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`h-9 px-3 rounded-xl border text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
            isFavorite
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-400/50'
              : 'border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-amber-500 hover:border-amber-300'
          }`}
          title={isFavorite ? 'Rimuovi dai Preferiti' : 'Aggiungi ai Preferiti'}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          <span className="hidden sm:inline">{isFavorite ? 'Nei Preferiti' : 'Salva Preferito'}</span>
        </button>

        {/* Share Link Button */}
        <button
          type="button"
          onClick={onCopyShareLink}
          className="h-9 px-3 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-750 hover:text-slate-900 dark:hover:text-zinc-100 transition-all shadow-2xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title="Copia link calcolatore"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Condividi</span>
        </button>

        {/* Mobile Quick Switcher Trigger */}
        <button
          type="button"
          onClick={onOpenMobileSelector}
          className="lg:hidden h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cambia (35)</span>
        </button>
      </div>
    </div>
  );
};

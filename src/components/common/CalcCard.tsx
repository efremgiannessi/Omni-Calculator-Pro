import React, { useState } from 'react';
import {
  Copy,
  Share2,
  RotateCcw,
  BookmarkPlus,
  Star,
  Maximize2,
  Receipt,
  BarChart2
} from 'lucide-react';
import { FormulaSteps } from './FormulaSteps';
import { PlainExplanation } from './PlainExplanation';

interface CalcCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onClear: () => void;
  onCopy: () => void;
  onShare: () => void;
  onSaveToHistory?: () => void;
  formula: string;
  steps: string[];
  notes?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onOpenBigDisplay?: () => void;
  onOpenReceipt?: () => void;
  plainExplanation?: string;
  chartComponent?: React.ReactNode;
  labels?: {
    clear?: string;
    copy?: string;
    share?: string;
    save?: string;
  };
}

export const CalcCard: React.FC<CalcCardProps> = ({
  title,
  description,
  children,
  onClear,
  onCopy,
  onShare,
  onSaveToHistory,
  formula,
  steps,
  notes,
  isFavorite = false,
  onToggleFavorite,
  onOpenBigDisplay,
  onOpenReceipt,
  plainExplanation,
  chartComponent,
  labels = { clear: 'Azzera', copy: 'Copia', share: 'Condividi', save: 'Salva' }
}) => {
  const [showChart, setShowChart] = useState(true);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-1.5 mt-0.5 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-500'
                  : 'bg-transparent border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-amber-500'
              }`}
              title={isFavorite ? 'Rimuovi dai Preferiti' : 'Aggiungi ai Preferiti ⭐'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-xl">
              {description}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
          {chartComponent && (
            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className={`min-w-[36px] min-h-[36px] p-2 rounded-xl transition-all border flex items-center justify-center shadow-2xs ${
                showChart
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-50/80 dark:bg-zinc-800/80 border-slate-200/70 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
              title="Grafico Dinamico"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          )}

          {onOpenBigDisplay && (
            <button
              type="button"
              onClick={onOpenBigDisplay}
              className="min-w-[36px] min-h-[36px] p-2 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 bg-slate-50/80 dark:bg-zinc-800/80 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shadow-2xs flex items-center justify-center"
              title="Display Schermo Cassa (Grandi Cifre)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          {onOpenReceipt && (
            <button
              type="button"
              onClick={onOpenReceipt}
              className="min-w-[36px] min-h-[36px] p-2 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 bg-slate-50/80 dark:bg-zinc-800/80 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shadow-2xs flex items-center justify-center"
              title="Scontrino Digitale & Stampa"
            >
              <Receipt className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onCopy}
            className="min-w-[36px] min-h-[36px] p-2 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 bg-slate-50/80 dark:bg-zinc-800/80 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shadow-2xs flex items-center justify-center"
            title={labels.copy}
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onShare}
            className="min-w-[36px] min-h-[36px] p-2 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 bg-slate-50/80 dark:bg-zinc-800/80 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shadow-2xs flex items-center justify-center"
            title={labels.share}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {onSaveToHistory && (
            <button
              type="button"
              onClick={onSaveToHistory}
              className="min-w-[36px] min-h-[36px] p-2 rounded-xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-2xs flex items-center justify-center"
              title={labels.save}
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClear}
            className="min-w-[36px] min-h-[36px] p-2 rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-2xs flex items-center justify-center"
            title={labels.clear}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5">
        {children}

        {/* Dynamic Chart if available */}
        {chartComponent && showChart && (
          <div className="mt-4">
            {chartComponent}
          </div>
        )}

        {/* Plain language explanation */}
        {plainExplanation && (
          <PlainExplanation text={plainExplanation} />
        )}

        {/* Formula Explainer */}
        <FormulaSteps formula={formula} steps={steps} notes={notes} />
      </div>
    </div>
  );
};

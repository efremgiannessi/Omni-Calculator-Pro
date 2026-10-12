import React, { useState } from 'react';
import { History, RotateCcw, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { HistoryItem, AppSettings, CalculatorId } from '../../types';

interface SectionHistoryTapeProps {
  calculatorId: CalculatorId;
  history: HistoryItem[];
  onRestore: (inputs: Record<string, string>) => void;
  onDeleteEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
  settings: AppSettings;
  showToast: (text: string) => void;
}

export const SectionHistoryTape: React.FC<SectionHistoryTapeProps> = ({
  calculatorId,
  history,
  onRestore,
  onDeleteEntry,
  onClearSectionHistory,
  settings,
  showToast
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter history for this specific calculator section
  const sectionHistory = history.filter((item) => item.calculatorId === calculatorId);

  const handleCopy = (item: HistoryItem) => {
    const text = `${item.summary}\n${item.details.map((d) => `${d.label}: ${d.value}`).join(' | ')}`;
    navigator.clipboard.writeText(text);
    showToast(settings.language === 'it' ? 'Calcolo copiato!' : 'Calculation copied!');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(settings.language === 'it' ? 'it-IT' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-6 border border-slate-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
      {/* Header Toolbar */}
      <div className="py-3 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <History className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold tracking-tight">
            {settings.language === 'it' ? 'Cronologia Locale di Sezione' : 'Section History Tape'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold border border-slate-300/80 dark:border-zinc-700">
            {sectionHistory.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sectionHistory.length > 0 && onClearSectionHistory && (
          <button
            type="button"
            onClick={() => onClearSectionHistory(calculatorId)}
            className="text-[11px] font-semibold text-slate-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
            title="Svuota cronologia di questa sezione"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {settings.language === 'it' ? 'Svuota sezione' : 'Clear section'}
            </span>
          </button>
        )}
      </div>

      {/* List */}
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-slate-50/40 dark:bg-zinc-950">
          {sectionHistory.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 italic py-3 text-center">
              {settings.language === 'it'
                ? 'I calcoli memorizzati in questa sezione appariranno automaticamente qui con valori e timestamp.'
                : 'Calculations made in this section will automatically be logged here with values and timestamp.'}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {sectionHistory.slice(0, 15).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/70 dark:hover:border-emerald-500/60 shadow-2xs transition-all text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                        {item.summary}
                      </span>
                      <span className="text-[10px] text-slate-600 dark:text-zinc-300 font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold shrink-0">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-700 dark:text-zinc-200 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {item.details.map((d, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="text-slate-400 dark:text-zinc-400">{d.label}:</span>
                          <span className="font-bold text-slate-800 dark:text-emerald-400">{d.value}</span>
                          {idx < item.details.length - 1 && <span className="text-slate-300 dark:text-zinc-700">·</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className="p-2 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      title="Copia negli appunti"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {item.inputs && (
                      <button
                        type="button"
                        onClick={() => {
                          onRestore(item.inputs!);
                          showToast(settings.language === 'it' ? 'Calcolo ripristinato nei campi!' : 'Restored inputs!');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        title="Carica questi valori"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{settings.language === 'it' ? 'Ripristina' : 'Restore'}</span>
                      </button>
                    )}

                    {onDeleteEntry && (
                      <button
                        type="button"
                        onClick={() => onDeleteEntry(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Rimuovi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

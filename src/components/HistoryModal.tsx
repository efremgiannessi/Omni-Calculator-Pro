import React, { useState } from 'react';
import { X, Trash2, Copy, Clock, Search, RotateCcw, Filter } from 'lucide-react';
import { HistoryItem, AppSettings, CalculatorId } from '../types';
import { CALCULATORS_LIST } from '../data/calculators';
import { translations } from '../i18n/translations';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem?: (id: string) => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  settings: AppSettings;
  showToast: (text: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onDeleteHistoryItem,
  onSelectHistoryItem,
  settings,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCalcFilter, setSelectedCalcFilter] = useState<CalculatorId | 'all'>('all');

  if (!isOpen) return null;

  const t = translations[settings.language] || translations.it;

  // Filter history
  const filteredHistory = history.filter((item) => {
    // Filter by calculator section
    if (selectedCalcFilter !== 'all' && item.calculatorId !== selectedCalcFilter) {
      return false;
    }

    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase().trim();
    return (
      item.calculatorTitle.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      (item.formula && item.formula.toLowerCase().includes(q)) ||
      item.details.some(
        (d) => d.label.toLowerCase().includes(q) || d.value.toLowerCase().includes(q)
      )
    );
  });

  const handleCopy = (item: HistoryItem) => {
    const text = `${item.calculatorTitle}\n${item.summary}\n${item.details.map((d) => `${d.label}: ${d.value}`).join('\n')}\nFormula: ${item.formula}`;
    navigator.clipboard.writeText(text);
    showToast(settings.language === 'it' ? 'Copiato negli appunti!' : 'Copied to clipboard!');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(settings.language === 'it' ? 'it-IT' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  // Unique calculator sections with entries in history
  const sectionCounts = history.reduce((acc, curr) => {
    acc[curr.calculatorId] = (acc[curr.calculatorId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {settings.language === 'it' ? 'Cronologia di Tutte le Sezioni' : 'All Sections History'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {history.length} {settings.language === 'it' ? 'calcoli registrati' : 'logged calculations'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Svuota cronologia"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {settings.language === 'it' ? 'Svuota tutto' : 'Clear all'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedCalcFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedCalcFilter === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
            }`}
          >
            <span>{t.all}</span>
            <span className="text-[10px] opacity-80 font-mono">({history.length})</span>
          </button>

          {CALCULATORS_LIST.map((calc) => {
            const count = sectionCounts[calc.id] || 0;
            if (count === 0 && selectedCalcFilter !== calc.id) return null; // Show active sections

            return (
              <button
                key={calc.id}
                type="button"
                onClick={() => setSelectedCalcFilter(calc.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedCalcFilter === calc.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                }`}
              >
                <span>{t[calc.titleKey]}</span>
                <span className="text-[10px] opacity-80 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        {history.length > 3 && (
          <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onFocus={(e) => e.currentTarget.select()}
              onClick={(e) => e.currentTarget.select()}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                settings.language === 'it'
                  ? 'Cerca nei calcoli e valori...'
                  : 'Search calculations...'
              }
              className="w-full text-xs bg-transparent outline-none text-slate-800 dark:text-zinc-200 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                {settings.language === 'it'
                  ? 'Nessun calcolo trovato per questa sezione'
                  : 'No calculations found'}
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                {settings.language === 'it'
                  ? 'Tutti i calcoli eseguiti nelle varie sezioni compariranno qui automaticamente.'
                  : 'Calculations will automatically appear here.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white dark:bg-zinc-900 hover:border-emerald-500/70 dark:hover:border-emerald-500/60 border border-slate-200/90 dark:border-zinc-800 rounded-xl transition-all space-y-2 group shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>{item.calculatorTitle}</span>
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-zinc-300 font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold">
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                <div className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                  {item.summary}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-zinc-200 pt-1.5 border-t border-slate-200/60 dark:border-zinc-800">
                  {item.details.map((d, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-slate-400 dark:text-zinc-400">{d.label}: </span>
                      <span className="font-bold text-slate-800 dark:text-emerald-400">
                        {d.value}
                      </span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate max-w-[280px]">
                    {item.formula}
                  </span>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                      title="Copia riepilogo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {onDeleteHistoryItem && (
                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 text-[11px] font-bold transition-colors"
                      title="Apri e carica in questo calcolatore"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{settings.language === 'it' ? 'Ripristina' : 'Restore'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

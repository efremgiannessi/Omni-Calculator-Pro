import React, { useState, useEffect, useRef } from 'react';
import { Search, Calculator, ArrowRight, CornerDownLeft, Sparkles, X } from 'lucide-react';
import { CalculatorId, AppSettings } from '../types';
import { CALCULATORS_LIST } from '../data/calculators';
import { translations } from '../i18n/translations';
import { formatNumber, formatPercent } from '../utils/format';
import { matchesCalculatorSearch } from '../utils/calculatorSearch';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculator: (id: CalculatorId) => void;
  settings: AppSettings;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectCalculator,
  settings
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[settings.language] || translations.it;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Comprehensive filtered list across ALL calculators, keywords, categories, and languages
  const filtered = CALCULATORS_LIST.filter((calc) =>
    matchesCalculatorSearch(calc, query, settings.language)
  );

  // Simple inline math parsing: e.g. "20% di 150" or "15% of 200" or "100 + 20%"
  let quickMathResult: { text: string; value: string } | null = null;
  const matchPctOf = query.match(/^(\d+(?:[.,]\d+)?)\s*%\s*(?:di|of|sur|von)\s*(\d+(?:[.,]\d+)?)$/i);
  if (matchPctOf) {
    const pct = parseFloat(matchPctOf[1].replace(',', '.'));
    const val = parseFloat(matchPctOf[2].replace(',', '.'));
    if (!isNaN(pct) && !isNaN(val)) {
      const res = (pct / 100) * val;
      quickMathResult = {
        text: `${pct}% di ${val}`,
        value: `${formatNumber(res, settings)}`
      };
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectCalculator(filtered[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search input header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              settings.language === 'it'
                ? 'Cerca calcolatore o digita un calcolo (es. 20% di 150)...'
                : 'Search calculator or type math (e.g. 20% of 150)...'
            }
            className="w-full text-sm font-semibold bg-transparent outline-none text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Math Inline Result */}
        {quickMathResult && (
          <div className="p-3 mx-3 my-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                Calcolo Istantaneo: {quickMathResult.text} =
              </span>
            </div>
            <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-400">
              {quickMathResult.value}
            </span>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.map((calc, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={calc.id}
                type="button"
                onClick={() => {
                  onSelectCalculator(calc.id);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-emerald-600'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold truncate">{t[calc.titleKey] || calc.id}</span>
                      {calc.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {calc.badge}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                          isSelected
                            ? 'bg-white/15 text-white/90'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                        }`}
                      >
                        {t[calc.category.replace('-', '_')] || calc.category}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] truncate block mt-0.5 ${
                        isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      {t[calc.descriptionKey]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[10px] opacity-70">
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && !quickMathResult && (
            <div className="py-8 text-center text-xs text-slate-400">
              {t.noCalculatorsFound}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 px-4 bg-slate-50 dark:bg-zinc-950/50 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ per navigare</span>
            <span>↵ per selezionare</span>
            <span>ESC per uscire</span>
          </div>
          <span className="font-mono">PRO Command Palette</span>
        </div>
      </div>
    </div>
  );
};

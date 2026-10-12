import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Star,
  ChevronRight,
  Layers,
  Sparkles,
  Percent
} from 'lucide-react';
import { AppSettings, CalculatorCategory, CalculatorId } from '../../types';
import { CALCULATORS_LIST } from '../../data/calculators';
import { matchesCalculatorSearch } from '../../utils/calculatorSearch';

interface MobileCalculatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeCalcId: CalculatorId;
  onSelectCalculator: (id: CalculatorId) => void;
  activeCategory: CalculatorCategory;
  onSelectCategory: (cat: CalculatorCategory) => void;
  settings: AppSettings;
  onToggleFavorite: (id: CalculatorId) => void;
  t: Record<string, string>;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
}

export const MobileCalculatorSheet: React.FC<MobileCalculatorSheetProps> = ({
  isOpen,
  onClose,
  activeCalcId,
  onSelectCalculator,
  activeCategory,
  onSelectCategory,
  settings,
  onToggleFavorite,
  t,
  iconMap
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const isSearching = searchTerm.trim().length > 0;

  const filteredCalculators = useMemo(() => {
    if (isSearching) {
      // Quando cerca su mobile, cerca tra TUTTI i 38 calcolatori dell'app
      return CALCULATORS_LIST.filter((calc) =>
        matchesCalculatorSearch(calc, searchTerm, settings.language)
      );
    }

    return CALCULATORS_LIST.filter((calc) => {
      // Category filter
      if (activeCategory === 'favorites') {
        return settings.favorites.includes(calc.id);
      }
      if (activeCategory === 'all') {
        return true;
      }
      return calc.category === activeCategory;
    });
  }, [isSearching, searchTerm, activeCategory, settings.favorites, settings.language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Modal Container */}
      <div className="relative z-10 w-full max-h-[88vh] bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle Bar */}
        <div className="w-full pt-3 pb-1 flex justify-center items-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
        </div>

        {/* Header Toolbar */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Seleziona Calcolatore
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {CALCULATORS_LIST.length} moduli scientifici & pro disponibili
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca calcolatore (es. Qubit, Marte, Wormhole, PAC)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-xs font-semibold text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills Ribbon */}
        <div className="px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800/80">
          {[
            { id: 'all', label: t.all || 'Tutti', count: CALCULATORS_LIST.length },
            { id: 'favorites', label: t.favorites || 'Preferiti', count: settings.favorites.length },
            { id: 'materials', label: 'Materiali ⚖️', count: CALCULATORS_LIST.filter(c => c.category === 'materials').length },
            { id: 'geometry', label: 'Geometria 📐', count: CALCULATORS_LIST.filter(c => c.category === 'geometry').length },
            { id: 'science', label: 'Scienza 🔬', count: CALCULATORS_LIST.filter(c => c.category === 'science').length },
            { id: 'quantum', label: 'Quantistica ⚛️', count: CALCULATORS_LIST.filter(c => c.category === 'quantum').length },
            { id: 'astronomy', label: 'Astronomia 🪐', count: CALCULATORS_LIST.filter(c => c.category === 'astronomy').length },
            { id: 'chemistry', label: 'Chimica 🧪', count: CALCULATORS_LIST.filter(c => c.category === 'chemistry').length },
            { id: 'matrices', label: 'Matrici 📐', count: CALCULATORS_LIST.filter(c => c.category === 'matrices').length },
            { id: 'electronics', label: 'Circuiti ⚡', count: CALCULATORS_LIST.filter(c => c.category === 'electronics').length },
            { id: 'finance-fire', label: 'Finanza 💰', count: CALCULATORS_LIST.filter(c => c.category === 'finance-fire').length },
            { id: 'health', label: 'Fitness 🏃', count: CALCULATORS_LIST.filter(c => c.category === 'health').length },
            { id: 'graphing-3d', label: '3D 🧊', count: CALCULATORS_LIST.filter(c => c.category === 'graphing-3d').length },
            { id: 'geometry', label: 'Geometria 📐', count: CALCULATORS_LIST.filter(c => c.category === 'geometry').length },
            { id: 'everyday', label: 'Base', count: CALCULATORS_LIST.filter(c => c.category === 'everyday').length },
            { id: 'business', label: 'Business', count: CALCULATORS_LIST.filter(c => c.category === 'business').length }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id as CalculatorCategory)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] font-mono px-1 rounded-full ${
                activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Calculators Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCalculators.map((calc) => {
            const IconComp = iconMap[calc.icon] || Percent;
            const isActive = calc.id === activeCalcId;
            const isFav = settings.favorites.includes(calc.id);

            return (
              <div
                key={calc.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectCalculator(calc.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200/60 dark:border-zinc-700'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold truncate ${
                        isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-zinc-200'
                      }`}>
                        {t[calc.titleKey] || calc.id}
                      </span>
                      {calc.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          {calc.badge}
                        </span>
                      )}
                      {isSearching && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-300 font-medium">
                          {t[calc.category.replace('-', '_')] || calc.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-400 truncate mt-0.5">
                      {t[calc.descriptionKey]}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(calc.id);
                    }}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isFav
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-slate-300 dark:text-zinc-600 hover:text-amber-400'
                    }`}
                    title="Preferiti"
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectCalculator(calc.id);
                      onClose();
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredCalculators.length === 0 && (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">Nessun calcolatore trovato per "{searchTerm}"</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  onSelectCategory('all');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Mostra tutti
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

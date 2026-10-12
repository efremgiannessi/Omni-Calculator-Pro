/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Percent,
  TrendingUp,
  Tag,
  Receipt as ReceiptIcon,
  Divide,
  Layers,
  PieChart,
  FileSpreadsheet,
  Briefcase,
  LineChart,
  Compass,
  Gauge,
  Zap,
  Landmark,
  Settings as SettingsIcon,
  Clock,
  Search,
  Keyboard,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  Sparkles,
  Scale,
  Table as TableIcon,
  Star,
  Download,
  Command,
  Maximize2,
  Target,
  Wallet,
  Grid,
  Brain,
  Ruler,
  Calculator,
  Spline,
  Activity,
  Atom,
  Orbit,
  Rocket,
  Telescope,
  Infinity as InfinityIcon,
  FlaskConical,
  Table2,
  Cpu,
  Flame,
  HeartPulse,
  Box,
  Shapes,
  Share2,
  X
} from 'lucide-react';

import {
  AppSettings,
  CalculatorCategory,
  CalculatorId,
  HistoryItem,
  ToastMessage
} from './types';
import { CALCULATORS_LIST } from './data/calculators';
import { translations } from './i18n/translations';
import { matchesCalculatorSearch } from './utils/calculatorSearch';

// Calculators
import { SimplePercentage } from './components/calculators/SimplePercentage';
import { PercentageIncreaseDecrease } from './components/calculators/PercentageIncreaseDecrease';
import { DiscountCalculator } from './components/calculators/DiscountCalculator';
import { PriceComparator } from './components/calculators/PriceComparator';
import { TipCalculator } from './components/calculators/TipCalculator';
import { FractionToPercentage } from './components/calculators/FractionToPercentage';
import { MarkupCalculator } from './components/calculators/MarkupCalculator';
import { MarginCalculator } from './components/calculators/MarginCalculator';
import { VatSalesTaxCalculator } from './components/calculators/VatSalesTaxCalculator';
import { TradersCalculator } from './components/calculators/TradersCalculator';
import { CompoundInterestCalculator } from './components/calculators/CompoundInterestCalculator';
import { CagrCalculator } from './components/calculators/CagrCalculator';
import { InflationCalculator } from './components/calculators/InflationCalculator';
import { DoublingTimeCalculator } from './components/calculators/DoublingTimeCalculator';
import { LoanCalculator } from './components/calculators/LoanCalculator';
import { AmortizationSchedule } from './components/calculators/AmortizationSchedule';
import { PercentagePoints } from './components/calculators/PercentagePoints';
import { PercentOfPercentCalculator } from './components/calculators/PercentOfPercentCalculator';
import { BreakEvenCalculator } from './components/calculators/BreakEvenCalculator';
import { SalaryIncreaseCalculator } from './components/calculators/SalaryIncreaseCalculator';
import { BatchCalculator } from './components/calculators/BatchCalculator';
import { MentalMathTrainer } from './components/calculators/MentalMathTrainer';
import { UniversalUnitConverter } from './components/calculators/UniversalUnitConverter';
import { MasterScientificCalculator } from './components/calculators/MasterScientificCalculator';
import { EquationSolver } from './components/calculators/EquationSolver';
import { StatisticsProCalculator } from './components/calculators/StatisticsProCalculator';
import { QuantumLabCalculator } from './components/calculators/QuantumLabCalculator';
import { QuantumPhysicsCalculator } from './components/calculators/QuantumPhysicsCalculator';
import { HohmannTransferCalculator } from './components/calculators/HohmannTransferCalculator';
import { AstrophysicsOrbitalCalculator } from './components/calculators/AstrophysicsOrbitalCalculator';
import { EinsteinRosenCalculator } from './components/calculators/EinsteinRosenCalculator';
import { ChemistryLabCalculator } from './components/calculators/ChemistryLabCalculator';
import { MatrixLabCalculator } from './components/calculators/MatrixLabCalculator';
import { ElectronicsLabCalculator } from './components/calculators/ElectronicsLabCalculator';
import { FireFinanceCalculator } from './components/calculators/FireFinanceCalculator';
import { FitnessBiomathCalculator } from './components/calculators/FitnessBiomathCalculator';
import { Graph3DCalculator } from './components/calculators/Graph3DCalculator';
import { OmniGeometrySurfaceVolumeCalculator } from './components/calculators/OmniGeometrySurfaceVolumeCalculator';
import { MaterialDensityWeightCalculator } from './components/calculators/MaterialDensityWeightCalculator';

// Common Toolbars & Responsive Components
import { CalculatorToolbar } from './components/common/CalculatorToolbar';
import { MobileCalculatorSheet } from './components/common/MobileCalculatorSheet';
import { MobileBottomBar } from './components/common/MobileBottomBar';

// Modals & Master Tools
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { Keypad } from './components/Keypad';
import { Toast } from './components/Toast';
import { BigDisplayModal } from './components/BigDisplayModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'it',
  currency: {
    code: 'EUR',
    symbol: '€'
  },
  decimalPrecision: 2,
  decimalSeparator: ',',
  theme: 'system',
  showKeypad: false,
  soundEnabled: true,
  favorites: ['simple', 'discount', 'price-comparator', 'vat', 'compound-interest']
};

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Percent,
  TrendingUp,
  Tag,
  Receipt: ReceiptIcon,
  Divide,
  Layers,
  PieChart,
  FileSpreadsheet,
  Briefcase,
  LineChart,
  Compass,
  Gauge,
  Zap,
  Landmark,
  Scale,
  Table: TableIcon,
  Target,
  Wallet,
  Grid,
  Brain,
  Ruler,
  Calculator,
  Spline,
  Activity,
  Atom,
  Orbit,
  Rocket,
  Telescope,
  Infinity: InfinityIcon,
  FlaskConical,
  Table2,
  Cpu,
  Flame,
  HeartPulse,
  Box,
  Shapes
};

export default function App() {
  // Load saved settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('pc_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          favorites: parsed.favorites || DEFAULT_SETTINGS.favorites
        };
      }
    } catch (_) {}
    return DEFAULT_SETTINGS;
  });

  // Load saved history
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pc_history');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [lastDeletedHistory, setLastDeletedHistory] = useState<HistoryItem[] | null>(null);

  const [activeCategory, setActiveCategory] = useState<CalculatorCategory>('all');
  const [activeCalcId, setActiveCalcId] = useState<CalculatorId>('simple');
  const [searchQuery, setSearchQuery] = useState('');
  const [restoredInputs, setRestoredInputs] = useState<Partial<Record<CalculatorId, Record<string, string>>>>({});

  // Modals & Tools
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Big Display & Receipt States
  const [bigDisplayData, setBigDisplayData] = useState<{
    isOpen: boolean;
    title: string;
    mainValue: string;
    mainLabel: string;
    details: { label: string; value: string }[];
  }>({
    isOpen: false,
    title: '',
    mainValue: '',
    mainLabel: '',
    details: []
  });

  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    title: string;
    summary: string;
    details: { label: string; value: string }[];
    formula: string;
  }>({
    isOpen: false,
    title: '',
    summary: '',
    details: [],
    formula: ''
  });

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem('pc_settings', JSON.stringify(settings));
    } catch (_) {}
  }, [settings]);

  // History sync
  useEffect(() => {
    try {
      localStorage.setItem('pc_history', JSON.stringify(history));
    } catch (_) {}
  }, [history]);

  const t = translations[settings.language] || translations.it;

  const showToast = (text: string, type: ToastMessage['type'] = 'success', action?: ToastMessage['action']) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleFavorite = (id: CalculatorId) => {
    setSettings((prev) => {
      const isFav = prev.favorites.includes(id);
      const nextFavorites = isFav
        ? prev.favorites.filter((f) => f !== id)
        : [...prev.favorites, id];
      showToast(isFav ? t.favoriteRemoved : t.favoriteAdded);
      return { ...prev, favorites: nextFavorites };
    });
  };

  const handleSaveHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
  };

  const handleClearHistory = () => {
    setLastDeletedHistory(history);
    setHistory([]);
    showToast(t.historyCleared, 'info', {
      label: t.undo,
      onClick: () => {
        if (lastDeletedHistory) {
          setHistory(lastDeletedHistory);
          setLastDeletedHistory(null);
        }
      }
    });
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearSectionHistory = (calculatorId: CalculatorId) => {
    const previous = history.filter((item) => item.calculatorId === calculatorId);
    setHistory((prev) => prev.filter((item) => item.calculatorId !== calculatorId));
    showToast(
      settings.language === 'it' ? 'Cronologia di sezione cancellata' : 'Section history cleared',
      'info',
      {
        label: t.undo,
        onClick: () => {
          setHistory((prev) => [...previous, ...prev]);
        }
      }
    );
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveCalcId(item.calculatorId);
    if (item.inputs) {
      setRestoredInputs((prev) => ({
        ...prev,
        [item.calculatorId]: item.inputs
      }));
    }
    showToast(t.calculationRestored);
  };

  // Export full history to CSV
  const handleExportAllHistoryCsv = () => {
    if (history.length === 0) {
      showToast(settings.language === 'it' ? 'Nessun dato nella cronologia da esportare' : 'History is empty', 'info');
      return;
    }

    const headers = ['Data e Ora', 'Calcolatore', 'Riepilogo', 'Formula'];
    const rows = history.map((item) => [
      `"${new Date(item.timestamp).toLocaleString()}"`,
      `"${item.calculatorTitle}"`,
      `"${item.summary.replace(/"/g, '""')}"`,
      `"${item.formula.replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cronologia_calcoli_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(settings.language === 'it' ? 'Cronologia esportata in CSV!' : 'History CSV exported!');
  };

  const isSearching = searchQuery.trim().length > 0;

  // Filtered calculators
  const filteredCalculators = useMemo(() => {
    if (isSearching) {
      // Quando l'utente cerca, cerca tra TUTTI i 38 calcolatori dell'applicazione (non ristretto alla categoria)
      return CALCULATORS_LIST.filter((calc) =>
        matchesCalculatorSearch(calc, searchQuery, settings.language)
      );
    }

    return CALCULATORS_LIST.filter((calc) => {
      if (activeCategory === 'favorites') {
        return settings.favorites.includes(calc.id);
      }
      if (activeCategory === 'all') {
        return true;
      }
      return calc.category === activeCategory;
    });
  }, [isSearching, searchQuery, activeCategory, settings.favorites, settings.language]);

  // Keypad simulation
  const handleKeypadPress = (key: string) => {
    const activeEl = document.activeElement as HTMLInputElement | null;
    if (activeEl && activeEl.tagName === 'INPUT' && !activeEl.readOnly) {
      if (key === 'C') {
        activeEl.value = '';
      } else if (key === 'DEL') {
        activeEl.value = activeEl.value.slice(0, -1);
      } else if (key === '=') {
        // Trigger change
      } else if (key.startsWith('+') || key.startsWith('-')) {
        const currentNum = parseFloat(activeEl.value.replace(',', '.')) || 0;
        const pctDelta = parseFloat(key.replace('%', ''));
        const updated = currentNum * (1 + pctDelta / 100);
        activeEl.value = updated.toFixed(settings.decimalPrecision).replace('.', settings.decimalSeparator);
      } else {
        activeEl.value += key;
      }
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      showToast(settings.language === 'it' ? 'Seleziona un campo prima di digitare' : 'Focus an input first', 'info');
    }
  };

  const activeCalcIsFavorite = settings.favorites.includes(activeCalcId);

  const activeCalcMeta = useMemo(() => {
    return CALCULATORS_LIST.find((c) => c.id === activeCalcId) || CALCULATORS_LIST[0];
  }, [activeCalcId]);

  const ActiveIconComponent = ICON_MAP[activeCalcMeta.icon] || Percent;

  const isDarkMode =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleToggleTheme = () => {
    setSettings((s) => ({ ...s, theme: isDarkMode ? 'light' : 'dark' }));
  };

  const activeCategoryTitle = useMemo(() => {
    if (activeCategory === 'all') return t.all;
    if (activeCategory === 'favorites') return t.favorites;
    if (activeCategory === 'everyday') return t.everyday;
    if (activeCategory === 'business') return t.business;
    if (activeCategory === 'science') return t.science || 'Scienza & Scientifica 🔬';
    if (activeCategory === 'quantum') return t.quantum || 'Calcoli Quantistici ⚛️';
    if (activeCategory === 'astronomy') return t.astronomy || 'Astronomia Interplanetaria 🪐';
    if (activeCategory === 'chemistry') return t.chemistry || 'Chimica & Tavola 🧪';
    if (activeCategory === 'matrices') return t.matrices || 'Matrici & Algebra 📐';
    if (activeCategory === 'electronics') return t.electronics || 'Elettronica & Circuiti ⚡';
    if (activeCategory === 'finance-fire') return t.finance_fire || 'FIRE & Finanza 💰';
    if (activeCategory === 'health') return t.health || 'Salute & Fitness 🏃';
    if (activeCategory === 'graphing-3d') return t.graphing_3d || 'Grafici 3D 🧊';
    if (activeCategory === 'geometry') return t.geometry || 'Superfici & Volumi 📐';
    if (activeCategory === 'materials') return t.materials || 'Pesi Specifici & Materiali ⚖️';
    if (activeCategory === 'trainer') return t.trainer;
    return t.converter || 'Convertitore 🌐';
  }, [activeCategory, t]);

  const categoryItems = useMemo(() => [
    { id: 'all' as CalculatorCategory, label: t.all || 'Tutti i Calcolatori', desc: `Catalogo completo (${CALCULATORS_LIST.length})`, icon: Layers, count: CALCULATORS_LIST.length },
    { id: 'favorites' as CalculatorCategory, label: t.favorites || 'Preferiti', desc: 'Fissati con la stella ⭐', icon: Star, count: settings.favorites.length },
    { id: 'materials' as CalculatorCategory, label: t.materials || 'Pesi Specifici & Materiali', desc: 'Densità di tutti i materiali al mondo', icon: Scale, count: CALCULATORS_LIST.filter(c => c.category === 'materials').length },
    { id: 'geometry' as CalculatorCategory, label: t.geometry || 'Superfici & Volumi', desc: 'Tutti i solidi & forme 3D/4D', icon: Shapes, count: CALCULATORS_LIST.filter(c => c.category === 'geometry').length },
    { id: 'science' as CalculatorCategory, label: t.science || 'Scienza & Scientifica', desc: 'Laboratorio e costanti NIST', icon: Sparkles, count: CALCULATORS_LIST.filter(c => c.category === 'science').length },
    { id: 'quantum' as CalculatorCategory, label: t.quantum || 'Calcoli Quantistici', desc: 'Simulatore Qubit, Bloch, Bell', icon: Atom, count: CALCULATORS_LIST.filter(c => c.category === 'quantum').length },
    { id: 'astronomy' as CalculatorCategory, label: t.astronomy || 'Astronomia Interplanetaria', desc: 'Orbite, Keplero, Ritardo Luce', icon: Orbit, count: CALCULATORS_LIST.filter(c => c.category === 'astronomy').length },
    { id: 'chemistry' as CalculatorCategory, label: t.chemistry || 'Chimica & Tavola', desc: 'Massa molare, pH, Reazioni', icon: FlaskConical, count: CALCULATORS_LIST.filter(c => c.category === 'chemistry').length },
    { id: 'matrices' as CalculatorCategory, label: t.matrices || 'Matrici & Algebra', desc: 'Det, Inversa, Autovalori', icon: Table2, count: CALCULATORS_LIST.filter(c => c.category === 'matrices').length },
    { id: 'electronics' as CalculatorCategory, label: t.electronics || 'Elettronica & Circuiti', desc: 'Resistori, RLC, Filtri RC', icon: Cpu, count: CALCULATORS_LIST.filter(c => c.category === 'electronics').length },
    { id: 'finance-fire' as CalculatorCategory, label: t.finance_fire || 'FIRE & Finanza', desc: 'Regola 4%, PAC, Tasse', icon: Flame, count: CALCULATORS_LIST.filter(c => c.category === 'finance-fire').length },
    { id: 'health' as CalculatorCategory, label: t.health || 'Salute & Fitness', desc: 'BMR, TDEE, Macro, 1RM', icon: HeartPulse, count: CALCULATORS_LIST.filter(c => c.category === 'health').length },
    { id: 'graphing-3d' as CalculatorCategory, label: t.graphing_3d || 'Grafici 3D', desc: 'Superfici z=f(x,y)', icon: Box, count: CALCULATORS_LIST.filter(c => c.category === 'graphing-3d').length },
    { id: 'everyday' as CalculatorCategory, label: t.everyday || 'Base & Quotidiano', desc: 'Percentuali, Sconti, Mance', icon: Percent, count: CALCULATORS_LIST.filter(c => c.category === 'everyday').length },
    { id: 'business' as CalculatorCategory, label: t.business || 'Business & Impresa', desc: 'Margini, Mutui, IVA, Break-even', icon: Briefcase, count: CALCULATORS_LIST.filter(c => c.category === 'business').length },
    { id: 'trainer' as CalculatorCategory, label: t.trainer || 'Allenatore Mentale', desc: 'Quiz e Calcolo Rapido', icon: Brain, count: CALCULATORS_LIST.filter(c => c.category === 'trainer').length },
    { id: 'converter' as CalculatorCategory, label: t.converter || 'Convertitore Universale', desc: 'Unità fisiche SI & Imp', icon: Ruler, count: CALCULATORS_LIST.filter(c => c.category === 'converter').length }
  ], [t, settings.favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-zinc-950 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs font-mono font-extrabold text-lg tracking-tighter">
              %
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                  Percentage Calculator
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  MASTER PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Command Bar on desktop */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center justify-between gap-3 flex-1 max-w-lg mx-4 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 text-xs text-slate-500 dark:text-zinc-400 hover:border-emerald-500 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>{t.searchPlaceholder}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 text-slate-600 dark:text-zinc-300 font-semibold shadow-2xs">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>

          {/* Coherent Header Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-750 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
              title={isDarkMode ? 'Passa al tema Chiaro' : 'Passa al tema Scuro'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportAllHistoryCsv}
              className="hidden sm:flex h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-750 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-2xs items-center justify-center shrink-0 cursor-pointer"
              title="Esporta Cronologia in CSV"
              aria-label="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Virtual Keypad Toggle Button */}
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, showKeypad: !s.showKeypad }))}
              className={`h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl border transition-all shadow-2xs flex items-center justify-center shrink-0 cursor-pointer ${
                settings.showKeypad
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-500/60'
                  : 'border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-750'
              }`}
              title={t.keypadToggle}
              aria-label="Toggle keypad"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* History Modal Trigger Button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-750 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-2xs flex items-center justify-center relative shrink-0 cursor-pointer"
              title={t.history}
              aria-label="Open history"
            >
              <Clock className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>

            {/* Settings Modal Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-750 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
              title={t.settings}
              aria-label="Open settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search bar */}
        <div className="md:hidden px-3 sm:px-4 pb-2.5">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>{t.searchPlaceholder}</span>
            </div>
            <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 font-semibold">
              Cerca
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Layout - Dual Wide Lateral Navbars & Active Workspace */}
      <main className="flex-1 max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 pb-28 lg:pb-12">
        {/* Mobile Active Calculator Bar (compact & touch-friendly) */}
        <div className="lg:hidden mb-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
              <ActiveIconComponent className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                  {t[activeCalcMeta.titleKey] || activeCalcMeta.id}
                </span>
                {activeCalcMeta.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    {activeCalcMeta.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                {activeCategoryTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileSelectorOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cambia ({CALCULATORS_LIST.length})</span>
          </button>
        </div>

        {/* Dual Lateral Navbars + Central Workspace Container */}
        <div className="flex flex-col lg:flex-row items-start gap-4 xl:gap-5 2xl:gap-6 w-full">
          {/* ========================================================
              NAVBAR LATERALE 1: CATEGORIE (Verticale allargata a sinistra)
              ======================================================== */}
          <aside
            aria-label="Aree e Categorie"
            className="hidden lg:flex flex-col w-60 xl:w-64 2xl:w-72 shrink-0 sticky top-24 space-y-2.5"
          >
            {/* Header Barra Categorie */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200 block">
                    Aree Tematiche
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                    16 sezioni
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/70 dark:border-zinc-700">
                {CALCULATORS_LIST.length}
              </span>
            </div>

            {/* Lista Categorie Verticale Allargata (con scrollbar nera) */}
            <div className="space-y-1.5 max-h-[calc(100vh-175px)] overflow-y-auto pr-1.5">
              {categoryItems.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between gap-3 border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                        : 'bg-white/85 dark:bg-zinc-900/85 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-850 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-xl shrink-0 transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block truncate">
                          {cat.label}
                        </span>
                        <span
                          className={`text-[10px] block truncate mt-0.5 ${
                            isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'
                          }`}
                        >
                          {cat.desc}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ========================================================
              NAVBAR LATERALE 2: CALCOLATORI (Di fianco alla prima, Allargata)
              ======================================================== */}
          <aside
            aria-label="Calcolatori Selezionati"
            className="hidden lg:flex flex-col w-72 xl:w-80 2xl:w-[360px] shrink-0 sticky top-24 space-y-2.5"
          >
            {/* Header Barra Calcolatori */}
            <div className="p-3 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200 truncate">
                    {isSearching ? 'Tutti i Risultati' : activeCategoryTitle}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold shrink-0">
                    {filteredCalculators.length}
                  </span>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Azzera
                  </button>
                )}
              </div>

              {/* Barra di ricerca rapida calcolatori */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca qualsiasi calcolatore o formula..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200/90 dark:border-zinc-700/80 bg-slate-50/90 dark:bg-zinc-800/90 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5 cursor-pointer"
                    title="Azzera ricerca"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Lista Calcolatori Verticale Allargata (con scrollbar nera) */}
            <div className="space-y-2 max-h-[calc(100vh-215px)] overflow-y-auto pr-1.5">
              {filteredCalculators.map((calc) => {
                const IconComponent = ICON_MAP[calc.icon] || Percent;
                const isActive = calc.id === activeCalcId;
                const isFav = settings.favorites.includes(calc.id);

                return (
                  <div key={calc.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCalcId(calc.id);
                        if (isSearching) {
                          setActiveCategory(calc.category);
                        }
                      }}
                      className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between gap-3 border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                          : 'bg-white/85 dark:bg-zinc-900/85 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-8 flex-1">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                          }`}
                        >
                          <IconComponent className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{t[calc.titleKey] || calc.id}</span>
                            {calc.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono font-extrabold ${
                                  isActive
                                    ? 'bg-white/25 text-white'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20'
                                }`}
                              >
                                {calc.badge}
                              </span>
                            )}
                            {isSearching && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-md font-medium ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60'
                                }`}
                              >
                                {t[calc.category.replace('-', '_')] || calc.category}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] line-clamp-1 mt-0.5 ${
                              isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'
                            }`}
                          >
                            {t[calc.descriptionKey]}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? 'text-white translate-x-0.5' : 'text-slate-300 dark:text-zinc-600'
                        }`}
                      />
                    </button>

                    {/* Quick Star Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(calc.id);
                      }}
                      className={`absolute right-9 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                        isFav
                          ? 'opacity-100 text-amber-400 hover:scale-110'
                          : 'opacity-0 group-hover:opacity-100 text-slate-300 hover:text-amber-400'
                      }`}
                      title="Fissa nei Preferiti ⭐"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                );
              })}

              {filteredCalculators.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 space-y-2">
                  <p className="font-semibold">
                    {activeCategory === 'favorites' && !isSearching
                      ? 'Nessun calcolatore nei Preferiti. Clicca la stella ⭐ su qualsiasi calcolatore per aggiungerlo!'
                      : `Nessun calcolatore trovato per "${searchQuery}"`}
                  </p>
                  {isSearching && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Azzera ricerca
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* ========================================================
              AREA PRINCIPALE: CALCOLATORE ATTIVO (Spazio Allargato)
              ======================================================== */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Universal Coherent Calculator Header & Action Toolbar */}
            <CalculatorToolbar
              id={activeCalcId}
              title={t[activeCalcMeta.titleKey] || activeCalcMeta.id}
              description={t[activeCalcMeta.descriptionKey] || ''}
              categoryLabel={activeCategoryTitle}
              badge={activeCalcMeta.badge}
              iconComponent={ActiveIconComponent}
              isFavorite={activeCalcIsFavorite}
              onToggleFavorite={() => handleToggleFavorite(activeCalcId)}
              onOpenMobileSelector={() => setIsMobileSelectorOpen(true)}
              onCopyShareLink={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link calcolatore copiato negli appunti!');
                }
              }}
            />
            {activeCalcId === 'simple' && (
              <SimplePercentage
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['simple']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'increase-decrease' && (
              <PercentageIncreaseDecrease
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['increase-decrease']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'discount' && (
              <DiscountCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['discount']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('discount')}
                onOpenBigDisplay={(data) =>
                  setBigDisplayData({
                    isOpen: true,
                    title: 'Sconto Commerciale',
                    ...data
                  })
                }
                onOpenReceipt={(data) => setReceiptData({ isOpen: true, ...data })}
              />
            )}
            {activeCalcId === 'price-comparator' && (
              <PriceComparator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['price-comparator']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'tip' && (
              <TipCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['tip']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'fractions' && (
              <FractionToPercentage
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['fractions']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'percentage-points' && (
              <PercentagePoints
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['percentage-points']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'percent-of-percent' && (
              <PercentOfPercentCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['percent-of-percent']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('percent-of-percent')}
              />
            )}
            {activeCalcId === 'batch-percentage' && (
              <BatchCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['batch-percentage']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('batch-percentage')}
              />
            )}
            {activeCalcId === 'markup' && (
              <MarkupCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['markup']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'margin' && (
              <MarginCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['margin']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'break-even' && (
              <BreakEvenCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['break-even']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('break-even')}
              />
            )}
            {activeCalcId === 'salary-increase' && (
              <SalaryIncreaseCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['salary-increase']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('salary-increase')}
              />
            )}
            {activeCalcId === 'vat' && (
              <VatSalesTaxCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['vat']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('vat')}
                onOpenBigDisplay={(data) =>
                  setBigDisplayData({
                    isOpen: true,
                    title: 'Calcolo IVA',
                    ...data
                  })
                }
                onOpenReceipt={(data) => setReceiptData({ isOpen: true, ...data })}
              />
            )}
            {activeCalcId === 'trader' && (
              <TradersCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['trader']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'compound-interest' && (
              <CompoundInterestCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['compound-interest']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('compound-interest')}
                onOpenBigDisplay={(data) =>
                  setBigDisplayData({
                    isOpen: true,
                    title: 'Interesse Composto',
                    ...data
                  })
                }
                onOpenReceipt={(data) => setReceiptData({ isOpen: true, ...data })}
              />
            )}
            {activeCalcId === 'cagr' && (
              <CagrCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['cagr']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'inflation' && (
              <InflationCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['inflation']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'doubling-time' && (
              <DoublingTimeCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['doubling-time']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'loan' && (
              <LoanCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['loan']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'amortization-schedule' && (
              <AmortizationSchedule
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['amortization-schedule']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
              />
            )}
            {activeCalcId === 'trainer' && (
              <MentalMathTrainer
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('trainer')}
              />
            )}
            {activeCalcId === 'unit-converter' && (
              <UniversalUnitConverter
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={showToast}
                history={history}
                initialInputs={restoredInputs['unit-converter']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('unit-converter')}
              />
            )}
            {activeCalcId === 'scientific' && (
              <MasterScientificCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['scientific']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('scientific')}
              />
            )}
            {activeCalcId === 'equations' && (
              <EquationSolver
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['equations']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('equations')}
              />
            )}
            {activeCalcId === 'statistics' && (
              <StatisticsProCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['statistics']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('statistics')}
              />
            )}
            {activeCalcId === 'quantum-lab' && (
              <QuantumLabCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['quantum-lab']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('quantum-lab')}
              />
            )}
            {activeCalcId === 'quantum-physics' && (
              <QuantumPhysicsCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['quantum-physics']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('quantum-physics')}
              />
            )}
            {activeCalcId === 'hohmann-transfer' && (
              <HohmannTransferCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['hohmann-transfer']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('hohmann-transfer')}
              />
            )}
            {activeCalcId === 'astrophysics-orbital' && (
              <AstrophysicsOrbitalCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['astrophysics-orbital']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('astrophysics-orbital')}
              />
            )}
            {activeCalcId === 'einstein-rosen' && (
              <EinsteinRosenCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['einstein-rosen']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('einstein-rosen')}
              />
            )}
            {activeCalcId === 'chemistry-lab' && (
              <ChemistryLabCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['chemistry-lab']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('chemistry-lab')}
              />
            )}
            {activeCalcId === 'matrix-lab' && (
              <MatrixLabCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['matrix-lab']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('matrix-lab')}
              />
            )}
            {activeCalcId === 'electronics-lab' && (
              <ElectronicsLabCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['electronics-lab']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('electronics-lab')}
              />
            )}
            {activeCalcId === 'fire-finance' && (
              <FireFinanceCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['fire-finance']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('fire-finance')}
              />
            )}
            {activeCalcId === 'fitness-biomath' && (
              <FitnessBiomathCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['fitness-biomath']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('fitness-biomath')}
              />
            )}
            {activeCalcId === 'graph-3d' && (
              <Graph3DCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['graph-3d']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('graph-3d')}
              />
            )}
            {activeCalcId === 'geometry-surface-volume' && (
              <OmniGeometrySurfaceVolumeCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['geometry-surface-volume']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('geometry-surface-volume')}
              />
            )}
            {activeCalcId === 'material-density-weight' && (
              <MaterialDensityWeightCalculator
                settings={settings}
                onSaveHistory={handleSaveHistoryItem}
                showToast={(text) => showToast(text, 'success')}
                history={history}
                initialInputs={restoredInputs['material-density-weight']}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearSectionHistory={handleClearSectionHistory}
                isFavorite={activeCalcIsFavorite}
                onToggleFavorite={() => handleToggleFavorite('material-density-weight')}
              />
            )}
          </div>
        </div>
      </main>

      {/* Floating Keypad */}
      {settings.showKeypad && (
        <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
          <Keypad
            settings={settings}
            onKeyPress={handleKeypadPress}
            onClose={() => setSettings((s) => ({ ...s, showKeypad: false }))}
          />
        </div>
      )}

      {/* Sticky Bottom Navigation for Mobile (lg:hidden) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-zinc-800 px-3 py-1.5 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center text-center">
          {/* 1. Scegli / Calcolatore */}
          <button
            type="button"
            onClick={() => setIsMobileSelectorOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              isMobileSelectorOpen
                ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/40'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium leading-none">Calcolatori</span>
          </button>

          {/* 2. Cerca (Command Palette) */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 transition-all cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium leading-none">Cerca</span>
          </button>

          {/* 3. Tastierino */}
          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, showKeypad: !s.showKeypad }))}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              settings.showKeypad
                ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/40'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            <Keyboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium leading-none">Tastierino</span>
          </button>

          {/* 4. Cronologia */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 transition-all relative cursor-pointer"
          >
            <Clock className="w-5 h-5" />
            {history.length > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            )}
            <span className="text-[10px] mt-0.5 font-medium leading-none">Cronologia</span>
          </button>

          {/* 5. Impostazioni */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 transition-all cursor-pointer"
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium leading-none">Opzioni</span>
          </button>
        </div>
      </nav>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryEntry}
        onSelectHistoryItem={handleSelectHistoryItem}
        settings={settings}
        showToast={showToast}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
      />

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectCalculator={(id) => {
          setActiveCalcId(id);
          showToast(`Aperto: ${id}`);
        }}
        settings={settings}
      />

      {/* Big Display Modal */}
      <BigDisplayModal
        isOpen={bigDisplayData.isOpen}
        onClose={() => setBigDisplayData((prev) => ({ ...prev, isOpen: false }))}
        title={bigDisplayData.title}
        mainValue={bigDisplayData.mainValue}
        mainLabel={bigDisplayData.mainLabel}
        secondaryItems={bigDisplayData.details}
        settings={settings}
        showToast={showToast}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptData.isOpen}
        onClose={() => setReceiptData((prev) => ({ ...prev, isOpen: false }))}
        title={receiptData.title}
        summary={receiptData.summary}
        details={receiptData.details}
        formula={receiptData.formula}
        settings={settings}
        showToast={showToast}
      />

      {/* Mobile Dedicated Calculator Selection Bottom Sheet */}
      <MobileCalculatorSheet
        isOpen={isMobileSelectorOpen}
        onClose={() => setIsMobileSelectorOpen(false)}
        activeCalcId={activeCalcId}
        onSelectCalculator={(id) => {
          setActiveCalcId(id);
          setIsMobileSelectorOpen(false);
          showToast(`Aperto: ${id}`);
        }}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        settings={settings}
        onToggleFavorite={handleToggleFavorite}
        t={t}
        iconMap={ICON_MAP}
      />

      {/* Mobile Sticky Bottom Navigation Bar (Thumb-Accessible) */}
      <MobileBottomBar
        onOpenSelector={() => setIsMobileSelectorOpen(true)}
        onToggleKeypad={() => setSettings((s) => ({ ...s, showKeypad: !s.showKeypad }))}
        isKeypadActive={settings.showKeypad}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Minimalistic footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 py-4 pb-20 lg:pb-4 text-center text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-[1720px] 2xl:max-w-[1880px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Percentage Calculator MASTER PRO · 36 Sezioni con Geometria Universale Superfici & Volumi, Calcolatrice Scientifica Pro, Laboratorio Quantistico & Qubit, Astrofisica, Relatività & Wormhole, Chimica, Matrici ed Elettronica</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportAllHistoryCsv}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportCsv}</span>
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {t.history} ({history.length})
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {t.settings}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

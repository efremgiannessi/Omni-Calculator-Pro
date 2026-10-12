import React, { useState, useEffect, useMemo } from 'react';
import {
  Ruler,
  Scale,
  Package,
  Layers,
  Thermometer,
  Zap,
  Clock,
  Gauge,
  Flame,
  HardDrive,
  Wifi,
  Compass,
  Fuel,
  Activity,
  Radio,
  Waves,
  Box,
  Repeat,
  Type,
  BatteryCharging,
  Coffee,
  ArrowRightLeft,
  Copy,
  Download,
  Search,
  Sparkles,
  BookOpen,
  Check,
  Star,
  Hash,
  Globe
} from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { UNIT_CATEGORIES, UnitCategory, UnitDefinition } from '../../data/units';

// Map icon strings to Lucide components
const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Ruler,
  Scale,
  Package,
  Layers,
  Thermometer,
  Zap,
  Clock,
  Gauge,
  Flame,
  HardDrive,
  Wifi,
  Compass,
  Fuel,
  Activity,
  Radio,
  Waves,
  Box,
  Repeat,
  Type,
  BatteryCharging,
  Coffee
};

interface UniversalUnitConverterProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const UniversalUnitConverter: React.FC<UniversalUnitConverterProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  // Selected category & units
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('length');
  const [fromUnitId, setFromUnitId] = useState<string>('km');
  const [toUnitId, setToUnitId] = useState<string>('mi');
  const [inputValue, setInputValue] = useState<string>('10');
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('all');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [precision, setPrecision] = useState<number>(4);
  const [useScientificNotation, setUseScientificNotation] = useState<boolean>(false);
  const [copiedUnitId, setCopiedUnitId] = useState<string | null>(null);

  // Restore initial inputs if passed from history
  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.categoryId && UNIT_CATEGORIES.some(c => c.id === initialInputs.categoryId)) {
        setSelectedCategoryId(initialInputs.categoryId);
      }
      if (initialInputs.fromUnit) setFromUnitId(initialInputs.fromUnit);
      if (initialInputs.toUnit) setToUnitId(initialInputs.toUnit);
      if (initialInputs.inputValue) setInputValue(initialInputs.inputValue);
    }
  }, [initialInputs]);

  // Current category
  const currentCategory = useMemo<UnitCategory>(() => {
    return UNIT_CATEGORIES.find(c => c.id === selectedCategoryId) || UNIT_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Ensure fromUnit and toUnit belong to currentCategory
  useEffect(() => {
    const unitIds = currentCategory.units.map(u => u.id);
    if (!unitIds.includes(fromUnitId)) {
      setFromUnitId(currentCategory.units[0]?.id || '');
    }
    if (!unitIds.includes(toUnitId)) {
      setToUnitId(currentCategory.units[1]?.id || currentCategory.units[0]?.id || '');
    }
  }, [selectedCategoryId, currentCategory]);

  const fromUnit = useMemo<UnitDefinition>(() => {
    return currentCategory.units.find(u => u.id === fromUnitId) || currentCategory.units[0];
  }, [currentCategory, fromUnitId]);

  const toUnit = useMemo<UnitDefinition>(() => {
    return currentCategory.units.find(u => u.id === toUnitId) || currentCategory.units[1] || currentCategory.units[0];
  }, [currentCategory, toUnitId]);

  // Numeric conversion logic
  const parsedVal = parseNumber(inputValue);
  const numValue = parsedVal !== null && !isNaN(parsedVal) ? parsedVal : 0;

  const convertedValue = useMemo<number>(() => {
    if (!fromUnit || !toUnit) return 0;
    try {
      const baseValue = fromUnit.toBase(numValue);
      return toUnit.fromBase(baseValue);
    } catch {
      return 0;
    }
  }, [numValue, fromUnit, toUnit]);

  // Multi-unit conversions for the entire category
  const allCategoryConversions = useMemo(() => {
    if (!fromUnit) return [];
    try {
      const baseValue = fromUnit.toBase(numValue);
      return currentCategory.units.map(unit => {
        const val = unit.fromBase(baseValue);
        return {
          unit,
          value: val,
          isSource: unit.id === fromUnit.id,
          isTarget: unit.id === toUnit.id
        };
      });
    } catch {
      return [];
    }
  }, [numValue, fromUnit, toUnit, currentCategory]);

  // Formatter for unit values
  const formatResultValue = (val: number): string => {
    if (isNaN(val)) return '0';
    if (val === 0) return '0';
    
    // Check if scientific notation is needed or enabled
    const absVal = Math.abs(val);
    if (useScientificNotation || (absVal < 0.0001 && absVal > 0) || absVal >= 1e9) {
      return val.toExponential(precision);
    }

    return formatNumber(val, settings, precision);
  };

  // Swap units
  const handleSwapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  // Copy result
  const handleCopyResult = (val: string, unitSymbol: string, unitId?: string) => {
    const text = `${val} ${unitSymbol}`;
    navigator.clipboard.writeText(text);
    if (unitId) {
      setCopiedUnitId(unitId);
      setTimeout(() => setCopiedUnitId(null), 1500);
    }
    showToast(`Copiato: ${text}`);
  };

  // Save to history
  const handleSaveToHistory = () => {
    if (!fromUnit || !toUnit) return;
    const fromStr = `${formatNumber(numValue, settings, precision)} ${fromUnit.symbol}`;
    const toStr = `${formatResultValue(convertedValue)} ${toUnit.symbol}`;

    onSaveHistory({
      calculatorId: 'unit-converter',
      calculatorTitle: `Convertitore: ${currentCategory.name}`,
      summary: `${fromStr} = ${toStr}`,
      formula: `1 ${fromUnit.symbol} = ${formatResultValue(toUnit.fromBase(fromUnit.toBase(1)))} ${toUnit.symbol}`,
      details: [
        { label: 'Categoria', value: currentCategory.name },
        { label: 'Unità di Partenza', value: `${fromUnit.name} (${fromUnit.symbol})` },
        { label: 'Valore Iniziale', value: fromStr },
        { label: 'Unità di Destinazione', value: `${toUnit.name} (${toUnit.symbol})` },
        { label: 'Risultato Convertito', value: toStr }
      ],
      inputs: {
        categoryId: currentCategory.id,
        fromUnit: fromUnit.id,
        toUnit: toUnit.id,
        inputValue
      }
    });
    showToast('Conversione salvata nella cronologia!');
  };

  // Export Category Table to CSV
  const handleExportCSV = () => {
    if (!fromUnit) return;
    const rows = [
      ['Categoria', currentCategory.name],
      ['Valore Sorgente', `${inputValue} ${fromUnit.symbol} (${fromUnit.name})`],
      [''],
      ['Unità', 'Simbolo', 'Nome Completo', 'Sistema', 'Valore Convertito']
    ];

    allCategoryConversions.forEach(item => {
      rows.push([
        item.unit.id,
        item.unit.symbol,
        item.unit.name,
        item.unit.system || 'standard',
        formatResultValue(item.value)
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `conversioni_${currentCategory.id}_${inputValue}${fromUnit.symbol}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tabella esportata in CSV!');
  };

  // Filtered categories by group and global search
  const filteredCategories = useMemo(() => {
    return UNIT_CATEGORIES.filter(cat => {
      // Search filter searches ALL categories in the converter
      if (globalSearch.trim() !== '') {
        const query = globalSearch.toLowerCase().trim();
        const matchesCat = cat.name.toLowerCase().includes(query) || cat.nameEn.toLowerCase().includes(query);
        const matchesUnits = cat.units.some(
          u => u.name.toLowerCase().includes(query) || u.symbol.toLowerCase().includes(query) || u.id.toLowerCase().includes(query)
        );
        return matchesCat || matchesUnits;
      }
      // Group filter when not searching
      if (activeGroupFilter !== 'all' && cat.group !== activeGroupFilter) {
        return false;
      }
      return true;
    });
  }, [activeGroupFilter, globalSearch]);

  // Current category icon component
  const CurrentCategoryIcon = CATEGORY_ICON_MAP[currentCategory.icon] || Globe;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Convertitore Universale del Mondo
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-950/30 text-emerald-100 font-mono">
                23 Categorie · 200+ Unità
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <CurrentCategoryIcon className="w-6 h-6 text-emerald-200" />
              {currentCategory.name}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              {currentCategory.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5 shadow-xs"
              title="Salva questa conversione nella cronologia"
            >
              <BookOpen className="w-4 h-4" />
              Salva Cronologia
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white text-slate-900 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="Esporta tutte le conversioni della categoria in CSV"
            >
              <Download className="w-4 h-4" />
              Esporta CSV
            </button>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-2 rounded-xl text-xs transition-all ${
                  isFavorite ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Selection Bar & Global Search */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700/80 p-4 shadow-xs space-y-3">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onFocus={(e) => e.currentTarget.select()}
              onClick={(e) => e.currentTarget.select()}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Cerca unità (es. joule, miglio, psi, kelvin)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-zinc-100"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Group Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tutte (23)' },
              { id: 'everyday', label: 'Quotidiane' },
              { id: 'science', label: 'Scienza & Fisica' },
              { id: 'tech', label: 'Digitale & Web' },
              { id: 'practical', label: 'Pratiche & Cucina' }
            ].map(group => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroupFilter(group.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeGroupFilter === group.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-700/60 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
          {filteredCategories.map(cat => {
            const Icon = CATEGORY_ICON_MAP[cat.icon] || Globe;
            const isSelected = cat.id === selectedCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setFromUnitId(cat.units[0]?.id || '');
                  setToUnitId(cat.units[1]?.id || cat.units[0]?.id || '');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                    : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>{cat.name}</span>
                <span className="text-[10px] font-mono opacity-70 px-1 py-0.2 rounded bg-slate-200/50 dark:bg-zinc-800">
                  {cat.units.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Conversion Panel: Bi-directional Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Direct Converter (Da -> A) */}
        <div className="lg:col-span-6 space-y-4">
          <CalcCard
            title="Convertitore Diretto"
            description={currentCategory.description}
            onClear={() => setInputValue('0')}
            onCopy={() => handleCopyResult(formatResultValue(convertedValue), toUnit?.symbol || '', 'main')}
            onShare={() => {
              navigator.clipboard.writeText(`${inputValue} ${fromUnit.symbol} = ${formatResultValue(convertedValue)} ${toUnit.symbol}`);
              showToast('Copiato negli appunti!');
            }}
            onSaveToHistory={handleSaveToHistory}
            formula={`1 ${fromUnit.symbol} = ${formatResultValue(toUnit.fromBase(fromUnit.toBase(1)))} ${toUnit.symbol}`}
            steps={[
              `Valore iniziale: ${inputValue} ${fromUnit.symbol}`,
              `Equivalente unità base SI: ${formatResultValue(fromUnit.toBase(numValue))} ${currentCategory.baseUnit}`,
              `Risultato convertito: ${formatResultValue(convertedValue)} ${toUnit.symbol}`
            ]}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          >
            <div className="space-y-4">
              {/* FROM UNIT INPUT */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                    Da (Unità di Partenza)
                  </label>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    {fromUnit?.symbol}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7">
                    <CalcInput
                      label="Quantità da convertire"
                      value={inputValue}
                      onChange={setInputValue}
                      placeholder="Inserisci valore..."
                      suffix={fromUnit?.symbol}
                    />
                  </div>
                  <div className="sm:col-span-5 flex flex-col justify-end">
                    <label className="text-[10px] font-medium text-slate-400 mb-1">Seleziona Unità</label>
                    <select
                      value={fromUnitId}
                      onChange={(e) => setFromUnitId(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-zinc-100"
                    >
                      {currentCategory.units.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {fromUnit?.description && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                    ℹ️ {fromUnit.description}
                  </p>
                )}
              </div>

              {/* QUICK SWAP BUTTON */}
              <div className="flex items-center justify-center my-1">
                <button
                  type="button"
                  onClick={handleSwapUnits}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-2 text-xs font-bold shadow-xs active:scale-95"
                  title="Inverti unità"
                >
                  <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                  <span>Inverti Unità (⇄)</span>
                </button>
              </div>

              {/* TO UNIT RESULT */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    A (Unità di Destinazione)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {toUnit?.symbol}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-7">
                    <label className="text-[10px] font-medium text-slate-400 mb-1 block">Risultato Calcolato</label>
                    <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 rounded-xl">
                      <div className="overflow-x-auto py-0.5">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-50 font-mono tracking-tight">
                          {formatResultValue(convertedValue)}
                        </span>
                        <span className="ml-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {toUnit?.symbol}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyResult(formatResultValue(convertedValue), toUnit?.symbol || '', 'main')}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                        title="Copia risultato"
                      >
                        {copiedUnitId === 'main' ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-5 flex flex-col justify-end">
                    <label className="text-[10px] font-medium text-slate-400 mb-1">Seleziona Destinazione</label>
                    <select
                      value={toUnitId}
                      onChange={(e) => setToUnitId(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-zinc-100"
                    >
                      {currentCategory.units.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {toUnit?.description && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                    ℹ️ {toUnit.description}
                  </p>
                )}
              </div>

              {/* Formatting & Precision Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-zinc-700">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Decimali:</span>
                  {[2, 3, 4, 6].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrecision(p)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                        precision === p
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setUseScientificNotation(!useScientificNotation)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 ${
                    useScientificNotation
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                  title="Attiva/disattiva notazione scientifica (1.23e+4)"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Notazione Sci: {useScientificNotation ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </CalcCard>

          {/* Formula & Explanation Card */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700/80 p-4 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Formula & Passaggi Matematici
            </h4>
            <div className="bg-slate-50 dark:bg-zinc-900 rounded-xl p-3 text-xs font-mono text-slate-700 dark:text-zinc-300 space-y-1">
              <div>
                Rapporto base: <span className="font-bold text-emerald-600 dark:text-emerald-400">1 {fromUnit?.symbol} = {formatResultValue(toUnit?.fromBase(fromUnit?.toBase(1) || 0))} {toUnit?.symbol}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Formula applicata: {inputValue || '0'} {fromUnit?.symbol} × fattore di scala = {formatResultValue(convertedValue)} {toUnit?.symbol}
              </div>
            </div>
          </div>

          {/* Real-World Benchmarks for Active Category */}
          {currentCategory.benchmarks.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-500" />
                  Curiosità & Benchmark del Mondo Reale
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Clicca per testare</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {currentCategory.benchmarks.map((bm, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(currentCategory.id);
                      setFromUnitId(bm.unitId);
                      setInputValue(bm.value.toString());
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 border border-slate-200/60 dark:border-zinc-800 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {bm.label}
                      </span>
                      <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {bm.value} {bm.unitId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {bm.fact}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Omni-Matrix (All Units in Category Simultaneously) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-zinc-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <CurrentCategoryIcon className="w-5 h-5 text-emerald-500" />
                  Tutte le Conversioni in Simultanea
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {inputValue || '0'} {fromUnit?.symbol} convertito in tutte le {currentCategory.units.length} unità di {currentCategory.name}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold self-start sm:self-auto">
                {allCategoryConversions.length} unità attive
              </span>
            </div>

            {/* List of converted units */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
              {allCategoryConversions.map(({ unit, value, isSource, isTarget }) => {
                const isCurrentCopied = copiedUnitId === unit.id;
                return (
                  <div
                    key={unit.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSource
                        ? 'bg-slate-100/80 dark:bg-zinc-700/50 border-slate-300 dark:border-zinc-600'
                        : isTarget
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-400'
                        : 'bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200/70 dark:border-zinc-800/80 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {unit.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                          {unit.symbol}
                        </span>
                        {isSource && (
                          <span className="text-[10px] bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-1.5 rounded font-bold">
                            Origine
                          </span>
                        )}
                        {isTarget && (
                          <span className="text-[10px] bg-emerald-500 text-white px-1.5 rounded font-bold">
                            Destinazione
                          </span>
                        )}
                      </div>
                      {unit.description && (
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                          {unit.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-zinc-100">
                          {formatResultValue(value)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {unit.symbol}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyResult(formatResultValue(value), unit.symbol, unit.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Copia valore"
                        >
                          {isCurrentCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {!isTarget && (
                          <button
                            type="button"
                            onClick={() => setToUnitId(unit.id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-800 hover:bg-emerald-50 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 border border-slate-200 dark:border-zinc-700"
                            title="Imposta come unità di destinazione"
                          >
                            Seleziona
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Helper Tip */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>💡 Puoi cliccare su qualsiasi riga per impostarla come unità di destinazione.</span>
              <button
                type="button"
                onClick={handleExportCSV}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline shrink-0 ml-2"
              >
                Esporta tutto (.csv)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Dedicated History Tape */}
      <SectionHistoryTape
        calculatorId="unit-converter"
        history={history}
        onRestore={(inputs) => {
          if (inputs) {
            if (inputs.categoryId) setSelectedCategoryId(inputs.categoryId);
            if (inputs.fromUnit) setFromUnitId(inputs.fromUnit);
            if (inputs.toUnit) setToUnitId(inputs.toUnit);
            if (inputs.inputValue) setInputValue(inputs.inputValue);
            showToast('Conversione ripristinata dalla cronologia!');
          }
        }}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        settings={settings}
        showToast={showToast}
      />
    </div>
  );
};

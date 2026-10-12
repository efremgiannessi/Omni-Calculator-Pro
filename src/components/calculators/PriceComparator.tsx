import React, { useState, useEffect } from 'react';
import { Scale, Award, ArrowRight, Sparkles } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface PriceComparatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const PriceComparator: React.FC<PriceComparatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  // Option A
  const [nameA, setNameA] = useState('Opzione A (Standard)');
  const [priceA, setPriceA] = useState('3.99');
  const [qtyA, setQtyA] = useState('250');
  const [unitA, setUnitA] = useState<'g' | 'kg' | 'ml' | 'l' | 'pz'>('g');

  // Option B
  const [nameB, setNameB] = useState('Opzione B (Maxi / Offerta)');
  const [priceB, setPriceB] = useState('6.49');
  const [qtyB, setQtyB] = useState('500');
  const [unitB, setUnitB] = useState<'g' | 'kg' | 'ml' | 'l' | 'pz'>('g');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.priceA !== undefined) setPriceA(initialInputs.priceA);
      if (initialInputs.qtyA !== undefined) setQtyA(initialInputs.qtyA);
      if (initialInputs.unitA) setUnitA(initialInputs.unitA as any);
      if (initialInputs.priceB !== undefined) setPriceB(initialInputs.priceB);
      if (initialInputs.qtyB !== undefined) setQtyB(initialInputs.qtyB);
      if (initialInputs.unitB) setUnitB(initialInputs.unitB as any);
      if (initialInputs.nameA !== undefined) setNameA(initialInputs.nameA);
      if (initialInputs.nameB !== undefined) setNameB(initialInputs.nameB);
    }
  }, [initialInputs]);

  // Standardize units to base: kg/l or 1000g/ml
  const pA = parseNumber(priceA);
  const qA = parseNumber(qtyA);
  const pB = parseNumber(priceB);
  const qB = parseNumber(qtyB);

  // Normalize factor: if g -> convert to kg (/1000), if ml -> convert to l (/1000)
  const normFactorA = unitA === 'g' || unitA === 'ml' ? 1000 : 1;
  const normFactorB = unitB === 'g' || unitB === 'ml' ? 1000 : 1;

  let unitPriceA: number | null = null;
  let unitPriceB: number | null = null;

  if (pA !== null && qA !== null && qA > 0) {
    unitPriceA = (pA / qA) * normFactorA;
  }
  if (pB !== null && qB !== null && qB > 0) {
    unitPriceB = (pB / qB) * normFactorB;
  }

  const standardUnitLabel =
    unitA === 'g' || unitA === 'kg'
      ? 'al kg'
      : unitA === 'ml' || unitA === 'l'
      ? 'al litro'
      : 'al pezzo';

  let winner: 'A' | 'B' | 'EQUAL' | null = null;
  let savingsPct: number | null = null;
  let priceDiffPerUnit: number | null = null;

  if (unitPriceA !== null && unitPriceB !== null) {
    if (Math.abs(unitPriceA - unitPriceB) < 0.0001) {
      winner = 'EQUAL';
      savingsPct = 0;
    } else if (unitPriceA < unitPriceB) {
      winner = 'A';
      savingsPct = ((unitPriceB - unitPriceA) / unitPriceB) * 100;
      priceDiffPerUnit = unitPriceB - unitPriceA;
    } else {
      winner = 'B';
      savingsPct = ((unitPriceA - unitPriceB) / unitPriceA) * 100;
      priceDiffPerUnit = unitPriceA - unitPriceB;
    }
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'price-comparator',
    calculatorTitle: settings.language === 'it' ? 'Comparatore Prezzi & Offerte' : 'Price Comparator',
    summary:
      winner === 'B'
        ? `Vince ${nameB}: -${formatPercent(savingsPct, settings)} ${standardUnitLabel}`
        : winner === 'A'
        ? `Vince ${nameA}: -${formatPercent(savingsPct, settings)} ${standardUnitLabel}`
        : 'Stesso prezzo unitario',
    details: [
      { label: nameA, value: `${formatCurrency(unitPriceA, settings)} ${standardUnitLabel}` },
      { label: nameB, value: `${formatCurrency(unitPriceB, settings)} ${standardUnitLabel}` },
      { label: 'Risparmio %', value: formatPercent(savingsPct, settings) }
    ],
    formula: 'Prezzo Unitario = Prezzo / Quantità standardizzata',
    inputs: { nameA, priceA, qtyA, unitA, nameB, priceB, qtyB, unitB },
    isValid: winner !== null && priceA !== '' && priceB !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setPriceA('');
    setQtyA('');
    setPriceB('');
    setQtyB('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Confronto Offerte:\n• ${nameA}: ${formatCurrency(pA, settings)} per ${qtyA}${unitA} (${formatCurrency(unitPriceA, settings)} ${standardUnitLabel})\n• ${nameB}: ${formatCurrency(pB, settings)} per ${qtyB}${unitB} (${formatCurrency(unitPriceB, settings)} ${standardUnitLabel})\n→ ${winner === 'B' ? `Conviene ${nameB}` : winner === 'A' ? `Conviene ${nameA}` : 'Equivalenti'} con risparmio del ${formatPercent(savingsPct, settings)}`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Confronto copiato!' : 'Copied!');
  };

  const handleShare = () => {
    handleCopy();
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.priceA !== undefined) setPriceA(inputs.priceA);
    if (inputs.qtyA !== undefined) setQtyA(inputs.qtyA);
    if (inputs.unitA) setUnitA(inputs.unitA as any);
    if (inputs.priceB !== undefined) setPriceB(inputs.priceB);
    if (inputs.qtyB !== undefined) setQtyB(inputs.qtyB);
    if (inputs.unitB) setUnitB(inputs.unitB as any);
    if (inputs.nameA !== undefined) setNameA(inputs.nameA);
    if (inputs.nameB !== undefined) setNameB(inputs.nameB);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Comparatore di Prezzi & Offerte' : 'Deal & Unit Price Comparator'}
      description={
        settings.language === 'it'
          ? 'Confronta due confezioni o promozioni diverse per scoprire quale conviene davvero e quanto risparmi in percentuale.'
          : 'Compare two different packs or discounts to find the real best deal per kg/liter/unit.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      formula="Prezzo Unitario = (Prezzo / Quantità) × Fattore Standard (kg/litro/pezzo)"
      steps={[
        `${nameA}: ${formatCurrency(pA, settings)} / ${qtyA || '1'}${unitA} = ${formatCurrency(unitPriceA, settings)} ${standardUnitLabel}`,
        `${nameB}: ${formatCurrency(pB, settings)} / ${qtyB || '1'}${unitB} = ${formatCurrency(unitPriceB, settings)} ${standardUnitLabel}`,
        `Differenza unitaria = ${formatCurrency(priceDiffPerUnit, settings)} ${standardUnitLabel} (${formatPercent(savingsPct, settings)} di convenienza)`
      ]}
      notes="Il calcolo uniforma automaticamente grammi in chilogrammi e millilitri in litri per un confronto al centesimo."
    >
      <div className="space-y-6">
        {/* Dual Cards comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A Box */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              winner === 'A'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200/80 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={nameA}
                onFocus={(e) => e.currentTarget.select()}
                onClick={(e) => e.currentTarget.select()}
                onChange={(e) => setNameA(e.target.value)}
                className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 bg-transparent outline-none border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-emerald-500"
              />
              {winner === 'A' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                  <Award className="w-3 h-3" />
                  MIGLIOR AFFARE
                </span>
              )}
            </div>

            <div className="space-y-3">
              <CalcInput
                label="Prezzo totale"
                value={priceA}
                onChange={setPriceA}
                prefix={settings.currency.symbol}
                placeholder="es. 3.99"
              />

              <div className="flex gap-2">
                <div className="flex-1">
                  <CalcInput
                    label="Quantità / Peso"
                    value={qtyA}
                    onChange={setQtyA}
                    placeholder="es. 250"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                    Unità
                  </label>
                  <select
                    value={unitA}
                    onChange={(e) => setUnitA(e.target.value as any)}
                    className="w-full py-2.5 px-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 outline-none"
                  >
                    <option value="g">grammi (g)</option>
                    <option value="kg">chili (kg)</option>
                    <option value="ml">ml</option>
                    <option value="l">litri (l)</option>
                    <option value="pz">pezzi (pz)</option>
                  </select>
                </div>
              </div>

              {/* Price per unit result */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Prezzo unitario:</span>
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-zinc-100">
                  {formatCurrency(unitPriceA, settings)} <span className="text-xs text-slate-400 font-normal">{standardUnitLabel}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Option B Box */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              winner === 'B'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200/80 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={nameB}
                onFocus={(e) => e.currentTarget.select()}
                onClick={(e) => e.currentTarget.select()}
                onChange={(e) => setNameB(e.target.value)}
                className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 bg-transparent outline-none border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-emerald-500"
              />
              {winner === 'B' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                  <Award className="w-3 h-3" />
                  MIGLIOR AFFARE
                </span>
              )}
            </div>

            <div className="space-y-3">
              <CalcInput
                label="Prezzo totale"
                value={priceB}
                onChange={setPriceB}
                prefix={settings.currency.symbol}
                placeholder="es. 6.49"
              />

              <div className="flex gap-2">
                <div className="flex-1">
                  <CalcInput
                    label="Quantità / Peso"
                    value={qtyB}
                    onChange={setQtyB}
                    placeholder="es. 500"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                    Unità
                  </label>
                  <select
                    value={unitB}
                    onChange={(e) => setUnitB(e.target.value as any)}
                    className="w-full py-2.5 px-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 outline-none"
                  >
                    <option value="g">grammi (g)</option>
                    <option value="kg">chili (kg)</option>
                    <option value="ml">ml</option>
                    <option value="l">litri (l)</option>
                    <option value="pz">pezzi (pz)</option>
                  </select>
                </div>
              </div>

              {/* Price per unit result */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Prezzo unitario:</span>
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-zinc-100">
                  {formatCurrency(unitPriceB, settings)} <span className="text-xs text-slate-400 font-normal">{standardUnitLabel}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner Highlight Box */}
        {winner && winner !== 'EQUAL' && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  Risultato del Confronto
                </span>
                <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100 mt-0.5">
                  {winner === 'A' ? nameA : nameB} è più conveniente del {formatPercent(savingsPct, settings)}!
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                  Risparmi {formatCurrency(priceDiffPerUnit, settings)} {standardUnitLabel} rispetto all'altra opzione.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-500/20 text-center shrink-0">
              <span className="text-[11px] text-slate-400 block font-medium">Differenza %</span>
              <span className="font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                -{formatPercent(savingsPct, settings)}
              </span>
            </div>
          </div>
        )}

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="price-comparator"
          history={history}
          onRestore={handleRestoreInputs}
          onDeleteEntry={onDeleteHistoryEntry}
          onClearSectionHistory={onClearSectionHistory}
          settings={settings}
          showToast={showToast}
        />
      </div>
    </CalcCard>
  );
};

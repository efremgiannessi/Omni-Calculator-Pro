import React, { useState, useEffect } from 'react';
import { Layers, ArrowDownRight, Percent, Sparkles, Plus, Trash2 } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface PercentOfPercentProps {
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

export const PercentOfPercentCalculator: React.FC<PercentOfPercentProps> = ({
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
  const [tab, setTab] = useState<'cascade' | 'shareOfShare'>('cascade');

  // Cascade discount / change state
  const [basePrice, setBasePrice] = useState('100');
  const [discounts, setDiscounts] = useState<string[]>(['20', '30']);

  // Share of share state (es. P1% of P2% of Total)
  const [shareTotal, setShareTotal] = useState('1000');
  const [pct1, setPct1] = useState('25');
  const [pct2, setPct2] = useState('40');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.tab === 'shareOfShare' || initialInputs.tab === 'cascade') {
        setTab(initialInputs.tab);
      }
      if (initialInputs.basePrice !== undefined) setBasePrice(initialInputs.basePrice);
      if (initialInputs.discounts !== undefined) {
        try {
          const parsed = JSON.parse(initialInputs.discounts);
          if (Array.isArray(parsed)) setDiscounts(parsed);
        } catch (_) {}
      }
      if (initialInputs.shareTotal !== undefined) setShareTotal(initialInputs.shareTotal);
      if (initialInputs.pct1 !== undefined) setPct1(initialInputs.pct1);
      if (initialInputs.pct2 !== undefined) setPct2(initialInputs.pct2);
    }
  }, [initialInputs]);

  // Calculations for Cascade
  const pBase = parseNumber(basePrice) ?? 0;
  let currentVal = pBase;
  const stepResults: { stepIndex: number; discount: number; before: number; discountAmount: number; after: number }[] = [];

  discounts.forEach((dStr, idx) => {
    const dVal = parseNumber(dStr) ?? 0;
    const discountAmount = (currentVal * dVal) / 100;
    const after = currentVal - discountAmount;
    stepResults.push({
      stepIndex: idx + 1,
      discount: dVal,
      before: currentVal,
      discountAmount,
      after
    });
    currentVal = after;
  });

  const finalCascadePrice = currentVal;
  const totalCascadeSavings = pBase - finalCascadePrice;
  const effectiveTotalDiscountPct = pBase > 0 ? (totalCascadeSavings / pBase) * 100 : 0;
  const nominalSumDiscount = discounts.reduce((acc, curr) => acc + (parseNumber(curr) ?? 0), 0);

  // Calculations for Share of Share
  const totalPop = parseNumber(shareTotal) ?? 0;
  const p1Val = parseNumber(pct1) ?? 0;
  const p2Val = parseNumber(pct2) ?? 0;
  const combinedEffectivePct = (p1Val * p2Val) / 100;
  const finalShareCount = (totalPop * combinedEffectivePct) / 100;
  const intermediateCount = (totalPop * p1Val) / 100;

  // Auto track history
  useAutoHistory({
    calculatorId: 'percent-of-percent',
    calculatorTitle:
      tab === 'cascade'
        ? (settings.language === 'it' ? 'Sconti a Cascata (% consecutive)' : 'Cascade Discounts')
        : (settings.language === 'it' ? '% di una % (Quota su Quota)' : '% of a %'),
    summary:
      tab === 'cascade'
        ? `Prezzo ${formatCurrency(pBase, settings)} con -${discounts.join('% poi -')}% = ${formatCurrency(
            finalCascadePrice,
            settings
          )} (Sconto effettivo -${formatPercent(effectiveTotalDiscountPct, settings)})`
        : `${pct2}% del ${pct1}% di ${formatNumber(totalPop, settings)} = ${formatNumber(
            finalShareCount,
            settings
          )} (${formatPercent(combinedEffectivePct, settings)} complessivo)`,
    details:
      tab === 'cascade'
        ? [
            { label: 'Importo iniziale', value: formatCurrency(pBase, settings) },
            { label: 'Sconti in sequenza', value: discounts.map((d) => `-${d}%`).join(' + ') },
            { label: 'Sconto nominale semplice', value: `-${nominalSumDiscount}% (errato)` },
            { label: 'Sconto effettivo reale', value: `-${formatPercent(effectiveTotalDiscountPct, settings)}` },
            { label: 'Risparmio totale', value: formatCurrency(totalCascadeSavings, settings) },
            { label: 'Prezzo finale', value: formatCurrency(finalCascadePrice, settings) }
          ]
        : [
            { label: 'Totale base', value: formatNumber(totalPop, settings) },
            { label: '1ª Percentuale', value: `${pct1}%` },
            { label: 'Quota intermedia', value: formatNumber(intermediateCount, settings) },
            { label: '2ª Percentuale (sulla quota)', value: `${pct2}%` },
            { label: 'Percentuale complessiva combinata', value: formatPercent(combinedEffectivePct, settings) },
            { label: 'Risultato finale', value: formatNumber(finalShareCount, settings) }
          ],
    formula:
      tab === 'cascade'
        ? 'Prezzo Finale = Base × (1 - d1/100) × (1 - d2/100) ...'
        : 'Risultato = Totale × (P1/100) × (P2/100)',
    inputs: {
      tab,
      basePrice,
      discounts: JSON.stringify(discounts),
      shareTotal,
      pct1,
      pct2
    },
    isValid: tab === 'cascade' ? pBase > 0 && discounts.length > 0 : totalPop > 0 && p1Val > 0 && p2Val > 0,
    onSaveHistory
  });

  const handleClear = () => {
    if (tab === 'cascade') {
      setBasePrice('');
      setDiscounts(['', '']);
    } else {
      setShareTotal('');
      setPct1('');
      setPct2('');
    }
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const text =
      tab === 'cascade'
        ? `Sconti Consecutivi a Cascata:\nBase: ${formatCurrency(pBase, settings)}\nSconti: ${discounts
            .map((d) => `-${d}%`)
            .join(' poi ')}\nSconto Effettivo Reale: -${formatPercent(
            effectiveTotalDiscountPct,
            settings
          )}\nPrezzo Finale: ${formatCurrency(finalCascadePrice, settings)} (Risparmio: ${formatCurrency(
            totalCascadeSavings,
            settings
          )})`
        : `Percentuale di Percentuale:\n${pct2}% del ${pct1}% di ${shareTotal} = ${formatNumber(
            finalShareCount,
            settings
          )} (pari al ${formatPercent(combinedEffectivePct, settings)} complessivo)`;
    navigator.clipboard.writeText(text);
    showToast(settings.language === 'it' ? 'Riepilogo copiato negli appunti!' : 'Copied to clipboard!');
  };

  const handleShare = () => {
    handleCopy();
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.tab) setTab(inputs.tab as 'cascade' | 'shareOfShare');
    if (inputs.basePrice !== undefined) setBasePrice(inputs.basePrice);
    if (inputs.discounts) {
      try {
        const d = JSON.parse(inputs.discounts);
        if (Array.isArray(d)) setDiscounts(d);
      } catch (_) {}
    }
    if (inputs.shareTotal !== undefined) setShareTotal(inputs.shareTotal);
    if (inputs.pct1 !== undefined) setPct1(inputs.pct1);
    if (inputs.pct2 !== undefined) setPct2(inputs.pct2);
  };

  const handleAddDiscount = () => {
    if (discounts.length < 5) {
      setDiscounts([...discounts, '10']);
    } else {
      showToast(settings.language === 'it' ? 'Massimo 5 sconti consecutivi' : 'Max 5 cascade steps');
    }
  };

  const handleRemoveDiscount = (idx: number) => {
    if (discounts.length > 1) {
      setDiscounts(discounts.filter((_, i) => i !== idx));
    }
  };

  const handleDiscountChange = (idx: number, val: string) => {
    const next = [...discounts];
    next[idx] = val;
    setDiscounts(next);
  };

  const plainExplanation =
    tab === 'cascade'
      ? `Attenzione al classico tranello commerciale: se un capo costa ${formatCurrency(
          pBase,
          settings
        )} ed è scontato del ${discounts[0]}% + ulteriore ${discounts[1] || 0}%, lo sconto NON è la somma (${nominalSumDiscount}%), perché il secondo sconto si applica sul prezzo già ridotto. Lo sconto reale effettivo è del ${formatPercent(
          effectiveTotalDiscountPct,
          settings
        )}, e paghi ${formatCurrency(finalCascadePrice, settings)}.`
      : `Calcolare il ${pct2}% del ${pct1}% equivale a moltiplicare le due percentuali: (${pct1} / 100) × (${pct2} / 100) = ${formatPercent(
          combinedEffectivePct,
          settings
        )} dell'intero valore iniziale di ${formatNumber(totalPop, settings)}, cioè esattamente ${formatNumber(
          finalShareCount,
          settings
        )}.`;

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Percentuali a Cascata & % di %' : 'Cascade % & Percent of Percent'}
      description={
        settings.language === 'it'
          ? 'Calcola sconti multipli a catena (es. 20% + 30%) e la percentuale di una percentuale (es. 40% del 25%).'
          : 'Calculate successive sequential discounts and nested percentages.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      plainExplanation={plainExplanation}
      formula={
        tab === 'cascade'
          ? 'Prezzo Finale = Base × (1 - s1) × (1 - s2)... | Sconto Effettivo % = (1 - (Prezzo Finale / Base)) × 100'
          : '% Combinata = (%1 × %2) / 100 | Risultato = Valore × (% Combinata / 100)'
      }
      steps={
        tab === 'cascade'
          ? stepResults.map(
              (s) =>
                `Passaggio ${s.stepIndex}: ${formatCurrency(s.before, settings)} - ${s.discount}% (${formatCurrency(
                  s.discountAmount,
                  settings
                )}) = ${formatCurrency(s.after, settings)}`
            )
          : [
              `Percentuale complessiva = (${pct1 || '0'}% × ${pct2 || '0'}%) / 100 = ${formatPercent(
                combinedEffectivePct,
                settings
              )}`,
              `Valore effettivo = ${formatNumber(totalPop, settings)} × ${formatPercent(
                combinedEffectivePct,
                settings
              )} = ${formatNumber(finalShareCount, settings)}`
            ]
      }
      notes={
        tab === 'cascade'
          ? 'Gli sconti commerciali consecutivi si applicano sempre sull\'importo residuo, non sul totale di partenza.'
          : 'Utile per statistiche, quote di mercato, funnel di conversione e probabilità condizionate.'
      }
    >
      <div className="space-y-6">
        {/* Sub-Tabs Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setTab('cascade')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'cascade'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{settings.language === 'it' ? 'Sconti a Cascata (20% + 30%)' : 'Cascade Discounts'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('shareOfShare')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'shareOfShare'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>{settings.language === 'it' ? '% di una % (Quota)' : '% of a %'}</span>
          </button>
        </div>

        {tab === 'cascade' ? (
          /* CASCADE DISCOUNTS VIEW */
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>{settings.language === 'it' ? 'Regola d\'oro:' : 'Golden Rule:'}</strong>{' '}
                {settings.language === 'it'
                  ? 'Il -20% seguito dal -30% NON equivale a un -50%! Perché il secondo sconto viene sottratto dal prezzo già scontato. Ecco il calcolo matematico esatto:'
                  : '-20% followed by -30% is NOT equal to -50%! The second discount applies to the discounted price.'}
              </div>
            </div>

            <div className="max-w-md">
              <CalcInput
                label={settings.language === 'it' ? 'Prezzo o valore di partenza' : 'Starting Price'}
                value={basePrice}
                onChange={setBasePrice}
                prefix={settings.currency.symbol}
                placeholder="es. 100"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                {settings.language === 'it' ? 'Sconti consecutivi a catena' : 'Sequential Discounts'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {discounts.map((d, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <CalcInput
                        label={`${index + 1}° Sconto`}
                        value={d}
                        onChange={(val) => handleDiscountChange(index, val)}
                        suffix="%"
                        placeholder="es. 20"
                        showSlider
                        min={0}
                        max={90}
                      />
                    </div>
                    {discounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDiscount(index)}
                        className="mt-6 p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title={settings.language === 'it' ? 'Rimuovi questo passaggio' : 'Remove step'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {discounts.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddDiscount}
                  className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{settings.language === 'it' ? '+ Aggiungi un ulteriore sconto a catena' : '+ Add another discount'}</span>
                </button>
              )}
            </div>

            {/* Results Grid */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  {settings.language === 'it' ? 'Prezzo Finale' : 'Final Price'}
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(finalCascadePrice, settings)}
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                  {settings.language === 'it' ? 'Importo netto da pagare' : 'Net amount to pay'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  {settings.language === 'it' ? 'Sconto Reale Effettivo' : 'Actual Total Discount'}
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  -{formatPercent(effectiveTotalDiscountPct, settings)}
                </div>
                <span className="text-xs text-slate-400 line-through mt-1 block">
                  {settings.language === 'it' ? `Non la somma (${nominalSumDiscount}%)` : `Not nominal sum (${nominalSumDiscount}%)`}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  {settings.language === 'it' ? 'Risparmio Totale' : 'Total Savings'}
                </span>
                <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                  {formatCurrency(totalCascadeSavings, settings)}
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                  {settings.language === 'it' ? 'Soldi risparmiati' : 'Money saved'}
                </span>
              </div>
            </div>

            {/* Step-by-Step Breakdown Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Passaggio</th>
                    <th className="py-2.5 px-3">Prezzo Precedente</th>
                    <th className="py-2.5 px-3">Sconto Applicato</th>
                    <th className="py-2.5 px-3">Quota Risparmiata</th>
                    <th className="py-2.5 px-3 text-right">Nuovo Prezzo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
                  {stepResults.map((s) => (
                    <tr key={s.stepIndex} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-zinc-200">
                        {s.stepIndex}° Step
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                        {formatCurrency(s.before, settings)}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                        -{s.discount}%
                      </td>
                      <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400">
                        -{formatCurrency(s.discountAmount, settings)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-zinc-100">
                        {formatCurrency(s.after, settings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* SHARE OF SHARE VIEW */
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CalcInput
                label={settings.language === 'it' ? 'Valore o totale iniziale' : 'Total Base Value'}
                value={shareTotal}
                onChange={setShareTotal}
                placeholder="es. 1000"
              />
              <CalcInput
                label={settings.language === 'it' ? '1ª Percentuale (es. 25%)' : '1st Percentage'}
                value={pct1}
                onChange={setPct1}
                suffix="%"
                placeholder="es. 25"
                showSlider
                min={0}
                max={100}
              />
              <CalcInput
                label={settings.language === 'it' ? '2ª Percentuale (della 1ª)' : '2nd Percentage (of 1st)'}
                value={pct2}
                onChange={setPct2}
                suffix="%"
                placeholder="es. 40"
                showSlider
                min={0}
                max={100}
              />
            </div>

            {/* Visual Formula Sentence */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base text-slate-700 dark:text-zinc-300">
              <span>Il</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-lg">{pct2 || '0'}%</strong>
              <span>del</span>
              <strong className="text-teal-600 dark:text-teal-400 font-mono text-lg">{pct1 || '0'}%</strong>
              <span>di</span>
              <strong className="text-slate-900 dark:text-zinc-100 font-mono text-lg">
                {formatNumber(totalPop, settings)}
              </strong>
              <span>è uguale a:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-2xl font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-500/20">
                {formatNumber(finalShareCount, settings)}
              </strong>
            </div>

            {/* Results Grid */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  {settings.language === 'it' ? 'Percentuale Totale Effettiva' : 'Effective Combined %'}
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatPercent(combinedEffectivePct, settings)}
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                  {settings.language === 'it' ? 'Quota proporzionale sull\'intero' : 'Proportional share of total'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                  {settings.language === 'it' ? 'Valore Numerico Finale' : 'Final Absolute Value'}
                </span>
                <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                  {formatNumber(finalShareCount, settings)}
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                  {settings.language === 'it'
                    ? `(1° step intermedio: ${formatNumber(intermediateCount, settings)})`
                    : `(Intermediate: ${formatNumber(intermediateCount, settings)})`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="percent-of-percent"
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

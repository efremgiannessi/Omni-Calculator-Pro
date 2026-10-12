import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { DonutChart } from '../common/InteractiveChart';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface DiscountCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onOpenBigDisplay?: (data: { mainValue: string; mainLabel: string; details: { label: string; value: string }[] }) => void;
  onOpenReceipt?: (data: { title: string; summary: string; details: { label: string; value: string }[]; formula: string }) => void;
}

export const DiscountCalculator: React.FC<DiscountCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite,
  onOpenBigDisplay,
  onOpenReceipt
}) => {
  const [originalPrice, setOriginalPrice] = useState('120');
  const [discountPercent, setDiscountPercent] = useState('25');
  const [extraDiscount, setExtraDiscount] = useState('0');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.originalPrice !== undefined) setOriginalPrice(initialInputs.originalPrice);
      if (initialInputs.discountPercent !== undefined) setDiscountPercent(initialInputs.discountPercent);
      if (initialInputs.extraDiscount !== undefined) setExtraDiscount(initialInputs.extraDiscount);
    }
  }, [initialInputs]);

  const orig = parseNumber(originalPrice);
  const disc = parseNumber(discountPercent);
  const extra = parseNumber(extraDiscount) || 0;

  const intermediate = orig !== null && disc !== null ? orig * (1 - disc / 100) : null;
  const finalPrice =
    intermediate !== null
      ? extra > 0
        ? intermediate * (1 - extra / 100)
        : intermediate
      : null;

  const totalSaved = orig !== null && finalPrice !== null ? orig - finalPrice : null;
  const effectiveDiscountPercent =
    orig !== null && orig > 0 && totalSaved !== null ? (totalSaved / orig) * 100 : null;

  // Auto track history
  useAutoHistory({
    calculatorId: 'discount',
    calculatorTitle: settings.language === 'it' ? 'Calcolatore Sconti' : 'Discount Calculator',
    summary: `${formatCurrency(orig, settings)} - ${discountPercent}% = ${formatCurrency(finalPrice, settings)}`,
    details: [
      { label: 'Originale', value: formatCurrency(orig, settings) },
      { label: 'Sconto %', value: `${discountPercent}%` },
      { label: 'Prezzo finale', value: formatCurrency(finalPrice, settings) },
      { label: 'Risparmio', value: formatCurrency(totalSaved, settings) }
    ],
    formula: 'Prezzo Finale = Originale × (1 - Sconto/100)',
    inputs: { originalPrice, discountPercent, extraDiscount },
    isValid: finalPrice !== null && originalPrice !== '' && discountPercent !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setOriginalPrice('');
    setDiscountPercent('');
    setExtraDiscount('0');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Prezzo originale: ${formatCurrency(orig, settings)} | Sconto: ${discountPercent}% | Prezzo finale: ${formatCurrency(finalPrice, settings)} (Risparmio: ${formatCurrency(totalSaved, settings)})`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Riepilogo sconto copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Calcolo Sconto:\nOriginale: ${formatCurrency(orig, settings)}\nSconto: ${discountPercent}%${extra > 0 ? ` + ${extra}% extra` : ''}\nPrezzo finale: ${formatCurrency(finalPrice, settings)}\nHai risparmiato: ${formatCurrency(totalSaved, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Calcolo Sconto', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'discount',
      calculatorTitle: settings.language === 'it' ? 'Calcolatore Sconti' : 'Discount Calculator',
      summary: `${formatCurrency(orig, settings)} - ${discountPercent}% = ${formatCurrency(finalPrice, settings)}`,
      details: [
        { label: 'Prezzo originale', value: formatCurrency(orig, settings) },
        { label: 'Sconto %', value: `${discountPercent}%` },
        { label: 'Prezzo finale', value: formatCurrency(finalPrice, settings) },
        { label: 'Risparmio', value: formatCurrency(totalSaved, settings) }
      ],
      formula: 'Prezzo Finale = Originale × (1 - Sconto/100)',
      inputs: { originalPrice, discountPercent, extraDiscount }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.originalPrice !== undefined) setOriginalPrice(inputs.originalPrice);
    if (inputs.discountPercent !== undefined) setDiscountPercent(inputs.discountPercent);
    if (inputs.extraDiscount !== undefined) setExtraDiscount(inputs.extraDiscount);
  };

  const plainExplanation =
    orig && finalPrice && totalSaved
      ? `Un articolo del valore di ${formatCurrency(orig, settings)} scontato del ${discountPercent}% ${
          extra > 0 ? `più un ulteriore ${extra}% extra ` : ''
        }ti costerà esattamente ${formatCurrency(finalPrice, settings)}. Risparmierai ${formatCurrency(totalSaved, settings)}, pari al ${formatPercent(
          effectiveDiscountPercent,
          settings
        )} del prezzo intero.`
      : '';

  const chartSlices = [
    {
      label: 'Prezzo da pagare',
      value: finalPrice || 0,
      color: '#10B981',
      formattedValue: formatCurrency(finalPrice, settings)
    },
    {
      label: 'Risparmio',
      value: totalSaved || 0,
      color: '#F59E0B',
      formattedValue: formatCurrency(totalSaved, settings)
    }
  ];

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Calcolatore Sconti' : 'Discount Calculator'}
      description={
        settings.language === 'it'
          ? 'Calcola all\'istante il prezzo finale scontato, quanto risparmi e sconti cumulativi.'
          : 'Instantly calculate sale price, savings, and stacked extra discounts.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onOpenBigDisplay={
        onOpenBigDisplay && finalPrice !== null
          ? () =>
              onOpenBigDisplay({
                mainValue: formatCurrency(finalPrice, settings),
                mainLabel: 'Prezzo Finale Scontato',
                details: [
                  { label: 'Listino', value: formatCurrency(orig, settings) },
                  { label: 'Sconto %', value: `${discountPercent}%` },
                  { label: 'Risparmio', value: formatCurrency(totalSaved, settings) }
                ]
              })
          : undefined
      }
      onOpenReceipt={
        onOpenReceipt && finalPrice !== null
          ? () =>
              onOpenReceipt({
                title: 'SCONTO COMMERCIALE',
                summary: formatCurrency(finalPrice, settings),
                details: [
                  { label: 'Prezzo di listino', value: formatCurrency(orig, settings) },
                  { label: 'Sconto applicato', value: `${discountPercent}%` },
                  { label: 'Risparmio cliente', value: formatCurrency(totalSaved, settings) },
                  { label: 'Prezzo da pagare', value: formatCurrency(finalPrice, settings) }
                ],
                formula: 'Prezzo = Originale × (1 - Sconto/100)'
              })
          : undefined
      }
      plainExplanation={plainExplanation}
      chartComponent={
        orig && orig > 0 ? (
          <DonutChart
            slices={chartSlices}
            centerLabel="Totale"
            centerValue={formatCurrency(orig, settings)}
            title="Suddivisione tra prezzo pagato e risparmio"
          />
        ) : undefined
      }
      formula="Prezzo Finale = Prezzo Originale × (1 - Sconto% / 100)"
      steps={[
        `Sconto base: ${formatCurrency(orig, settings)} × ${discountPercent || '0'}% = ${formatCurrency((orig || 0) * ((disc || 0) / 100), settings)}`,
        extra > 0
          ? `Sconto extra applicato: ${extra}% sul residuo`
          : 'Nessun extra sconto applicato',
        `Prezzo scontato definitivo: ${formatCurrency(finalPrice, settings)}`,
        `Risparmio totale: ${formatCurrency(totalSaved, settings)} (${formatPercent(effectiveDiscountPercent, settings)})`
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            label="Prezzo di listino / originale"
            value={originalPrice}
            onChange={setOriginalPrice}
            prefix={settings.currency.symbol}
            placeholder="es. 120"
          />
          <CalcInput
            label="Percentuale di sconto"
            value={discountPercent}
            onChange={setDiscountPercent}
            suffix="%"
            placeholder="es. 25"
          />
        </div>

        {/* Quick discount buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Sconti comuni:</span>
          {['10', '15', '20', '30', '40', '50', '70'].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setDiscountPercent(pct)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                discountPercent === pct
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
              }`}
            >
              -{pct}%
            </button>
          ))}
        </div>

        {/* Optional Extra discount */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/30 border border-slate-200/60 dark:border-zinc-800">
          <CalcInput
            label="Ulteriore sconto alla cassa (opzionale)"
            value={extraDiscount}
            onChange={setExtraDiscount}
            suffix="%"
            placeholder="0"
            helperText="Applicato in cascata sul prezzo già scontato"
          />
        </div>

        {/* Result Highlight */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              <Tag className="w-4 h-4" />
              <span>Prezzo finale scontato</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
              {formatCurrency(finalPrice, settings)}
            </div>
            {effectiveDiscountPercent !== null && (
              <div className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-1 font-medium">
                Sconto effettivo complessivo: {formatPercent(effectiveDiscountPercent, settings)}
              </div>
            )}
          </div>

          <div className="sm:border-l sm:border-emerald-500/20 sm:pl-4">
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
              Il tuo risparmio
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {formatCurrency(totalSaved, settings)}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">
              Differenza rispetto al prezzo di listino
            </span>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="discount"
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

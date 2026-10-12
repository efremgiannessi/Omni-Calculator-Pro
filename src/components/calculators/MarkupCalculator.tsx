import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface MarkupCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const MarkupCalculator: React.FC<MarkupCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [cost, setCost] = useState('50');
  const [markupPercent, setMarkupPercent] = useState('40');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.cost !== undefined) setCost(initialInputs.cost);
      if (initialInputs.markupPercent !== undefined) setMarkupPercent(initialInputs.markupPercent);
    }
  }, [initialInputs]);

  const c = parseNumber(cost);
  const m = parseNumber(markupPercent);

  const profit = c !== null && m !== null ? (c * m) / 100 : null;
  const sellingPrice = c !== null && profit !== null ? c + profit : null;
  const marginPercent =
    sellingPrice !== null && sellingPrice > 0 && profit !== null
      ? (profit / sellingPrice) * 100
      : null;

  // Auto track history
  useAutoHistory({
    calculatorId: 'markup',
    calculatorTitle: settings.language === 'it' ? 'Ricarico (Markup)' : 'Markup Calculator',
    summary: `Costo ${formatCurrency(c, settings)} + ${markupPercent}% ricarico = ${formatCurrency(sellingPrice, settings)}`,
    details: [
      { label: 'Costo iniziale', value: formatCurrency(c, settings) },
      { label: 'Ricarico %', value: `${markupPercent}%` },
      { label: 'Prezzo di vendita', value: formatCurrency(sellingPrice, settings) },
      { label: 'Profitto', value: formatCurrency(profit, settings) }
    ],
    formula: 'Prezzo Vendita = Costo × (1 + Ricarico% / 100)',
    inputs: { cost, markupPercent },
    isValid: sellingPrice !== null && cost !== '' && markupPercent !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setCost('');
    setMarkupPercent('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Costo: ${formatCurrency(c, settings)} | Ricarico: ${markupPercent}% | Prezzo vendita: ${formatCurrency(sellingPrice, settings)} | Profitto: ${formatCurrency(profit, settings)}`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Calcolo Ricarico (Markup):\nCosto: ${formatCurrency(c, settings)}\nRicarico: ${markupPercent}%\nPrezzo di vendita: ${formatCurrency(sellingPrice, settings)}\nGuadagno netto: ${formatCurrency(profit, settings)}\nMargine sul prezzo: ${formatPercent(marginPercent, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Calcolo Ricarico', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'markup',
      calculatorTitle: settings.language === 'it' ? 'Ricarico (Markup)' : 'Markup Calculator',
      summary: `Costo ${formatCurrency(c, settings)} + ${markupPercent}% ricarico = ${formatCurrency(sellingPrice, settings)}`,
      details: [
        { label: 'Costo iniziale', value: formatCurrency(c, settings) },
        { label: 'Ricarico %', value: `${markupPercent}%` },
        { label: 'Prezzo di vendita', value: formatCurrency(sellingPrice, settings) },
        { label: 'Profitto', value: formatCurrency(profit, settings) },
        { label: 'Margine equivalente', value: formatPercent(marginPercent, settings) }
      ],
      formula: 'Prezzo Vendita = Costo × (1 + Ricarico% / 100)',
      inputs: { cost, markupPercent }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.cost !== undefined) setCost(inputs.cost);
    if (inputs.markupPercent !== undefined) setMarkupPercent(inputs.markupPercent);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Calcolatore Ricarico (Markup)' : 'Markup Calculator'}
      description={
        settings.language === 'it'
          ? 'Calcola il prezzo di vendita e l\'utile generato a partire dal costo del prodotto.'
          : 'Calculate selling price and gross profit from cost and markup percentage.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Prezzo Vendita = Costo × (1 + Ricarico% / 100)  |  Profitto = Prezzo - Costo"
      steps={[
        `Profitto = ${formatCurrency(c, settings)} × ${markupPercent || '0'}% = ${formatCurrency(profit, settings)}`,
        `Prezzo finale di vendita = ${formatCurrency(c, settings)} + ${formatCurrency(profit, settings)} = ${formatCurrency(sellingPrice, settings)}`,
        `Margine di profitto equivalente sul fatturato = ${formatPercent(marginPercent, settings)}`
      ]}
      notes="Il ricarico è calcolato rispetto al costo, mentre il margine è calcolato rispetto al prezzo di vendita."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            label="Costo del prodotto (Cost)"
            value={cost}
            onChange={setCost}
            prefix={settings.currency.symbol}
            placeholder="es. 50"
          />
          <CalcInput
            label="Percentuale di ricarico (Markup)"
            value={markupPercent}
            onChange={setMarkupPercent}
            suffix="%"
            placeholder="es. 40"
          />
        </div>

        {/* Quick markup preset buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Ricarichi tipici:</span>
          {['15', '25', '30', '50', '75', '100', '150'].map((mPct) => (
            <button
              key={mPct}
              type="button"
              onClick={() => setMarkupPercent(mPct)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                markupPercent === mPct
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
              }`}
            >
              +{mPct}%
            </button>
          ))}
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Prezzo di vendita
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(sellingPrice, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Margine sul prezzo: {formatPercent(marginPercent, settings)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Guadagno / Profitto
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatCurrency(profit, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Differenza rispetto al costo
              </div>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="markup"
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

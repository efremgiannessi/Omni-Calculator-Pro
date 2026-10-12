import React, { useState, useEffect } from 'react';
import { PieChart } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface MarginCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const MarginCalculator: React.FC<MarginCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [cost, setCost] = useState('60');
  const [marginPercent, setMarginPercent] = useState('30');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.cost !== undefined) setCost(initialInputs.cost);
      if (initialInputs.marginPercent !== undefined) setMarginPercent(initialInputs.marginPercent);
    }
  }, [initialInputs]);

  const c = parseNumber(cost);
  const m = parseNumber(marginPercent);

  const sellingPrice =
    c !== null && m !== null && m < 100 ? c / (1 - m / 100) : null;
  const profit =
    sellingPrice !== null && c !== null ? sellingPrice - c : null;
  const markupPercent =
    profit !== null && c !== null && c > 0 ? (profit / c) * 100 : null;

  // Auto track history
  useAutoHistory({
    calculatorId: 'margin',
    calculatorTitle: settings.language === 'it' ? 'Margine di Profitto' : 'Profit Margin',
    summary: `Costo ${formatCurrency(c, settings)} con margine ${marginPercent}% = Prezzo ${formatCurrency(sellingPrice, settings)}`,
    details: [
      { label: 'Costo iniziale', value: formatCurrency(c, settings) },
      { label: 'Margine %', value: `${marginPercent}%` },
      { label: 'Prezzo di vendita', value: formatCurrency(sellingPrice, settings) },
      { label: 'Profitto', value: formatCurrency(profit, settings) }
    ],
    formula: 'Prezzo = Costo / (1 - Margine% / 100)',
    inputs: { cost, marginPercent },
    isValid: sellingPrice !== null && cost !== '' && marginPercent !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setCost('');
    setMarginPercent('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Costo: ${formatCurrency(c, settings)} | Margine: ${marginPercent}% | Prezzo vendita: ${formatCurrency(sellingPrice, settings)} | Guadagno: ${formatCurrency(profit, settings)}`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Calcolo Margine di Profitto:\nCosto: ${formatCurrency(c, settings)}\nMargine sul ricavo: ${marginPercent}%\nPrezzo di vendita richiesto: ${formatCurrency(sellingPrice, settings)}\nProfitto generato: ${formatCurrency(profit, settings)}\nRicarico sul costo: ${formatPercent(markupPercent, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Margine di Profitto', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'margin',
      calculatorTitle: settings.language === 'it' ? 'Margine di Profitto' : 'Profit Margin',
      summary: `Costo ${formatCurrency(c, settings)} con margine ${marginPercent}% = Prezzo ${formatCurrency(sellingPrice, settings)}`,
      details: [
        { label: 'Costo iniziale', value: formatCurrency(c, settings) },
        { label: 'Margine %', value: `${marginPercent}%` },
        { label: 'Prezzo di vendita', value: formatCurrency(sellingPrice, settings) },
        { label: 'Profitto', value: formatCurrency(profit, settings) },
        { label: 'Ricarico equivalente', value: formatPercent(markupPercent, settings) }
      ],
      formula: 'Prezzo = Costo / (1 - Margine% / 100)',
      inputs: { cost, marginPercent }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.cost !== undefined) setCost(inputs.cost);
    if (inputs.marginPercent !== undefined) setMarginPercent(inputs.marginPercent);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Margine di Profitto' : 'Profit Margin'}
      description={
        settings.language === 'it'
          ? 'Determina il prezzo di vendita necessario per ottenere il margine desiderato sul fatturato.'
          : 'Find the required selling price to achieve your target gross margin.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Prezzo = Costo / (1 - Margine% / 100)  |  Margine = (Profitto / Prezzo) × 100"
      steps={[
        `Rapporto margine = 1 - (${marginPercent || '0'} / 100) = ${(1 - (m || 0) / 100).toFixed(4)}`,
        `Prezzo di vendita necessario = ${formatCurrency(c, settings)} / ${(1 - (m || 0) / 100).toFixed(4)} = ${formatCurrency(sellingPrice, settings)}`,
        `Profitto netto = ${formatCurrency(sellingPrice, settings)} - ${formatCurrency(c, settings)} = ${formatCurrency(profit, settings)}`,
        `Ricarico equivalente sul costo (Markup) = ${formatPercent(markupPercent, settings)}`
      ]}
      notes="Il margine non può essere uguale o superiore al 100%."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            label="Costo del prodotto (Cost)"
            value={cost}
            onChange={setCost}
            prefix={settings.currency.symbol}
            placeholder="es. 60"
          />
          <CalcInput
            label="Margine desiderato (Margin)"
            value={marginPercent}
            onChange={setMarginPercent}
            suffix="%"
            placeholder="es. 30"
          />
        </div>

        {/* Quick margin preset buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Margini tipici:</span>
          {['10', '15', '20', '25', '30', '40', '50'].map((mPct) => (
            <button
              key={mPct}
              type="button"
              onClick={() => setMarginPercent(mPct)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                marginPercent === mPct
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
              }`}
            >
              {mPct}%
            </button>
          ))}
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Prezzo di vendita richiesto
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(sellingPrice, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Ricarico sul costo: {formatPercent(markupPercent, settings)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Profitto conseguito
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatCurrency(profit, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Utile rispetto al fatturato
              </div>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="margin"
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

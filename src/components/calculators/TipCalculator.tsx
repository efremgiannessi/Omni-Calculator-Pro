import React, { useState, useEffect } from 'react';
import { Users, Receipt, Sparkles } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface TipCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const TipCalculator: React.FC<TipCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [bill, setBill] = useState('85');
  const [tipPercent, setTipPercent] = useState('15');
  const [people, setPeople] = useState('3');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.bill !== undefined) setBill(initialInputs.bill);
      if (initialInputs.tipPercent !== undefined) setTipPercent(initialInputs.tipPercent);
      if (initialInputs.people !== undefined) setPeople(initialInputs.people);
    }
  }, [initialInputs]);

  const b = parseNumber(bill);
  const t = parseNumber(tipPercent);
  const p = Math.max(1, parseInt(people, 10) || 1);

  const tipAmount = b !== null && t !== null ? (b * t) / 100 : null;
  const total = b !== null && tipAmount !== null ? b + tipAmount : null;
  const totalPerPerson = total !== null ? total / p : null;
  const tipPerPerson = tipAmount !== null ? tipAmount / p : null;

  // Auto track history
  useAutoHistory({
    calculatorId: 'tip',
    calculatorTitle: settings.language === 'it' ? 'Calcolatore Mance & Split' : 'Tip & Split Calculator',
    summary: `Conto ${formatCurrency(b, settings)} + ${tipPercent}% = ${formatCurrency(total, settings)} (${formatCurrency(totalPerPerson, settings)}/pers.)`,
    details: [
      { label: 'Importo conto', value: formatCurrency(b, settings) },
      { label: 'Mancia %', value: `${tipPercent}%` },
      { label: 'Totale complessivo', value: formatCurrency(total, settings) },
      { label: 'Persone', value: `${p}` },
      { label: 'A persona', value: formatCurrency(totalPerPerson, settings) }
    ],
    formula: 'Totale = Conto × (1 + Mancia% / 100)',
    inputs: { bill, tipPercent, people },
    isValid: total !== null && bill !== '' && tipPercent !== '',
    onSaveHistory
  });

  const handleRoundUp = () => {
    if (totalPerPerson === null) return;
    const roundedPerPerson = Math.ceil(totalPerPerson);
    const newTotal = roundedPerPerson * p;
    const newTip = b !== null ? Math.max(0, newTotal - b) : 0;
    const newTipPct = b !== null && b > 0 ? (newTip / b) * 100 : 0;

    setTipPercent(newTipPct.toFixed(settings.decimalPrecision));
    showToast(settings.language === 'it' ? `Arrotondato a ${settings.currency.symbol} ${roundedPerPerson}/persona` : `Rounded to ${settings.currency.symbol} ${roundedPerPerson}/person`);
  };

  const handleClear = () => {
    setBill('');
    setTipPercent('15');
    setPeople('1');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Conto: ${formatCurrency(b, settings)} | Mancia (${tipPercent}%): ${formatCurrency(tipAmount, settings)} | Totale: ${formatCurrency(total, settings)} (${formatCurrency(totalPerPerson, settings)} per persona x ${p})`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Riepilogo conto copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Divisione Conto:\nConto base: ${formatCurrency(b, settings)}\nMancia (${tipPercent}%): ${formatCurrency(tipAmount, settings)}\nTotale: ${formatCurrency(total, settings)}\nPersone: ${p}\nQuota a testa: ${formatCurrency(totalPerPerson, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Divisione Conto', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'tip',
      calculatorTitle: settings.language === 'it' ? 'Calcolatore Mance & Split' : 'Tip & Split Calculator',
      summary: `Conto ${formatCurrency(b, settings)} + ${tipPercent}% = ${formatCurrency(total, settings)} (${formatCurrency(totalPerPerson, settings)}/pers.)`,
      details: [
        { label: 'Importo conto', value: formatCurrency(b, settings) },
        { label: 'Mancia %', value: `${tipPercent}%` },
        { label: 'Totale complessivo', value: formatCurrency(total, settings) },
        { label: 'Persone', value: `${p}` },
        { label: 'A persona', value: formatCurrency(totalPerPerson, settings) }
      ],
      formula: 'Totale = Conto × (1 + Mancia% / 100)',
      inputs: { bill, tipPercent, people }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.bill !== undefined) setBill(inputs.bill);
    if (inputs.tipPercent !== undefined) setTipPercent(inputs.tipPercent);
    if (inputs.people !== undefined) setPeople(inputs.people);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Calcolatore Mance & Split' : 'Tip & Split Calculator'}
      description={
        settings.language === 'it'
          ? 'Calcola con precisione la mancia e dividi il conto equamente tra tutti i commensali.'
          : 'Calculate tip percentage and split the bill fairly among all friends.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Totale = Conto + Mancia  |  Quota/Persona = Totale / Persone"
      steps={[
        `Mancia = ${formatCurrency(b, settings)} × ${tipPercent || '0'}% = ${formatCurrency(tipAmount, settings)}`,
        `Totale da pagare = ${formatCurrency(b, settings)} + ${formatCurrency(tipAmount, settings)} = ${formatCurrency(total, settings)}`,
        `Quota per ciascuno (${p} persone) = ${formatCurrency(totalPerPerson, settings)}`
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcInput
            label="Importo del conto"
            value={bill}
            onChange={setBill}
            prefix={settings.currency.symbol}
            placeholder="es. 85"
          />
          <CalcInput
            label="Percentuale mancia"
            value={tipPercent}
            onChange={setTipPercent}
            suffix="%"
            placeholder="es. 15"
          />
          <CalcInput
            label="Numero di persone"
            value={people}
            onChange={setPeople}
            placeholder="es. 3"
          />
        </div>

        {/* Quick Tip percentages and Round button */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Mancia:</span>
            {['10', '12', '15', '18', '20', '25'].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTipPercent(pct)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                  tipPercent === pct
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRoundUp}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Arrotonda quota</span>
          </button>
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Split per person */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Quota a persona ({p} pers.)</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalPerPerson, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Di cui mancia a testa: {formatCurrency(tipPerPerson, settings)}
              </div>
            </div>

            {/* Total overall */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                <Receipt className="w-4 h-4" />
                <span>Totale complessivo conto</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatCurrency(total, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Importo totale mancia: {formatCurrency(tipAmount, settings)}
              </div>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="tip"
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

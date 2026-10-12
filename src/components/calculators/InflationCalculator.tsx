import React, { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface InflationCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const InflationCalculator: React.FC<InflationCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [amount, setAmount] = useState('1000');
  const [inflationRate, setInflationRate] = useState('3.5');
  const [years, setYears] = useState('10');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.amount !== undefined) setAmount(initialInputs.amount);
      if (initialInputs.inflationRate !== undefined) setInflationRate(initialInputs.inflationRate);
      if (initialInputs.years !== undefined) setYears(initialInputs.years);
    }
  }, [initialInputs]);

  const a = parseNumber(amount);
  const inf = parseNumber(inflationRate);
  const y = parseNumber(years);

  let futureEquivalent: number | null = null;
  let futurePurchasingPower: number | null = null;
  let lossPct: number | null = null;

  if (a !== null && inf !== null && y !== null && y >= 0) {
    const rateFactor = 1 + inf / 100;
    futureEquivalent = a * Math.pow(rateFactor, y);
    futurePurchasingPower = a / Math.pow(rateFactor, y);
    lossPct = ((a - futurePurchasingPower) / a) * 100;
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'inflation',
    calculatorTitle: settings.language === 'it' ? 'Calcolatore Inflazione' : 'Inflation Calculator',
    summary: `${formatCurrency(a, settings)} tra ${years} anni (${inflationRate}%) = ${formatCurrency(futureEquivalent, settings)}`,
    details: [
      { label: 'Importo iniziale', value: formatCurrency(a, settings) },
      { label: 'Tasso medio', value: `${inflationRate}%` },
      { label: 'Anni', value: `${years} anni` },
      { label: 'Equivalente futuro', value: formatCurrency(futureEquivalent, settings) },
      { label: 'Potere residuo', value: formatCurrency(futurePurchasingPower, settings) }
    ],
    formula: 'Costo Futuro = Somma × (1 + Inflazione% / 100)^Anni',
    inputs: { amount, inflationRate, years },
    isValid: futureEquivalent !== null && amount !== '' && inflationRate !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setAmount('');
    setInflationRate('3.5');
    setYears('10');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `${formatCurrency(a, settings)} tra ${years} anni al ${inflationRate}% inflazione: Equivale a ${formatCurrency(futureEquivalent, settings)} (Potere d'acquisto residuo: ${formatCurrency(futurePurchasingPower, settings)})`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Calcolo Inflazione:\nImporto attuale: ${formatCurrency(a, settings)}\nTasso inflazione annuo: ${inflationRate}%\nTra ${years} anni:\n• Serviranno: ${formatCurrency(futureEquivalent, settings)} per lo stesso carrello\n• Il denaro attuale varrà: ${formatCurrency(futurePurchasingPower, settings)}\n• Perdita potere d'acquisto: -${formatPercent(lossPct, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Calcolo Inflazione', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'inflation',
      calculatorTitle: settings.language === 'it' ? 'Calcolatore Inflazione' : 'Inflation Calculator',
      summary: `${formatCurrency(a, settings)} tra ${years} anni al ${inflationRate}% = ${formatCurrency(futureEquivalent, settings)}`,
      details: [
        { label: 'Importo iniziale', value: formatCurrency(a, settings) },
        { label: 'Tasso medio inflazione', value: `${inflationRate}%` },
        { label: 'Anni', value: `${years} anni` },
        { label: 'Costo futuro equivalente', value: formatCurrency(futureEquivalent, settings) },
        { label: 'Potere d\'acquisto residuo', value: formatCurrency(futurePurchasingPower, settings) }
      ],
      formula: 'Costo Futuro = Somma × (1 + Inflazione% / 100)^Anni',
      inputs: { amount, inflationRate, years }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.amount !== undefined) setAmount(inputs.amount);
    if (inputs.inflationRate !== undefined) setInflationRate(inputs.inflationRate);
    if (inputs.years !== undefined) setYears(inputs.years);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Calcolatore Inflazione' : 'Inflation Calculator'}
      description={
        settings.language === 'it'
          ? 'Calcola l\'impatto dell\'aumento dei prezzi e la perdita di potere d\'acquisto del capitale.'
          : 'Calculate the erosion of purchasing power and price inflation over time.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Somma Futura Equivalente = Somma Attuale × (1 + Inflazione)^Anni"
      steps={[
        `Fattore cumulativo = (1 + ${inflationRate || '0'}/100)^${years || '0'} = ${inf && y ? Math.pow(1 + inf / 100, y).toFixed(4) : '1'}`,
        `Per acquistare gli stessi beni serviranno: ${formatCurrency(futureEquivalent, settings)}`,
        `Un importo fermo oggi di ${formatCurrency(a, settings)} varrà realmente: ${formatCurrency(futurePurchasingPower, settings)}`
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcInput
            label="Somma attuale"
            value={amount}
            onChange={setAmount}
            prefix={settings.currency.symbol}
            placeholder="es. 1000"
          />
          <CalcInput
            label="Tasso medio inflazione annua %"
            value={inflationRate}
            onChange={setInflationRate}
            suffix="%"
            placeholder="es. 3.5"
          />
          <CalcInput
            label="Orizzonte temporale (Anni)"
            value={years}
            onChange={setYears}
            suffix="anni"
            placeholder="es. 10"
          />
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Serviranno tra {years} anni
              </span>
              <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatCurrency(futureEquivalent, settings)}
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                Per mantenere lo stesso tenore di vita
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Potere d'acquisto residuo
              </span>
              <div className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(futurePurchasingPower, settings)}
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                Perdita di valore: -{formatPercent(lossPct, settings)}
              </span>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="inflation"
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

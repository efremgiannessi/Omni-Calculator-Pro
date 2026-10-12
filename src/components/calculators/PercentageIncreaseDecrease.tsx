import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatNumber, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface PercentageIncreaseDecreaseProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const PercentageIncreaseDecrease: React.FC<PercentageIncreaseDecreaseProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [initialVal, setInitialVal] = useState('80');
  const [finalVal, setFinalVal] = useState('100');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.initialVal !== undefined) setInitialVal(initialInputs.initialVal);
      if (initialInputs.finalVal !== undefined) setFinalVal(initialInputs.finalVal);
    }
  }, [initialInputs]);

  const v1 = parseNumber(initialVal);
  const v2 = parseNumber(finalVal);

  const diff = v1 !== null && v2 !== null ? v2 - v1 : null;
  const pctChange = v1 !== null && v2 !== null && v1 !== 0 ? ((v2 - v1) / Math.abs(v1)) * 100 : null;

  const isPositive = pctChange !== null && pctChange > 0;
  const isNegative = pctChange !== null && pctChange < 0;

  // Auto track history
  useAutoHistory({
    calculatorId: 'increase-decrease',
    calculatorTitle: settings.language === 'it' ? 'Incremento / Decremento %' : 'Percentage Increase / Decrease',
    summary: `Da ${initialVal} a ${finalVal} (${pctChange !== null && pctChange > 0 ? `+${formatPercent(pctChange, settings)}` : formatPercent(pctChange, settings)})`,
    details: [
      { label: 'Valore iniziale', value: initialVal },
      { label: 'Valore finale', value: finalVal },
      { label: 'Differenza', value: formatNumber(diff, settings) },
      { label: 'Variazione %', value: formatPercent(pctChange, settings) }
    ],
    formula: '((Finale - Iniziale) / |Iniziale|) × 100',
    inputs: { initialVal, finalVal },
    isValid: diff !== null && initialVal !== '' && finalVal !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setInitialVal('');
    setFinalVal('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Da ${initialVal} a ${finalVal}: Variazione ${formatPercent(pctChange, settings)} (${formatNumber(diff, settings)})`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato negli appunti!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Calcolo Variazione Percentuale:\nIniziale: ${initialVal}\nFinale: ${finalVal}\nVariazione: ${formatPercent(pctChange, settings)}\nDifferenza: ${formatNumber(diff, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Variazione Percentuale', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'increase-decrease',
      calculatorTitle: settings.language === 'it' ? 'Incremento / Decremento %' : 'Percentage Increase / Decrease',
      summary: `Da ${initialVal} a ${finalVal} (${formatPercent(pctChange, settings)})`,
      details: [
        { label: 'Valore iniziale', value: initialVal },
        { label: 'Valore finale', value: finalVal },
        { label: 'Differenza assoluta', value: formatNumber(diff, settings) },
        { label: 'Variazione %', value: formatPercent(pctChange, settings) }
      ],
      formula: '((Finale - Iniziale) / Iniziale) × 100',
      inputs: { initialVal, finalVal }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.initialVal !== undefined) setInitialVal(inputs.initialVal);
    if (inputs.finalVal !== undefined) setFinalVal(inputs.finalVal);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Incremento / Decremento %' : 'Percentage Increase / Decrease'}
      description={
        settings.language === 'it'
          ? 'Calcola la variazione percentuale e il divario assoluto tra due valori.'
          : 'Compute percentage change and absolute difference between two numbers.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Variazione % = ((Valore Finale - Valore Iniziale) / |Valore Iniziale|) × 100"
      steps={[
        `Differenza = ${finalVal || '0'} - ${initialVal || '0'} = ${formatNumber(diff, settings)}`,
        `Rapporto = ${formatNumber(diff, settings)} / ${initialVal || '1'}`,
        `Variazione % = ${formatPercent(pctChange, settings)}`
      ]}
      notes={
        pctChange !== null
          ? isPositive
            ? `Crescita del ${formatPercent(pctChange, settings)}`
            : isNegative
            ? `Diminuzione del ${formatPercent(Math.abs(pctChange), settings)}`
            : 'Nessuna variazione (0%)'
          : undefined
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            label="Valore iniziale (Da)"
            value={initialVal}
            onChange={setInitialVal}
            placeholder="es. 80"
          />
          <CalcInput
            label="Valore finale (A)"
            value={finalVal}
            onChange={setFinalVal}
            placeholder="es. 100"
          />
        </div>

        {/* Results Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Variazione percentuale
            </span>
            <div className="flex items-center gap-2 mt-1">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : isNegative ? (
                <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              ) : null}
              <span
                className={`text-2xl font-bold font-mono ${
                  isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isNegative
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-zinc-100'
                }`}
              >
                {pctChange !== null ? (pctChange > 0 ? `+${formatPercent(pctChange, settings)}` : formatPercent(pctChange, settings)) : '—'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              {isPositive ? 'Incremento' : isNegative ? 'Decremento' : 'Neutro'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Differenza assoluta
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {diff !== null ? (diff > 0 ? `+${formatNumber(diff, settings)}` : formatNumber(diff, settings)) : '—'}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              Valore finale − Valore iniziale
            </span>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="increase-decrease"
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

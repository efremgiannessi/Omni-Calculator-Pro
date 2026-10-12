import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface CagrCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const CagrCalculator: React.FC<CagrCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [initialVal, setInitialVal] = useState('1000');
  const [finalVal, setFinalVal] = useState('2500');
  const [years, setYears] = useState('5');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.initialVal !== undefined) setInitialVal(initialInputs.initialVal);
      if (initialInputs.finalVal !== undefined) setFinalVal(initialInputs.finalVal);
      if (initialInputs.years !== undefined) setYears(initialInputs.years);
    }
  }, [initialInputs]);

  const v0 = parseNumber(initialVal);
  const v1 = parseNumber(finalVal);
  const t = parseNumber(years);

  let cagr: number | null = null;
  let totalGrowthPct: number | null = null;

  if (v0 !== null && v1 !== null && t !== null && v0 > 0 && t > 0) {
    cagr = (Math.pow(v1 / v0, 1 / t) - 1) * 100;
    totalGrowthPct = ((v1 - v0) / v0) * 100;
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'cagr',
    calculatorTitle: settings.language === 'it' ? 'Crescita Cumulativa (CAGR)' : 'Cumulative Growth (CAGR)',
    summary: `Da ${initialVal} a ${finalVal} (${years}a) = CAGR ${formatPercent(cagr, settings)}/a`,
    details: [
      { label: 'Valore iniziale', value: initialVal },
      { label: 'Valore finale', value: finalVal },
      { label: 'Anni', value: `${years} anni` },
      { label: 'CAGR annuo', value: formatPercent(cagr, settings) }
    ],
    formula: 'CAGR = ((Valore Finale / Valore Iniziale)^(1 / Anni) - 1) × 100',
    inputs: { initialVal, finalVal, years },
    isValid: cagr !== null && initialVal !== '' && finalVal !== '' && years !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setInitialVal('');
    setFinalVal('');
    setYears('5');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Da ${initialVal} a ${finalVal} in ${years} anni: CAGR = ${formatPercent(cagr, settings)} all'anno (Totale: ${formatPercent(totalGrowthPct, settings)})`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Calcolo CAGR (Crescita Cumulativa):\nValore iniziale: ${initialVal}\nValore finale: ${finalVal}\nDurata: ${years} anni\nTasso annuo medio composto (CAGR): ${formatPercent(cagr, settings)}\nCrescita complessiva: ${formatPercent(totalGrowthPct, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Calcolo CAGR', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'cagr',
      calculatorTitle: settings.language === 'it' ? 'Crescita Cumulativa (CAGR)' : 'Cumulative Growth (CAGR)',
      summary: `Da ${initialVal} a ${finalVal} (${years} anni) = CAGR ${formatPercent(cagr, settings)}/anno`,
      details: [
        { label: 'Valore iniziale', value: initialVal },
        { label: 'Valore finale', value: finalVal },
        { label: 'Anni', value: `${years} anni` },
        { label: 'Tasso CAGR annuo', value: formatPercent(cagr, settings) },
        { label: 'Crescita totale %', value: formatPercent(totalGrowthPct, settings) }
      ],
      formula: 'CAGR = ((Valore Finale / Valore Iniziale)^(1 / Anni) - 1) × 100',
      inputs: { initialVal, finalVal, years }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.initialVal !== undefined) setInitialVal(inputs.initialVal);
    if (inputs.finalVal !== undefined) setFinalVal(inputs.finalVal);
    if (inputs.years !== undefined) setYears(inputs.years);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Crescita Cumulativa (CAGR)' : 'Cumulative Growth (CAGR)'}
      description={
        settings.language === 'it'
          ? 'Calcola il Compound Annual Growth Rate (tasso di crescita annuo composto geometrico).'
          : 'Compute the Compound Annual Growth Rate over specified periods.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="CAGR = ((Valore Finale / Valore Iniziale)^(1 / Anni) - 1) × 100"
      steps={[
        `Rapporto di crescita totale = ${finalVal || '0'} / ${initialVal || '1'} = ${v0 && v1 ? (v1 / v0).toFixed(4) : '0'}`,
        `Esponente = 1 / ${years || '1'} = ${t ? (1 / t).toFixed(4) : '1'}`,
        `Tasso medio annuo CAGR = ${formatPercent(cagr, settings)}`
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcInput
            label="Valore iniziale"
            value={initialVal}
            onChange={setInitialVal}
            placeholder="es. 1000"
          />
          <CalcInput
            label="Valore finale"
            value={finalVal}
            onChange={setFinalVal}
            placeholder="es. 2500"
          />
          <CalcInput
            label="Numero di anni (Periodo)"
            value={years}
            onChange={setYears}
            suffix="anni"
            placeholder="es. 5"
          />
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Tasso annuo composto (CAGR)
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatPercent(cagr, settings)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Rendimento medio costante all'anno
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Crescita complessiva totale
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {formatPercent(totalGrowthPct, settings)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Variazione nell'intero arco dei {years} anni
            </span>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="cagr"
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

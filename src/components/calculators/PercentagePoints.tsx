import React, { useState, useEffect } from 'react';
import { Percent, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatNumber, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface PercentagePointsProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const PercentagePoints: React.FC<PercentagePointsProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [initialRate, setInitialRate] = useState('2.5');
  const [finalRate, setFinalRate] = useState('3.75');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.initialRate !== undefined) setInitialRate(initialInputs.initialRate);
      if (initialInputs.finalRate !== undefined) setFinalRate(initialInputs.finalRate);
    }
  }, [initialInputs]);

  const r1 = parseNumber(initialRate);
  const r2 = parseNumber(finalRate);

  let ppDiff: number | null = null;
  let pctChange: number | null = null;

  if (r1 !== null && r2 !== null) {
    ppDiff = r2 - r1;
    if (r1 !== 0) {
      pctChange = ((r2 - r1) / Math.abs(r1)) * 100;
    }
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'percentage-points',
    calculatorTitle: settings.language === 'it' ? 'Punti Percentuali (pp vs %)' : 'Percentage Points vs %',
    summary: `Da ${initialRate}% a ${finalRate}%: ${ppDiff !== null && ppDiff >= 0 ? `+${formatNumber(ppDiff, settings)}` : formatNumber(ppDiff, settings)} pp (${formatPercent(pctChange, settings)} var. relativa)`,
    details: [
      { label: 'Tasso iniziale', value: `${initialRate}%` },
      { label: 'Tasso finale', value: `${finalRate}%` },
      { label: 'Differenza in punti (pp)', value: `${formatNumber(ppDiff, settings)} pp` },
      { label: 'Variazione percentuale (%)', value: formatPercent(pctChange, settings) }
    ],
    formula: 'pp = Tasso Finale - Tasso Iniziale  |  % = (pp / Tasso Iniziale) × 100',
    inputs: { initialRate, finalRate },
    isValid: ppDiff !== null && initialRate !== '' && finalRate !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setInitialRate('');
    setFinalRate('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Da ${initialRate}% a ${finalRate}%:\n• Punti Percentuali: ${ppDiff !== null && ppDiff >= 0 ? `+${formatNumber(ppDiff, settings)}` : formatNumber(ppDiff, settings)} pp\n• Variazione Percentuale: ${formatPercent(pctChange, settings)}`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    handleCopy();
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.initialRate !== undefined) setInitialRate(inputs.initialRate);
    if (inputs.finalRate !== undefined) setFinalRate(inputs.finalRate);
  };

  const plainExplanation =
    r1 !== null && r2 !== null && ppDiff !== null && pctChange !== null
      ? `Attenzione alla differenza tra "punti" e "percentuale": un tasso che passa da ${r1}% a ${r2}% aumenta di ${formatNumber(
          ppDiff,
          settings
        )} punti percentuali (differenza aritmetica diretta), ma dal punto di vista relativo rappresenta una crescita del ${formatPercent(
          pctChange,
          settings
        )} rispetto al valore di partenza.`
      : '';

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Punti Percentuali vs Variazione Percentuale (pp vs %)' : 'Percentage Points vs %'}
      description={
        settings.language === 'it'
          ? 'Distingui la differenza assoluta in punti percentuali (pp) dall\'aumento o calo percentuale effettivo.'
          : 'Clarify the distinction between absolute percentage points (pp) and relative percentage change.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      plainExplanation={plainExplanation}
      formula="Punti Percentuali (pp) = Tasso Finale - Tasso Iniziale  |  Variazione % = ((Tasso Finale - Iniziale) / Iniziale) × 100"
      steps={[
        `Differenza in Punti (pp) = ${finalRate || '0'}% - ${initialRate || '0'}% = ${formatNumber(ppDiff, settings)} pp`,
        `Variazione Percentuale (%) = (${formatNumber(ppDiff, settings)} / ${initialRate || '1'}) × 100 = ${formatPercent(pctChange, settings)}`
      ]}
      notes="I punti percentuali indicano la sottrazione aritmetica diretta; la variazione percentuale misura l'impatto proporzionale."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            label="Tasso / Percentuale iniziale"
            value={initialRate}
            onChange={setInitialRate}
            suffix="%"
            placeholder="es. 2.5"
            showSlider
            min={0}
            max={30}
          />
          <CalcInput
            label="Tasso / Percentuale finale"
            value={finalRate}
            onChange={setFinalRate}
            suffix="%"
            placeholder="es. 3.75"
            showSlider
            min={0}
            max={30}
          />
        </div>

        {/* Results Comparison Grid */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Punti Percentuali (Differenza pp)
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {ppDiff !== null ? (ppDiff >= 0 ? `+${formatNumber(ppDiff, settings)}` : formatNumber(ppDiff, settings)) : '—'} <span className="text-sm font-normal">pp</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Variazione aritmetica secca
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
              Variazione Relativa (%)
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {pctChange !== null ? (pctChange >= 0 ? `+${formatPercent(pctChange, settings)}` : formatPercent(pctChange, settings)) : '—'}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Aumento o calo proporzionale effettivo
            </span>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="percentage-points"
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

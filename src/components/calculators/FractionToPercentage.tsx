import React, { useState, useEffect } from 'react';
import { Divide } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatPercent, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface FractionToPercentageProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export const FractionToPercentage: React.FC<FractionToPercentageProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [numerator, setNumerator] = useState('3');
  const [denominator, setDenominator] = useState('4');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.numerator !== undefined) setNumerator(initialInputs.numerator);
      if (initialInputs.denominator !== undefined) setDenominator(initialInputs.denominator);
    }
  }, [initialInputs]);

  const num = parseNumber(numerator);
  const den = parseNumber(denominator);

  const decimalVal = num !== null && den !== null && den !== 0 ? num / den : null;
  const percentVal = decimalVal !== null ? decimalVal * 100 : null;

  let simplified = '';
  if (num !== null && den !== null && den !== 0 && Number.isInteger(num) && Number.isInteger(den)) {
    const divisor = gcd(Math.abs(num), Math.abs(den));
    if (divisor > 1) {
      simplified = `${num / divisor} / ${den / divisor}`;
    }
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'fractions',
    calculatorTitle: settings.language === 'it' ? 'Frazioni in Percentuale' : 'Fractions to Percentage',
    summary: `${numerator}/${denominator} = ${formatPercent(percentVal, settings)}`,
    details: [
      { label: 'Numeratore', value: numerator },
      { label: 'Denominatore', value: denominator },
      { label: 'Percentuale', value: formatPercent(percentVal, settings) },
      { label: 'Decimale', value: formatNumber(decimalVal, settings, 4) }
    ],
    formula: '(Numeratore / Denominatore) × 100',
    inputs: { numerator, denominator },
    isValid: percentVal !== null && numerator !== '' && denominator !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setNumerator('');
    setDenominator('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `${numerator}/${denominator} = ${formatPercent(percentVal, settings)} (decimale: ${formatNumber(decimalVal, settings, 4)})`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Conversione Frazione:\n${numerator}/${denominator} equivale a:\n• Percentuale: ${formatPercent(percentVal, settings)}\n• Decimale: ${formatNumber(decimalVal, settings, 4)}`;
    if (navigator.share) {
      navigator.share({ title: 'Frazione in Percentuale', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'fractions',
      calculatorTitle: settings.language === 'it' ? 'Frazioni in Percentuale' : 'Fractions to Percentage',
      summary: `${numerator}/${denominator} = ${formatPercent(percentVal, settings)}`,
      details: [
        { label: 'Numeratore', value: numerator },
        { label: 'Denominatore', value: denominator },
        { label: 'Percentuale', value: formatPercent(percentVal, settings) },
        { label: 'Decimale', value: formatNumber(decimalVal, settings, 4) }
      ],
      formula: '(Numeratore / Denominatore) × 100',
      inputs: { numerator, denominator }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.numerator !== undefined) setNumerator(inputs.numerator);
    if (inputs.denominator !== undefined) setDenominator(inputs.denominator);
  };

  const quickFractions = [
    { n: '1', d: '2' },
    { n: '1', d: '3' },
    { n: '1', d: '4' },
    { n: '2', d: '3' },
    { n: '3', d: '4' },
    { n: '1', d: '5' },
    { n: '4', d: '5' }
  ];

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Frazioni in Percentuale' : 'Fractions to Percentage'}
      description={
        settings.language === 'it'
          ? 'Converti all\'istante qualsiasi frazione in percentuale e valore decimale.'
          : 'Convert fractions to percentage and decimal values in real-time.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Percentuale % = (Numeratore / Denominatore) × 100"
      steps={[
        `Rapporto decimale = ${numerator || '0'} / ${denominator || '1'} = ${formatNumber(decimalVal, settings, 4)}`,
        `Percentuale = ${formatNumber(decimalVal, settings, 4)} × 100 = ${formatPercent(percentVal, settings)}`,
        simplified ? `Frazione ridotta ai minimi termini = ${simplified}` : 'Frazione già ai minimi termini'
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            label="Numeratore (Parte superiore)"
            value={numerator}
            onChange={setNumerator}
            placeholder="es. 3"
          />
          <CalcInput
            label="Denominatore (Parte inferiore)"
            value={denominator}
            onChange={setDenominator}
            placeholder="es. 4"
          />
        </div>

        {/* Quick fractions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Frazioni comuni:</span>
          {quickFractions.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setNumerator(f.n);
                setDenominator(f.d);
              }}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500 transition-colors"
            >
              {f.n}/{f.d}
            </button>
          ))}
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Percentuale equivalente
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatPercent(percentVal, settings)}
              </div>
              {simplified && (
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Semplificata: <span className="font-mono font-semibold">{simplified}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Valore decimale
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatNumber(decimalVal, settings, 4)}
              </div>
            </div>
          </div>

          {/* Visual Percentage Bar */}
          {percentVal !== null && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>0%</span>
                <span>{formatPercent(percentVal, settings)}</span>
                <span>100%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, percentVal))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="fractions"
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

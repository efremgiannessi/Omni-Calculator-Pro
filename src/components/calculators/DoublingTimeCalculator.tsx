import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface DoublingTimeCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const DoublingTimeCalculator: React.FC<DoublingTimeCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [growthRate, setGrowthRate] = useState('8');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.growthRate !== undefined) setGrowthRate(initialInputs.growthRate);
    }
  }, [initialInputs]);

  const r = parseNumber(growthRate);

  let exactYears: number | null = null;
  let rule72Years: number | null = null;
  let tripleYears: number | null = null;

  if (r !== null && r > 0) {
    const rateDecimal = r / 100;
    exactYears = Math.log(2) / Math.log(1 + rateDecimal);
    rule72Years = 72 / r;
    tripleYears = Math.log(3) / Math.log(1 + rateDecimal);
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'doubling-time',
    calculatorTitle: settings.language === 'it' ? 'Tempo di Raddoppio (Regola 72)' : 'Doubling Time (Rule of 72)',
    summary: `Al ${growthRate}% raddoppia in ${formatNumber(exactYears, settings)} anni`,
    details: [
      { label: 'Tasso di crescita', value: `${growthRate}%` },
      { label: 'Anni esatti', value: `${formatNumber(exactYears, settings)} anni` },
      { label: 'Stima Regola 72', value: `~${formatNumber(rule72Years, settings)} anni` }
    ],
    formula: 'Anni = ln(2) / ln(1 + r) ≈ 72 / r',
    inputs: { growthRate },
    isValid: exactYears !== null && growthRate !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setGrowthRate('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Tasso ${growthRate}%: Tempo per raddoppiare = ${formatNumber(exactYears, settings)} anni (Regola 72: ${formatNumber(rule72Years, settings)} anni)`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Tempo di Raddoppio:\nAl tasso del ${growthRate}% annuo:\n• Anni per raddoppiare (esatti): ${formatNumber(exactYears, settings)} anni\n• Stima Regola del 72: ${formatNumber(rule72Years, settings)} anni\n• Anni per triplicare: ${formatNumber(tripleYears, settings)} anni`;
    if (navigator.share) {
      navigator.share({ title: 'Tempo di Raddoppio', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'doubling-time',
      calculatorTitle: settings.language === 'it' ? 'Tempo di Raddoppio (Regola 72)' : 'Doubling Time (Rule of 72)',
      summary: `Al ${growthRate}% raddoppia in ${formatNumber(exactYears, settings)} anni`,
      details: [
        { label: 'Tasso di crescita', value: `${growthRate}%` },
        { label: 'Anni per raddoppiare', value: `${formatNumber(exactYears, settings)} anni` },
        { label: 'Stima Regola 72', value: `${formatNumber(rule72Years, settings)} anni` }
      ],
      formula: 'Anni = ln(2) / ln(1 + r) ≈ 72 / r',
      inputs: { growthRate }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.growthRate !== undefined) setGrowthRate(inputs.growthRate);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Tempo di Raddoppio (Regola del 72)' : 'Doubling Time (Rule of 72)'}
      description={
        settings.language === 'it'
          ? 'Scopri in quanti anni il tuo capitale raddoppierà ad un dato tasso di crescita composto.'
          : 'Find out how long it takes for money to double under exponential growth.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Anni Esatti = ln(2) / ln(1 + Tasso/100)   |   Regola del 72 ≈ 72 / Tasso"
      steps={[
        `Tasso annuo = ${growthRate || '0'}%`,
        `Formula esatta: ln(2) / ln(1 + ${r ? (r / 100).toFixed(4) : '0'}) = ${formatNumber(exactYears, settings)} anni`,
        `Approssimazione Regola 72: 72 / ${growthRate || '1'} = ${formatNumber(rule72Years, settings)} anni`
      ]}
    >
      <div className="space-y-5">
        <CalcInput
          label="Tasso di crescita o interesse annuo %"
          value={growthRate}
          onChange={setGrowthRate}
          suffix="%"
          placeholder="es. 8"
        />

        {/* Quick rates */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Tassi comuni:</span>
          {['3', '5', '7', '8', '10', '12', '15'].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setGrowthRate(rate)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                growthRate === rate
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
              }`}
            >
              {rate}%
            </button>
          ))}
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Anni per Raddoppiare (Esatto)
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatNumber(exactYears, settings, 2)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Formula matematica precisa
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Stima Regola del 72
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              ~{formatNumber(rule72Years, settings, 1)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              72 / Tasso %
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Anni per Triplicare (3×)
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-700 dark:text-zinc-200 mt-1">
              {formatNumber(tripleYears, settings, 2)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              ln(3) / ln(1 + Tasso)
            </span>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="doubling-time"
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

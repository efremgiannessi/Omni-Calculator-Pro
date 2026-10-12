import React, { useState, useEffect } from 'react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatNumber, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface SimplePercentageProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const SimplePercentage: React.FC<SimplePercentageProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  // Mode A: What is X% of Y?
  const [aPercent, setAPercent] = useState('15');
  const [aValue, setAValue] = useState('200');

  // Mode B: X is what % of Y?
  const [bPart, setBPart] = useState('45');
  const [bTotal, setBTotal] = useState('180');

  // Mode C: X increased / decreased by Y%
  const [cBase, setCBase] = useState('100');
  const [cPercent, setCPercent] = useState('20');
  const [cMode, setCMode] = useState<'increase' | 'decrease'>('increase');

  // Apply restored inputs
  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.aPercent !== undefined) setAPercent(initialInputs.aPercent);
      if (initialInputs.aValue !== undefined) setAValue(initialInputs.aValue);
      if (initialInputs.bPart !== undefined) setBPart(initialInputs.bPart);
      if (initialInputs.bTotal !== undefined) setBTotal(initialInputs.bTotal);
      if (initialInputs.cBase !== undefined) setCBase(initialInputs.cBase);
      if (initialInputs.cPercent !== undefined) setCPercent(initialInputs.cPercent);
      if (initialInputs.cMode) setCMode(initialInputs.cMode as any);
    }
  }, [initialInputs]);

  // Calculations
  const aP = parseNumber(aPercent);
  const aV = parseNumber(aValue);
  const aResult = aP !== null && aV !== null ? (aP / 100) * aV : null;

  const bP = parseNumber(bPart);
  const bT = parseNumber(bTotal);
  const bResult = bP !== null && bT !== null && bT !== 0 ? (bP / bT) * 100 : null;

  const cB = parseNumber(cBase);
  const cP = parseNumber(cPercent);
  const cResult =
    cB !== null && cP !== null
      ? cMode === 'increase'
        ? cB * (1 + cP / 100)
        : cB * (1 - cP / 100)
      : null;

  // Auto track to history when valid
  useAutoHistory({
    calculatorId: 'simple',
    calculatorTitle: settings.language === 'it' ? 'Percentuale Semplice' : 'Simple Percentage',
    summary: `${aPercent}% di ${aValue} = ${formatNumber(aResult, settings)}`,
    details: [
      { label: 'Percentuale', value: `${aPercent}%` },
      { label: 'Valore base', value: aValue },
      { label: 'Risultato', value: formatNumber(aResult, settings) }
    ],
    formula: 'Risultato = (Percentuale / 100) × Valore',
    inputs: { aPercent, aValue, bPart, bTotal, cBase, cPercent, cMode },
    isValid: aResult !== null && aPercent !== '' && aValue !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setAPercent('');
    setAValue('');
    setBPart('');
    setBTotal('');
    setCBase('');
    setCPercent('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `${aPercent}% di ${aValue} = ${formatNumber(aResult, settings)} | ${bPart} di ${bTotal} = ${formatPercent(bResult, settings)}`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Risultato copiato!' : 'Copied to clipboard!');
  };

  const handleShare = () => {
    const summary = `Calcolo Percentuale Semplice:\n• ${aPercent}% di ${aValue} = ${formatNumber(aResult, settings)}\n• ${bPart} su ${bTotal} = ${formatPercent(bResult, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Percentage Calculator', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per la condivisione' : 'Copied for sharing');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'simple',
      calculatorTitle: settings.language === 'it' ? 'Percentuale Semplice' : 'Simple Percentage',
      summary: `${aPercent}% di ${aValue} = ${formatNumber(aResult, settings)}`,
      details: [
        { label: 'Percentuale', value: `${aPercent}%` },
        { label: 'Valore base', value: aValue },
        { label: 'Risultato', value: formatNumber(aResult, settings) }
      ],
      formula: 'Risultato = (Percentuale / 100) × Valore',
      inputs: { aPercent, aValue, bPart, bTotal, cBase, cPercent, cMode }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.aPercent !== undefined) setAPercent(inputs.aPercent);
    if (inputs.aValue !== undefined) setAValue(inputs.aValue);
    if (inputs.bPart !== undefined) setBPart(inputs.bPart);
    if (inputs.bTotal !== undefined) setBTotal(inputs.bTotal);
    if (inputs.cBase !== undefined) setCBase(inputs.cBase);
    if (inputs.cPercent !== undefined) setCPercent(inputs.cPercent);
    if (inputs.cMode) setCMode(inputs.cMode as any);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Percentuale Semplice' : 'Simple Percentage'}
      description={
        settings.language === 'it'
          ? 'Risolvi rapidamente i 3 calcoli percentuali più comuni della vita quotidiana.'
          : 'Instantly solve the 3 most common everyday percentage problems.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="1) (P / 100) × V    |    2) (X / Y) × 100    |    3) V × (1 ± P / 100)"
      steps={[
        `Calcolo 1: (${aPercent || '0'} / 100) × ${aValue || '0'} = ${formatNumber(aResult, settings)}`,
        `Calcolo 2: (${bPart || '0'} / ${bTotal || '0'}) × 100 = ${formatPercent(bResult, settings)}`,
        `Calcolo 3: ${cBase || '0'} ${cMode === 'increase' ? '+' : '-'} (${cPercent || '0'}%) = ${formatNumber(cResult, settings)}`
      ]}
      notes={
        settings.language === 'it'
          ? 'Tutti i valori si aggiornano all\'istante durante la digitazione e vengono tracciati nello storico.'
          : 'Values recalculate automatically in real-time as you type and log into history.'
      }
    >
      <div className="space-y-6">
        {/* Section 1: Quanto è il X% di Y? */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Quanto è il X% di Y?</span>
            {aResult !== null && (
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                = {formatNumber(aResult, settings)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CalcInput
              label="Percentuale"
              value={aPercent}
              onChange={setAPercent}
              suffix="%"
              placeholder="es. 15"
            />
            <CalcInput
              label="Valore / Numero"
              value={aValue}
              onChange={setAValue}
              placeholder="es. 200"
            />
          </div>

          {/* Quick % buttons */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Rapidi:</span>
            {['5', '10', '15', '20', '25', '50'].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setAPercent(pct)}
                className={`px-2 py-1 text-xs font-mono rounded-md border transition-colors ${
                  aPercent === pct
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Risultato:</span>
            <span className="font-mono text-base font-bold text-slate-900 dark:text-zinc-100">
              {formatNumber(aResult, settings)}
            </span>
          </div>
        </div>

        {/* Section 2: X è che percentuale di Y? */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>X è che percentuale di Y?</span>
            {bResult !== null && (
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                = {formatPercent(bResult, settings)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CalcInput
              label="Parte (X)"
              value={bPart}
              onChange={setBPart}
              placeholder="es. 45"
            />
            <CalcInput
              label="Totale / Intero (Y)"
              value={bTotal}
              onChange={setBTotal}
              placeholder="es. 180"
            />
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Rapporto percentuale:</span>
            <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
              {formatPercent(bResult, settings)}
            </span>
          </div>
        </div>

        {/* Section 3: X aumentato o diminuito del Y% */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider">
              Variazione rapida (% ±)
            </span>
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-zinc-700/60 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setCMode('increase')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  cMode === 'increase'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                + Aumento
              </button>
              <button
                type="button"
                onClick={() => setCMode('decrease')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  cMode === 'decrease'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                − Riduzione
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CalcInput
              label="Valore iniziale"
              value={cBase}
              onChange={setCBase}
              placeholder="es. 100"
            />
            <CalcInput
              label={`Percentuale di ${cMode === 'increase' ? 'aumento' : 'diminuzione'}`}
              value={cPercent}
              onChange={setCPercent}
              suffix="%"
              placeholder="es. 20"
            />
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">
              Valore finale rettificato:
            </span>
            <span className="font-mono text-base font-bold text-slate-900 dark:text-zinc-100">
              {formatNumber(cResult, settings)}
            </span>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="simple"
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

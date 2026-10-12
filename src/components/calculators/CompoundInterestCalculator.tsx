import React, { useState, useEffect } from 'react';
import { LineChart, Sparkles } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { DonutChart } from '../common/InteractiveChart';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface CompoundInterestCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onOpenBigDisplay?: (data: { mainValue: string; mainLabel: string; details: { label: string; value: string }[] }) => void;
  onOpenReceipt?: (data: { title: string; summary: string; details: { label: string; value: string }[]; formula: string }) => void;
}

export const CompoundInterestCalculator: React.FC<CompoundInterestCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite,
  onOpenBigDisplay,
  onOpenReceipt
}) => {
  const [principal, setPrincipal] = useState('10000');
  const [annualRate, setAnnualRate] = useState('7');
  const [years, setYears] = useState('10');
  const [compoundsPerYear, setCompoundsPerYear] = useState<number>(12);
  const [monthlyDeposit, setMonthlyDeposit] = useState('100');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.principal !== undefined) setPrincipal(initialInputs.principal);
      if (initialInputs.annualRate !== undefined) setAnnualRate(initialInputs.annualRate);
      if (initialInputs.years !== undefined) setYears(initialInputs.years);
      if (initialInputs.monthlyDeposit !== undefined) setMonthlyDeposit(initialInputs.monthlyDeposit);
      if (initialInputs.compoundsPerYear !== undefined) {
        setCompoundsPerYear(parseInt(initialInputs.compoundsPerYear, 10) || 12);
      }
    }
  }, [initialInputs]);

  const p = parseNumber(principal) || 0;
  const r = (parseNumber(annualRate) || 0) / 100;
  const t = Math.max(1, parseNumber(years) || 1);
  const n = compoundsPerYear;
  const pmt = parseNumber(monthlyDeposit) || 0;

  let fvPrincipal = 0;
  if (r > 0 && n > 0) {
    fvPrincipal = p * Math.pow(1 + r / n, n * t);
  } else {
    fvPrincipal = p;
  }

  let fvDeposits = 0;
  const monthlyRate = r / 12;
  const totalMonths = t * 12;

  if (pmt > 0) {
    if (monthlyRate > 0) {
      fvDeposits = pmt * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else {
      fvDeposits = pmt * totalMonths;
    }
  }

  const futureValue = fvPrincipal + fvDeposits;
  const totalDeposited = p + pmt * totalMonths;
  const totalInterest = Math.max(0, futureValue - totalDeposited);

  // Auto track history
  useAutoHistory({
    calculatorId: 'compound-interest',
    calculatorTitle: settings.language === 'it' ? 'Interesse Composto' : 'Compound Interest',
    summary: `Iniziale ${formatCurrency(p, settings)} al ${annualRate}% (${t}a) = ${formatCurrency(futureValue, settings)}`,
    details: [
      { label: 'Capitale iniziale', value: formatCurrency(p, settings) },
      { label: 'Tasso annuo %', value: `${annualRate}%` },
      { label: 'Durata', value: `${t} anni` },
      { label: 'Capitale finale', value: formatCurrency(futureValue, settings) },
      { label: 'Interessi', value: formatCurrency(totalInterest, settings) }
    ],
    formula: 'FV = P × (1 + r/n)^(n×t) + Depositi',
    inputs: { principal, annualRate, years, monthlyDeposit, compoundsPerYear: compoundsPerYear.toString() },
    isValid: futureValue > 0 && principal !== '' && annualRate !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setPrincipal('');
    setAnnualRate('7');
    setYears('10');
    setMonthlyDeposit('0');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Interesse Composto: Capitale iniziale ${formatCurrency(p, settings)} | Tasso ${annualRate}% su ${t} anni = Capitale finale ${formatCurrency(futureValue, settings)} (Interessi: ${formatCurrency(totalInterest, settings)})`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    handleCopy();
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.principal !== undefined) setPrincipal(inputs.principal);
    if (inputs.annualRate !== undefined) setAnnualRate(inputs.annualRate);
    if (inputs.years !== undefined) setYears(inputs.years);
    if (inputs.monthlyDeposit !== undefined) setMonthlyDeposit(inputs.monthlyDeposit);
    if (inputs.compoundsPerYear !== undefined) {
      setCompoundsPerYear(parseInt(inputs.compoundsPerYear, 10) || 12);
    }
  };

  const plainExplanation =
    futureValue > 0
      ? `Partendo da ${formatCurrency(p, settings)}${
          pmt > 0 ? ` e versando ${formatCurrency(pmt, settings)} al mese, ` : ', '
        }in ${t} anni avrai versato di tasca tua ${formatCurrency(totalDeposited, settings)}. Grazie alla capitalizzazione composta al ${annualRate}%, avrai generato ${formatCurrency(
          totalInterest,
          settings
        )} di soli interessi passivi, raggiungendo un patrimonio totale finale di ${formatCurrency(futureValue, settings)}.`
      : '';

  const chartSlices = [
    {
      label: 'Tuo Capitale Versato',
      value: totalDeposited,
      color: '#3B82F6',
      formattedValue: formatCurrency(totalDeposited, settings)
    },
    {
      label: 'Interessi Guadagnati',
      value: totalInterest,
      color: '#10B981',
      formattedValue: formatCurrency(totalInterest, settings)
    }
  ];

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Interesse Composto' : 'Compound Interest'}
      description={
        settings.language === 'it'
          ? 'Simula l\'effetto esponenziale del rendimento composto con capitalizzazione e versamenti periodici.'
          : 'Simulate long-term compound growth with compounding frequency and recurring deposits.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onOpenBigDisplay={
        onOpenBigDisplay && futureValue > 0
          ? () =>
              onOpenBigDisplay({
                mainValue: formatCurrency(futureValue, settings),
                mainLabel: 'Capitale Finale Maturato',
                details: [
                  { label: 'Capitale Versato', value: formatCurrency(totalDeposited, settings) },
                  { label: 'Interessi Maturati', value: formatCurrency(totalInterest, settings) },
                  { label: 'Tasso Annuo', value: `${annualRate}%` },
                  { label: 'Orizzonte', value: `${t} anni` }
                ]
              })
          : undefined
      }
      onOpenReceipt={
        onOpenReceipt && futureValue > 0
          ? () =>
              onOpenReceipt({
                title: 'PROIEZIONE INTERESSE COMPOSTO',
                summary: formatCurrency(futureValue, settings),
                details: [
                  { label: 'Capitale Iniziale', value: formatCurrency(p, settings) },
                  { label: 'Versamento Mensile', value: formatCurrency(pmt, settings) },
                  { label: 'Tasso Annuo', value: `${annualRate}%` },
                  { label: 'Durata', value: `${t} anni` },
                  { label: 'Totale Tuoi Versamenti', value: formatCurrency(totalDeposited, settings) },
                  { label: 'Interessi Maturati', value: formatCurrency(totalInterest, settings) },
                  { label: 'Capitale Finale', value: formatCurrency(futureValue, settings) }
                ],
                formula: 'FV = P × (1 + r/n)^(n×t) + Depositi'
              })
          : undefined
      }
      plainExplanation={plainExplanation}
      chartComponent={
        futureValue > 0 ? (
          <DonutChart
            slices={chartSlices}
            centerLabel="Futuro"
            centerValue={formatCurrency(futureValue, settings)}
            title="Confronto tra capitale versato e interessi maturati"
          />
        ) : undefined
      }
      formula="FV = Capitale × (1 + Tasso / n)^(n × Anni) + Versamenti"
      steps={[
        `Capitale proprio investito = ${formatCurrency(p, settings)} + (${formatCurrency(pmt, settings)} × ${totalMonths} mesi) = ${formatCurrency(totalDeposited, settings)}`,
        `Capitale finale accumulato = ${formatCurrency(futureValue, settings)}`,
        `Interessi netti guadagnati = ${formatCurrency(totalInterest, settings)}`
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            label="Capitale iniziale (Principal)"
            value={principal}
            onChange={setPrincipal}
            prefix={settings.currency.symbol}
            placeholder="es. 10000"
          />
          <CalcInput
            label="Tasso di interesse annuo %"
            value={annualRate}
            onChange={setAnnualRate}
            suffix="%"
            placeholder="es. 7"
          />
          <CalcInput
            label="Durata dell'investimento (Anni)"
            value={years}
            onChange={setYears}
            suffix="anni"
            placeholder="es. 10"
          />
          <CalcInput
            label="Versamento ricorrente mensile (opzionale)"
            value={monthlyDeposit}
            onChange={setMonthlyDeposit}
            prefix={settings.currency.symbol}
            placeholder="es. 100"
          />
        </div>

        {/* Compounding frequency picker */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
            Frequenza di capitalizzazione
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { label: 'Annuale (1/anno)', value: 1 },
              { label: 'Semestrale (2/anno)', value: 2 },
              { label: 'Trimestrale (4/anno)', value: 4 },
              { label: 'Mensile (12/anno)', value: 12 },
              { label: 'Giornaliero (365/anno)', value: 365 }
            ].map((freq) => (
              <button
                key={freq.value}
                type="button"
                onClick={() => setCompoundsPerYear(freq.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors ${
                  compoundsPerYear === freq.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Capitale Finale Futuro
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                {formatCurrency(futureValue, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Dopo {t} anni di capitalizzazione
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                Interessi Maturati
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                +{formatCurrency(totalInterest, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Rendimento generato dal tempo
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                Capitale Tuo Versato
              </span>
              <div className="text-2xl font-bold font-mono text-slate-700 dark:text-zinc-300 mt-1">
                {formatCurrency(totalDeposited, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Iniziale + versamenti mensili
              </div>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="compound-interest"
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

import React, { useState, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface LoanCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [loanAmount, setLoanAmount] = useState('25000');
  const [interestRate, setInterestRate] = useState('5.5');
  const [years, setYears] = useState('5');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.loanAmount !== undefined) setLoanAmount(initialInputs.loanAmount);
      if (initialInputs.interestRate !== undefined) setInterestRate(initialInputs.interestRate);
      if (initialInputs.years !== undefined) setYears(initialInputs.years);
    }
  }, [initialInputs]);

  const p = parseNumber(loanAmount);
  const r = (parseNumber(interestRate) || 0) / 100;
  const y = parseNumber(years);

  let monthlyPayment: number | null = null;
  let totalRepayment: number | null = null;
  let totalInterest: number | null = null;

  if (p !== null && y !== null && p > 0 && y > 0) {
    const totalMonths = Math.round(y * 12);
    const monthlyRate = r / 12;

    if (monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = (p * (monthlyRate * factor)) / (factor - 1);
    } else {
      monthlyPayment = p / totalMonths;
    }

    totalRepayment = monthlyPayment * totalMonths;
    totalInterest = Math.max(0, totalRepayment - p);
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'loan',
    calculatorTitle: settings.language === 'it' ? 'Calcolatore Prestiti & Rate' : 'Loan & Mortgage Calculator',
    summary: `Prestito ${formatCurrency(p, settings)} al ${interestRate}% (${years}a) = Rata ${formatCurrency(monthlyPayment, settings)}/m`,
    details: [
      { label: 'Importo finanziato', value: formatCurrency(p, settings) },
      { label: 'Tasso annuo %', value: `${interestRate}%` },
      { label: 'Durata', value: `${years} anni` },
      { label: 'Rata mensile', value: formatCurrency(monthlyPayment, settings) },
      { label: 'Interessi totali', value: formatCurrency(totalInterest, settings) }
    ],
    formula: 'Rata = P × [i(1+i)^n] / [(1+i)^n - 1]',
    inputs: { loanAmount, interestRate, years },
    isValid: monthlyPayment !== null && loanAmount !== '' && interestRate !== '' && years !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setLoanAmount('');
    setInterestRate('5.5');
    setYears('5');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Prestito ${formatCurrency(p, settings)} al ${interestRate}% (${years} anni): Rata mensile = ${formatCurrency(monthlyPayment, settings)} | Totale restituito = ${formatCurrency(totalRepayment, settings)} (Interessi: ${formatCurrency(totalInterest, settings)})`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Piano di Rimborso Prestito:\nImporto: ${formatCurrency(p, settings)}\nTasso annuo: ${interestRate}%\nDurata: ${years} anni (${y ? Math.round(y * 12) : 0} rate)\n• Rata mensile: ${formatCurrency(monthlyPayment, settings)}\n• Interessi totali: ${formatCurrency(totalInterest, settings)}\n• Totale complessivo rimborsato: ${formatCurrency(totalRepayment, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Calcolo Rata Prestito', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'loan',
      calculatorTitle: settings.language === 'it' ? 'Calcolatore Prestiti & Rate' : 'Loan & Mortgage Calculator',
      summary: `Prestito ${formatCurrency(p, settings)} al ${interestRate}% (${years}a) = Rata ${formatCurrency(monthlyPayment, settings)}/mese`,
      details: [
        { label: 'Importo finanziato', value: formatCurrency(p, settings) },
        { label: 'Tasso annuo %', value: `${interestRate}%` },
        { label: 'Durata', value: `${years} anni` },
        { label: 'Rata mensile', value: formatCurrency(monthlyPayment, settings) },
        { label: 'Interessi totali', value: formatCurrency(totalInterest, settings) },
        { label: 'Totale restituito', value: formatCurrency(totalRepayment, settings) }
      ],
      formula: 'Rata = P × [i(1+i)^n] / [(1+i)^n - 1]',
      inputs: { loanAmount, interestRate, years }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.loanAmount !== undefined) setLoanAmount(inputs.loanAmount);
    if (inputs.interestRate !== undefined) setInterestRate(inputs.interestRate);
    if (inputs.years !== undefined) setYears(inputs.years);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Calcolatore Prestiti, Mutui & Rate' : 'Loan & Mortgage Calculator'}
      description={
        settings.language === 'it'
          ? 'Calcola l\'ammortamento a rata costante, gli interessi passivi e il costo totale del finanziamento.'
          : 'Calculate standard monthly payments, total interest paid, and full loan amortization.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Rata Mensile = Capitale × [i × (1 + i)^n] / [(1 + i)^n - 1]"
      steps={[
        `Numero di rate mensili (n) = ${years || '0'} anni × 12 = ${y ? Math.round(y * 12) : 0} mesi`,
        `Tasso mensile (i) = ${interestRate || '0'}% / 12 = ${r ? ((r / 12) * 100).toFixed(4) : '0'}%`,
        `Rata mensile calcolata = ${formatCurrency(monthlyPayment, settings)}`,
        `Totale restituito a fine prestito = ${formatCurrency(totalRepayment, settings)} (di cui ${formatCurrency(totalInterest, settings)} di soli interessi)`
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcInput
            label="Importo del prestito (Capitale)"
            value={loanAmount}
            onChange={setLoanAmount}
            prefix={settings.currency.symbol}
            placeholder="es. 25000"
          />
          <CalcInput
            label="Tasso di interesse annuo fisso %"
            value={interestRate}
            onChange={setInterestRate}
            suffix="%"
            placeholder="es. 5.5"
          />
          <CalcInput
            label="Durata rimborso (Anni)"
            value={years}
            onChange={setYears}
            suffix="anni"
            placeholder="es. 5"
          />
        </div>

        {/* Quick loan duration buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Durata tipica:</span>
          {['1', '2', '3', '5', '7', '10', '15', '20', '30'].map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => setYears(duration)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                years === duration
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
              }`}
            >
              {duration} {parseInt(duration, 10) === 1 ? 'anno' : 'anni'}
            </button>
          ))}
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Rata Mensile
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                {formatCurrency(monthlyPayment, settings)}
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                Per {y ? Math.round(y * 12) : 0} mensilità
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                Interessi Complessivi
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatCurrency(totalInterest, settings)}
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                Costo degli interessi bancari
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                Totale Restituito
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatCurrency(totalRepayment, settings)}
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                Capitale iniziale + interessi
              </span>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="loan"
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

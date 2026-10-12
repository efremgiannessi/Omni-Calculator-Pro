import React, { useState, useEffect } from 'react';
import { Table, Download, LineChart, FileSpreadsheet } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface AmortizationScheduleProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

interface YearRow {
  year: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [loanAmount, setLoanAmount] = useState('150000');
  const [interestRate, setInterestRate] = useState('3.8');
  const [years, setYears] = useState('20');

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

  let monthlyPayment = 0;
  let totalInterest = 0;
  let totalRepayment = 0;
  const schedule: YearRow[] = [];

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

    // Calculate month by month, aggregated by year
    let currentBalance = p;
    for (let yr = 1; yr <= y; yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;

      for (let m = 1; m <= 12; m++) {
        const monthInterest = currentBalance * monthlyRate;
        const monthPrincipal = monthlyPayment - monthInterest;
        currentBalance = Math.max(0, currentBalance - monthPrincipal);

        yrInterest += monthInterest;
        yrPrincipal += monthPrincipal;
      }

      schedule.push({
        year: yr,
        payment: monthlyPayment * 12,
        principalPaid: yrPrincipal,
        interestPaid: yrInterest,
        remainingBalance: currentBalance
      });
    }
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'amortization-schedule',
    calculatorTitle: settings.language === 'it' ? 'Piano Ammortamento Mutuo' : 'Amortization Schedule',
    summary: `Mutuo ${formatCurrency(p, settings)} al ${interestRate}% (${years}a): Rata ${formatCurrency(monthlyPayment, settings)}/m`,
    details: [
      { label: 'Importo mutuo', value: formatCurrency(p, settings) },
      { label: 'Tasso fisso %', value: `${interestRate}%` },
      { label: 'Durata', value: `${years} anni` },
      { label: 'Rata mensile', value: formatCurrency(monthlyPayment, settings) },
      { label: 'Interessi complessivi', value: formatCurrency(totalInterest, settings) }
    ],
    formula: 'Ammortamento Francese: Quota Capitale + Quota Interessi',
    inputs: { loanAmount, interestRate, years },
    isValid: monthlyPayment > 0 && loanAmount !== '' && interestRate !== '',
    onSaveHistory
  });

  const handleExportCsv = () => {
    if (schedule.length === 0) return;

    const headers = ['Anno', 'Rata Annua', 'Quota Capitale', 'Quota Interessi', 'Debito Residuo'];
    const rows = schedule.map((row) => [
      row.year,
      row.payment.toFixed(2),
      row.principalPaid.toFixed(2),
      row.interestPaid.toFixed(2),
      row.remainingBalance.toFixed(2)
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `piano_ammortamento_${loanAmount}eur_${years}anni.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(settings.language === 'it' ? 'Tabella CSV scaricata con successo!' : 'CSV exported!');
  };

  const handleClear = () => {
    setLoanAmount('');
    setInterestRate('3.8');
    setYears('20');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Mutuo ${formatCurrency(p, settings)} su ${years} anni al ${interestRate}%: Rata mensile = ${formatCurrency(monthlyPayment, settings)} | Totale interessi: ${formatCurrency(totalInterest, settings)} | Totale rimborsato: ${formatCurrency(totalRepayment, settings)}`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Riepilogo copiato!' : 'Copied!');
  };

  const handleShare = () => {
    handleCopy();
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.loanAmount !== undefined) setLoanAmount(inputs.loanAmount);
    if (inputs.interestRate !== undefined) setInterestRate(inputs.interestRate);
    if (inputs.years !== undefined) setYears(inputs.years);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Piano di Ammortamento Mutuo & Finanziamento' : 'Amortization Schedule'}
      description={
        settings.language === 'it'
          ? 'Prospetto dettagliato anno per anno con ripartizione esatta tra quota capitale, quota interessi e debito residuo.'
          : 'Detailed yearly amortization table with principal, interest, and residual debt breakdown.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      formula="Rata Mensile = Capitale × [i(1+i)^n] / [(1+i)^n - 1]  |  Quota Interessi = Debito Residuo × i"
      steps={[
        `Rata mensile = ${formatCurrency(monthlyPayment, settings)} / mese (${formatCurrency(monthlyPayment * 12, settings)} / anno)`,
        `Interessi bancari totali nel periodo di ${years || '0'} anni = ${formatCurrency(totalInterest, settings)}`,
        `Costo totale restituito = ${formatCurrency(totalRepayment, settings)}`
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcInput
            label="Importo del mutuo"
            value={loanAmount}
            onChange={setLoanAmount}
            prefix={settings.currency.symbol}
            placeholder="es. 150000"
          />
          <CalcInput
            label="Tasso di interesse annuo fisso %"
            value={interestRate}
            onChange={setInterestRate}
            suffix="%"
            placeholder="es. 3.8"
          />
          <CalcInput
            label="Durata rimborso (Anni)"
            value={years}
            onChange={setYears}
            suffix="anni"
            placeholder="es. 20"
          />
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Rata Mensile
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
              {formatCurrency(monthlyPayment, settings)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Per {y ? y * 12 : 0} mesi
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
              Incidenza sul capitale: {p && p > 0 ? formatPercent((totalInterest / p) * 100, settings) : '0%'}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
              Totale Complessivo
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {formatCurrency(totalRepayment, settings)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Capitale + Interessi
            </span>
          </div>
        </div>

        {/* Table & CSV Export Button Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Prospetto Ammortamento Anno per Anno
              </h3>
            </div>

            {schedule.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Esporta CSV</span>
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-semibold sticky top-0 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Anno</th>
                    <th className="py-2.5 px-3">Rata Annua</th>
                    <th className="py-2.5 px-3 text-emerald-600">Quota Capitale</th>
                    <th className="py-2.5 px-3 text-rose-600">Quota Interessi</th>
                    <th className="py-2.5 px-3 text-right">Debito Residuo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono">
                  {schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-zinc-200">
                        Anno {row.year}
                      </td>
                      <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">
                        {formatCurrency(row.payment, settings)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(row.principalPaid, settings)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-rose-600 dark:text-rose-400">
                        {formatCurrency(row.interestPaid, settings)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-zinc-100">
                        {formatCurrency(row.remainingBalance, settings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="amortization-schedule"
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

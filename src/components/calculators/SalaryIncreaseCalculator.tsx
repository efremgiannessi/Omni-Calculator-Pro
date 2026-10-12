import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, DollarSign, Wallet, Calendar, Percent } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface SalaryIncreaseProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const SalaryIncreaseCalculator: React.FC<SalaryIncreaseProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [currentSalary, setCurrentSalary] = useState('32000');
  const [salaryType, setSalaryType] = useState<'annual' | 'monthly'>('annual');
  const [monthsCount, setMonthsCount] = useState<'12' | '13' | '14'>('13');
  const [increaseType, setIncreaseType] = useState<'percent' | 'amount'>('percent');
  const [increaseValue, setIncreaseValue] = useState('8');
  const [taxRate, setTaxRate] = useState('35'); // Stima aliquota marginale fiscale + previdenziale

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.currentSalary !== undefined) setCurrentSalary(initialInputs.currentSalary);
      if (initialInputs.salaryType === 'annual' || initialInputs.salaryType === 'monthly') {
        setSalaryType(initialInputs.salaryType);
      }
      if (initialInputs.monthsCount) setMonthsCount(initialInputs.monthsCount as any);
      if (initialInputs.increaseType === 'percent' || initialInputs.increaseType === 'amount') {
        setIncreaseType(initialInputs.increaseType);
      }
      if (initialInputs.increaseValue !== undefined) setIncreaseValue(initialInputs.increaseValue);
      if (initialInputs.taxRate !== undefined) setTaxRate(initialInputs.taxRate);
    }
  }, [initialInputs]);

  const numMonths = parseInt(monthsCount, 10) || 12;
  const rawSal = parseNumber(currentSalary) ?? 0;
  const incVal = parseNumber(increaseValue) ?? 0;
  const taxPct = parseNumber(taxRate) ?? 35;

  // Normalize to Annual Gross (RAL)
  const currentAnnualGross = salaryType === 'annual' ? rawSal : rawSal * numMonths;

  // Calculate Increase
  let annualGrossIncrease = 0;
  let percentIncrease = 0;

  if (increaseType === 'percent') {
    percentIncrease = incVal;
    annualGrossIncrease = (currentAnnualGross * incVal) / 100;
  } else {
    // Amount
    if (salaryType === 'annual') {
      annualGrossIncrease = incVal;
    } else {
      annualGrossIncrease = incVal * numMonths;
    }
    percentIncrease = currentAnnualGross > 0 ? (annualGrossIncrease / currentAnnualGross) * 100 : 0;
  }

  const newAnnualGross = currentAnnualGross + annualGrossIncrease;

  // Monthly values
  const currentMonthlyGross = currentAnnualGross / numMonths;
  const newMonthlyGross = newAnnualGross / numMonths;
  const monthlyGrossIncrease = annualGrossIncrease / numMonths;

  // Estimated Net values (using marginal tax rate on the delta)
  const annualNetIncrease = annualGrossIncrease * (1 - taxPct / 100);
  const monthlyNetIncrease = annualNetIncrease / numMonths;

  // Auto track history
  useAutoHistory({
    calculatorId: 'salary-increase',
    calculatorTitle: settings.language === 'it' ? 'Aumento Stipendio & RAL' : 'Salary Increase Calculator',
    summary: `RAL da ${formatCurrency(currentAnnualGross, settings)} a ${formatCurrency(
      newAnnualGross,
      settings
    )} (+${formatPercent(percentIncrease, settings)}). Aumento lordo mensile: +${formatCurrency(
      monthlyGrossIncrease,
      settings
    )} (~+${formatCurrency(monthlyNetIncrease, settings)} netto)`,
    details: [
      { label: 'RAL attuale', value: formatCurrency(currentAnnualGross, settings) },
      { label: 'Nuova RAL', value: formatCurrency(newAnnualGross, settings) },
      { label: 'Variazione percentuale', value: `+${formatPercent(percentIncrease, settings)}` },
      { label: 'Aumento lordo annuo', value: `+${formatCurrency(annualGrossIncrease, settings)}` },
      { label: 'Aumento lordo mensile', value: `+${formatCurrency(monthlyGrossIncrease, settings)}/mese` },
      { label: 'Stima netto in busta paga', value: `+${formatCurrency(monthlyNetIncrease, settings)}/mese` }
    ],
    formula: 'Nuovo Stipendio = Attuale × (1 + % / 100) | Netto stimato = Lordo × (1 - Aliquota marginale)',
    inputs: {
      currentSalary,
      salaryType,
      monthsCount,
      increaseType,
      increaseValue,
      taxRate
    },
    isValid: currentAnnualGross > 0 && incVal > 0,
    onSaveHistory
  });

  const handleClear = () => {
    setCurrentSalary('');
    setIncreaseValue('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const text = `Simulazione Aumento Retributivo:\n• RAL Attuale: ${formatCurrency(
      currentAnnualGross,
      settings
    )}\n• Nuova RAL Proposta: ${formatCurrency(
      newAnnualGross,
      settings
    )} (+${formatPercent(percentIncrease, settings)})\n• Incremento Lordo Annuo: +${formatCurrency(
      annualGrossIncrease,
      settings
    )}\n• Incremento Lordo Mensile (${numMonths} mensilità): +${formatCurrency(
      monthlyGrossIncrease,
      settings
    )}\n• Stima Netto Busta Paga (aliquota ~${taxPct}%): +${formatCurrency(
      monthlyNetIncrease,
      settings
    )} al mese`;
    navigator.clipboard.writeText(text);
    showToast(settings.language === 'it' ? 'Prospetto stipendio copiato!' : 'Copied to clipboard!');
  };

  const handleShare = () => {
    handleCopy();
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.currentSalary !== undefined) setCurrentSalary(inputs.currentSalary);
    if (inputs.salaryType) setSalaryType(inputs.salaryType as any);
    if (inputs.monthsCount) setMonthsCount(inputs.monthsCount as any);
    if (inputs.increaseType) setIncreaseType(inputs.increaseType as any);
    if (inputs.increaseValue !== undefined) setIncreaseValue(inputs.increaseValue);
    if (inputs.taxRate !== undefined) setTaxRate(inputs.taxRate);
  };

  const plainExplanation =
    currentAnnualGross > 0 && annualGrossIncrease > 0
      ? `Con un aumento del ${formatPercent(percentIncrease, settings)}, la tua retribuzione lorda annua passa da ${formatCurrency(
          currentAnnualGross,
          settings
        )} a ${formatCurrency(
          newAnnualGross,
          settings
        )} (+${formatCurrency(
          annualGrossIncrease,
          settings
        )} lordi all'anno). Diviso su ${numMonths} mensilità, ogni cedolino mensile vedrà un aumento lordo di ${formatCurrency(
          monthlyGrossIncrease,
          settings
        )}. Considerando una tassazione marginale stimata del ${taxPct}%, il tuo guadagno effettivo netto in tasca sarà di circa ${formatCurrency(
          monthlyNetIncrease,
          settings
        )} in più ogni singolo mese (${formatCurrency(annualNetIncrease, settings)} netti annui).`
      : '';

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Aumento di Stipendio & Nuova RAL' : 'Salary Increase Calculator'}
      description={
        settings.language === 'it'
          ? 'Calcola l\'impatto dell\'aumento retributivo su base mensile e annua, con stima del netto reale in busta paga.'
          : 'Calculate salary raises, new annual compensation, and net take-home pay differences.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      plainExplanation={plainExplanation}
      formula="Nuova RAL = RAL Attuale × (1 + Aumento % / 100) | Aumento Netto Mensile ≈ (Delta Lordo / Mensilità) × (1 - Aliquota Fiscale)"
      steps={[
        `Aumento Lordo Annuo = ${formatCurrency(currentAnnualGross, settings)} × ${formatPercent(
          percentIncrease,
          settings
        )} = +${formatCurrency(annualGrossIncrease, settings)}`,
        `Nuova RAL = ${formatCurrency(currentAnnualGross, settings)} + ${formatCurrency(
          annualGrossIncrease,
          settings
        )} = ${formatCurrency(newAnnualGross, settings)}`,
        `Aumento Lordo Mensile (${numMonths} mensilità) = ${formatCurrency(
          annualGrossIncrease,
          settings
        )} / ${numMonths} = +${formatCurrency(monthlyGrossIncrease, settings)}/mese`,
        `Stima Netto in Tasca al mese = ${formatCurrency(monthlyGrossIncrease, settings)} × (1 - ${taxPct}%) = +${formatCurrency(
          monthlyNetIncrease,
          settings
        )}/mese`
      ]}
      notes="Le aliquote marginali IRPEF + contributi INPS possono variare a seconda del tuo scaglione di reddito e delle detrazioni personali."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                {settings.language === 'it' ? 'Retribuzione Attuale' : 'Current Salary'}
              </label>
              <div className="flex text-xs rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setSalaryType('annual')}
                  className={`px-2 py-0.5 ${
                    salaryType === 'annual'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Annuale (RAL)
                </button>
                <button
                  type="button"
                  onClick={() => setSalaryType('monthly')}
                  className={`px-2 py-0.5 ${
                    salaryType === 'monthly'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Mensile
                </button>
              </div>
            </div>
            <CalcInput
              label=""
              value={currentSalary}
              onChange={setCurrentSalary}
              prefix={settings.currency.symbol}
              placeholder={salaryType === 'annual' ? 'es. 32000' : 'es. 2400'}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                {settings.language === 'it' ? 'Aumento Proposto' : 'Proposed Raise'}
              </label>
              <div className="flex text-xs rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setIncreaseType('percent')}
                  className={`px-2 py-0.5 ${
                    increaseType === 'percent'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setIncreaseType('amount')}
                  className={`px-2 py-0.5 ${
                    increaseType === 'amount'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {settings.currency.symbol}
                </button>
              </div>
            </div>
            <CalcInput
              label=""
              value={increaseValue}
              onChange={setIncreaseValue}
              suffix={increaseType === 'percent' ? '%' : undefined}
              prefix={increaseType === 'amount' ? settings.currency.symbol : undefined}
              placeholder={increaseType === 'percent' ? 'es. 8' : 'es. 2500'}
              showSlider={increaseType === 'percent'}
              min={0}
              max={50}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1">
                {settings.language === 'it' ? 'Mensilità / Anno' : 'Payments / Year'}
              </label>
              <select
                value={monthsCount}
                onChange={(e) => setMonthsCount(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              >
                <option value="12">12 (Standard)</option>
                <option value="13">13 (Con 13esima)</option>
                <option value="14">14 (13esima + 14esima)</option>
              </select>
            </div>
            <div>
              <CalcInput
                label={settings.language === 'it' ? 'Aliquota Fiscale Stima' : 'Est. Marginal Tax'}
                value={taxRate}
                onChange={setTaxRate}
                suffix="%"
                placeholder="es. 35"
              />
            </div>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              {settings.language === 'it' ? 'Nuova RAL Annuale' : 'New Annual Salary'}
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(newAnnualGross, settings)}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              +{formatPercent(percentIncrease, settings)} rispetto ad ora
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {settings.language === 'it' ? 'Stima Netto in Busta Paga' : 'Est. Net in Paycheck'}
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatCurrency(monthlyNetIncrease, settings)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              {settings.language === 'it' ? 'Soldi netti in più ogni mese' : 'Net take-home cash / month'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
              {settings.language === 'it' ? 'Aumento Lordo Mensile' : 'Monthly Gross Increase'}
            </span>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              +{formatCurrency(monthlyGrossIncrease, settings)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Su {numMonths} mensilità
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
              {settings.language === 'it' ? 'Aumento Annuo Lordo' : 'Annual Gross Delta'}
            </span>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              +{formatCurrency(annualGrossIncrease, settings)}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Totale extra all'anno
            </span>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="salary-increase"
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

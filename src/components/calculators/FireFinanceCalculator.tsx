import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Flame,
  TrendingUp,
  Activity,
  Bookmark,
  Share2,
  Info,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface FireFinanceCalculatorProps {
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

export const FireFinanceCalculator: React.FC<FireFinanceCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'fire' | 'pac' | 'savingsrate'>('fire');

  // FIRE Parameters
  const [monthlyExpense, setMonthlyExpense] = useState<string>('2000'); // €2,000/mo
  const [swrPercent, setSwrPercent] = useState<string>('4.0'); // 4% Rule
  const [currentNetWorth, setCurrentNetWorth] = useState<string>('50000'); // €50,000

  // PAC / SIP Compound Accumulation Parameters
  const [initialCapital, setInitialCapital] = useState<string>('20000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('600');
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<string>('7.5'); // 7.5% nominal
  const [inflationRate, setInflationRate] = useState<string>('2.0'); // 2% inflation
  const [capitalTaxRate, setCapitalTaxRate] = useState<string>('26'); // 26% Italian capital gain tax
  const [investmentYears, setInvestmentYears] = useState<string>('20');

  // Savings Rate Parameters
  const [netIncomeMonthly, setNetIncomeMonthly] = useState<string>('2800');
  const [monthlySaved, setMonthlySaved] = useState<string>('1000');

  // Format currency helper
  const fmtCurr = (n: number) => {
    return `${settings.currency.symbol}${Math.round(n).toLocaleString()}`;
  };

  // Calculate FIRE Numbers
  const fireCalc = useMemo(() => {
    const expense = parseFloat(monthlyExpense) || 0;
    const swr = parseFloat(swrPercent) || 4.0;
    const current = parseFloat(currentNetWorth) || 0;

    const annualExpense = expense * 12;
    const fireTarget = swr > 0 ? annualExpense / (swr / 100) : 0;
    const leanFireTarget = fireTarget * 0.75; // 25% lower expense
    const fatFireTarget = fireTarget * 1.5;   // 50% luxury cushion
    const baristaFireTarget = fireTarget * 0.5; // Half expenses covered by part-time job

    const percentAchieved = fireTarget > 0 ? Math.min(100, (current / fireTarget) * 100) : 0;
    const remainingToFire = Math.max(0, fireTarget - current);

    return {
      annualExpense,
      fireTarget,
      leanFireTarget,
      fatFireTarget,
      baristaFireTarget,
      percentAchieved,
      remainingToFire
    };
  }, [monthlyExpense, swrPercent, currentNetWorth]);

  // Calculate PAC Compound Projections
  const pacCalc = useMemo(() => {
    const p0 = parseFloat(initialCapital) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const rNominal = (parseFloat(expectedAnnualReturn) || 0) / 100;
    const rInflation = (parseFloat(inflationRate) || 0) / 100;
    const taxRate = (parseFloat(capitalTaxRate) || 0) / 100;
    const years = parseInt(investmentYears) || 20;

    const rReal = (1 + rNominal) / (1 + rInflation) - 1; // Fisher equation for real rate
    const rMonthlyNom = rNominal / 12;

    const trajectory: Array<{
      year: number;
      invested: number;
      nominalGross: number;
      nominalNet: number;
      realNet: number;
    }> = [];

    let currentGross = p0;
    let totalInvested = p0;

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        currentGross = currentGross * (1 + rMonthlyNom) + pmt;
        totalInvested += pmt;
      }

      const grossGain = Math.max(0, currentGross - totalInvested);
      const taxDue = grossGain * taxRate;
      const nominalNet = currentGross - taxDue;
      const realDiscount = Math.pow(1 + rInflation, y);
      const realNet = nominalNet / realDiscount;

      trajectory.push({
        year: y,
        invested: Math.round(totalInvested),
        nominalGross: Math.round(currentGross),
        nominalNet: Math.round(nominalNet),
        realNet: Math.round(realNet)
      });
    }

    const final = trajectory[trajectory.length - 1] || {
      invested: totalInvested,
      nominalGross: currentGross,
      nominalNet: currentGross,
      realNet: currentGross
    };

    return {
      trajectory,
      finalInvested: final.invested,
      finalNominalGross: final.nominalGross,
      finalNominalNet: final.nominalNet,
      finalRealNet: final.realNet,
      totalGainsGross: final.nominalGross - final.invested
    };
  }, [initialCapital, monthlyContribution, expectedAnnualReturn, inflationRate, capitalTaxRate, investmentYears]);

  // Savings rate calculation
  const savingsCalc = useMemo(() => {
    const inc = parseFloat(netIncomeMonthly) || 1;
    const sav = parseFloat(monthlySaved) || 0;
    const rate = Math.max(0, Math.min(100, (sav / inc) * 100));

    // Approximate years to retire from $0 assuming 5% real return and 4% SWR
    // Formula: t = ln( (exp / sav) * (r / SWR) + 1 ) / ln(1 + r)
    const exp = inc - sav;
    const r = 0.05; // 5% real return
    const swr = 0.04; // 4% SWR
    let yearsToFire = 0;
    if (sav > 0 && exp > 0) {
      const numerator = Math.log((exp / (sav * 12)) * (r / swr) * 12 + 1);
      const denominator = Math.log(1 + r);
      yearsToFire = numerator / denominator;
    }

    return {
      rate,
      exp,
      yearsToFire: Math.max(0, yearsToFire)
    };
  }, [netIncomeMonthly, monthlySaved]);

  const handleSaveToHistory = () => {
    let summary = '';
    let details: { label: string; value: string }[] = [];
    let formula = '';

    if (activeTab === 'fire') {
      summary = `Obiettivo FIRE: ${fmtCurr(fireCalc.fireTarget)} (${fireCalc.percentAchieved.toFixed(1)}% completato)`;
      details = [
        { label: 'Spese Annuali', value: fmtCurr(fireCalc.annualExpense) },
        { label: 'Target FIRE (SWR)', value: fmtCurr(fireCalc.fireTarget) },
        { label: 'Lean FIRE', value: fmtCurr(fireCalc.leanFireTarget) },
        { label: 'Fat FIRE', value: fmtCurr(fireCalc.fatFireTarget) },
        { label: 'Capitale Mancante', value: fmtCurr(fireCalc.remainingToFire) }
      ];
      formula = 'FIRE Target = Spese Annuali / Tasso di Prelievo SWR';
    } else if (activeTab === 'pac') {
      summary = `PAC ${investmentYears} Anni: Capitale ${fmtCurr(pacCalc.finalNominalNet)} (Reale: ${fmtCurr(pacCalc.finalRealNet)})`;
      details = [
        { label: 'Totale Versato', value: fmtCurr(pacCalc.finalInvested) },
        { label: 'Capitale Nominale Netto', value: fmtCurr(pacCalc.finalNominalNet) },
        { label: 'Potere d\'Acquisto Reale', value: fmtCurr(pacCalc.finalRealNet) },
        { label: 'Interessi e Guadagni', value: fmtCurr(pacCalc.totalGainsGross) }
      ];
      formula = 'PAC = C₀(1+r)ⁿ + PMT·∑(1+r)ⁱ - Tasse e Inflazione';
    } else {
      summary = `Tasso di Risparmio ${savingsCalc.rate.toFixed(1)}%: FIRE stimato in ~${savingsCalc.yearsToFire.toFixed(1)} anni`;
      details = [
        { label: 'Tasso di Risparmio', value: `${savingsCalc.rate.toFixed(1)}%` },
        { label: 'Spese Mensili', value: fmtCurr(savingsCalc.exp) },
        { label: 'Anni stimati a FIRE', value: `${savingsCalc.yearsToFire.toFixed(1)} anni` }
      ];
      formula = 'Shock Retirement Math (Mr. Money Mustache)';
    }

    onSaveHistory({
      calculatorId: 'fire-finance',
      calculatorTitle: 'FIRE Finanza Personale & Simulatore PAC',
      summary,
      details,
      formula,
      inputs: { activeTab }
    });
    showToast('Simulazione FIRE salvata!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                FIRE Indipendenza Finanziaria & PAC
                <span className="text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-mono">
                  Regola del 4% & Trinity Study
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Calcola il tuo numero FIRE (Financial Independence, Retire Early), simula piani di accumulo PAC con inflazione reale e tasse, e misura l'impatto del risparmio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`min-w-[38px] h-[38px] p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-sm'
                    : 'border-slate-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
                title="Aggiungi ai preferiti"
              >
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="h-[38px] flex items-center gap-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Salva
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 overflow-x-auto no-scrollbar mt-3">
          {[
            { id: 'fire', label: 'Calcolatore Obiettivo FIRE', icon: Flame },
            { id: 'pac', label: 'Simulatore PAC (Reale & Fiscale)', icon: TrendingUp },
            { id: 'savingsrate', label: 'Impatto Tasso di Risparmio', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-700/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: FIRE NUMBER */}
      {activeTab === 'fire' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <CalcInput
                label="Spese Mensili Desiderate"
                value={monthlyExpense}
                onChange={setMonthlyExpense}
                prefix={settings.currency.symbol}
              />
              <CalcInput
                label="Tasso Prelievo Sicuro SWR (%)"
                value={swrPercent}
                onChange={setSwrPercent}
                suffix="%"
              />
              <CalcInput
                label="Patrimonio Attuale Netto"
                value={currentNetWorth}
                onChange={setCurrentNetWorth}
                prefix={settings.currency.symbol}
              />
            </div>

            {/* Target Display and Progress Bar */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-zinc-800/40 border border-orange-200/60 dark:border-orange-900/40 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Il Tuo Numero FIRE
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-1">
                    {fmtCurr(fireCalc.fireTarget)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Genera rendite passive sufficienti a coprire {fmtCurr(fireCalc.annualExpense)}/anno senza mai intaccare il capitale.
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono">
                    {fireCalc.percentAchieved.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">Completamento</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, fireCalc.percentAchieved)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>Attuale: {fmtCurr(parseFloat(currentNetWorth) || 0)}</span>
                <span>Mancante: {fmtCurr(fireCalc.remainingToFire)}</span>
              </div>
            </div>

            {/* Archetypes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl">
                <div className="text-xs font-bold text-slate-500 uppercase">Lean FIRE (-25%)</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {fmtCurr(fireCalc.leanFireTarget)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Stile di vita minimalista e spese ridotte</div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl">
                <div className="text-xs font-bold text-slate-500 uppercase">Barista FIRE (50%)</div>
                <div className="text-xl font-bold text-sky-600 dark:text-sky-400 font-mono mt-1">
                  {fmtCurr(fireCalc.baristaFireTarget)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Metà spese da rendita, metà da lavoro part-time</div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl">
                <div className="text-xs font-bold text-slate-500 uppercase">Fat FIRE (+50%)</div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono mt-1">
                  {fmtCurr(fireCalc.fatFireTarget)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Totale libertà con viaggi, cene e comfort extra</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAC SIMULATOR */}
      {activeTab === 'pac' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
              <CalcInput label="Capitale Iniziale" value={initialCapital} onChange={setInitialCapital} prefix={settings.currency.symbol} />
              <CalcInput label="Versamento Mensile" value={monthlyContribution} onChange={setMonthlyContribution} prefix={settings.currency.symbol} />
              <CalcInput label="Rendimento Annuo (%)" value={expectedAnnualReturn} onChange={setExpectedAnnualReturn} suffix="%" />
              <CalcInput label="Inflazione Annua (%)" value={inflationRate} onChange={setInflationRate} suffix="%" />
              <CalcInput label="Tassazione Capital Gain (%)" value={capitalTaxRate} onChange={setCapitalTaxRate} suffix="%" />
              <CalcInput label="Anni di Orizzonte" value={investmentYears} onChange={setInvestmentYears} suffix="anni" />
            </div>

            {/* Results Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase">Totale Versato</div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                  {fmtCurr(pacCalc.finalInvested)}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase">Capitale Lordo Finale</div>
                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                  {fmtCurr(pacCalc.finalNominalGross)}
                </div>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-xl text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase">Capitale Netto Fiscale</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {fmtCurr(pacCalc.finalNominalNet)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Post-tassazione {capitalTaxRate}%</div>
              </div>

              <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 p-4 rounded-xl text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase">Potere d'Acquisto Reale</div>
                <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1">
                  {fmtCurr(pacCalc.finalRealNet)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Al netto dell'inflazione</div>
              </div>
            </div>

            {/* SVG Trajectory Chart */}
            <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Crescita nel Tempo (Anni 1 - {investmentYears})</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Versato</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Netto Fiscale</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Valore Reale</span>
                </div>
              </div>

              <div className="h-44 w-full">
                {pacCalc.trajectory.length > 0 && (() => {
                  const maxVal = Math.max(...pacCalc.trajectory.map(t => t.nominalNet), 1000);
                  const ptsInvested = pacCalc.trajectory.map((t, i) => `${(i / (pacCalc.trajectory.length - 1)) * 500},${140 - (t.invested / maxVal) * 120}`).join(' ');
                  const ptsNet = pacCalc.trajectory.map((t, i) => `${(i / (pacCalc.trajectory.length - 1)) * 500},${140 - (t.nominalNet / maxVal) * 120}`).join(' ');
                  const ptsReal = pacCalc.trajectory.map((t, i) => `${(i / (pacCalc.trajectory.length - 1)) * 500},${140 - (t.realNet / maxVal) * 120}`).join(' ');

                  return (
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      <polyline points={ptsInvested} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 4" />
                      <polyline points={ptsReal} fill="none" stroke="#0ea5e9" strokeWidth="3" />
                      <polyline points={ptsNet} fill="none" stroke="#10b981" strokeWidth="3.5" />
                    </svg>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAVINGS RATE IMPACT */}
      {activeTab === 'savingsrate' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              La Matematica dell'Indipendenza Anticipata
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <CalcInput
                label="Reddito Netto Mensile"
                value={netIncomeMonthly}
                onChange={setNetIncomeMonthly}
                prefix={settings.currency.symbol}
              />
              <CalcInput
                label="Importo Risparmiato Mensilmente"
                value={monthlySaved}
                onChange={setMonthlySaved}
                prefix={settings.currency.symbol}
              />
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                  Tasso di Risparmio (Savings Rate)
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-1">
                  {savingsCalc.rate.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Vivi con {fmtCurr(savingsCalc.exp)} al mese e risparmi {fmtCurr(parseFloat(monthlySaved) || 0)}.
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-center sm:text-right">
                <div className="text-xs text-slate-400 uppercase font-semibold">Anni di lavoro necessari per andare in pensione</div>
                <div className="text-3xl font-black text-orange-600 dark:text-orange-400 font-mono mt-1">
                  ~{savingsCalc.yearsToFire.toFixed(1)} Anni
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tape */}
      <SectionHistoryTape
        history={history}
        calculatorId="fire-finance"
        onRestore={() => {}}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        showToast={showToast}
        settings={settings}
      />
    </div>
  );
};

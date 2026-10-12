import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Package, BarChart2 } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface BreakEvenProps {
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

export const BreakEvenCalculator: React.FC<BreakEvenProps> = ({
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
  const [fixedCosts, setFixedCosts] = useState('15000');
  const [unitVariableCost, setUnitVariableCost] = useState('25');
  const [unitPrice, setUnitPrice] = useState('65');
  const [targetProfit, setTargetProfit] = useState('5000');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.fixedCosts !== undefined) setFixedCosts(initialInputs.fixedCosts);
      if (initialInputs.unitVariableCost !== undefined) setUnitVariableCost(initialInputs.unitVariableCost);
      if (initialInputs.unitPrice !== undefined) setUnitPrice(initialInputs.unitPrice);
      if (initialInputs.targetProfit !== undefined) setTargetProfit(initialInputs.targetProfit);
    }
  }, [initialInputs]);

  const fc = parseNumber(fixedCosts) ?? 0;
  const vc = parseNumber(unitVariableCost) ?? 0;
  const p = parseNumber(unitPrice) ?? 0;
  const tp = parseNumber(targetProfit) ?? 0;

  const unitMargin = p - vc;
  const marginRatio = p > 0 ? (unitMargin / p) * 100 : 0;

  const breakEvenUnits = unitMargin > 0 ? Math.ceil(fc / unitMargin) : null;
  const breakEvenRevenue = breakEvenUnits !== null ? breakEvenUnits * p : null;

  const targetUnits = unitMargin > 0 ? Math.ceil((fc + tp) / unitMargin) : null;
  const targetRevenue = targetUnits !== null ? targetUnits * p : null;

  // Sensitivity scenarios table (-50%, -25%, BEP, +25%, +50%)
  const simulationVolumes = breakEvenUnits
    ? [
        Math.round(breakEvenUnits * 0.5),
        Math.round(breakEvenUnits * 0.75),
        breakEvenUnits,
        Math.round(breakEvenUnits * 1.25),
        Math.round(breakEvenUnits * 1.5)
      ]
    : [];

  // Auto track history
  useAutoHistory({
    calculatorId: 'break-even',
    calculatorTitle: settings.language === 'it' ? 'Punto di Pareggio (Break-Even Point)' : 'Break-Even Point',
    summary:
      breakEvenUnits !== null
        ? `Pareggio a ${formatNumber(breakEvenUnits, settings)} unità (${formatCurrency(
            breakEvenRevenue ?? 0,
            settings
          )} fatturato) con margine unitario ${formatCurrency(unitMargin, settings)} (${formatPercent(
            marginRatio,
            settings
          )})`
        : 'Margine unitario negativo o nullo',
    details: [
      { label: 'Costi fissi totali', value: formatCurrency(fc, settings) },
      { label: 'Prezzo di vendita unitario', value: formatCurrency(p, settings) },
      { label: 'Costo variabile unitario', value: formatCurrency(vc, settings) },
      { label: 'Margine contribuzione unitario', value: formatCurrency(unitMargin, settings) },
      { label: 'Margine di contribuzione %', value: formatPercent(marginRatio, settings) },
      { label: 'Unità di pareggio (BEP)', value: `${formatNumber(breakEvenUnits ?? 0, settings)} unità` },
      { label: 'Fatturato di pareggio', value: formatCurrency(breakEvenRevenue ?? 0, settings) }
    ],
    formula: 'BEP (Unità) = Costi Fissi / (Prezzo - Costo Variabile) | BEP (Fatturato) = Costi Fissi / Margine %',
    inputs: { fixedCosts, unitVariableCost, unitPrice, targetProfit },
    isValid: fc > 0 && p > 0 && vc >= 0 && unitMargin > 0,
    onSaveHistory
  });

  const handleClear = () => {
    setFixedCosts('');
    setUnitVariableCost('');
    setUnitPrice('');
    setTargetProfit('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const text = `Analisi Punto di Pareggio (Break-Even):\n• Costi Fissi: ${formatCurrency(
      fc,
      settings
    )}\n• Prezzo Unitario: ${formatCurrency(p, settings)}\n• Costo Variabile Unitario: ${formatCurrency(
      vc,
      settings
    )}\n• Margine Unitario: ${formatCurrency(unitMargin, settings)} (${formatPercent(
      marginRatio,
      settings
    )})\n• Unità per Pareggio: ${formatNumber(breakEvenUnits ?? 0, settings)} pezzi\n• Fatturato di Pareggio: ${formatCurrency(
      breakEvenRevenue ?? 0,
      settings
    )}${
      tp > 0
        ? `\n• Per target utile di ${formatCurrency(tp, settings)}: servono ${formatNumber(
            targetUnits ?? 0,
            settings
          )} pezzi (${formatCurrency(targetRevenue ?? 0, settings)})`
        : ''
    }`;
    navigator.clipboard.writeText(text);
    showToast(settings.language === 'it' ? 'Dati di pareggio copiati!' : 'Copied to clipboard!');
  };

  const handleShare = () => {
    handleCopy();
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.fixedCosts !== undefined) setFixedCosts(inputs.fixedCosts);
    if (inputs.unitVariableCost !== undefined) setUnitVariableCost(inputs.unitVariableCost);
    if (inputs.unitPrice !== undefined) setUnitPrice(inputs.unitPrice);
    if (inputs.targetProfit !== undefined) setTargetProfit(inputs.targetProfit);
  };

  const plainExplanation =
    unitMargin > 0 && breakEvenUnits !== null
      ? `Ogni pezzo venduto a ${formatCurrency(p, settings)} ti lascia in cassa un margine di contribuzione netto di ${formatCurrency(
          unitMargin,
          settings
        )} (cioè il ${formatPercent(
          marginRatio,
          settings
        )} del prezzo), dopo aver coperto i suoi costi variabili di produzione. Per coprire i ${formatCurrency(
          fc,
          settings
        )} di costi fissi aziendali (affitto, stipendi, utenze) devi vendere almeno ${formatNumber(
          breakEvenUnits,
          settings
        )} pezzi, incassando un fatturato minimo di ${formatCurrency(
          breakEvenRevenue ?? 0,
          settings
        )}. Da quel momento in poi, ogni pezzo venduto in più genera puro profitto.`
      : unitMargin <= 0
      ? 'Attenzione: il prezzo di vendita è inferiore o uguale al costo variabile unitario. In questa situazione ogni vendita genera una perdita diretta e non sarà mai possibile raggiungere il pareggio.'
      : '';

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Punto di Pareggio & Margine di Contribuzione (Break-Even)' : 'Break-Even Point'}
      description={
        settings.language === 'it'
          ? 'Calcola quante unità devi vendere e quanto fatturato generare per coprire tutti i costi fissi e iniziare a guadagnare.'
          : 'Determine the exact sales volume and revenue needed to cover all fixed and variable costs.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      plainExplanation={plainExplanation}
      formula="Unità di Pareggio = Costi Fissi / (Prezzo - Costo Variabile) | Margine % = ((Prezzo - Costo Variabile) / Prezzo) × 100"
      steps={[
        `Margine di contribuzione unitario = ${formatCurrency(p, settings)} - ${formatCurrency(
          vc,
          settings
        )} = ${formatCurrency(unitMargin, settings)} per pezzo`,
        `Margine di contribuzione in % = (${formatCurrency(unitMargin, settings)} / ${formatCurrency(
          p,
          settings
        )}) × 100 = ${formatPercent(marginRatio, settings)}`,
        `Punto di pareggio (unità) = ${formatCurrency(fc, settings)} / ${formatCurrency(
          unitMargin,
          settings
        )} = ${formatNumber(breakEvenUnits ?? 0, settings)} pezzi`,
        `Fatturato di pareggio = ${formatNumber(breakEvenUnits ?? 0, settings)} × ${formatCurrency(
          p,
          settings
        )} = ${formatCurrency(breakEvenRevenue ?? 0, settings)}`
      ]}
      notes="Il margine di contribuzione misura la quota di ricavi che rimane disponibile per coprire i costi fissi dopo aver pagato i costi variabili."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CalcInput
            label={settings.language === 'it' ? 'Costi fissi totali (€)' : 'Total Fixed Costs'}
            value={fixedCosts}
            onChange={setFixedCosts}
            prefix={settings.currency.symbol}
            placeholder="es. 15000"
          />
          <CalcInput
            label={settings.language === 'it' ? 'Prezzo di vendita (€/unità)' : 'Selling Price / unit'}
            value={unitPrice}
            onChange={setUnitPrice}
            prefix={settings.currency.symbol}
            placeholder="es. 65"
          />
          <CalcInput
            label={settings.language === 'it' ? 'Costo variabile (€/unità)' : 'Variable Cost / unit'}
            value={unitVariableCost}
            onChange={setUnitVariableCost}
            prefix={settings.currency.symbol}
            placeholder="es. 25"
          />
          <CalcInput
            label={settings.language === 'it' ? 'Utile desiderato (€, opzionale)' : 'Target Profit (optional)'}
            value={targetProfit}
            onChange={setTargetProfit}
            prefix={settings.currency.symbol}
            placeholder="es. 5000"
          />
        </div>

        {/* Results Overview */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              {settings.language === 'it' ? 'Unità di Pareggio' : 'Break-Even Units'}
            </span>
            <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {breakEvenUnits !== null ? formatNumber(breakEvenUnits, settings) : '—'}{' '}
              <span className="text-sm font-normal">pezzi</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              {settings.language === 'it' ? 'Quantità minima per non perdere' : 'Minimum units required'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {settings.language === 'it' ? 'Fatturato di Pareggio' : 'Break-Even Revenue'}
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {breakEvenRevenue !== null ? formatCurrency(breakEvenRevenue, settings) : '—'}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              {settings.language === 'it' ? 'Incasso minimo a pareggio' : 'Minimum revenue required'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
              {settings.language === 'it' ? 'Margine Contribuzione' : 'Unit Margin'}
            </span>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {formatCurrency(unitMargin, settings)}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              {formatPercent(marginRatio, settings)} del prezzo
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {settings.language === 'it' ? 'Target Utile' : 'Target Profit Volume'}
            </span>
            <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {targetUnits !== null ? `${formatNumber(targetUnits, settings)} pz` : '—'}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              {targetRevenue !== null ? `Fatturato ${formatCurrency(targetRevenue, settings)}` : ''}
            </span>
          </div>
        </div>

        {/* Sensitivity / Volume Simulation Table */}
        {simulationVolumes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{settings.language === 'it' ? 'Simulazione Volumi e Utile / Perdita' : 'Volume Profit Simulation'}</span>
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Unità Vendute</th>
                    <th className="py-2.5 px-3">Fatturato</th>
                    <th className="py-2.5 px-3">Costi Variabili</th>
                    <th className="py-2.5 px-3">Costi Fissi</th>
                    <th className="py-2.5 px-3 text-right">Utile Netto / (Perdita)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
                  {simulationVolumes.map((vol) => {
                    const rev = vol * p;
                    const totVar = vol * vc;
                    const profit = rev - (totVar + fc);
                    const isBEP = vol === breakEvenUnits;

                    return (
                      <tr
                        key={vol}
                        className={
                          isBEP
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30 font-semibold'
                            : 'hover:bg-slate-50/60 dark:hover:bg-zinc-800/30'
                        }
                      >
                        <td className="py-2.5 px-3 font-sans">
                          {formatNumber(vol, settings)} pz {isBEP && <span className="text-indigo-600 font-bold ml-1">(BEP ★)</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                          {formatCurrency(rev, settings)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">
                          {formatCurrency(totVar, settings)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">
                          {formatCurrency(fc, settings)}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            profit > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : profit < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          {profit > 0 ? `+${formatCurrency(profit, settings)}` : formatCurrency(profit, settings)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="break-even"
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

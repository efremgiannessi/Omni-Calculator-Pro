import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface TradersCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  initialInputs?: Record<string, string>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
}

export const TradersCalculator: React.FC<TradersCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory
}) => {
  const [cost, setCost] = useState('40');
  const [profitType, setProfitType] = useState<'markup' | 'margin'>('markup');
  const [profitPercent, setProfitPercent] = useState('50');
  const [taxRate, setTaxRate] = useState('22');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.cost !== undefined) setCost(initialInputs.cost);
      if (initialInputs.profitPercent !== undefined) setProfitPercent(initialInputs.profitPercent);
      if (initialInputs.taxRate !== undefined) setTaxRate(initialInputs.taxRate);
      if (initialInputs.profitType) setProfitType(initialInputs.profitType as any);
    }
  }, [initialInputs]);

  const c = parseNumber(cost);
  const pPct = parseNumber(profitPercent);
  const tRate = parseNumber(taxRate) || 0;

  let netSellingPrice: number | null = null;
  let profit: number | null = null;
  let effectiveMargin: number | null = null;
  let effectiveMarkup: number | null = null;

  if (c !== null && pPct !== null) {
    if (profitType === 'markup') {
      profit = (c * pPct) / 100;
      netSellingPrice = c + profit;
      effectiveMarkup = pPct;
      effectiveMargin = netSellingPrice > 0 ? (profit / netSellingPrice) * 100 : 0;
    } else {
      if (pPct < 100) {
        netSellingPrice = c / (1 - pPct / 100);
        profit = netSellingPrice - c;
        effectiveMargin = pPct;
        effectiveMarkup = c > 0 ? (profit / c) * 100 : 0;
      }
    }
  }

  const taxAmount =
    netSellingPrice !== null ? (netSellingPrice * tRate) / 100 : null;
  const grossRetailPrice =
    netSellingPrice !== null && taxAmount !== null ? netSellingPrice + taxAmount : null;

  // Auto track history
  useAutoHistory({
    calculatorId: 'trader',
    calculatorTitle: settings.language === 'it' ? 'Calcolatore Commercianti' : 'Trader\'s Calculator',
    summary: `Costo ${formatCurrency(c, settings)} → Lordo ${formatCurrency(grossRetailPrice, settings)} (Utile: ${formatCurrency(profit, settings)})`,
    details: [
      { label: 'Costo fornitore', value: formatCurrency(c, settings) },
      { label: profitType === 'markup' ? 'Ricarico %' : 'Margine %', value: `${profitPercent}%` },
      { label: 'Prezzo al pubblico', value: formatCurrency(grossRetailPrice, settings) },
      { label: 'Guadagno netto', value: formatCurrency(profit, settings) }
    ],
    formula: 'Prezzo Pubblico = Prezzo Netto × (1 + Tassa% / 100)',
    inputs: { cost, profitType, profitPercent, taxRate },
    isValid: grossRetailPrice !== null && cost !== '' && profitPercent !== '',
    onSaveHistory
  });

  const handleClear = () => {
    setCost('');
    setProfitPercent('50');
    setTaxRate('22');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Commerciante: Costo ${formatCurrency(c, settings)} | Prezzo vendita netto ${formatCurrency(netSellingPrice, settings)} | Prezzo al pubblico (IVA ${taxRate}%): ${formatCurrency(grossRetailPrice, settings)} | Guadagno: ${formatCurrency(profit, settings)}`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    const summary = `Calcolatore Commerciante:\nCosto fornitore: ${formatCurrency(c, settings)}\n${profitType === 'markup' ? 'Ricarico' : 'Margine'}: ${profitPercent}%\nPrezzo netto di vendita: ${formatCurrency(netSellingPrice, settings)}\nPrezzo finale al cliente (+${taxRate}% IVA): ${formatCurrency(grossRetailPrice, settings)}\nGuadagno netto aziendale: ${formatCurrency(profit, settings)}`;
    if (navigator.share) {
      navigator.share({ title: 'Calcolatore Commerciante', text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      showToast(settings.language === 'it' ? 'Copiato per condividere' : 'Copied');
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'trader',
      calculatorTitle: settings.language === 'it' ? 'Calcolatore Commercianti' : 'Trader\'s Calculator',
      summary: `Costo ${formatCurrency(c, settings)} → Al pubblico ${formatCurrency(grossRetailPrice, settings)} (Utile: ${formatCurrency(profit, settings)})`,
      details: [
        { label: 'Costo fornitore', value: formatCurrency(c, settings) },
        { label: profitType === 'markup' ? 'Ricarico %' : 'Margine %', value: `${profitPercent}%` },
        { label: 'Aliquota fiscale', value: `${taxRate}%` },
        { label: 'Prezzo netto vendita', value: formatCurrency(netSellingPrice, settings) },
        { label: 'Prezzo al pubblico', value: formatCurrency(grossRetailPrice, settings) },
        { label: 'Guadagno netto', value: formatCurrency(profit, settings) }
      ],
      formula: 'Prezzo Pubblico = Prezzo Netto × (1 + Tassa% / 100)',
      inputs: { cost, profitType, profitPercent, taxRate }
    });
    showToast(settings.language === 'it' ? 'Salvato nella cronologia' : 'Saved to history');
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.cost !== undefined) setCost(inputs.cost);
    if (inputs.profitPercent !== undefined) setProfitPercent(inputs.profitPercent);
    if (inputs.taxRate !== undefined) setTaxRate(inputs.taxRate);
    if (inputs.profitType) setProfitType(inputs.profitType as any);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Calcolatore per Commercianti' : 'Trader\'s Calculator'}
      description={
        settings.language === 'it'
          ? 'Strumento professionale che combina costo, ricarico o margine, imposta IVA e prezzo al pubblico.'
          : 'Integrated professional tool coordinating purchase cost, markup/margin, tax, and retail price.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      onSaveToHistory={handleSave}
      formula="Prezzo Netto = Costo + Utile  |  Prezzo Lordo al Pubblico = Prezzo Netto + IVA"
      steps={[
        profitType === 'markup'
          ? `Utile da ricarico: ${formatCurrency(c, settings)} × ${profitPercent}% = ${formatCurrency(profit, settings)}`
          : `Utile da margine: Prezzo Netto = ${formatCurrency(c, settings)} / (1 - ${profitPercent}%)`,
        `Prezzo Netto di vendita = ${formatCurrency(netSellingPrice, settings)}`,
        `IVA al cliente (${taxRate}%) = ${formatCurrency(taxAmount, settings)}`,
        `Prezzo finale al cliente (al banco) = ${formatCurrency(grossRetailPrice, settings)}`
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcInput
            label="Costo d'acquisto / fornitore"
            value={cost}
            onChange={setCost}
            prefix={settings.currency.symbol}
            placeholder="es. 40"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-zinc-300">
                Tipo di calcolo
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setProfitType('markup')}
                  className={`font-semibold ${profitType === 'markup' ? 'text-emerald-600' : 'text-slate-400'}`}
                >
                  Ricarico
                </button>
                <span className="text-slate-300">/</span>
                <button
                  type="button"
                  onClick={() => setProfitType('margin')}
                  className={`font-semibold ${profitType === 'margin' ? 'text-emerald-600' : 'text-slate-400'}`}
                >
                  Margine
                </button>
              </div>
            </div>
            <CalcInput
              label={profitType === 'markup' ? 'Ricarico %' : 'Margine %'}
              value={profitPercent}
              onChange={setProfitPercent}
              suffix="%"
              placeholder="es. 50"
            />
          </div>

          <CalcInput
            label="Aliquota IVA / Tassa %"
            value={taxRate}
            onChange={setTaxRate}
            suffix="%"
            placeholder="es. 22"
          />
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Prezzo al Pubblico (con IVA)
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                {formatCurrency(grossRetailPrice, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Netto: {formatCurrency(netSellingPrice, settings)}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                Guadagno Netto Aziendale
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatCurrency(profit, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Margine: {formatPercent(effectiveMargin, settings)} | Ricarico: {formatPercent(effectiveMarkup, settings)}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                IVA da Versare ({taxRate}%)
              </span>
              <div className="text-xl font-bold font-mono text-slate-700 dark:text-zinc-300 mt-1">
                {formatCurrency(taxAmount, settings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Incassata dal cliente
              </div>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="trader"
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

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, FileSpreadsheet } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { WaterfallBar } from '../common/InteractiveChart';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface VatSalesTaxCalculatorProps {
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

export const VatSalesTaxCalculator: React.FC<VatSalesTaxCalculatorProps> = ({
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
  const [netPrice, setNetPrice] = useState('100');
  const [vatRate, setVatRate] = useState('22');
  const [grossPrice, setGrossPrice] = useState('122');
  const [activeInput, setActiveInput] = useState<'net' | 'gross'>('net');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.netPrice !== undefined) setNetPrice(initialInputs.netPrice);
      if (initialInputs.vatRate !== undefined) setVatRate(initialInputs.vatRate);
      if (initialInputs.grossPrice !== undefined) setGrossPrice(initialInputs.grossPrice);
      if (initialInputs.activeInput) setActiveInput(initialInputs.activeInput as any);
    }
  }, [initialInputs]);

  const rate = parseNumber(vatRate) || 0;

  let net: number | null = null;
  let gross: number | null = null;
  let vatAmount: number | null = null;

  if (activeInput === 'net') {
    net = parseNumber(netPrice);
    if (net !== null) {
      vatAmount = (net * rate) / 100;
      gross = net + vatAmount;
    }
  } else {
    gross = parseNumber(grossPrice);
    if (gross !== null) {
      net = gross / (1 + rate / 100);
      vatAmount = gross - net;
    }
  }

  // Auto track history
  useAutoHistory({
    calculatorId: 'vat',
    calculatorTitle: settings.language === 'it' ? 'IVA / Imposta di Vendita' : 'VAT / Sales Tax',
    summary: `Netto ${formatCurrency(net, settings)} + ${vatRate}% IVA = Lordo ${formatCurrency(gross, settings)}`,
    details: [
      { label: 'Prezzo netto', value: formatCurrency(net, settings) },
      { label: 'Aliquota IVA', value: `${vatRate}%` },
      { label: 'Importo IVA', value: formatCurrency(vatAmount, settings) },
      { label: 'Prezzo lordo', value: formatCurrency(gross, settings) }
    ],
    formula: 'Lordo = Netto × (1 + IVA% / 100)',
    inputs: { netPrice, vatRate, grossPrice, activeInput },
    isValid: net !== null && gross !== null && (netPrice !== '' || grossPrice !== ''),
    onSaveHistory
  });

  const handleNetChange = (val: string) => {
    setActiveInput('net');
    setNetPrice(val);
  };

  const handleGrossChange = (val: string) => {
    setActiveInput('gross');
    setGrossPrice(val);
  };

  const handleClear = () => {
    setNetPrice('');
    setGrossPrice('');
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopy = () => {
    const summary = `Netto: ${formatCurrency(net, settings)} | IVA (${vatRate}%): ${formatCurrency(vatAmount, settings)} | Lordo: ${formatCurrency(gross, settings)}`;
    navigator.clipboard.writeText(summary);
    showToast(settings.language === 'it' ? 'Copiato!' : 'Copied!');
  };

  const handleShare = () => {
    handleCopy();
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.netPrice !== undefined) setNetPrice(inputs.netPrice);
    if (inputs.vatRate !== undefined) setVatRate(inputs.vatRate);
    if (inputs.grossPrice !== undefined) setGrossPrice(inputs.grossPrice);
    if (inputs.activeInput) setActiveInput(inputs.activeInput as any);
  };

  const commonVatRates = ['4', '5', '10', '20', '21', '22'];

  const plainExplanation =
    net && gross && vatAmount
      ? `Su un imponibile netto di ${formatCurrency(net, settings)}, con un'aliquota IVA del ${vatRate}%, l'imposta da corrispondere è pari a ${formatCurrency(
          vatAmount,
          settings
        )}. Il prezzo totale finito (lordo fattura o scontrino) è di ${formatCurrency(gross, settings)}.`
      : '';

  const waterfallItems = [
    {
      label: 'Imponibile Netto',
      value: net || 0,
      color: '#0284C7',
      formatted: formatCurrency(net, settings)
    },
    {
      label: 'IVA / Tassa',
      value: vatAmount || 0,
      color: '#10B981',
      formatted: formatCurrency(vatAmount, settings)
    }
  ];

  return (
    <CalcCard
      title={settings.language === 'it' ? 'IVA / Imposta di Vendita' : 'VAT / Sales Tax'}
      description={
        settings.language === 'it'
          ? 'Calcola l\'imposta e il totale con IVA, oppure esegui lo scorporo immediato partendo dal lordo.'
          : 'Add or deduct VAT / sales tax from prices with custom rates or common standard rates.'
      }
      onClear={handleClear}
      onCopy={handleCopy}
      onShare={handleShare}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onOpenBigDisplay={
        onOpenBigDisplay && gross !== null
          ? () =>
              onOpenBigDisplay({
                mainValue: formatCurrency(gross, settings),
                mainLabel: 'Totale Lordo con IVA',
                details: [
                  { label: 'Imponibile Netto', value: formatCurrency(net, settings) },
                  { label: `IVA (${vatRate}%)`, value: formatCurrency(vatAmount, settings) },
                  { label: 'Totale Fattura', value: formatCurrency(gross, settings) }
                ]
              })
          : undefined
      }
      onOpenReceipt={
        onOpenReceipt && gross !== null
          ? () =>
              onOpenReceipt({
                title: 'DETTAGLIO IVA E IMPONIBILE',
                summary: formatCurrency(gross, settings),
                details: [
                  { label: 'Imponibile Netto', value: formatCurrency(net, settings) },
                  { label: `Aliquota IVA`, value: `${vatRate}%` },
                  { label: 'Importo IVA', value: formatCurrency(vatAmount, settings) },
                  { label: 'Totale Lordo', value: formatCurrency(gross, settings) }
                ],
                formula: 'Lordo = Netto × (1 + IVA/100)'
              })
          : undefined
      }
      plainExplanation={plainExplanation}
      chartComponent={
        gross && gross > 0 ? <WaterfallBar items={waterfallItems} /> : undefined
      }
      formula="Aggiungi IVA: Lordo = Netto × (1 + IVA/100)  |  Scorporo IVA: Netto = Lordo / (1 + IVA/100)"
      steps={[
        activeInput === 'net'
          ? `Calcolo IVA = ${formatCurrency(net, settings)} × ${vatRate}% = ${formatCurrency(vatAmount, settings)}`
          : `Scorporo: Imponibile = ${formatCurrency(gross, settings)} / (1 + ${vatRate}/100) = ${formatCurrency(net, settings)}`,
        `Prezzo Netto (Imponibile) = ${formatCurrency(net, settings)}`,
        `Imposta IVA dovuta = ${formatCurrency(vatAmount, settings)}`,
        `Prezzo Lordo complessivo = ${formatCurrency(gross, settings)}`
      ]}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            label="Prezzo Netto (Imponibile)"
            value={activeInput === 'net' ? netPrice : net !== null ? net.toFixed(settings.decimalPrecision) : ''}
            onChange={handleNetChange}
            prefix={settings.currency.symbol}
            placeholder="es. 100"
            helperText="Modifica per calcolare il lordo"
          />

          <CalcInput
            label="Prezzo Lordo (Totale con IVA)"
            value={activeInput === 'gross' ? grossPrice : gross !== null ? gross.toFixed(settings.decimalPrecision) : ''}
            onChange={handleGrossChange}
            prefix={settings.currency.symbol}
            placeholder="es. 122"
            helperText="Modifica per scorporare l'IVA"
          />
        </div>

        <div>
          <CalcInput
            label="Aliquota IVA / Imposta %"
            value={vatRate}
            onChange={setVatRate}
            suffix="%"
            placeholder="es. 22"
          />

          {/* Quick VAT rates */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Aliquote:</span>
            {commonVatRates.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setVatRate(r)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                  vatRate === r
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* Results Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                Prezzo Netto
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {formatCurrency(net, settings)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Importo IVA ({vatRate}%)
              </span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(vatAmount, settings)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Prezzo Lordo
              </span>
              <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(gross, settings)}
              </div>
            </div>
          </div>
        </div>

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="vat"
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

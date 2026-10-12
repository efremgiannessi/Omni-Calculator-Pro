import React, { useState, useEffect } from 'react';
import { Grid, ListOrdered, Download, Copy, Plus, Trash2, ArrowRight } from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { parseNumber, formatCurrency, formatPercent, formatNumber } from '../../utils/format';
import { CalcCard } from '../common/CalcCard';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface BatchCalculatorProps {
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

export const BatchCalculator: React.FC<BatchCalculatorProps> = ({
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
  const [mode, setMode] = useState<'matrix' | 'list'>('matrix');

  // Matrix State
  const [baseAmount, setBaseAmount] = useState('200');
  const [customRates, setCustomRates] = useState<number[]>([1, 2, 5, 10, 15, 20, 22, 25, 30, 33.33, 40, 50, 75, 100]);
  const [newRateInput, setNewRateInput] = useState('');

  // Bulk List State
  const [listInput, setListInput] = useState('100, 250, 49.99, 1200, 85, 450');
  const [listOperation, setListOperation] = useState<'discount' | 'markup' | 'calcPercent'>('discount');
  const [listRate, setListRate] = useState('20');

  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.mode === 'matrix' || initialInputs.mode === 'list') {
        setMode(initialInputs.mode);
      }
      if (initialInputs.baseAmount !== undefined) setBaseAmount(initialInputs.baseAmount);
      if (initialInputs.listInput !== undefined) setListInput(initialInputs.listInput);
      if (initialInputs.listOperation) setListOperation(initialInputs.listOperation as any);
      if (initialInputs.listRate !== undefined) setListRate(initialInputs.listRate);
    }
  }, [initialInputs]);

  // Matrix Calculations
  const baseVal = parseNumber(baseAmount) ?? 0;
  const matrixRows = customRates.map((rate) => {
    const amount = (baseVal * rate) / 100;
    return {
      rate,
      amount,
      increased: baseVal + amount,
      discounted: Math.max(0, baseVal - amount)
    };
  });

  // Bulk List Calculations
  const rateVal = parseNumber(listRate) ?? 0;
  const parsedItems = listInput
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseNumber(s))
    .filter((n): n is number => n !== null);

  const bulkResults = parsedItems.map((val, idx) => {
    const delta = (val * rateVal) / 100;
    let finalVal = val;
    if (listOperation === 'discount') finalVal = val - delta;
    else if (listOperation === 'markup') finalVal = val + delta;
    else finalVal = delta;

    return {
      id: idx + 1,
      original: val,
      delta,
      final: finalVal
    };
  });

  const bulkOriginalSum = bulkResults.reduce((acc, r) => acc + r.original, 0);
  const bulkFinalSum = bulkResults.reduce((acc, r) => acc + r.final, 0);
  const bulkDeltaSum = bulkResults.reduce((acc, r) => acc + r.delta, 0);

  // Auto track history
  useAutoHistory({
    calculatorId: 'batch-percentage',
    calculatorTitle:
      mode === 'matrix'
        ? (settings.language === 'it' ? 'Matrice Percentuali Rapide' : 'Percentage Matrix')
        : (settings.language === 'it' ? 'Calcolo Batch su Lista Numeri' : 'Bulk Batch Percentage'),
    summary:
      mode === 'matrix'
        ? `Matrice per ${formatCurrency(baseVal, settings)} su ${customRates.length} percentuali`
        : `Batch ${listOperation} al ${formatPercent(rateVal, settings)} su ${bulkResults.length} elementi. Totale: ${formatCurrency(
            bulkFinalSum,
            settings
          )}`,
    details:
      mode === 'matrix'
        ? [
            { label: 'Importo base', value: formatCurrency(baseVal, settings) },
            { label: 'Percentuali calcolate', value: `${customRates.length} tassi` }
          ]
        : [
            { label: 'Numero elementi', value: `${bulkResults.length}` },
            { label: 'Operazione', value: listOperation },
            { label: 'Aliquota applicata', value: `${listRate}%` },
            { label: 'Totale originale', value: formatCurrency(bulkOriginalSum, settings) },
            { label: 'Totale finale calcolato', value: formatCurrency(bulkFinalSum, settings) }
          ],
    formula:
      mode === 'matrix'
        ? 'Valore % = (Base × Tasso) / 100'
        : 'Applicazione batch su ogni elemento della lista',
    inputs: {
      mode,
      baseAmount,
      listInput,
      listOperation,
      listRate
    },
    isValid: mode === 'matrix' ? baseVal > 0 : bulkResults.length > 0 && rateVal > 0,
    onSaveHistory
  });

  const handleClear = () => {
    if (mode === 'matrix') {
      setBaseAmount('');
    } else {
      setListInput('');
      setListRate('');
    }
    showToast(settings.language === 'it' ? 'Campi azzerati' : 'Fields cleared');
  };

  const handleCopyMatrixCsv = () => {
    const headers = ['Percentuale', 'Valore %', 'Con Aumento (+%)', 'Con Sconto (-%)'];
    const rows = matrixRows.map((r) => [
      `"${r.rate}%"`,
      `"${formatCurrency(r.amount, settings)}"`,
      `"${formatCurrency(r.increased, settings)}"`,
      `"${formatCurrency(r.discounted, settings)}"`
    ]);
    const csv = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(csv);
    showToast(settings.language === 'it' ? 'Tabella copiata (incollabile in Excel/Sheets)!' : 'Table copied!');
  };

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (mode === 'matrix') {
      headers = ['Percentuale', 'Importo %', 'Valore Aumentato (+)', 'Valore Scontato (-)'];
      rows = matrixRows.map((r) => [
        `"${r.rate}%"`,
        `"${r.amount}"`,
        `"${r.increased}"`,
        `"${r.discounted}"`
      ]);
    } else {
      headers = ['Item #', 'Valore Originale', 'Differenza %', 'Valore Finale'];
      rows = bulkResults.map((r) => [
        `"${r.id}"`,
        `"${r.original}"`,
        `"${r.delta}"`,
        `"${r.final}"`
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calcolo_${mode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(settings.language === 'it' ? 'File CSV esportato!' : 'CSV exported!');
  };

  const handleAddCustomRate = () => {
    const val = parseFloat(newRateInput);
    if (!isNaN(val) && val > 0 && !customRates.includes(val)) {
      setCustomRates([...customRates, val].sort((a, b) => a - b));
      setNewRateInput('');
      showToast(`Aggiunto ${val}%`);
    }
  };

  const handleRestoreInputs = (inputs: Record<string, string>) => {
    if (inputs.mode) setMode(inputs.mode as any);
    if (inputs.baseAmount !== undefined) setBaseAmount(inputs.baseAmount);
    if (inputs.listInput !== undefined) setListInput(inputs.listInput);
    if (inputs.listOperation) setListOperation(inputs.listOperation as any);
    if (inputs.listRate !== undefined) setListRate(inputs.listRate);
  };

  const plainExplanation =
    mode === 'matrix'
      ? `Questa matrice istantanea ti mostra in un solo colpo d'occhio tutte le percentuali più frequenti calcolate su ${formatCurrency(
          baseVal,
          settings
        )}, con il relativo importo al netto o al lordo (+/-), ideale per listini prezzi e fatturazione.`
      : `Hai applicato l'operazione "${listOperation}" con aliquota del ${listRate}% su ${bulkResults.length} valori inseriti. Il totale originale di ${formatCurrency(
          bulkOriginalSum,
          settings
        )} diventa ${formatCurrency(bulkFinalSum, settings)}.`;

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Calcolo Percentuale Multiplo & Batch' : 'Batch Percentage Calculator'}
      description={
        settings.language === 'it'
          ? 'Genera una matrice completa di percentuali su un importo base, o applica sconti/aumenti in blocco a un\'intera lista di numeri.'
          : 'Generate full percentage reference matrices or apply bulk changes across number lists.'
      }
      onClear={handleClear}
      onCopy={handleCopyMatrixCsv}
      onShare={handleCopyMatrixCsv}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      plainExplanation={plainExplanation}
      formula="Valore % = (Importo × Tasso) / 100"
      steps={[
        mode === 'matrix'
          ? `Generazione matrice di ${customRates.length} percentuali per l'importo base ${formatCurrency(baseVal, settings)}`
          : `Calcolo batch su ${bulkResults.length} elementi con tasso ${listRate}%`
      ]}
      notes="Puoi copiare la tabella direttamente in Excel o Google Sheets con un semplice clic."
    >
      <div className="space-y-6">
        {/* Mode Selector */}
        <div className="flex p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setMode('matrix')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'matrix'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{settings.language === 'it' ? 'Matrice Tabellare' : 'Matrix Reference'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('list')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'list'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>{settings.language === 'it' ? 'Batch su Lista Numeri' : 'Bulk List Calculator'}</span>
          </button>
        </div>

        {mode === 'matrix' ? (
          /* MATRIX VIEW */
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-end gap-3 max-w-xl">
              <div className="flex-1 w-full">
                <CalcInput
                  label={settings.language === 'it' ? 'Importo base di riferimento' : 'Base Amount'}
                  value={baseAmount}
                  onChange={setBaseAmount}
                  prefix={settings.currency.symbol}
                  placeholder="es. 200"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-28">
                  <CalcInput
                    label={settings.language === 'it' ? '+ % personalizzata' : '+ Custom %'}
                    value={newRateInput}
                    onChange={setNewRateInput}
                    suffix="%"
                    placeholder="es. 22"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomRate}
                  className="mb-1 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shrink-0"
                  title="Aggiungi percentuale alla matrice"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {settings.language === 'it'
                  ? `Mostrate ${matrixRows.length} aliquote percentuali per ${formatCurrency(baseVal, settings)}`
                  : `Showing ${matrixRows.length} rates for ${formatCurrency(baseVal, settings)}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMatrixCsv}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{settings.language === 'it' ? 'Copia per Excel' : 'Copy for Excel'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Percentuale (%)</th>
                    <th className="py-2.5 px-3">Importo Percentuale</th>
                    <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">Con Aumento (+%)</th>
                    <th className="py-2.5 px-3 text-amber-600 dark:text-amber-400">Con Sconto (-%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
                  {matrixRows.map((r) => (
                    <tr key={r.rate} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-zinc-100">
                        {r.rate}%
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-zinc-300">
                        {formatCurrency(r.amount, settings)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(r.increased, settings)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(r.discounted, settings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* BULK LIST VIEW */
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                  {settings.language === 'it'
                    ? 'Incolla la lista di numeri (separati da virgola o a capo)'
                    : 'Paste number list (comma or newline separated)'}
                </label>
                <textarea
                  rows={4}
                  value={listInput}
                  onFocus={(e) => e.currentTarget.select()}
                  onClick={(e) => e.currentTarget.select()}
                  onChange={(e) => setListInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="100, 250, 49.99, 1200..."
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-1">
                    {settings.language === 'it' ? 'Operazione Batch' : 'Batch Action'}
                  </label>
                  <select
                    value={listOperation}
                    onChange={(e) => setListOperation(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  >
                    <option value="discount">Applica Sconto (- %)</option>
                    <option value="markup">Applica Aumento (+ %)</option>
                    <option value="calcPercent">Calcola Quota (es. IVA %)</option>
                  </select>
                </div>

                <CalcInput
                  label={settings.language === 'it' ? 'Aliquota % da applicare' : 'Rate % to apply'}
                  value={listRate}
                  onChange={setListRate}
                  suffix="%"
                  placeholder="es. 20"
                />
              </div>
            </div>

            {/* Bulk Summary Cards */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800">
                <span className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Elementi processati
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                  {bulkResults.length} valori
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800">
                <span className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Somma originale
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                  {formatCurrency(bulkOriginalSum, settings)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-semibold">
                  Nuovo Totale Calcolato
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(bulkFinalSum, settings)}
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Valore Iniziale</th>
                    <th className="py-2.5 px-3">Quota % ({listRate}%)</th>
                    <th className="py-2.5 px-3 text-right">Valore Finale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
                  {bulkResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30">
                      <td className="py-2 px-3 text-slate-400">{r.id}</td>
                      <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">
                        {formatCurrency(r.original, settings)}
                      </td>
                      <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(r.delta, settings)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-zinc-100">
                        {formatCurrency(r.final, settings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="batch-percentage"
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

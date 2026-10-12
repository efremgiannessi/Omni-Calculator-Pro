import React from 'react';
import { X, Printer, Copy, Check, Receipt } from 'lucide-react';
import { AppSettings } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  details: { label: string; value: string }[];
  formula: string;
  settings: AppSettings;
  showToast: (text: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  title,
  summary,
  details,
  formula,
  settings,
  showToast
}) => {
  if (!isOpen) return null;

  const dateStr = new Date().toLocaleString(settings.language === 'it' ? 'it-IT' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textReceipt = `====================================
PERCENTAGE CALCULATOR - RICEVUTA
Data: ${dateStr}
Sezione: ${title}
------------------------------------
${details.map((d) => `${d.label.padEnd(20, ' ')} : ${d.value}`).join('\n')}
------------------------------------
TOTALE / RISULTATO: ${summary}
Formula: ${formula}
====================================`;
    navigator.clipboard.writeText(textReceipt);
    showToast(settings.language === 'it' ? 'Scontrino copiato negli appunti!' : 'Receipt text copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {settings.language === 'it' ? 'Scontrino Digitale' : 'Digital Receipt'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-zinc-950/60 flex justify-center">
          <div className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 p-6 rounded-xl shadow-xs font-mono text-xs space-y-4 print:shadow-none print:border-none print:p-0">
            {/* Header branding */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-zinc-700 space-y-1">
              <div className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                PERCENTAGE CALCULATOR
              </div>
              <div className="text-[11px] text-slate-500">{title}</div>
              <div className="text-[10px] text-slate-400">{dateStr}</div>
            </div>

            {/* Line items */}
            <div className="space-y-2 py-1">
              {details.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-500 truncate mr-2">{d.label}</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100 shrink-0">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Highlight */}
            <div className="pt-3 border-t-2 border-slate-900 dark:border-zinc-100 space-y-1">
              <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                <span>RIASSUNTO:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{summary}</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-dashed border-slate-200 dark:border-zinc-800">
                Formula: {formula}
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-2 text-[10px] text-slate-400 italic">
              *** Grazie per il calcolo ***
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3.5 py-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{settings.language === 'it' ? 'Copia Testo' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{settings.language === 'it' ? 'Stampa / Salva PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

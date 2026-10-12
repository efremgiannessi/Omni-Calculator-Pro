import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface FormulaStepsProps {
  formula: string;
  steps: string[];
  notes?: string;
  labels?: {
    show?: string;
    hide?: string;
  };
}

export const FormulaSteps: React.FC<FormulaStepsProps> = ({
  formula,
  steps,
  notes,
  labels = { show: 'Passaggi e Formula', hide: 'Nascondi passaggi' }
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50/70 dark:bg-zinc-900/50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2.5 px-3.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isOpen ? labels.hide : labels.show}</span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-3.5 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-3 text-xs text-slate-600 dark:text-zinc-400">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1">
              Formula applicata
            </div>
            <div className="font-mono bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-emerald-400 font-medium overflow-x-auto text-xs">
              {formula}
            </div>
          </div>

          {steps.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1.5">
                Passaggi di calcolo
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 font-mono text-slate-700 dark:text-zinc-300">
                {steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {notes && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 italic pt-1 border-t border-slate-200/60 dark:border-zinc-800/60">
              {notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

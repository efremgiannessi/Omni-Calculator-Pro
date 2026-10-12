import React, { useState } from 'react';
import { MessageSquareText, ChevronDown, ChevronUp } from 'lucide-react';

interface PlainExplanationProps {
  text: string;
}

export const PlainExplanation: React.FC<PlainExplanationProps> = ({ text }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!text) return null;

  return (
    <div className="mt-3.5 border border-emerald-500/30 rounded-xl overflow-hidden bg-emerald-50/40 dark:bg-emerald-950/20 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 px-3.5 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>In Parole Povere (Spiegazione Semplice)</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
        )}
      </button>

      {isOpen && (
        <div className="p-3 pt-1 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed font-normal">
          {text}
        </div>
      )}
    </div>
  );
};

import React, { useRef } from 'react';
import { X } from 'lucide-react';

interface CalcInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  readOnly?: boolean;
  highlight?: boolean;
  helperText?: string;
  onFocus?: () => void;
  showSlider?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const CalcInput: React.FC<CalcInputProps> = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0',
  readOnly = false,
  highlight = false,
  helperText,
  onFocus,
  showSlider = false,
  min = 0,
  max = 100,
  step = 1
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const numericVal = parseFloat(value.replace(',', '.')) || 0;

  const handleSelectAll = (target?: HTMLInputElement | null) => {
    const el = target || inputRef.current;
    if (!el || readOnly) return;
    try {
      el.select();
      el.setSelectionRange(0, el.value.length);
    } catch {
      el.select();
    }
    // Run after tick so browser mouseup doesn't collapse cursor selection
    setTimeout(() => {
      if (document.activeElement === el) {
        try {
          el.select();
          el.setSelectionRange(0, el.value.length);
        } catch {
          el.select();
        }
      }
    }, 15);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-zinc-300">
          {label}
        </label>
        {helperText && (
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {helperText}
          </span>
        )}
      </div>

      <div
        onClick={() => {
          if (!readOnly && inputRef.current) {
            inputRef.current.focus();
            handleSelectAll(inputRef.current);
          }
        }}
        className={`relative flex items-center rounded-xl border transition-all duration-150 cursor-text ${
          highlight
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/50 shadow-xs'
            : 'bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
        } ${readOnly ? 'opacity-90 cursor-default' : 'focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:focus-within:ring-emerald-500/30'}`}
      >
        {prefix && (
          <span className="pl-3.5 pr-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 select-none">
            {prefix}
          </span>
        )}

        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          readOnly={readOnly}
          onFocus={(e) => {
            handleSelectAll(e.currentTarget);
            if (onFocus) onFocus();
          }}
          onMouseUp={(e) => {
            handleSelectAll(e.currentTarget);
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAll(e.currentTarget);
          }}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-2.5 px-3 text-base font-semibold tracking-tight bg-transparent outline-none text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 font-mono`}
        />

        {value && !readOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              inputRef.current?.focus();
            }}
            tabIndex={-1}
            className="p-1 mr-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Svuota campo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {suffix && (
          <span className="pr-3.5 pl-1 text-xs font-semibold text-slate-500 dark:text-zinc-400 select-none">
            {suffix}
          </span>
        )}
      </div>

      {/* Optional Interactive Range Slider */}
      {showSlider && !readOnly && (
        <div className="flex items-center gap-2 px-1 pt-0.5">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={Math.min(max, Math.max(min, numericVal))}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-[10px] font-mono text-slate-400 shrink-0 w-8 text-right">
            {numericVal}%
          </span>
        </div>
      )}
    </div>
  );
};

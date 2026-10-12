import React from 'react';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
  formattedValue?: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  centerLabel?: string;
  centerValue?: string;
  title?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  slices,
  centerLabel,
  centerValue,
  title
}) => {
  const total = slices.reduce((acc, s) => acc + (s.value > 0 ? s.value : 0), 0);
  if (total === 0) return null;

  let cumulativeAngle = 0;
  const radius = 60;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-center gap-4">
      {/* SVG Circle */}
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
          {slices.map((slice, i) => {
            const pct = slice.value / total;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle * circumference;
            cumulativeAngle += pct;

            return (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            {centerLabel && (
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
                {centerLabel}
              </span>
            )}
            {centerValue && (
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
                {centerValue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 text-xs w-full">
        {title && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {title}
          </span>
        )}
        {slices.map((slice, idx) => {
          const pct = ((slice.value / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-slate-700 dark:text-zinc-300 truncate font-medium">
                  {slice.label}
                </span>
              </div>
              <div className="font-mono text-slate-900 dark:text-zinc-100 font-bold shrink-0">
                {slice.formattedValue || `${pct}%`}
                <span className="text-[11px] text-slate-400 font-normal ml-1">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface WaterfallBarProps {
  items: { label: string; value: number; color: string; formatted: string }[];
}

export const WaterfallBar: React.FC<WaterfallBarProps> = ({ items }) => {
  const total = items.reduce((acc, it) => acc + (it.value > 0 ? it.value : 0), 0);
  if (total === 0) return null;

  return (
    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400">
        <span>Ripartizione percentuale visiva</span>
        <span className="font-mono text-[11px]">100%</span>
      </div>

      {/* Progress Bar Segments */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-zinc-800">
        {items.map((it, idx) => {
          const widthPct = (it.value / total) * 100;
          if (widthPct <= 0) return null;
          return (
            <div
              key={idx}
              style={{ width: `${widthPct}%`, backgroundColor: it.color }}
              title={`${it.label}: ${widthPct.toFixed(1)}%`}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
            />
          );
        })}
      </div>

      {/* Legend below */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px]">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: it.color }} />
            <span className="text-slate-600 dark:text-zinc-400">{it.label}:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-zinc-200">{it.formatted}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

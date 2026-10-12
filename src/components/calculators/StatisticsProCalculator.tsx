import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  BarChart2,
  Activity,
  Layers,
  Sparkles,
  Info,
  TrendingUp,
  Download,
  BookOpen,
  Star
} from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface StatisticsProCalculatorProps {
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

// Error function approximation (erf) for Gaussian CDF
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// Standard normal cumulative distribution function Φ(z)
function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

export const StatisticsProCalculator: React.FC<StatisticsProCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite = false,
  onToggleFavorite
}) => {
  // Raw data input
  const [rawData, setRawData] = useState<string>(
    initialInputs?.rawData || '12, 15, 18, 19, 22, 24, 25, 28, 29, 31, 35, 42'
  );

  // Normal distribution controls
  const [normMean, setNormMean] = useState<string>('24.2');
  const [normStd, setNormStd] = useState<string>('8.6');
  const [normX, setNormX] = useState<string>('30');
  const [normA, setNormA] = useState<string>('15');
  const [normB, setNormB] = useState<string>('32');

  const DATA_PRESETS = [
    { label: 'Voti Scolastici', data: '18, 22, 24, 25, 26, 27, 28, 28, 30, 30' },
    { label: 'Misurazioni Laboratorio', data: '9.81, 9.79, 9.82, 9.80, 9.85, 9.78, 9.83' },
    { label: 'Rendimenti % Mensili', data: '2.4, -1.2, 3.8, 0.5, 4.2, -2.1, 1.9, 5.0, 0.8' },
    { label: 'Distribuzione Gaussiana Simulata', data: '10, 14, 17, 19, 20, 20, 21, 23, 26, 30' }
  ];

  // Parse numbers
  const numbers = useMemo(() => {
    return rawData
      .split(/[\s,;\n\t]+/)
      .map((s) => parseFloat(s.replace(',', '.')))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
  }, [rawData]);

  // Descriptive Statistics Calculation
  const stats = useMemo(() => {
    const n = numbers.length;
    if (n === 0) return null;

    const sum = numbers.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;

    const freq: Record<number, number> = {};
    let maxFreq = 0;
    numbers.forEach((val) => {
      freq[val] = (freq[val] || 0) + 1;
      if (freq[val] > maxFreq) maxFreq = freq[val];
    });

    const variancePop = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdPop = Math.sqrt(variancePop);

    const varianceSample = n > 1 ? numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1) : 0;
    const stdSample = Math.sqrt(varianceSample);

    const sem = stdSample / Math.sqrt(n);

    const min = numbers[0];
    const max = numbers[n - 1];
    const range = max - min;

    const q1 = numbers[Math.floor(n * 0.25)];
    const q3 = numbers[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    return {
      n,
      sum,
      mean,
      median,
      variancePop,
      stdPop,
      varianceSample,
      stdSample,
      sem,
      min,
      max,
      range,
      q1,
      q3,
      iqr
    };
  }, [numbers]);

  const syncWithData = () => {
    if (stats) {
      setNormMean(stats.mean.toFixed(2));
      setNormStd((stats.stdSample || stats.stdPop || 1).toFixed(2));
      showToast('Parametri della gaussiana sincronizzati con i dati!');
    }
  };

  const normResult = useMemo(() => {
    const mu = parseFloat(normMean.replace(',', '.')) || 0;
    const sigma = Math.max(0.0001, parseFloat(normStd.replace(',', '.')) || 1);
    const x = parseFloat(normX.replace(',', '.')) || 0;
    const a = parseFloat(normA.replace(',', '.')) || 0;
    const b = parseFloat(normB.replace(',', '.')) || 0;

    const z = (x - mu) / sigma;
    const pLessX = normalCdf(z);
    const pGreaterX = 1 - pLessX;

    const za = (a - mu) / sigma;
    const zb = (b - mu) / sigma;
    const pBetween = Math.max(0, normalCdf(zb) - normalCdf(za));

    return {
      mu,
      sigma,
      x,
      z,
      pLessX,
      pGreaterX,
      pBetween,
      za,
      zb
    };
  }, [normMean, normStd, normX, normA, normB]);

  const handleSaveToHistory = () => {
    if (!stats) return;
    onSaveHistory({
      calculatorId: 'statistics',
      calculatorTitle: 'Statistica & Distribuzioni Pro',
      summary: `N = ${stats.n} | Media = ${stats.mean.toFixed(2)} | Dev.Std = ${stats.stdSample.toFixed(2)} | Mediana = ${stats.median}`,
      details: [
        { label: 'Campione N', value: `${stats.n}` },
        { label: 'Media μ', value: stats.mean.toFixed(2) },
        { label: 'Mediana', value: `${stats.median}` },
        { label: 'Dev.Std campionaria', value: stats.stdSample.toFixed(2) },
        { label: 'Intervallo [Min, Max]', value: `[${stats.min}, ${stats.max}]` }
      ],
      formula: 'μ = Σx / N,  s = √(Σ(x-μ)² / (N-1))',
      inputs: { rawData }
    });
    showToast('Statistiche salvate nella cronologia!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                Statistica & Probabilità
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-950/30 text-emerald-100 font-mono">
                Box-Plot · Curva Normale Gauss · Z-Score
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-200" />
              Statistica Descrittiva & Distribuzione Gaussiana
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              Media, mediana, deviazione standard, errore standard, quartili, diagramma box-plot e calcolo dell\'area sottesa alla curva a campana.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-2 rounded-xl backdrop-blur-xs transition-all ${
                  isFavorite ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title="Aggiungi ai preferiti"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              Salva Cronologia
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Dataset Esempio:</span>
          {DATA_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setRawData(p.data);
                showToast(`Caricato dataset: ${p.label}`);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
            Dati del Campione (inserisci numeri separati da virgola, spazio o a capo):
          </label>
          <textarea
            rows={3}
            value={rawData}
            onFocus={(e) => {
              e.currentTarget.select();
              setTimeout(() => e.currentTarget.select(), 15);
            }}
            onClick={(e) => {
              e.currentTarget.select();
              setTimeout(() => e.currentTarget.select(), 15);
            }}
            onChange={(e) => setRawData(e.target.value)}
            className="w-full p-3 text-sm font-mono rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="es. 12, 14, 15, 18, 22..."
          />
        </div>

        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Conteggio (N)</div>
                <div className="text-xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-1">
                  {stats.n}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Media Aritmetica (μ)</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {stats.mean.toFixed(2)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Mediana</div>
                <div className="text-xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-1">
                  {stats.median}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Deviazione Std (s)</div>
                <div className="text-xl font-black text-amber-500 font-mono mt-1">
                  {stats.stdSample.toFixed(2)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Varianza (s²)</div>
                <div className="text-base font-bold text-slate-800 dark:text-zinc-200 font-mono mt-1">
                  {stats.varianceSample.toFixed(2)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Errore Std (SEM)</div>
                <div className="text-base font-bold text-slate-800 dark:text-zinc-200 font-mono mt-1">
                  ± {stats.sem.toFixed(2)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Minimo / Massimo</div>
                <div className="text-base font-bold text-slate-800 dark:text-zinc-200 font-mono mt-1">
                  {stats.min} ... {stats.max}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Range Interquartile (IQR)</div>
                <div className="text-base font-bold text-slate-800 dark:text-zinc-200 font-mono mt-1">
                  {stats.iqr.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span>Diagramma Box-Plot (Q1, Mediana, Q3):</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Q1 = {stats.q1} | Med = {stats.median} | Q3 = {stats.q3}
                </span>
              </div>

              <div className="py-2">
                <svg className="w-full h-16 overflow-visible" viewBox="0 0 400 60">
                  {(() => {
                    const span = stats.max - stats.min || 1;
                    const scale = (val: number) => 30 + ((val - stats.min) / span) * 340;
                    const q1X = scale(stats.q1);
                    const q3X = scale(stats.q3);
                    const medX = scale(stats.median);
                    const minX = scale(stats.min);
                    const maxX = scale(stats.max);

                    return (
                      <g>
                        <line x1={minX} y1={30} x2={q1X} y2={30} stroke="#94a3b8" strokeWidth={2} />
                        <line x1={q3X} y1={30} x2={maxX} y2={30} stroke="#94a3b8" strokeWidth={2} />
                        <line x1={minX} y1={20} x2={minX} y2={40} stroke="#94a3b8" strokeWidth={2} />
                        <line x1={maxX} y1={20} x2={maxX} y2={40} stroke="#94a3b8" strokeWidth={2} />

                        <rect
                          x={q1X}
                          y={15}
                          width={Math.max(2, q3X - q1X)}
                          height={30}
                          fill="#10b981"
                          fillOpacity={0.25}
                          stroke="#10b981"
                          strokeWidth={2}
                          rx={3}
                        />

                        <line x1={medX} y1={12} x2={medX} y2={48} stroke="#059669" strokeWidth={3} />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* GAUSSIAN NORMAL DISTRIBUTION */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-zinc-700/80 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Calcolatore Distribuzione Normale Gaussiana N(μ, σ²)
              </span>
            </div>
            <button
              type="button"
              onClick={syncWithData}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Usa media e dev.std del campione
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CalcInput label="Media (μ)" value={normMean} onChange={setNormMean} />
            <CalcInput label="Deviazione Std (σ)" value={normStd} onChange={setNormStd} />
            <CalcInput label="Valore Soglia x" value={normX} onChange={setNormX} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Punti intervallo [a, b]</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={normA}
                  onFocus={(e) => e.currentTarget.select()}
                  onClick={(e) => e.currentTarget.select()}
                  onChange={(e) => setNormA(e.target.value)}
                  className="w-1/2 p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  placeholder="a"
                />
                <input
                  type="text"
                  value={normB}
                  onFocus={(e) => e.currentTarget.select()}
                  onClick={(e) => e.currentTarget.select()}
                  onChange={(e) => setNormB(e.target.value)}
                  className="w-1/2 p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  placeholder="b"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-center">
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700">
              <div className="text-[11px] font-sans font-bold text-slate-400">Punteggio Z-Score</div>
              <div className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">
                Z = {normResult.z.toFixed(3)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700">
              <div className="text-[11px] font-sans font-bold text-slate-400">P(X ≤ {normX})</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {(normResult.pLessX * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700">
              <div className="text-[11px] font-sans font-bold text-slate-400">P({normA} ≤ X ≤ {normB})</div>
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {(normResult.pBetween * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="pt-2">
            <svg className="w-full h-28 overflow-visible" viewBox="0 0 400 100">
              {(() => {
                const mu = normResult.mu;
                const sigma = normResult.sigma;
                const xMin = mu - 3.5 * sigma;
                const xMax = mu + 3.5 * sigma;

                const toPx = (v: number) => ((v - xMin) / (xMax - xMin)) * 400;
                const gauss = (v: number) => {
                  const num = Math.exp(-0.5 * Math.pow((v - mu) / sigma, 2));
                  return 90 - num * 75;
                };

                const pts: string[] = [];
                for (let i = 0; i <= 400; i += 2) {
                  const val = xMin + (i / 400) * (xMax - xMin);
                  pts.push(`${i},${gauss(val).toFixed(1)}`);
                }

                const aX = Math.max(0, Math.min(400, toPx(parseFloat(normA) || mu - sigma)));
                const bX = Math.max(0, Math.min(400, toPx(parseFloat(normB) || mu + sigma)));

                return (
                  <g>
                    <rect
                      x={Math.min(aX, bX)}
                      y={10}
                      width={Math.abs(bX - aX)}
                      height={80}
                      fill="#10b981"
                      fillOpacity={0.2}
                    />
                    <line x1={0} y1={90} x2={400} y2={90} stroke="#94a3b8" strokeWidth={1} />
                    <polyline fill="none" stroke="#10b981" strokeWidth={2.5} points={pts.join(' ')} />
                    <line x1={toPx(mu)} y1={15} x2={toPx(mu)} y2={90} stroke="#059669" strokeWidth={1.5} strokeDasharray="3 3" />
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>

      <SectionHistoryTape
        calculatorId="statistics"
        history={history}
        onRestore={(inputs) => {
          if (inputs.rawData) setRawData(inputs.rawData);
        }}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        settings={settings}
        showToast={showToast}
      />
    </div>
  );
};

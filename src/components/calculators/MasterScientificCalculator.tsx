import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Share2,
  Bookmark,
  Delete,
  Sparkles,
  Layers,
  Activity,
  Binary,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
  TrendingUp,
  Cpu,
  ChevronRight,
  Info,
  BookOpen,
  Calculator as CalcIcon,
  Star
} from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import {
  AngleUnit,
  PHYSICAL_CONSTANTS,
  evaluateMathExpression,
  calculateDerivative,
  calculateDefiniteIntegral,
  calculateSummation,
  calculateProduct,
  toFractionString
} from '../../utils/scientificEngine';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface MasterScientificCalculatorProps {
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

type CalculatorTab = 'keypad' | 'grapher' | 'programmer' | 'calculus' | 'constants';
type NumberFormatMode = 'norm' | 'sci' | 'eng' | 'frac';

export const MasterScientificCalculator: React.FC<MasterScientificCalculatorProps> = ({
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
  // Calculator State
  const [activeTab, setActiveTab] = useState<CalculatorTab>('keypad');
  const [expression, setExpression] = useState<string>(
    initialInputs?.expression || 'sin(pi / 4)^2 + cos(pi / 4)^2'
  );
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('RAD');
  const [isSecond, setIsSecond] = useState<boolean>(false);
  const [isHyp, setIsHyp] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState<boolean>(false);
  const [lastAnswer, setLastAnswer] = useState<number>(1);
  const [formatMode, setFormatMode] = useState<NumberFormatMode>('norm');
  const [copied, setCopied] = useState<boolean>(false);

  // Variables registers
  const [vars] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, X: 0, Y: 0 });

  // Tape history of scientific evaluations
  const [sessionTape, setSessionTape] = useState<Array<{ expr: string; res: number; time: string }>>([
    { expr: 'sqrt(144) + 5!', res: 132, time: '12:00' }
  ]);

  // Audio click generator for tactile feedback
  const playClick = () => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (_) {}
  };

  // Evaluate Expression live
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setResult(null);
      setError(null);
      return;
    }
    try {
      const evaluated = evaluateMathExpression(expression, angleUnit, {
        Ans: lastAnswer,
        ...vars
      });
      if (isNaN(evaluated)) {
        setResult(null);
        setError('Sintassi non valida');
      } else {
        setResult(evaluated);
        setError(null);
      }
    } catch (e: any) {
      setResult(null);
      setError(e.message || 'Errore');
    }
  }, [expression, angleUnit, lastAnswer, vars]);

  // Append token to expression
  const appendToken = (token: string) => {
    playClick();
    setExpression((prev) => {
      if (prev === '0' && /^[0-9]$/.test(token)) {
        return token;
      }
      return prev + token;
    });
  };

  const handleClear = () => {
    playClick();
    setExpression('');
    setResult(null);
    setError(null);
  };

  const handleBackspace = () => {
    playClick();
    setExpression((prev) => prev.slice(0, -1));
  };

  // Format result display
  const formatFormattedNumber = (val: number | null): string => {
    if (val === null || isNaN(val)) return '—';
    if (!isFinite(val)) return val > 0 ? '∞' : '-∞';

    if (formatMode === 'frac') {
      const frac = toFractionString(val);
      if (frac) return frac;
    }

    if (formatMode === 'sci') {
      return val.toExponential(settings.decimalPrecision || 4);
    }

    if (formatMode === 'eng') {
      const exp = Math.floor(Math.log10(Math.abs(val || 1)) / 3) * 3;
      const mantissa = val / Math.pow(10, exp);
      return `${mantissa.toFixed(settings.decimalPrecision || 2)} × 10^${exp}`;
    }

    if (Number.isInteger(val)) {
      return val.toLocaleString('it-IT');
    }

    const precision = settings.decimalPrecision !== undefined ? settings.decimalPrecision : 4;
    return val.toLocaleString('it-IT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.max(2, precision)
    });
  };

  const handleCalculateCommit = () => {
    playClick();
    if (result !== null && !isNaN(result)) {
      setLastAnswer(result);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSessionTape((prev) => [{ expr: expression, res: result, time: timeStr }, ...prev.slice(0, 19)]);

      onSaveHistory({
        calculatorId: 'scientific',
        calculatorTitle: 'Calcolatrice Scientifica Pro',
        summary: `${expression} = ${formatFormattedNumber(result)}`,
        details: [
          { label: 'Espressione', value: expression },
          { label: 'Risultato', value: formatFormattedNumber(result) },
          { label: 'Unità Angolare', value: angleUnit }
        ],
        formula: expression,
        inputs: { expression }
      });
      showToast('Calcolo scientifico completato e salvato!');
    }
  };

  // Memory functions
  const handleMemoryAdd = () => {
    if (result !== null && !isNaN(result)) {
      setMemory((prev) => prev + result);
      setHasMemory(true);
      showToast(`Aggiunto a Memoria: ${result} (M = ${memory + result})`);
    }
  };

  const handleMemorySub = () => {
    if (result !== null && !isNaN(result)) {
      setMemory((prev) => prev - result);
      setHasMemory(true);
      showToast(`Sottratto da Memoria: ${result}`);
    }
  };

  const handleMemoryRecall = () => {
    appendToken(`${memory}`);
  };

  const handleMemoryClear = () => {
    setMemory(0);
    setHasMemory(false);
    showToast('Memoria azzerata (MC)');
  };

  const handleCopyResult = () => {
    if (result === null) return;
    const text = formatFormattedNumber(result);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Risultato copiato negli appunti!');
  };

  // -------------------------------------------------------------
  // 2D FUNCTION GRAPHER
  // -------------------------------------------------------------
  const [graphFn, setGraphFn] = useState<string>('sin(x) * cos(x/2)');
  const [xRange, setXRange] = useState<{ min: number; max: number }>({ min: -10, max: 10 });
  const [yRange, setYRange] = useState<{ min: number; max: number }>({ min: -3, max: 3 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; slope: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const GRAPH_PRESETS = [
    { label: 'Onda Sinusoidale', expr: 'sin(x)' },
    { label: 'Campana di Gauss', expr: 'exp(-x^2 / 2)' },
    { label: 'Parabola Cubica', expr: 'x^3 - 3*x' },
    { label: 'Smorzamento Armonico', expr: 'exp(-x/5) * cos(3*x)' },
    { label: 'Iperbole / Razionale', expr: '1 / (1 + x^2)' },
    { label: 'Sigmoide Logistica', expr: '1 / (1 + exp(-x))' },
    { label: 'Sinc (sin x / x)', expr: 'sin(x) / x' }
  ];

  useEffect(() => {
    if (activeTab !== 'grapher') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#18181b' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    const toCanvasX = (x: number) => ((x - xRange.min) / (xRange.max - xRange.min)) * width;
    const toCanvasY = (y: number) => height - ((y - yRange.min) / (yRange.max - yRange.min)) * height;
    const toMathX = (cx: number) => xRange.min + (cx / width) * (xRange.max - xRange.min);

    ctx.lineWidth = 1;
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#27272a' : '#e2e8f0';

    const xStep = Math.max(1, Math.round((xRange.max - xRange.min) / 10));
    for (let x = Math.floor(xRange.min); x <= xRange.max; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(x.toString(), cx + 2, toCanvasY(0) + 12);
    }

    const yStep = Math.max(0.5, Math.round((yRange.max - yRange.min) / 8));
    for (let y = Math.floor(yRange.min); y <= yRange.max; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      if (y !== 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(y.toString(), toCanvasX(0) + 4, cy - 2);
      }
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#52525b' : '#94a3b8';

    const originY = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    const originX = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#10b981';

    let firstPoint = true;
    for (let i = 0; i < width; i++) {
      const mx = toMathX(i);
      const my = evaluateMathExpression(graphFn, angleUnit, { x: mx });

      if (isNaN(my) || !isFinite(my)) {
        firstPoint = true;
        continue;
      }

      const cy = toCanvasY(my);
      if (firstPoint) {
        ctx.moveTo(i, cy);
        firstPoint = false;
      } else {
        ctx.lineTo(i, cy);
      }
    }
    ctx.stroke();

    if (hoverCoord) {
      const hcx = toCanvasX(hoverCoord.x);
      const hcy = toCanvasY(hoverCoord.y);

      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(hcx, hcy, 5, 0, Math.PI * 2);
      ctx.fill();

      const tangentLength = 40;
      const angle = Math.atan(hoverCoord.slope);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hcx - Math.cos(angle) * tangentLength, hcy + Math.sin(angle) * tangentLength);
      ctx.lineTo(hcx + Math.cos(angle) * tangentLength, hcy - Math.sin(angle) * tangentLength);
      ctx.stroke();
    }
  }, [activeTab, graphFn, xRange, yRange, angleUnit, hoverCoord]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const toMathX = (cxVal: number) => xRange.min + (cxVal / canvas.width) * (xRange.max - xRange.min);

    const mx = toMathX(cx);
    const my = evaluateMathExpression(graphFn, angleUnit, { x: mx });
    if (!isNaN(my) && isFinite(my)) {
      const slope = calculateDerivative(graphFn, mx, angleUnit);
      setHoverCoord({ x: mx, y: my, slope: isNaN(slope) ? 0 : slope });
    } else {
      setHoverCoord(null);
    }
  };

  const handleZoom = (factor: number) => {
    setXRange((prev) => ({ min: prev.min * factor, max: prev.max * factor }));
    setYRange((prev) => ({ min: prev.min * factor, max: prev.max * factor }));
  };

  const handleResetZoom = () => {
    setXRange({ min: -10, max: 10 });
    setYRange({ min: -3, max: 3 });
  };

  // -------------------------------------------------------------
  // PROGRAMMER MODE
  // -------------------------------------------------------------
  const [programmerValue, setProgrammerValue] = useState<number>(42);
  const [wordSize, setWordSize] = useState<'QWORD' | 'DWORD' | 'WORD' | 'BYTE'>('DWORD');

  const bitMask = useMemo(() => {
    if (wordSize === 'BYTE') return 0xff;
    if (wordSize === 'WORD') return 0xffff;
    return 0xffffffff;
  }, [wordSize]);

  const progDec = (programmerValue >>> 0) & bitMask;
  const progHex = progDec.toString(16).toUpperCase();
  const progOct = progDec.toString(8);
  const progBin = progDec.toString(2).padStart(wordSize === 'BYTE' ? 8 : wordSize === 'WORD' ? 16 : 32, '0');

  const toggleBit = (bitIndex: number) => {
    const mask = 1 << bitIndex;
    const newVal = programmerValue ^ mask;
    setProgrammerValue(newVal);
  };

  // -------------------------------------------------------------
  // CALCULUS STUDIO
  // -------------------------------------------------------------
  const [calcFn, setCalcFn] = useState<string>('x^2 * sin(x)');
  const [derivX0, setDerivX0] = useState<string>('2');
  const [integralA, setIntegralA] = useState<string>('0');
  const [integralB, setIntegralB] = useState<string>('pi');
  const [sumStart, setSumStart] = useState<string>('1');
  const [sumEnd, setSumEnd] = useState<string>('10');
  const [calcStudioResult, setCalcStudioResult] = useState<string | null>(null);

  const runDerivativeCalc = () => {
    const x0 = parseFloat(derivX0) || 0;
    const slope = calculateDerivative(calcFn, x0, angleUnit);
    setCalcStudioResult(`d/dx [${calcFn}] a x = ${x0} ➔ ${slope.toFixed(6)}`);
    showToast('Derivata numerica calcolata!');
  };

  const runIntegralCalc = () => {
    const a = evaluateMathExpression(integralA, angleUnit);
    const b = evaluateMathExpression(integralB, angleUnit);
    const { value, intervals } = calculateDefiniteIntegral(calcFn, a, b, angleUnit);
    setCalcStudioResult(`∫[${integralA}, ${integralB}] (${calcFn}) dx ➔ ${value.toFixed(6)} (${intervals} intervalli Simpson)`);
    showToast('Integrale numerico calcolato!');
  };

  const runSummationCalc = () => {
    const s = parseInt(sumStart, 10) || 1;
    const e = parseInt(sumEnd, 10) || 10;
    const sum = calculateSummation(calcFn, s, e, angleUnit);
    setCalcStudioResult(`∑_{k=${s}}^{${e}} (${calcFn}) ➔ ${sum}`);
    showToast('Sommatoria serie calcolata!');
  };

  // -------------------------------------------------------------
  // CONSTANTS FILTER
  // -------------------------------------------------------------
  const [constSearch, setConstSearch] = useState<string>('');
  const filteredConstants = useMemo(() => {
    if (!constSearch) return PHYSICAL_CONSTANTS;
    const q = constSearch.toLowerCase();
    return PHYSICAL_CONSTANTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [constSearch]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <CalcIcon className="w-3.5 h-3.5" />
                Migliore al Mondo · Pro
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-950/30 text-emerald-100 font-mono">
                5 Modalità · Grafici 2D · HEX/BIN · NIST
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <CalcIcon className="w-6 h-6 text-emerald-200" />
              Calcolatrice Scientifica & Grafica Pro
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              Tutte le funzioni matematiche, trigonometriche, iperboliche, grafici 2D interattivi, programmatore bit-a-bit e analisi infinitesimale.
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
              onClick={handleCalculateCommit}
              className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5 shadow-xs"
              title="Salva calcolo"
            >
              <BookOpen className="w-4 h-4" />
              Salva Cronologia
            </button>
          </div>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
        {/* Studio Mode Selector Pills Toolbar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl mb-4 border border-slate-200/80 dark:border-zinc-700/60 overflow-x-auto no-scrollbar shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('keypad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'keypad'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Scientifica Pro
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grapher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'grapher'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Grafico 2D Interattivo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('programmer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'programmer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            Programmatore (HEX/BIN)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calculus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculus'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Analisi (∫ dx & d/dx)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('constants')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'constants'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Costanti Fisiche NIST ({PHYSICAL_CONSTANTS.length})
          </button>
        </div>

        {/* MASTER DUAL-LINE DISPLAY */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-inner border border-slate-800 mb-5 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-400 mb-3 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next: AngleUnit = angleUnit === 'RAD' ? 'DEG' : angleUnit === 'DEG' ? 'GRAD' : 'RAD';
                  setAngleUnit(next);
                  playClick();
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer font-bold"
                title="Cambia unità angolare"
              >
                [{angleUnit}]
              </button>
              {isSecond && <span className="text-amber-400 font-bold bg-amber-950/40 px-1.5 py-0.5 rounded">[2nd]</span>}
              {isHyp && <span className="text-indigo-400 font-bold bg-indigo-950/40 px-1.5 py-0.5 rounded">[HYP]</span>}
              {hasMemory && <span className="text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded">[M={memory}]</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex bg-slate-800 rounded-lg p-0.5">
                {(['norm', 'sci', 'eng', 'frac'] as NumberFormatMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setFormatMode(mode);
                      playClick();
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                      formatMode === mode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyResult}
                disabled={result === null}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Copia risultato"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="relative mb-2">
            <input
              type="text"
              value={expression}
              onFocus={(e) => {
                e.currentTarget.select();
                setTimeout(() => e.currentTarget.select(), 15);
              }}
              onClick={(e) => {
                e.currentTarget.select();
                setTimeout(() => e.currentTarget.select(), 15);
              }}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Digita formula (es. sin(pi/4), sqrt(144), 5! + log10(100))..."
              className="w-full bg-transparent text-slate-300 text-base sm:text-lg font-medium outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-xs font-semibold text-slate-500">
              {error ? <span className="text-rose-400 font-sans">{error}</span> : <span>=</span>}
            </div>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-emerald-400 select-all overflow-x-auto text-right max-w-full">
              {formatFormattedNumber(result)}
            </div>
          </div>
        </div>

        {/* TAB 1: KEYPAD */}
        {activeTab === 'keypad' && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSecond(!isSecond);
                  playClick();
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  isSecond
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200'
                }`}
              >
                2nd
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsHyp(!isHyp);
                  playClick();
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  isHyp
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200'
                }`}
              >
                hyp
              </button>
              <button
                type="button"
                onClick={() => appendToken(isHyp ? (isSecond ? 'asinh(' : 'sinh(') : isSecond ? 'asin(' : 'sin(')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition-colors"
              >
                {isHyp ? (isSecond ? 'asinh' : 'sinh') : isSecond ? 'sin⁻¹' : 'sin'}
              </button>
              <button
                type="button"
                onClick={() => appendToken(isHyp ? (isSecond ? 'acosh(' : 'cosh(') : isSecond ? 'acos(' : 'cos(')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition-colors"
              >
                {isHyp ? (isSecond ? 'acosh' : 'cosh') : isSecond ? 'cos⁻¹' : 'cos'}
              </button>
              <button
                type="button"
                onClick={() => appendToken(isHyp ? (isSecond ? 'atanh(' : 'tanh(') : isSecond ? 'atan(' : 'tan(')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition-colors"
              >
                {isHyp ? (isSecond ? 'atanh' : 'tanh') : isSecond ? 'tan⁻¹' : 'tan'}
              </button>
              <button
                type="button"
                onClick={() => appendToken('pi')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-serif"
              >
                π
              </button>
              <button
                type="button"
                onClick={() => appendToken('e')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-serif"
              >
                e
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => appendToken(isSecond ? 'exp(' : 'ln(')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold"
              >
                {isSecond ? 'eˣ' : 'ln'}
              </button>
              <button
                type="button"
                onClick={() => appendToken(isSecond ? '10^(' : 'log10(')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold"
              >
                {isSecond ? '10ˣ' : 'log₁₀'}
              </button>
              <button
                type="button"
                onClick={() => appendToken(isSecond ? 'cbrt(' : 'sqrt(')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold"
              >
                {isSecond ? '³√x' : '√x'}
              </button>
              <button
                type="button"
                onClick={() => appendToken('^2')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold"
              >
                x²
              </button>
              <button
                type="button"
                onClick={() => appendToken('^')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold"
              >
                xʸ
              </button>
              <button
                type="button"
                onClick={() => appendToken('1/(')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold"
              >
                1/x
              </button>
              <button
                type="button"
                onClick={() => appendToken('!')}
                className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-amber-600 dark:text-amber-400"
              >
                n!
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleMemoryClear}
                className="py-1.5 px-2 rounded-xl bg-slate-200/80 dark:bg-zinc-800/80 text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:bg-rose-100 dark:hover:bg-rose-950/30 hover:text-rose-600"
              >
                MC
              </button>
              <button
                type="button"
                onClick={handleMemoryRecall}
                className="py-1.5 px-2 rounded-xl bg-slate-200/80 dark:bg-zinc-800/80 text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 hover:text-emerald-600"
              >
                MR
              </button>
              <button
                type="button"
                onClick={handleMemoryAdd}
                className="py-1.5 px-2 rounded-xl bg-slate-200/80 dark:bg-zinc-800/80 text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 hover:text-emerald-600"
              >
                M+
              </button>
              <button
                type="button"
                onClick={handleMemorySub}
                className="py-1.5 px-2 rounded-xl bg-slate-200/80 dark:bg-zinc-800/80 text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 hover:text-emerald-600"
              >
                M-
              </button>
              <button
                type="button"
                onClick={() => appendToken(isSecond ? 'nCr(' : 'nPr(')}
                className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
              >
                {isSecond ? 'nCr' : 'nPr'}
              </button>
              <button
                type="button"
                onClick={() => appendToken(isSecond ? 'lcm(' : 'gcd(')}
                className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
              >
                {isSecond ? 'LCM' : 'GCD'}
              </button>
              <button
                type="button"
                onClick={() => appendToken('mod(')}
                className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
              >
                MOD
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleClear}
                className="py-3 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-base transition-colors"
              >
                AC
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 font-bold text-base transition-colors"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={() => appendToken('%')}
                className="py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 font-bold text-base transition-colors"
              >
                %
              </button>
              <button
                type="button"
                onClick={() => appendToken(' / ')}
                className="py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold text-xl transition-colors"
              >
                ÷
              </button>

              <button
                type="button"
                onClick={() => appendToken('7')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                7
              </button>
              <button
                type="button"
                onClick={() => appendToken('8')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                8
              </button>
              <button
                type="button"
                onClick={() => appendToken('9')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                9
              </button>
              <button
                type="button"
                onClick={() => appendToken(' * ')}
                className="py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold text-xl transition-colors"
              >
                ×
              </button>

              <button
                type="button"
                onClick={() => appendToken('4')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                4
              </button>
              <button
                type="button"
                onClick={() => appendToken('5')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => appendToken('6')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                6
              </button>
              <button
                type="button"
                onClick={() => appendToken(' - ')}
                className="py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold text-xl transition-colors"
              >
                −
              </button>

              <button
                type="button"
                onClick={() => appendToken('1')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => appendToken('2')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => appendToken('3')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => appendToken(' + ')}
                className="py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold text-xl transition-colors"
              >
                +
              </button>

              <button
                type="button"
                onClick={() => appendToken('0')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => appendToken('.')}
                className="py-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-extrabold text-xl shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => appendToken('Ans')}
                className="py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-bold text-sm"
                title="Ultimo risultato"
              >
                Ans
              </button>
              <button
                type="button"
                onClick={handleCalculateCommit}
                className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-2xl shadow-md transition-all active:scale-98"
              >
                =
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GRAPHER */}
        {activeTab === 'grapher' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Curve Preset:</span>
              {GRAPH_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setGraphFn(p.expr);
                    playClick();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300 font-mono">f(x) =</span>
                <input
                  type="text"
                  value={graphFn}
                  onFocus={(e) => e.currentTarget.select()}
                  onClick={(e) => e.currentTarget.select()}
                  onChange={(e) => setGraphFn(e.target.value)}
                  placeholder="es. sin(x), x^2 - 4, exp(-x^2)"
                  className="w-full sm:max-w-md px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleZoom(0.8)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(1.25)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                  title="Ripristina Vista"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm bg-slate-50 dark:bg-zinc-900">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => setHoverCoord(null)}
                className="w-full h-[320px] sm:h-[400px] cursor-crosshair block"
              />

              {hoverCoord && (
                <div className="absolute top-3 right-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 dark:border-zinc-700 shadow-md font-mono text-xs space-y-1 pointer-events-none">
                  <div className="text-slate-500 font-sans font-semibold text-[10px] uppercase tracking-wider">
                    Ispezione Cursore
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">x:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-100">{hoverCoord.x.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">f(x):</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{hoverCoord.y.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-400">Pendenza f'(x):</span>
                    <span className="font-bold text-amber-500">{hoverCoord.slope.toFixed(4)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Passa il mouse sul grafico per ispezionare le coordinate esatte (x, y) e la pendenza della retta tangente locale.
            </div>
          </div>
        )}

        {/* TAB 3: PROGRAMMER */}
        {activeTab === 'programmer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">Dimensione Parola:</span>
              <div className="flex bg-slate-100 dark:bg-zinc-800 rounded-xl p-0.5">
                {(['QWORD', 'DWORD', 'WORD', 'BYTE'] as const).map((ws) => (
                  <button
                    key={ws}
                    type="button"
                    onClick={() => setWordSize(ws)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      wordSize === ws ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {ws}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">HEX (Base 16)</span>
                <span className="text-base font-extrabold text-amber-500 select-all tracking-wider">
                  0x{progHex}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">DEC (Base 10)</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 select-all">
                  {progDec}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">OCT (Base 8)</span>
                <span className="text-base font-extrabold text-indigo-500 select-all">
                  0o{progOct}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">BIN (Base 2)</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 select-all tracking-wider">
                  {progBin.match(/.{1,4}/g)?.join(' ') || progBin}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Bitboard Interattivo (Fai clic su un bit per invertire 0/1):
                </span>
                <button
                  type="button"
                  onClick={() => setProgrammerValue(0)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600"
                >
                  Azzera Bit
                </button>
              </div>

              <div className="grid grid-cols-8 gap-1.5 text-center font-mono">
                {Array.from({ length: 32 }, (_, i) => 31 - i).map((bit) => {
                  const isSet = ((programmerValue >>> bit) & 1) === 1;
                  return (
                    <button
                      key={bit}
                      type="button"
                      onClick={() => toggleBit(bit)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        isSet
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <div className="text-[9px] text-slate-400 font-normal">{bit}</div>
                      <div>{isSet ? '1' : '0'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => setProgrammerValue((prev) => prev << 1)}
                className="py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold hover:bg-slate-200"
              >
                LSH (&lt;&lt;)
              </button>
              <button
                type="button"
                onClick={() => setProgrammerValue((prev) => prev >>> 1)}
                className="py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold hover:bg-slate-200"
              >
                RSH (&gt;&gt;)
              </button>
              <button
                type="button"
                onClick={() => setProgrammerValue((prev) => ~prev)}
                className="py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold hover:bg-slate-200"
              >
                NOT (~)
              </button>
              <button
                type="button"
                onClick={() => setProgrammerValue((prev) => prev ^ 0xffffffff)}
                className="py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold hover:bg-slate-200"
              >
                XOR (^)
              </button>
              <button
                type="button"
                onClick={() => setProgrammerValue((prev) => prev + 1)}
                className="py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold hover:bg-slate-200"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setProgrammerValue((prev) => prev - 1)}
                className="py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold hover:bg-slate-200"
              >
                -1
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: CALCULUS */}
        {activeTab === 'calculus' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Funzione Matematico-Analitica f(x):
                </label>
                <input
                  type="text"
                  value={calcFn}
                  onFocus={(e) => e.currentTarget.select()}
                  onClick={(e) => e.currentTarget.select()}
                  onChange={(e) => setCalcFn(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  placeholder="es. x^2 * sin(x)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Derivata d/dx nel punto x₀
                  </div>
                  <input
                    type="text"
                    value={derivX0}
                    onFocus={(e) => e.currentTarget.select()}
                    onClick={(e) => e.currentTarget.select()}
                    onChange={(e) => setDerivX0(e.target.value)}
                    placeholder="Punto x₀ (es. 2)"
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={runDerivativeCalc}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Calcola f'(x₀)
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className="font-serif text-sm">∫</span>
                    Integrale Definito ∫ₐᵇ f(x) dx
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={integralA}
                      onFocus={(e) => e.currentTarget.select()}
                      onClick={(e) => e.currentTarget.select()}
                      onChange={(e) => setIntegralA(e.target.value)}
                      placeholder="Da a"
                      className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                    <input
                      type="text"
                      value={integralB}
                      onFocus={(e) => e.currentTarget.select()}
                      onClick={(e) => e.currentTarget.select()}
                      onChange={(e) => setIntegralB(e.target.value)}
                      placeholder="A b"
                      className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={runIntegralCalc}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Calcola Integrale (Simpson)
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className="font-serif text-sm">∑</span>
                    Sommatoria Discreta ∑ₖ f(k)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={sumStart}
                      onFocus={(e) => e.currentTarget.select()}
                      onClick={(e) => e.currentTarget.select()}
                      onChange={(e) => setSumStart(e.target.value)}
                      placeholder="Da k"
                      className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                    <input
                      type="text"
                      value={sumEnd}
                      onFocus={(e) => e.currentTarget.select()}
                      onClick={(e) => e.currentTarget.select()}
                      onChange={(e) => setSumEnd(e.target.value)}
                      placeholder="A n"
                      className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={runSummationCalc}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Calcola Serie
                  </button>
                </div>
              </div>

              {calcStudioResult && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 font-mono text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {calcStudioResult}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CONSTANTS */}
        {activeTab === 'constants' && (
          <div className="space-y-4">
            <input
              type="text"
              value={constSearch}
              onFocus={(e) => e.currentTarget.select()}
              onClick={(e) => e.currentTarget.select()}
              onChange={(e) => setConstSearch(e.target.value)}
              placeholder="Cerca costante fisica (es. luce, gravitazione, planck, avogadro, terra)..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredConstants.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    appendToken(`${c.value}`);
                    showToast(`Inserita costante ${c.name} (${c.symbol})`);
                  }}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
                        {c.name}
                      </span>
                      <span className="font-serif font-black text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        {c.symbol}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mb-2">
                      {c.description}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-800/80 text-[11px] font-mono">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">
                      {c.value.toExponential(4)}
                    </span>
                    <span className="text-slate-400 font-sans text-[10px]">{c.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tape History */}
        {sessionTape.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 flex items-center justify-between">
              <span>Nastro Calcoli Recenti ({sessionTape.length})</span>
              <button
                type="button"
                onClick={() => setSessionTape([])}
                className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold"
              >
                Svuota Nastro
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sessionTape.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setExpression(item.expr)}
                  className="shrink-0 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500 transition-all cursor-pointer font-mono text-xs space-y-1"
                  title="Fai clic per ricaricare nell'editor"
                >
                  <div className="text-slate-500 dark:text-zinc-400 max-w-[160px] truncate">{item.expr}</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">= {formatFormattedNumber(item.res)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Persistent History Tape */}
      <SectionHistoryTape
        calculatorId="scientific"
        history={history}
        onRestore={(inputs) => {
          if (inputs.expression) {
            setExpression(inputs.expression);
          }
        }}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        settings={settings}
        showToast={showToast}
      />
    </div>
  );
};

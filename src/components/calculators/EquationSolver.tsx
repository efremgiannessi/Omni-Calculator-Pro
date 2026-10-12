import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Info,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  Spline,
  BookOpen,
  Star
} from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface EquationSolverProps {
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

type SolverType = 'quadratic' | 'cubic' | 'system2x2' | 'system3x3';

export const EquationSolver: React.FC<EquationSolverProps> = ({
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
  const [solverType, setSolverType] = useState<SolverType>('quadratic');

  // Quadratic parameters: ax² + bx + c = 0
  const [quadA, setQuadA] = useState<string>(initialInputs?.quadA || '1');
  const [quadB, setQuadB] = useState<string>(initialInputs?.quadB || '-5');
  const [quadC, setQuadC] = useState<string>(initialInputs?.quadC || '6');

  // Cubic parameters: ax³ + bx² + cx + d = 0
  const [cubicA, setCubicA] = useState<string>('1');
  const [cubicB, setCubicB] = useState<string>('-6');
  const [cubicC, setCubicC] = useState<string>('11');
  const [cubicD, setCubicD] = useState<string>('-6');

  // Linear 2x2:
  const [s2_a1, setS2_a1] = useState<string>('2');
  const [s2_b1, setS2_b1] = useState<string>('3');
  const [s2_c1, setS2_c1] = useState<string>('8');
  const [s2_a2, setS2_a2] = useState<string>('1');
  const [s2_b2, setS2_b2] = useState<string>('-1');
  const [s2_c2, setS2_c2] = useState<string>('-1');

  // Linear 3x3:
  const [s3_a1, setS3_a1] = useState<string>('1');
  const [s3_b1, setS3_b1] = useState<string>('1');
  const [s3_c1, setS3_c1] = useState<string>('1');
  const [s3_d1, setS3_d1] = useState<string>('6');

  const [s3_a2, setS3_a2] = useState<string>('0');
  const [s3_b2, setS3_b2] = useState<string>('2');
  const [s3_c2, setS3_c2] = useState<string>('5');
  const [s3_d2, setS3_d2] = useState<string>('-4');

  const [s3_a3, setS3_a3] = useState<string>('2');
  const [s3_b3, setS3_b3] = useState<string>('5');
  const [s3_c3, setS3_c3] = useState<string>('-1');
  const [s3_d3, setS3_d3] = useState<string>('27');

  // Quadratic Resolution
  const quadraticResult = useMemo(() => {
    const a = parseFloat(quadA.replace(',', '.')) || 0;
    const b = parseFloat(quadB.replace(',', '.')) || 0;
    const c = parseFloat(quadC.replace(',', '.')) || 0;

    if (a === 0) {
      if (b === 0) {
        return {
          valid: false,
          delta: 0,
          error: c === 0 ? 'Identità indeterminata (0 = 0)' : 'Equazione impossibile',
          desc: 'Impossibile o Indeterminata'
        };
      }
      const x = -c / b;
      return {
        valid: true,
        type: 'linear' as const,
        delta: 0,
        x1: x,
        x2: null,
        vertex: null,
        desc: `Equazione di 1° grado: x = ${x.toFixed(4)}`
      };
    }

    const delta = b * b - 4 * a * c;
    const vx = -b / (2 * a);
    const vy = -delta / (4 * a);

    if (delta > 0) {
      const sqrtD = Math.sqrt(delta);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      return {
        valid: true,
        type: 'real_two' as const,
        x1,
        x2,
        delta,
        vertex: { x: vx, y: vy },
        desc: `Due radici reali distinte: x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`
      };
    } else if (delta === 0) {
      const x = -b / (2 * a);
      return {
        valid: true,
        type: 'real_one' as const,
        x1: x,
        x2: x,
        delta: 0,
        vertex: { x: vx, y: vy },
        desc: `Radice reale doppia: x₁ = x₂ = ${x.toFixed(4)}`
      };
    } else {
      const real = -b / (2 * a);
      const imag = Math.sqrt(-delta) / (2 * a);
      return {
        valid: true,
        type: 'complex' as const,
        realPart: real,
        imagPart: imag,
        delta,
        vertex: { x: vx, y: vy },
        desc: `Radici complesse coniugate: x = ${real.toFixed(4)} ± ${Math.abs(imag).toFixed(4)}i`
      };
    }
  }, [quadA, quadB, quadC]);

  // Cubic Resolution (Cardano)
  const cubicResult = useMemo(() => {
    const a = parseFloat(cubicA.replace(',', '.')) || 0;
    const b = parseFloat(cubicB.replace(',', '.')) || 0;
    const c = parseFloat(cubicC.replace(',', '.')) || 0;
    const d = parseFloat(cubicD.replace(',', '.')) || 0;

    if (a === 0) {
      return { valid: false, roots: [] as string[], error: 'a non può essere 0' };
    }

    const p = (3 * a * c - b * b) / (3 * a * a);
    const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
    const delta = (q * q) / 4 + (p * p * p) / 27;

    const shift = -b / (3 * a);
    const roots: string[] = [];

    if (delta > 0) {
      const u = Math.cbrt(-q / 2 + Math.sqrt(delta));
      const v = Math.cbrt(-q / 2 - Math.sqrt(delta));
      const x1 = u + v + shift;
      const real = -(u + v) / 2 + shift;
      const imag = (Math.sqrt(3) / 2) * (u - v);

      roots.push(`x₁ = ${x1.toFixed(4)}`);
      roots.push(`x₂,₃ = ${real.toFixed(4)} ± ${Math.abs(imag).toFixed(4)}i`);
    } else if (delta === 0) {
      const u = Math.cbrt(-q / 2);
      const x1 = 2 * u + shift;
      const x2 = -u + shift;
      roots.push(`x₁ = ${x1.toFixed(4)}`);
      roots.push(`x₂,₃ = ${x2.toFixed(4)} (doppia)`);
    } else {
      const r = Math.sqrt(-Math.pow(p, 3) / 27);
      const phi = Math.acos(-q / (2 * r));
      const m = 2 * Math.cbrt(r);
      const x1 = m * Math.cos(phi / 3) + shift;
      const x2 = m * Math.cos((phi + 2 * Math.PI) / 3) + shift;
      const x3 = m * Math.cos((phi + 4 * Math.PI) / 3) + shift;
      roots.push(`x₁ = ${x1.toFixed(4)}`);
      roots.push(`x₂ = ${x2.toFixed(4)}`);
      roots.push(`x₃ = ${x3.toFixed(4)}`);
    }

    return { valid: true, roots, desc: roots.join(' | ') };
  }, [cubicA, cubicB, cubicC, cubicD]);

  // Linear System 2x2
  const system2Result = useMemo(() => {
    const a1 = parseFloat(s2_a1) || 0, b1 = parseFloat(s2_b1) || 0, c1 = parseFloat(s2_c1) || 0;
    const a2 = parseFloat(s2_a2) || 0, b2 = parseFloat(s2_b2) || 0, c2 = parseFloat(s2_c2) || 0;

    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;

    if (Math.abs(D) < 1e-12) {
      if (Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12) {
        return { valid: true, status: 'indeterminato', desc: 'Sistema Indeterminato (Infinite soluzioni)' };
      }
      return { valid: true, status: 'impossibile', desc: 'Sistema Impossibile (Nessuna soluzione)' };
    }

    const x = Dx / D;
    const y = Dy / D;

    return {
      valid: true,
      status: 'determinato',
      D,
      Dx,
      Dy,
      x,
      y,
      desc: `Soluzione unica: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}`
    };
  }, [s2_a1, s2_b1, s2_c1, s2_a2, s2_b2, s2_c2]);

  // Linear System 3x3
  const system3Result = useMemo(() => {
    const a1 = parseFloat(s3_a1) || 0, b1 = parseFloat(s3_b1) || 0, c1 = parseFloat(s3_c1) || 0, d1 = parseFloat(s3_d1) || 0;
    const a2 = parseFloat(s3_a2) || 0, b2 = parseFloat(s3_b2) || 0, c2 = parseFloat(s3_c2) || 0, d2 = parseFloat(s3_d2) || 0;
    const a3 = parseFloat(s3_a3) || 0, b3 = parseFloat(s3_b3) || 0, c3 = parseFloat(s3_c3) || 0, d3 = parseFloat(s3_d3) || 0;

    const det3 = (
      m11: number, m12: number, m13: number,
      m21: number, m22: number, m23: number,
      m31: number, m32: number, m33: number
    ) => m11 * (m22 * m33 - m23 * m32) - m12 * (m21 * m33 - m23 * m31) + m13 * (m21 * m32 - m22 * m31);

    const D = det3(a1, b1, c1, a2, b2, c2, a3, b3, c3);
    const Dx = det3(d1, b1, c1, d2, b2, c2, d3, b3, c3);
    const Dy = det3(a1, d1, c1, a2, d2, c2, a3, d3, c3);
    const Dz = det3(a1, b1, d1, a2, b2, d2, a3, b3, d3);

    if (Math.abs(D) < 1e-12) {
      if (Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12 && Math.abs(Dz) < 1e-12) {
        return { valid: true, status: 'indeterminato', desc: 'Sistema Indeterminato (Infinite soluzioni)' };
      }
      return { valid: true, status: 'impossibile', desc: 'Sistema Impossibile (Nessuna soluzione)' };
    }

    const x = Dx / D;
    const y = Dy / D;
    const z = Dz / D;

    return {
      valid: true,
      status: 'determinato',
      D,
      Dx,
      Dy,
      Dz,
      x,
      y,
      z,
      desc: `Soluzione unica: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}, z = ${z.toFixed(4)}`
    };
  }, [s3_a1, s3_b1, s3_c1, s3_d1, s3_a2, s3_b2, s3_c2, s3_d2, s3_a3, s3_b3, s3_c3, s3_d3]);

  // Save current solution to history
  const handleSaveCurrent = () => {
    let summary = '';
    let details: { label: string; value: string }[] = [];
    let formula = '';
    let inputs: Record<string, string> = {};

    if (solverType === 'quadratic') {
      formula = `${quadA}x² + ${quadB}x + ${quadC} = 0`;
      summary = `Equazione 2° Grado: ${formula} ➔ ${quadraticResult.desc}`;
      details = [
        { label: 'Formula', value: formula },
        { label: 'Discriminante Δ', value: `${quadraticResult.delta.toFixed(2)}` },
        { label: 'Soluzioni', value: quadraticResult.desc }
      ];
      inputs = { quadA, quadB, quadC };
    } else if (solverType === 'cubic') {
      formula = `${cubicA}x³ + ${cubicB}x² + ${cubicC}x + ${cubicD} = 0`;
      summary = `Equazione 3° Grado ➔ ${cubicResult.desc || ''}`;
      details = [{ label: 'Formula', value: formula }, { label: 'Radici', value: cubicResult.desc || '' }];
      inputs = { cubicA, cubicB, cubicC, cubicD };
    } else if (solverType === 'system2x2') {
      formula = 'Sistema 2x2';
      summary = `Sistema 2x2 ➔ ${system2Result.desc}`;
      details = [{ label: 'Determinante D', value: `${system2Result.D ?? 0}` }, { label: 'Soluzioni', value: system2Result.desc }];
      inputs = { s2_a1, s2_b1, s2_c1, s2_a2, s2_b2, s2_c2 };
    } else {
      formula = 'Sistema 3x3';
      summary = `Sistema 3x3 ➔ ${system3Result.desc}`;
      details = [{ label: 'Determinante D', value: `${system3Result.D ?? 0}` }, { label: 'Soluzioni', value: system3Result.desc }];
    }

    onSaveHistory({
      calculatorId: 'equations',
      calculatorTitle: 'Risolutore Equazioni & Sistemi',
      summary,
      details,
      formula,
      inputs
    });
    showToast('Risoluzione salvata nella cronologia!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <Spline className="w-3.5 h-3.5" />
                Algebra & Sistemi
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-950/30 text-indigo-100 font-mono">
                2° Grado · Cardano 3° · Cramer 2x2 / 3x3
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Spline className="w-6 h-6 text-indigo-200" />
              Risolutore di Equazioni & Sistemi Lineari
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
              Risolvi all\'istante equazioni di secondo e terzo grado con radici reali e complesse, vertice parabola e sistemi con Cramer.
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
              onClick={handleSaveCurrent}
              className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              Salva Cronologia
            </button>
          </div>
        </div>
      </div>

      {/* Main Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs space-y-5">
        {/* Type Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setSolverType('quadratic')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              solverType === 'quadratic'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            2° Grado (ax² + bx + c = 0)
          </button>
          <button
            type="button"
            onClick={() => setSolverType('cubic')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              solverType === 'cubic'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            3° Grado (Cardano)
          </button>
          <button
            type="button"
            onClick={() => setSolverType('system2x2')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              solverType === 'system2x2'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            Sistema 2x2 (Cramer)
          </button>
          <button
            type="button"
            onClick={() => setSolverType('system3x3')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              solverType === 'system3x3'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
            }`}
          >
            Sistema 3x3 (Cramer)
          </button>
        </div>

        {/* 2° Grado */}
        {solverType === 'quadratic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <CalcInput label="Coefficiente a" value={quadA} onChange={setQuadA} placeholder="1" />
              <CalcInput label="Coefficiente b" value={quadB} onChange={setQuadB} placeholder="-5" />
              <CalcInput label="Termine noto c" value={quadC} onChange={setQuadC} placeholder="6" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center font-mono font-bold text-base text-slate-800 dark:text-zinc-200">
              {quadA || '0'}x² {parseFloat(quadB) >= 0 ? `+ ${quadB}` : `- ${Math.abs(parseFloat(quadB) || 0)}`}x{' '}
              {parseFloat(quadC) >= 0 ? `+ ${quadC}` : `- ${Math.abs(parseFloat(quadC) || 0)}`} = 0
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Discriminante (Δ = b² - 4ac)</span>
                <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  Δ = {quadraticResult.delta.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500">Radici / Soluzioni:</span>
                <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100">
                  {quadraticResult.desc}
                </div>
              </div>

              {quadraticResult.vertex && (
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Vertice Parabola V: </span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      ({quadraticResult.vertex.x.toFixed(4)}, {quadraticResult.vertex.y.toFixed(4)})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Asse di Simmetria: </span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      x = {quadraticResult.vertex.x.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3° Grado */}
        {solverType === 'cubic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CalcInput label="a (x³)" value={cubicA} onChange={setCubicA} placeholder="1" />
              <CalcInput label="b (x²)" value={cubicB} onChange={setCubicB} placeholder="-6" />
              <CalcInput label="c (x)" value={cubicC} onChange={setCubicC} placeholder="11" />
              <CalcInput label="d (costante)" value={cubicD} onChange={setCubicD} placeholder="-6" />
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/30 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400">Radici della Cubica:</span>
              {cubicResult.valid ? (
                <div className="space-y-1.5 font-mono">
                  {cubicResult.roots.map((r, i) => (
                    <div key={i} className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {r}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-rose-500 text-sm font-bold">{cubicResult.error}</div>
              )}
            </div>
          </div>
        )}

        {/* Sistema 2x2 */}
        {solverType === 'system2x2' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3 font-mono">
              <div className="text-xs font-bold text-slate-500 uppercase">Equazione 1: a₁x + b₁y = c₁</div>
              <div className="grid grid-cols-3 gap-2">
                <CalcInput label="a₁ (x)" value={s2_a1} onChange={setS2_a1} />
                <CalcInput label="b₁ (y)" value={s2_b1} onChange={setS2_b1} />
                <CalcInput label="c₁ (=)" value={s2_c1} onChange={setS2_c1} />
              </div>

              <div className="text-xs font-bold text-slate-500 uppercase pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                Equazione 2: a₂x + b₂y = c₂
              </div>
              <div className="grid grid-cols-3 gap-2">
                <CalcInput label="a₂ (x)" value={s2_a2} onChange={setS2_a2} />
                <CalcInput label="b₂ (y)" value={s2_b2} onChange={setS2_b2} />
                <CalcInput label="c₂ (=)" value={s2_c2} onChange={setS2_c2} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Determinanti di Cramer</span>
                <span className="font-mono text-xs font-bold text-slate-600 dark:text-zinc-400">
                  D = {system2Result.D?.toFixed(2) ?? '—'}, Dx = {system2Result.Dx?.toFixed(2) ?? '—'}, Dy ={' '}
                  {system2Result.Dy?.toFixed(2) ?? '—'}
                </span>
              </div>

              <div className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {system2Result.desc}
              </div>
            </div>
          </div>
        )}

        {/* Sistema 3x3 */}
        {solverType === 'system3x3' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3 font-mono">
              <div className="text-xs font-bold text-slate-500 uppercase">Equazione 1: a₁x + b₁y + c₁z = d₁</div>
              <div className="grid grid-cols-4 gap-2">
                <CalcInput label="a₁ (x)" value={s3_a1} onChange={setS3_a1} />
                <CalcInput label="b₁ (y)" value={s3_b1} onChange={setS3_b1} />
                <CalcInput label="c₁ (z)" value={s3_c1} onChange={setS3_c1} />
                <CalcInput label="d₁ (=)" value={s3_d1} onChange={setS3_d1} />
              </div>

              <div className="text-xs font-bold text-slate-500 uppercase pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                Equazione 2: a₂x + b₂y + c₂z = d₂
              </div>
              <div className="grid grid-cols-4 gap-2">
                <CalcInput label="a₂ (x)" value={s3_a2} onChange={setS3_a2} />
                <CalcInput label="b₂ (y)" value={s3_b2} onChange={setS3_b2} />
                <CalcInput label="c₂ (z)" value={s3_c2} onChange={setS3_c2} />
                <CalcInput label="d₂ (=)" value={s3_d2} onChange={setS3_d2} />
              </div>

              <div className="text-xs font-bold text-slate-500 uppercase pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                Equazione 3: a₃x + b₃y + c₃z = d₃
              </div>
              <div className="grid grid-cols-4 gap-2">
                <CalcInput label="a₃ (x)" value={s3_a3} onChange={setS3_a3} />
                <CalcInput label="b₃ (y)" value={s3_b3} onChange={setS3_b3} />
                <CalcInput label="c₃ (z)" value={s3_c3} onChange={setS3_c3} />
                <CalcInput label="d₃ (=)" value={s3_d3} onChange={setS3_d3} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Determinanti di Cramer</span>
                <span className="font-mono text-xs font-bold text-slate-600 dark:text-zinc-400">
                  D = {system3Result.D?.toFixed(2) ?? '—'}
                </span>
              </div>

              <div className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {system3Result.desc}
              </div>
            </div>
          </div>
        )}
      </div>

      <SectionHistoryTape
        calculatorId="equations"
        history={history}
        onRestore={(inputs) => {
          if (inputs.quadA) setQuadA(inputs.quadA);
          if (inputs.quadB) setQuadB(inputs.quadB);
          if (inputs.quadC) setQuadC(inputs.quadC);
        }}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        settings={settings}
        showToast={showToast}
      />
    </div>
  );
};

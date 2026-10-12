import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Table2,
  Layers,
  Activity,
  Bookmark,
  Share2,
  Info,
  ArrowRight,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface MatrixLabCalculatorProps {
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

// Matrix operations utilities
type Matrix = number[][];

function createEmptyMatrix(dim: number, fill = 0): Matrix {
  return Array.from({ length: dim }, () => Array(dim).fill(fill));
}

function createIdentityMatrix(dim: number): Matrix {
  return Array.from({ length: dim }, (_, r) =>
    Array.from({ length: dim }, (_, c) => (r === c ? 1 : 0))
  );
}

function matrixDet(m: Matrix): number {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  if (n === 3) {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  }
  // Laplace expansion for 4x4
  let det = 0;
  for (let c = 0; c < n; c++) {
    const sub: Matrix = [];
    for (let i = 1; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        if (j !== c) row.push(m[i][j]);
      }
      sub.push(row);
    }
    const sign = c % 2 === 0 ? 1 : -1;
    det += sign * m[0][c] * matrixDet(sub);
  }
  return det;
}

function matrixTranspose(m: Matrix): Matrix {
  const n = m.length;
  const res = createEmptyMatrix(n);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[c][r] = m[r][c];
    }
  }
  return res;
}

function matrixTrace(m: Matrix): number {
  return m.reduce((acc, row, i) => acc + row[i], 0);
}

function matrixInverse(m: Matrix): Matrix | null {
  const det = matrixDet(m);
  if (Math.abs(det) < 1e-12) return null;

  const n = m.length;
  if (n === 2) {
    return [
      [m[1][1] / det, -m[0][1] / det],
      [-m[1][0] / det, m[0][0] / det]
    ];
  }

  // Adjugate / Det
  const adj = createEmptyMatrix(n);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const sub: Matrix = [];
      for (let i = 0; i < n; i++) {
        if (i === r) continue;
        const row: number[] = [];
        for (let j = 0; j < n; j++) {
          if (j === c) continue;
          row.push(m[i][j]);
        }
        sub.push(row);
      }
      const sign = (r + c) % 2 === 0 ? 1 : -1;
      adj[c][r] = (sign * matrixDet(sub)) / det;
    }
  }
  return adj;
}

function matrixMultiply(A: Matrix, B: Matrix): Matrix {
  const n = A.length;
  const C = createEmptyMatrix(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
}

function matrixAdd(A: Matrix, B: Matrix, sign = 1): Matrix {
  const n = A.length;
  const C = createEmptyMatrix(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      C[i][j] = A[i][j] + sign * B[i][j];
    }
  }
  return C;
}

function matrixRank(m: Matrix): number {
  const A = m.map((r) => [...r]);
  const rows = A.length;
  const cols = A[0].length;
  let rank = 0;

  for (let col = 0; col < cols && rank < rows; col++) {
    let pivot = rank;
    while (pivot < rows && Math.abs(A[pivot][col]) < 1e-9) pivot++;
    if (pivot === rows) continue;

    // Swap pivot row
    const temp = A[rank];
    A[rank] = A[pivot];
    A[pivot] = temp;

    // Eliminate below
    for (let r = rank + 1; r < rows; r++) {
      const factor = A[r][col] / A[rank][col];
      for (let c = col; c < cols; c++) {
        A[r][c] -= factor * A[rank][c];
      }
    }
    rank++;
  }
  return rank;
}

export const MatrixLabCalculator: React.FC<MatrixLabCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [dim, setDim] = useState<2 | 3 | 4>(2);
  const [activeTab, setActiveTab] = useState<'unary' | 'binary' | 'eigen'>('unary');

  // Matrix A and B
  const [matA, setMatA] = useState<Matrix>([
    [4, 2],
    [1, 3]
  ]);
  const [matB, setMatB] = useState<Matrix>([
    [1, 0],
    [0, 1]
  ]);
  const [scalarK, setScalarK] = useState<string>('2');

  // Dimension switch
  const handleDimChange = (newDim: 2 | 3 | 4) => {
    setDim(newDim);
    if (newDim === 2) {
      setMatA([[4, 2], [1, 3]]);
      setMatB([[1, 0], [0, 1]]);
    } else if (newDim === 3) {
      setMatA([[2, -1, 0], [-1, 2, -1], [0, -1, 2]]);
      setMatB([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    } else {
      setMatA(createIdentityMatrix(4));
      setMatB(createIdentityMatrix(4));
    }
  };

  const updateCellA = (r: number, c: number, val: string) => {
    const num = parseFloat(val.replace(',', '.')) || 0;
    setMatA((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = num;
      return copy;
    });
  };

  const updateCellB = (r: number, c: number, val: string) => {
    const num = parseFloat(val.replace(',', '.')) || 0;
    setMatB((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = num;
      return copy;
    });
  };

  // Matrix Analysis for A
  const detA = useMemo(() => matrixDet(matA), [matA]);
  const trA = useMemo(() => matrixTrace(matA), [matA]);
  const transA = useMemo(() => matrixTranspose(matA), [matA]);
  const invA = useMemo(() => matrixInverse(matA), [matA]);
  const rankA = useMemo(() => matrixRank(matA), [matA]);

  // Binary Operations
  const multAB = useMemo(() => matrixMultiply(matA, matB), [matA, matB]);
  const addAB = useMemo(() => matrixAdd(matA, matB, 1), [matA, matB]);
  const subAB = useMemo(() => matrixAdd(matA, matB, -1), [matA, matB]);

  // Eigenvalues for 2x2: lambda^2 - tr(A)*lambda + det(A) = 0
  const eigenResult2x2 = useMemo(() => {
    if (dim !== 2) return null;
    const a = matA[0][0];
    const b = matA[0][1];
    const c = matA[1][0];
    const d = matA[1][1];

    const tr = a + d;
    const det = a * d - b * c;
    const delta = tr * tr - 4 * det;

    if (delta >= 0) {
      const l1 = (tr + Math.sqrt(delta)) / 2;
      const l2 = (tr - Math.sqrt(delta)) / 2;
      return {
        type: 'Reali',
        l1: Number(l1.toFixed(4)),
        l2: Number(l2.toFixed(4))
      };
    } else {
      const real = tr / 2;
      const imag = Math.sqrt(-delta) / 2;
      return {
        type: 'Complessi Coniugati',
        real: Number(real.toFixed(4)),
        imag: Number(imag.toFixed(4))
      };
    }
  }, [matA, dim]);

  // Auto-select text in inputs
  const handleSelectAll = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  // Save to History
  const handleSaveToHistory = () => {
    onSaveHistory({
      calculatorId: 'matrix-lab',
      calculatorTitle: 'Algebra Lineare & Matrici Studio',
      summary: `Matrice A ${dim}x${dim}: det(A) = ${detA.toFixed(2)}, Tr(A) = ${trA.toFixed(2)}, rank = ${rankA}`,
      formula: 'det(A - λI) = 0, A⁻¹ = adj(A)/det(A)',
      details: [
        { label: 'Dimensione', value: `${dim}x${dim}` },
        { label: 'Determinante', value: `${detA.toFixed(4)}` },
        { label: 'Traccia', value: `${trA.toFixed(4)}` },
        { label: 'Rango Matriciale', value: `${rankA}` },
        { label: 'Invertibile', value: Math.abs(detA) > 1e-12 ? 'Sì' : 'No (Singolare)' }
      ]
    });
    showToast('Calcolo matriciale salvato nella cronologia!');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border border-blue-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-400">
              <Table2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Algebra Lineare & Matrici Studio</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Matrix Calculator Pro
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200/80 mt-1">
                Determinante, inversa, trasposta, rango, autovalori, moltiplicazione AxB e sistemi lineari.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-2.5 rounded-xl border transition-all ${
                  isFavorite
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
                title="Aggiungi ai preferiti"
              >
                ★
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salva Matrice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dim Switcher & Subtabs Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100/90 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'unary', label: 'Proprietà di A (Det, Inversa, Rango)' },
            { id: 'binary', label: 'Operazioni A × B & Somma' },
            { id: 'eigen', label: 'Autovalori & Autovettori' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/70 dark:hover:bg-zinc-700/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white/80 dark:bg-zinc-900/80 p-1 rounded-xl self-end sm:self-auto shrink-0 border border-slate-200/60 dark:border-zinc-700/60">
          {([2, 3, 4] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDimChange(d)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                dim === d
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              {d}×{d}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Matrix A */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Matrice A ({dim}×{dim})</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setMatA(createIdentityMatrix(dim))}
                className="px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-[10px]"
              >
                Identità I
              </button>
              <button
                type="button"
                onClick={() => setMatA(createEmptyMatrix(dim))}
                className="px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-[10px]"
              >
                Azzera
              </button>
            </div>
          </div>

          <div
            className="grid gap-2 p-3 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-200 dark:border-zinc-800 inline-block w-full"
            style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
          >
            {matA.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`${r}-${c}`}
                  type="text"
                  value={val}
                  onFocus={handleSelectAll}
                  onChange={(e) => updateCellA(r, c, e.target.value)}
                  className="w-full text-center py-2 px-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500"
                />
              ))
            )}
          </div>
        </div>

        {/* Matrix B (Shown in binary mode or available) */}
        {activeTab === 'binary' ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Matrice B ({dim}×{dim})</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setMatB(createIdentityMatrix(dim))}
                  className="px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-[10px]"
                >
                  Identità I
                </button>
                <button
                  type="button"
                  onClick={() => setMatB(createEmptyMatrix(dim))}
                  className="px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-[10px]"
                >
                  Azzera
                </button>
              </div>
            </div>

            <div
              className="grid gap-2 p-3 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-200 dark:border-zinc-800 inline-block w-full"
              style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
            >
              {matB.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`${r}-${c}`}
                    type="text"
                    value={val}
                    onFocus={handleSelectAll}
                    onChange={(e) => updateCellB(r, c, e.target.value)}
                    className="w-full text-center py-2 px-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500"
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          /* Unary metrics quick card */
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <span className="text-xs font-mono uppercase text-blue-400">Invarianti di Matrice A</span>
              <span className="text-xs font-mono text-slate-400">Dimensione {dim}×{dim}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Determinante det(A):</span>
                <div className="text-2xl font-bold text-amber-300">{detA.toFixed(4)}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Traccia Tr(A):</span>
                <div className="text-2xl font-bold text-sky-300">{trA.toFixed(4)}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Rango Matriciale:</span>
                <div className="text-2xl font-bold text-emerald-400">{rankA} / {dim}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Invertibilità:</span>
                <div className="text-sm font-bold text-white pt-1">
                  {Math.abs(detA) > 1e-12 ? 'Regolare (Invertibile)' : 'Singolare (det=0)'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unary Tab Details: Inverse & Transpose Display */}
      {activeTab === 'unary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inverse Matrix */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Matrice Inversa A⁻¹:
            </h4>
            {invA ? (
              <div
                className="grid gap-2 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border font-mono text-center text-xs font-bold"
                style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
              >
                {invA.map((row, r) =>
                  row.map((val, c) => (
                    <div key={`${r}-${c}`} className="py-2 px-1 bg-white dark:bg-zinc-800 rounded border">
                      {val.toFixed(3)}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-mono">
                La matrice non è invertibile (determinante nullo det(A)=0).
              </div>
            )}
          </div>

          {/* Transpose Matrix */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Matrice Trasposta Aᵀ:
            </h4>
            <div
              className="grid gap-2 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border font-mono text-center text-xs font-bold"
              style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
            >
              {transA.map((row, r) =>
                row.map((val, c) => (
                  <div key={`${r}-${c}`} className="py-2 px-1 bg-white dark:bg-zinc-800 rounded border">
                    {val}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Binary Tab: Multiplied A * B and Sum */}
      {activeTab === 'binary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 text-white shadow-xl space-y-3">
            <h4 className="text-xs font-mono uppercase text-blue-400">
              Prodotto Matriciale C = A × B
            </h4>
            <div
              className="grid gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-center text-xs font-bold"
              style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
            >
              {multAB.map((row, r) =>
                row.map((val, c) => (
                  <div key={`${r}-${c}`} className="py-2.5 px-1 bg-slate-900 rounded border border-slate-800 text-blue-300">
                    {val.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 text-white shadow-xl space-y-3">
            <h4 className="text-xs font-mono uppercase text-emerald-400">
              Somma Matriciale C = A + B
            </h4>
            <div
              className="grid gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-center text-xs font-bold"
              style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
            >
              {addAB.map((row, r) =>
                row.map((val, c) => (
                  <div key={`${r}-${c}`} className="py-2.5 px-1 bg-slate-900 rounded border border-slate-800 text-emerald-300">
                    {val.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Eigenvalues Tab */}
      {activeTab === 'eigen' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Spettro degli Autovalori: Equazione Caratteristica det(A - λI) = 0
          </h4>

          {eigenResult2x2 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 font-mono text-xs space-y-2 border">
              <div>Polinomio Caratteristico: <strong>λ² - {trA.toFixed(2)}λ + {detA.toFixed(2)} = 0</strong></div>
              {eigenResult2x2.type === 'Reali' ? (
                <div className="flex gap-4 text-sm font-bold text-blue-600 dark:text-blue-400 pt-1">
                  <span>λ₁ = {eigenResult2x2.l1}</span>
                  <span>λ₂ = {eigenResult2x2.l2}</span>
                </div>
              ) : (
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 pt-1">
                  λ = {eigenResult2x2.real} ± {eigenResult2x2.imag} i
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-mono text-slate-500">
              Traccia = {trA.toFixed(2)}, Determinante = {detA.toFixed(2)}. Per matrici 3x3 e 4x4 la diagonalizzazione completa si basa sull'invarianza della traccia e del determinante.
            </div>
          )}
        </div>
      )}

      {/* History */}
      <SectionHistoryTape
        calculatorId="matrix-lab"
        history={history}
        onRestore={() => {}}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        settings={settings}
        showToast={showToast}
      />
    </div>
  );
};

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Atom,
  Layers,
  Activity,
  Play,
  Share2,
  Bookmark,
  Info,
  HelpCircle,
  BarChart2,
  Zap,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface QuantumLabCalculatorProps {
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

// Complex number representation
interface Complex {
  re: number;
  im: number;
}

function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}
function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}
function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}
function cScale(c: Complex, s: number): Complex {
  return { re: c.re * s, im: c.im * s };
}
function cMag2(c: Complex): number {
  return c.re * c.re + c.im * c.im;
}
function cMag(c: Complex): number {
  return Math.sqrt(cMag2(c));
}
function cPhase(c: Complex): number {
  return Math.atan2(c.im, c.re);
}

// Format complex number nicely
function formatComplex(c: Complex, decimals = 3): string {
  const r = Math.abs(c.re) < 1e-6 ? 0 : Number(c.re.toFixed(decimals));
  const i = Math.abs(c.im) < 1e-6 ? 0 : Number(c.im.toFixed(decimals));
  if (r === 0 && i === 0) return '0';
  if (i === 0) return `${r}`;
  if (r === 0) {
    if (i === 1) return 'i';
    if (i === -1) return '-i';
    return `${i}i`;
  }
  const sign = i > 0 ? '+' : '-';
  const absI = Math.abs(i) === 1 ? '' : Math.abs(i);
  return `${r} ${sign} ${absI}i`;
}

// 2x2 Matrix Gates
type GateType = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'CX' | 'SWAP' | 'RESET';

interface GateOperation {
  gate: GateType;
  target: number;
  control?: number;
  id: string;
}

const INV_SQRT2 = 1 / Math.SQRT2;

export const QuantumLabCalculator: React.FC<QuantumLabCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [numQubits, setNumQubits] = useState<1 | 2 | 3>(2);
  const [circuit, setCircuit] = useState<GateOperation[]>([]);
  const [activeTab, setActiveTab] = useState<'circuit' | 'bloch' | 'measurements' | 'presets'>('circuit');
  
  // Bloch angles for single qubit visualization
  const [blochTheta, setBlochTheta] = useState<number>(Math.PI / 2); // 0 to PI
  const [blochPhi, setBlochPhi] = useState<number>(0); // 0 to 2PI
  
  // Measurement shots
  const [measurementShots, setMeasurementShots] = useState<Record<string, number> | null>(null);
  const [totalShots, setTotalShots] = useState<number>(1024);
  const [isSimulatingShots, setIsSimulatingShots] = useState<boolean>(false);

  // Compute statevector of N qubits from circuit
  const stateVector = useMemo(() => {
    const dim = Math.pow(2, numQubits);
    // Initialize to |00...0>
    let state: Complex[] = Array.from({ length: dim }, (_, i) => 
      i === 0 ? { re: 1, im: 0 } : { re: 0, im: 0 }
    );

    for (const op of circuit) {
      if (op.target >= numQubits) continue;

      if (op.gate === 'RESET') {
        // Reset target qubit to |0>
        const mask = 1 << (numQubits - 1 - op.target);
        // Project onto 0
        let norm0 = 0;
        for (let i = 0; i < dim; i++) {
          if ((i & mask) === 0) norm0 += cMag2(state[i]);
        }
        if (norm0 > 1e-12) {
          const factor = 1 / Math.sqrt(norm0);
          state = state.map((c, i) => (i & mask) === 0 ? cScale(c, factor) : { re: 0, im: 0 });
        }
        continue;
      }

      if (op.gate === 'CX' && op.control !== undefined) {
        if (op.control >= numQubits) continue;
        const ctrlMask = 1 << (numQubits - 1 - op.control);
        const tgtMask = 1 << (numQubits - 1 - op.target);

        const next = [...state];
        for (let i = 0; i < dim; i++) {
          if ((i & ctrlMask) !== 0 && (i & tgtMask) === 0) {
            const partner = i | tgtMask;
            // Swap amplitudes between |...0...> and |...1...>
            const tmp = next[i];
            next[i] = next[partner];
            next[partner] = tmp;
          }
        }
        state = next;
        continue;
      }

      if (op.gate === 'SWAP' && op.control !== undefined) {
        if (op.control >= numQubits) continue;
        const q1Mask = 1 << (numQubits - 1 - op.control);
        const q2Mask = 1 << (numQubits - 1 - op.target);

        const next = [...state];
        for (let i = 0; i < dim; i++) {
          const bit1 = (i & q1Mask) !== 0;
          const bit2 = (i & q2Mask) !== 0;
          if (bit1 !== bit2 && bit1) {
            const partner = (i & ~q1Mask) | q2Mask;
            const tmp = next[i];
            next[i] = next[partner];
            next[partner] = tmp;
          }
        }
        state = next;
        continue;
      }

      // Single qubit gate on target
      const tgtMask = 1 << (numQubits - 1 - op.target);
      const next = [...state];

      for (let i = 0; i < dim; i++) {
        if ((i & tgtMask) === 0) {
          const i0 = i;
          const i1 = i | tgtMask;
          const c0 = state[i0];
          const c1 = state[i1];

          if (op.gate === 'H') {
            next[i0] = cScale(cAdd(c0, c1), INV_SQRT2);
            next[i1] = cScale(cSub(c0, c1), INV_SQRT2);
          } else if (op.gate === 'X') {
            next[i0] = c1;
            next[i1] = c0;
          } else if (op.gate === 'Y') {
            // Y: [0 -i; i 0] -> Y|0> = i|1>, Y|1> = -i|0>
            next[i0] = { re: c1.im, im: -c1.re };
            next[i1] = { re: -c0.im, im: c0.re };
          } else if (op.gate === 'Z') {
            next[i0] = c0;
            next[i1] = cScale(c1, -1);
          } else if (op.gate === 'S') {
            // S: [1 0; 0 i]
            next[i0] = c0;
            next[i1] = { re: -c1.im, im: c1.re };
          } else if (op.gate === 'T') {
            // T: [1 0; 0 e^(i*pi/4)]
            next[i0] = c0;
            next[i1] = cMul(c1, { re: INV_SQRT2, im: INV_SQRT2 });
          }
        }
      }
      state = next;
    }

    return state;
  }, [circuit, numQubits]);

  // Probabilities and basis states
  const basisStates = useMemo(() => {
    const dim = Math.pow(2, numQubits);
    return Array.from({ length: dim }, (_, idx) => {
      const bin = idx.toString(2).padStart(numQubits, '0');
      const amp = stateVector[idx] || { re: 0, im: 0 };
      const prob = cMag2(amp);
      return {
        index: idx,
        binary: bin,
        amp,
        prob,
        magnitude: cMag(amp),
        phase: cPhase(amp)
      };
    });
  }, [stateVector, numQubits]);

  // Dirac notation string
  const diracNotation = useMemo(() => {
    const terms = basisStates
      .filter((s) => s.prob > 1e-4)
      .map((s) => {
        const coeff = formatComplex(s.amp);
        return `${coeff === '1' ? '' : coeff === '-1' ? '-' : `(${coeff})`}|${s.binary}⟩`;
      });
    return terms.length > 0 ? terms.join(' + ').replace(/\+\s*-/g, '- ') : '|0⟩';
  }, [basisStates]);

  // Bloch vector for qubit 0
  const blochCoords = useMemo(() => {
    if (numQubits === 1) {
      const a = stateVector[0];
      const b = stateVector[1];
      // rho = |psi><psi|
      // x = 2*Re(a* b)
      // y = 2*Im(a* b)
      // z = |a|^2 - |b|^2
      const x = 2 * (a.re * b.re + a.im * b.im);
      const y = 2 * (a.re * b.im - a.im * b.re);
      const z = cMag2(a) - cMag2(b);
      return { x, y, z };
    } else {
      // Direct user angles from Bloch tab
      return {
        x: Math.sin(blochTheta) * Math.cos(blochPhi),
        y: Math.sin(blochTheta) * Math.sin(blochPhi),
        z: Math.cos(blochTheta)
      };
    }
  }, [numQubits, stateVector, blochTheta, blochPhi]);

  // Entanglement & Purity (for 2 qubits)
  const entanglementMetrics = useMemo(() => {
    if (numQubits !== 2) return null;
    const [c00, c01, c10, c11] = stateVector;
    // Concurrence C = 2 * |c00*c11 - c01*c10|
    const term1 = cMul(c00, c11);
    const term2 = cMul(c01, c10);
    const diff = cSub(term1, term2);
    const concurrence = Math.min(1, 2 * cMag(diff));
    
    // Von Neumann entropy estimation based on concurrence:
    // x = (1 + sqrt(1 - C^2))/2, S = -x*log2(x) - (1-x)*log2(1-x)
    let entropy = 0;
    if (concurrence > 0.001) {
      const p = (1 + Math.sqrt(Math.max(0, 1 - concurrence * concurrence))) / 2;
      const p2 = 1 - p;
      const t1 = p > 1e-9 ? -p * Math.log2(p) : 0;
      const t2 = p2 > 1e-9 ? -p2 * Math.log2(p2) : 0;
      entropy = t1 + t2;
    }

    return {
      concurrence: Number(concurrence.toFixed(4)),
      entropy: Number(entropy.toFixed(4)),
      isEntangled: concurrence > 0.01,
      isMaximallyEntangled: concurrence > 0.99
    };
  }, [stateVector, numQubits]);

  // Gate additions
  const addGate = (gate: GateType, target: number, control?: number) => {
    const op: GateOperation = {
      gate,
      target,
      control,
      id: `${Date.now()}-${Math.random()}`
    };
    setCircuit((prev) => [...prev, op]);
    setMeasurementShots(null);
  };

  const removeLastGate = () => {
    setCircuit((prev) => prev.slice(0, -1));
    setMeasurementShots(null);
  };

  const clearCircuit = () => {
    setCircuit([]);
    setMeasurementShots(null);
  };

  // Run 1024-shot measurement sampling
  const handleSimulateMeasurements = () => {
    setIsSimulatingShots(true);
    setTimeout(() => {
      const counts: Record<string, number> = {};
      basisStates.forEach((s) => {
        counts[s.binary] = 0;
      });

      // Cumulative probabilities
      const cumProb: { binary: string; cum: number }[] = [];
      let sum = 0;
      for (const s of basisStates) {
        sum += s.prob;
        cumProb.push({ binary: s.binary, cum: sum });
      }

      for (let i = 0; i < totalShots; i++) {
        const rand = Math.random();
        let selected = basisStates[0].binary;
        for (const cp of cumProb) {
          if (rand <= cp.cum) {
            selected = cp.binary;
            break;
          }
        }
        counts[selected] = (counts[selected] || 0) + 1;
      }

      setMeasurementShots(counts);
      setIsSimulatingShots(false);
      showToast(`Campionamento a ${totalShots} colpi completato!`);
    }, 200);
  };

  // Preset circuits
  const applyPreset = (presetName: string) => {
    clearCircuit();
    if (presetName === 'bell-phi-plus') {
      setNumQubits(2);
      setCircuit([
        { gate: 'H', target: 0, id: '1' },
        { gate: 'CX', control: 0, target: 1, id: '2' }
      ]);
      showToast('Stato di Bell |Φ⁺⟩ caricato: (|00⟩ + |11⟩)/√2');
    } else if (presetName === 'bell-psi-plus') {
      setNumQubits(2);
      setCircuit([
        { gate: 'X', target: 1, id: '1' },
        { gate: 'H', target: 0, id: '2' },
        { gate: 'CX', control: 0, target: 1, id: '3' }
      ]);
      showToast('Stato di Bell |Ψ⁺⟩ caricato: (|01⟩ + |10⟩)/√2');
    } else if (presetName === 'ghz') {
      setNumQubits(3);
      setCircuit([
        { gate: 'H', target: 0, id: '1' },
        { gate: 'CX', control: 0, target: 1, id: '2' },
        { gate: 'CX', control: 1, target: 2, id: '3' }
      ]);
      showToast('Stato GHZ a 3 Qubit caricato: (|000⟩ + |111⟩)/√2');
    } else if (presetName === 'superposition') {
      setNumQubits(2);
      setCircuit([
        { gate: 'H', target: 0, id: '1' },
        { gate: 'H', target: 1, id: '2' }
      ]);
      showToast('Sovrapposizione uniforme H⊗H caricata');
    } else if (presetName === 'teleportation') {
      setNumQubits(3);
      setCircuit([
        // Prepare state to teleport on q0 (e.g. H)
        { gate: 'H', target: 0, id: '1' },
        // Create Bell pair between q1 and q2
        { gate: 'H', target: 1, id: '2' },
        { gate: 'CX', control: 1, target: 2, id: '3' },
        // Bell measurement on q0, q1
        { gate: 'CX', control: 0, target: 1, id: '4' },
        { gate: 'H', target: 0, id: '5' }
      ]);
      showToast('Protocollo di Teletrasporto Quantistico (Alice -> Bob)');
    }
  };

  // Save to history
  const handleSaveToHistory = () => {
    onSaveHistory({
      calculatorId: 'quantum-lab',
      calculatorTitle: 'Laboratorio Quantistico & Qubit',
      summary: `${numQubits} Qubit: ${diracNotation}`,
      formula: '|ψ⟩ = Σ cᵢ |i⟩',
      details: [
        { label: 'Qubit configurati', value: `${numQubits}` },
        { label: 'Vettore di Stato Dirac', value: diracNotation },
        { label: 'Porte Quantistiche applicate', value: `${circuit.length}` },
        ...(entanglementMetrics ? [
          { label: 'Concurrence (Entanglement)', value: `${entanglementMetrics.concurrence}` },
          { label: 'Entropia di Von Neumann', value: `${entanglementMetrics.entropy}` }
        ] : [])
      ]
    });
    showToast('Stato quantistico salvato nella cronologia!');
  };

  const handleCopyKet = () => {
    navigator.clipboard.writeText(diracNotation);
    showToast('Notazione Ket copiata!');
  };

  // Section history entries
  const sectionHistory = history.filter((h) => h.calculatorId === 'quantum-lab');

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <Atom className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Laboratorio Quantistico & Qubit</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Qiskit-Class Simulator
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1">
                Simulatore a {numQubits} Qubit, porte unitarie, stati di Bell, sfera di Bloch 3D e campionamento Monte Carlo.
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
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salva Stato</span>
            </button>
          </div>
        </div>

        {/* Live State Vector Display Banner */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-indigo-400/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-indigo-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Stato Quantistico Corrente |ψ⟩
            </span>
            <button
              type="button"
              onClick={handleCopyKet}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copia Ket</span>
            </button>
          </div>
          <div className="text-sm sm:text-base font-mono text-white tracking-wide break-all select-all font-semibold py-1">
            |ψ⟩ = {diracNotation}
          </div>

          {entanglementMetrics && (
            <div className="mt-3 pt-3 border-t border-indigo-500/20 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Entanglement Concurrence:</span>
                <span className={`font-mono font-bold ${entanglementMetrics.isMaximallyEntangled ? 'text-emerald-400' : entanglementMetrics.isEntangled ? 'text-amber-400' : 'text-slate-300'}`}>
                  {entanglementMetrics.concurrence}
                </span>
                {entanglementMetrics.isMaximallyEntangled && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Massimamente Entangled
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Entropia di Von Neumann:</span>
                <span className="font-mono font-bold text-purple-300">
                  {entanglementMetrics.entropy} bit
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Navigation Tabs Toolbar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'circuit', label: 'Circuito Quantistico', icon: Cpu },
          { id: 'bloch', label: 'Sfera di Bloch 3D', icon: Atom },
          { id: 'measurements', label: 'Misurazioni (1024 Shot)', icon: BarChart2 },
          { id: 'presets', label: 'Stati Noti & Algoritmi', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/70 dark:hover:bg-zinc-700/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Quantum Circuit Builder */}
      {activeTab === 'circuit' && (
        <div className="space-y-6">
          {/* Controls Bar: Qubit count & Reset */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Numero di Qubit:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                {([1, 2, 3] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setNumQubits(q);
                      clearCircuit();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      numQubits === q
                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {q} Qubit
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={removeLastGate}
                disabled={circuit.length === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                Annulla Ultima Porta
              </button>
              <button
                type="button"
                onClick={clearCircuit}
                disabled={circuit.length === 0}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 disabled:opacity-40 transition-colors"
              >
                Azzera Circuito
              </button>
            </div>
          </div>

          {/* Interactive Circuit Timeline Canvas */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner text-white overflow-x-auto">
            <div className="min-w-[620px] space-y-6">
              {Array.from({ length: numQubits }, (_, qIdx) => {
                // Find all gates affecting this qubit
                return (
                  <div key={qIdx} className="flex items-center gap-4">
                    {/* Qubit Label */}
                    <div className="w-16 font-mono text-xs font-bold text-indigo-400 flex items-center justify-between pr-2 border-r border-slate-800">
                      <span>q[{qIdx}]</span>
                      <span className="text-slate-400">|0⟩</span>
                    </div>

                    {/* Wire and gates */}
                    <div className="flex-1 relative flex items-center min-h-[44px]">
                      {/* Wire line */}
                      <div className="absolute inset-x-0 h-0.5 bg-slate-700 top-1/2 -translate-y-1/2" />

                      {/* Placed Gates along the wire */}
                      <div className="relative z-10 flex items-center gap-3 py-1">
                        {circuit.map((op, idx) => {
                          const isTarget = op.target === qIdx;
                          const isControl = op.control === qIdx;

                          if (!isTarget && !isControl) {
                            return (
                              <div
                                key={op.id}
                                className="w-10 h-10 flex items-center justify-center opacity-0 pointer-events-none"
                              >
                                •
                              </div>
                            );
                          }

                          if (isControl) {
                            return (
                              <div
                                key={op.id}
                                className="w-10 h-10 flex items-center justify-center"
                                title={`Controllo CNOT per q[${op.target}]`}
                              >
                                <div className="w-3.5 h-3.5 rounded-full bg-indigo-400 shadow-md shadow-indigo-500/50 ring-2 ring-indigo-950" />
                              </div>
                            );
                          }

                          if (op.gate === 'CX' && isTarget) {
                            return (
                              <div
                                key={op.id}
                                className="w-10 h-10 rounded-lg bg-indigo-600 border border-indigo-400 flex items-center justify-center font-bold text-white shadow-lg"
                                title={`Target CNOT da q[${op.control}]`}
                              >
                                ⊕
                              </div>
                            );
                          }

                          return (
                            <div
                              key={op.id}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shadow-md border ${
                                op.gate === 'H'
                                  ? 'bg-amber-600 border-amber-400 text-white'
                                  : op.gate === 'X'
                                  ? 'bg-emerald-600 border-emerald-400 text-white'
                                  : op.gate === 'Z'
                                  ? 'bg-purple-600 border-purple-400 text-white'
                                  : op.gate === 'Y'
                                  ? 'bg-blue-600 border-blue-400 text-white'
                                  : op.gate === 'S' || op.gate === 'T'
                                  ? 'bg-pink-600 border-pink-400 text-white'
                                  : 'bg-zinc-700 border-zinc-500 text-white'
                              }`}
                            >
                              {op.gate}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gate Palette: Add gates to qubits */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              Tavolozza Porte Quantistiche Unitarie
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: numQubits }, (_, qIdx) => (
                <div key={qIdx} className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      Qubit q[{qIdx}]
                    </span>
                    <span className="text-[10px] text-slate-500">Porte a 1 Qubit</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => addGate('H', qIdx)}
                      className="py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs"
                      title="Hadamard: crea sovrapposizione"
                    >
                      H
                    </button>
                    <button
                      type="button"
                      onClick={() => addGate('X', qIdx)}
                      className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                      title="Pauli-X: Bit-flip NOT"
                    >
                      X (NOT)
                    </button>
                    <button
                      type="button"
                      onClick={() => addGate('Y', qIdx)}
                      className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                      title="Pauli-Y"
                    >
                      Y
                    </button>
                    <button
                      type="button"
                      onClick={() => addGate('Z', qIdx)}
                      className="py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                      title="Pauli-Z: Phase-flip"
                    >
                      Z
                    </button>
                    <button
                      type="button"
                      onClick={() => addGate('S', qIdx)}
                      className="py-1.5 px-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-xs"
                      title="S Gate: Fase pi/2"
                    >
                      S (π/2)
                    </button>
                    <button
                      type="button"
                      onClick={() => addGate('T', qIdx)}
                      className="py-1.5 px-2 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-bold transition-all shadow-xs"
                      title="T Gate: Fase pi/4"
                    >
                      T (π/4)
                    </button>
                  </div>

                  {numQubits > 1 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1.5">
                      <div className="text-[10px] text-slate-500 font-medium">Entanglement Multi-Qubit:</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Array.from({ length: numQubits }, (_, otherIdx) => {
                          if (otherIdx === qIdx) return null;
                          return (
                            <button
                              key={otherIdx}
                              type="button"
                              onClick={() => addGate('CX', otherIdx, qIdx)}
                              className="py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all shadow-xs text-left truncate"
                              title={`CNOT: Controllo q[${qIdx}] -> Target q[${otherIdx}]`}
                            >
                              CX → q[{otherIdx}]
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* State Vector Breakdown Table */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Vettore degli Stati & Probabilità Teoriche
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Dimensione spazio Hilbert = {Math.pow(2, numQubits)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {basisStates.map((state) => {
                const percent = (state.prob * 100).toFixed(1);
                return (
                  <div
                    key={state.binary}
                    className={`p-3 rounded-xl border transition-all ${
                      state.prob > 0.001
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                        : 'bg-slate-50/40 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        |{state.binary}⟩
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {percent}%
                      </span>
                    </div>

                    {/* Probability Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full my-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      <span>Amp: {formatComplex(state.amp, 2)}</span>
                      <span>|c|² = {state.prob.toFixed(3)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Bloch Sphere */}
      {activeTab === 'bloch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Bloch Sphere SVG Visualizer */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white flex flex-col items-center justify-center shadow-xl">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Sfera di Bloch 3D - Qubit 0
              </span>
              <span className="text-xs font-mono text-slate-400">
                (x={blochCoords.x.toFixed(2)}, y={blochCoords.y.toFixed(2)}, z={blochCoords.z.toFixed(2)})
              </span>
            </div>

            <svg viewBox="-120 -120 240 240" className="w-full max-w-[320px] aspect-square">
              {/* Outer circle */}
              <circle cx="0" cy="0" r="85" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="3,3" />

              {/* Equator ellipse (perspective view) */}
              <ellipse cx="0" cy="0" rx="85" ry="32" fill="rgba(99, 102, 241, 0.05)" stroke="#475569" strokeWidth="1.5" />

              {/* Meridian ellipse */}
              <ellipse cx="0" cy="0" rx="32" ry="85" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />

              {/* Z-Axis (North-South: |0> to |1>) */}
              <line x1="0" y1="95" x2="0" y2="-95" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="6" y="-98" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">|0⟩ (Z+)</text>
              <text x="6" y="106" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">|1⟩ (Z-)</text>

              {/* X-Axis */}
              <line x1="-95" y1="18" x2="95" y2="-18" stroke="#64748b" strokeWidth="1" />
              <text x="98" y="-18" fill="#a855f7" fontSize="10" fontFamily="monospace">|+⟩ (X+)</text>
              <text x="-115" y="24" fill="#a855f7" fontSize="10" fontFamily="monospace">|-⟩ (X-)</text>

              {/* Y-Axis */}
              <line x1="-30" y1="-28" x2="30" y2="28" stroke="#64748b" strokeWidth="1" />
              <text x="32" y="32" fill="#ec4899" fontSize="10" fontFamily="monospace">|+i⟩ (Y+)</text>

              {/* Projected vector end coordinates */}
              {(() => {
                // Projection formulas for 3D sphere onto 2D isometric plane
                const R = 85;
                const px = R * (blochCoords.x * 0.9 - blochCoords.y * 0.3);
                const py = -R * blochCoords.z + R * (blochCoords.x * 0.2 + blochCoords.y * 0.35);

                return (
                  <g>
                    {/* Shadow / projection line to equator */}
                    <line x1="0" y1="0" x2={px} y2={py} stroke="#6366f1" strokeWidth="2.5" />
                    {/* Glowing tip */}
                    <circle cx={px} cy={py} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                  </g>
                );
              })()}
            </svg>

            <div className="mt-4 text-center text-xs text-slate-400">
              Stato puro: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
            </div>
          </div>

          {/* Bloch Angle Sliders & Quick State Buttons */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Parametri Angolari Sfera di Bloch
            </h3>

            {/* Theta Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Angolo Polare θ (Latitudine):</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {(blochTheta * (180 / Math.PI)).toFixed(1)}° ({(blochTheta / Math.PI).toFixed(2)}π)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.01"
                value={blochTheta}
                onChange={(e) => setBlochTheta(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (|0⟩ Polo Nord)</span>
                <span>π/2 (Equatore)</span>
                <span>π (|1⟩ Polo Sud)</span>
              </div>
            </div>

            {/* Phi Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Angolo Azimutale φ (Longitudine):</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {(blochPhi * (180 / Math.PI)).toFixed(1)}° ({(blochPhi / Math.PI).toFixed(2)}π)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.01"
                value={blochPhi}
                onChange={(e) => setBlochPhi(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0° (Asse X+)</span>
                <span>90° (Asse Y+)</span>
                <span>180° (X-)</span>
                <span>360°</span>
              </div>
            </div>

            {/* Quick Cardinal States */}
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Stati Cardinali Immediati:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => { setBlochTheta(0); setBlochPhi(0); }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-zinc-200 font-semibold border border-slate-200 dark:border-zinc-700"
                >
                  |0⟩
                </button>
                <button
                  type="button"
                  onClick={() => { setBlochTheta(Math.PI); setBlochPhi(0); }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-zinc-200 font-semibold border border-slate-200 dark:border-zinc-700"
                >
                  |1⟩
                </button>
                <button
                  type="button"
                  onClick={() => { setBlochTheta(Math.PI / 2); setBlochPhi(0); }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-zinc-200 font-semibold border border-slate-200 dark:border-zinc-700"
                >
                  |+⟩
                </button>
                <button
                  type="button"
                  onClick={() => { setBlochTheta(Math.PI / 2); setBlochPhi(Math.PI); }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-zinc-200 font-semibold border border-slate-200 dark:border-zinc-700"
                >
                  |-⟩
                </button>
                <button
                  type="button"
                  onClick={() => { setBlochTheta(Math.PI / 2); setBlochPhi(Math.PI / 2); }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-zinc-200 font-semibold border border-slate-200 dark:border-zinc-700"
                >
                  |+i⟩
                </button>
                <button
                  type="button"
                  onClick={() => { setBlochTheta(Math.PI / 2); setBlochPhi(3 * Math.PI / 2); }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-zinc-200 font-semibold border border-slate-200 dark:border-zinc-700"
                >
                  |-i⟩
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Measurement Simulator (1024 shots) */}
      {activeTab === 'measurements' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Simulatore di Collasso & Campionamento Misura
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Simulazione Monte Carlo di misura proiettiva secondo il postulato di Born.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={totalShots}
                onChange={(e) => setTotalShots(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
              >
                <option value="128">128 Shots</option>
                <option value="512">512 Shots</option>
                <option value="1024">1024 Shots (Standard)</option>
                <option value="4096">4096 Shots (Alta Precisione)</option>
              </select>

              <button
                type="button"
                onClick={handleSimulateMeasurements}
                disabled={isSimulatingShots}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulatingShots ? 'Campionamento...' : 'Esegui Misura'}</span>
              </button>
            </div>
          </div>

          {/* Histogram Chart */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center justify-between">
              <span>Distribuzione degli Esiti di Misura:</span>
              <span>{measurementShots ? `${totalShots} colpi simulati` : 'Teorica (in attesa di esecuzione)'}</span>
            </div>

            <div className="space-y-3">
              {basisStates.map((state) => {
                const shotCount = measurementShots ? measurementShots[state.binary] || 0 : Math.round(state.prob * totalShots);
                const measuredFreq = measurementShots ? (shotCount / totalShots) * 100 : state.prob * 100;
                const theoreticalFreq = state.prob * 100;

                return (
                  <div key={state.binary} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        |{state.binary}⟩
                      </span>
                      <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400">
                        <span>{shotCount} conteggi ({measuredFreq.toFixed(1)}%)</span>
                        <span className="text-[11px] text-slate-400">Teorico: {theoreticalFreq.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="h-6 w-full bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-lg"
                        style={{ width: `${Math.max(measuredFreq, 0.5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Presets & Algorithms */}
      {activeTab === 'presets' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Libreria Stati Noti, Entanglement & Circuiti Famosi
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Carica istantaneamente i circuiti fondamentali della computazione quantistica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => applyPreset('bell-phi-plus')}
              className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  Stato di Bell |Φ⁺⟩
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-semibold">
                  EPR Pair
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                (|00⟩ + |11⟩) / √2
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                H su q0 seguito da CNOT(0→1). Massima correlazione quantistica.
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('bell-psi-plus')}
              className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  Stato di Bell |Ψ⁺⟩
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-semibold">
                  Anti-correlato
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                (|01⟩ + |10⟩) / √2
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                X su q1, poi H su q0 e CNOT(0→1). Bit opposti con 50% ciascuno.
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('ghz')}
              className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  Stato GHZ a 3 Qubit
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-semibold">
                  Greenberger-Horne-Zeilinger
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                (|000⟩ + |111⟩) / √2
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Entanglement tripartito su 3 particelle.
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('superposition')}
              className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  Superposizione Uniforme
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">
                  H⊗H
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                (|00⟩ + |01⟩ + |10⟩ + |11⟩) / 2
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Tutti i 4 stati equiprobabili al 25% (fase iniziale algoritmi quantistici).
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('teleportation')}
              className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  Teletrasporto Quantistico
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                  Protocollo Completo
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                Alice (q0, q1) → Bob (q2)
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Trasferimento fedele dello stato del qubit senza violare il teorema di non-clonazione.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Section History */}
      <SectionHistoryTape
        calculatorId="quantum-lab"
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

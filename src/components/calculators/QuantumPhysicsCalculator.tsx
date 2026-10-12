import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Info,
  HelpCircle,
  Atom,
  Layers,
  Activity,
  Zap,
  Bookmark,
  Share2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface QuantumPhysicsCalculatorProps {
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

// Physical Constants (CODATA / NIST)
const H_PLANCK = 6.62607015e-34; // J*s
const H_BAR = 1.054571817e-34; // J*s
const C_LIGHT = 299792458; // m/s
const EV_TO_JOULE = 1.602176634e-19;
const M_ELECTRON = 9.1093837015e-31; // kg
const M_PROTON = 1.67262192369e-27; // kg
const M_NEUTRON = 1.67492749804e-27; // kg
const BOHR_RADIUS = 5.29177210903e-11; // m

export const QuantumPhysicsCalculator: React.FC<QuantumPhysicsCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'debroglie' | 'heisenberg' | 'photon' | 'tunneling' | 'box' | 'constants'>('debroglie');

  // De Broglie inputs
  const [particleType, setParticleType] = useState<'electron' | 'proton' | 'neutron' | 'custom'>('electron');
  const [customMassKg, setCustomMassKg] = useState<string>('9.109e-31');
  const [deBroglieMode, setDeBroglieMode] = useState<'velocity' | 'energy'>('velocity');
  const [velocityMps, setVelocityMps] = useState<string>('1000000'); // 1e6 m/s
  const [energyEv, setEnergyEv] = useState<string>('100'); // 100 eV

  // Heisenberg inputs
  const [deltaXNm, setDeltaXNm] = useState<string>('0.1'); // 0.1 nm (atomic scale)
  const [deltaTNs, setDeltaTNs] = useState<string>('10'); // 10 ns (excited state lifetime)

  // Photon inputs
  const [photonWavelengthNm, setPhotonWavelengthNm] = useState<string>('532'); // 532 nm (green laser)
  const [laserPowerMw, setLaserPowerMw] = useState<string>('5'); // 5 mW

  // Tunneling inputs
  const [barrierV0Ev, setBarrierV0Ev] = useState<string>('5'); // 5 eV
  const [particleEnergyEv, setParticleEnergyEv] = useState<string>('3'); // 3 eV (< V0)
  const [barrierWidthNm, setBarrierWidthNm] = useState<string>('0.5'); // 0.5 nm width

  // Particle in a box inputs
  const [boxLengthNm, setBoxLengthNm] = useState<string>('1.0'); // 1 nm
  const [boxLevelN, setBoxLevelN] = useState<number>(1);

  // Active particle mass
  const currentMass = useMemo(() => {
    if (particleType === 'electron') return M_ELECTRON;
    if (particleType === 'proton') return M_PROTON;
    if (particleType === 'neutron') return M_NEUTRON;
    const parsed = parseFloat(customMassKg.replace(',', '.'));
    return isNaN(parsed) || parsed <= 0 ? M_ELECTRON : parsed;
  }, [particleType, customMassKg]);

  // 1. De Broglie Calculation
  const deBroglieResult = useMemo(() => {
    let v = 0;
    const m = currentMass;

    if (deBroglieMode === 'velocity') {
      v = parseFloat(velocityMps.replace(',', '.')) || 0;
    } else {
      const eJoule = (parseFloat(energyEv.replace(',', '.')) || 0) * EV_TO_JOULE;
      // Relativistic velocity from kinetic energy: Ek = (gamma - 1) m c^2
      // gamma = 1 + Ek / (m c^2)
      const mc2 = m * C_LIGHT * C_LIGHT;
      const gammaVal = 1 + eJoule / mc2;
      const beta = Math.sqrt(Math.max(0, 1 - 1 / (gammaVal * gammaVal)));
      v = beta * C_LIGHT;
    }

    if (v <= 0 || v >= C_LIGHT) {
      return { error: 'La velocità deve essere positiva e strettamente inferiore a c (velocità della luce).' };
    }

    const beta = v / C_LIGHT;
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    const momentum = gamma * m * v; // Relativistic momentum
    const wavelengthM = H_PLANCK / momentum;
    const wavelengthNm = wavelengthM * 1e9;
    const wavelengthAngstrom = wavelengthM * 1e10;
    const kineticEnergyJ = (gamma - 1) * m * C_LIGHT * C_LIGHT;
    const kineticEnergyEv = kineticEnergyJ / EV_TO_JOULE;

    return {
      v,
      beta,
      gamma,
      momentum,
      wavelengthM,
      wavelengthNm,
      wavelengthAngstrom,
      kineticEnergyEv,
      ratioToBohr: wavelengthM / BOHR_RADIUS
    };
  }, [currentMass, deBroglieMode, velocityMps, energyEv]);

  // 2. Heisenberg Uncertainty Calculation
  const heisenbergResult = useMemo(() => {
    const deltaX = (parseFloat(deltaXNm.replace(',', '.')) || 0) * 1e-9;
    const deltaT = (parseFloat(deltaTNs.replace(',', '.')) || 0) * 1e-9;

    let deltaPMin = 0;
    let deltaVMin = 0;
    if (deltaX > 0) {
      deltaPMin = H_BAR / (2 * deltaX);
      deltaVMin = deltaPMin / currentMass;
    }

    let deltaEMinJ = 0;
    let deltaEMinEv = 0;
    let deltaNuMin = 0;
    if (deltaT > 0) {
      deltaEMinJ = H_BAR / (2 * deltaT);
      deltaEMinEv = deltaEMinJ / EV_TO_JOULE;
      deltaNuMin = 1 / (4 * Math.PI * deltaT);
    }

    return {
      deltaX,
      deltaPMin,
      deltaVMin,
      deltaT,
      deltaEMinJ,
      deltaEMinEv,
      deltaNuMin
    };
  }, [deltaXNm, deltaTNs, currentMass]);

  // 3. Photon & Planck Calculations
  const photonResult = useMemo(() => {
    const lambdaM = (parseFloat(photonWavelengthNm.replace(',', '.')) || 0) * 1e-9;
    const powerW = (parseFloat(laserPowerMw.replace(',', '.')) || 0) * 1e-3;

    if (lambdaM <= 0) return null;

    const frequencyHz = C_LIGHT / lambdaM;
    const energyJ = H_PLANCK * frequencyHz;
    const energyEv = energyJ / EV_TO_JOULE;
    const momentum = energyJ / C_LIGHT;
    const photonsPerSec = energyJ > 0 && powerW > 0 ? powerW / energyJ : 0;

    // Spectral category
    let band = 'Infrarosso';
    let colorHex = '#ef4444';
    if (lambdaM < 0.01e-9) { band = 'Raggi Gamma (γ)'; colorHex = '#6366f1'; }
    else if (lambdaM < 10e-9) { band = 'Raggi X'; colorHex = '#8b5cf6'; }
    else if (lambdaM < 380e-9) { band = 'Ultravioletto (UV)'; colorHex = '#a855f7'; }
    else if (lambdaM <= 450e-9) { band = 'Visibile (Violetto / Blu)'; colorHex = '#3b82f6'; }
    else if (lambdaM <= 495e-9) { band = 'Visibile (Ciano)'; colorHex = '#06b6d4'; }
    else if (lambdaM <= 570e-9) { band = 'Visibile (Verde)'; colorHex = '#10b981'; }
    else if (lambdaM <= 590e-9) { band = 'Visibile (Giallo)'; colorHex = '#eab308'; }
    else if (lambdaM <= 620e-9) { band = 'Visibile (Arancione)'; colorHex = '#f97316'; }
    else if (lambdaM <= 750e-9) { band = 'Visibile (Rosso)'; colorHex = '#ef4444'; }
    else if (lambdaM <= 1e-3) { band = 'Infrarosso (IR)'; colorHex = '#b91c1c'; }
    else if (lambdaM <= 1) { band = 'Microonde'; colorHex = '#64748b'; }
    else { band = 'Onde Radio'; colorHex = '#475569'; }

    return {
      lambdaM,
      frequencyHz,
      energyJ,
      energyEv,
      momentum,
      photonsPerSec,
      band,
      colorHex
    };
  }, [photonWavelengthNm, laserPowerMw]);

  // 4. Quantum Tunneling Calculation
  const tunnelingResult = useMemo(() => {
    const v0 = parseFloat(barrierV0Ev.replace(',', '.')) || 0;
    const e = parseFloat(particleEnergyEv.replace(',', '.')) || 0;
    const a = (parseFloat(barrierWidthNm.replace(',', '.')) || 0) * 1e-9;
    const m = currentMass;

    if (v0 <= 0 || e <= 0 || a <= 0) return null;
    if (e >= v0) {
      return { warning: 'L\'energia del corpuscolo supera l\'altezza della barriera (regime classico sopra-barriera).' };
    }

    const diffJ = (v0 - e) * EV_TO_JOULE;
    const kappa = Math.sqrt(2 * m * diffJ) / H_BAR; // Decay constant (1/m)
    const sinhVal = Math.sinh(kappa * a);
    const denom = 1 + ((v0 * v0) / (4 * e * (v0 - e))) * (sinhVal * sinhVal);
    const transmission = 1 / denom;
    const reflection = 1 - transmission;

    return {
      kappa,
      transmission,
      reflection,
      transmissionPercent: (transmission * 100).toExponential(4),
      decayLengthNm: (1 / kappa) * 1e9
    };
  }, [barrierV0Ev, particleEnergyEv, barrierWidthNm, currentMass]);

  // 5. 1D Particle in a Box
  const boxResult = useMemo(() => {
    const L = (parseFloat(boxLengthNm.replace(',', '.')) || 0) * 1e-9;
    const m = currentMass;
    if (L <= 0) return null;

    // E_n = n^2 * h^2 / (8 * m * L^2)
    const baseEnergyJ = (H_PLANCK * H_PLANCK) / (8 * m * L * L);
    const levels = [1, 2, 3, 4, 5].map((n) => {
      const eJ = n * n * baseEnergyJ;
      const eEv = eJ / EV_TO_JOULE;
      return { n, eJ, eEv };
    });

    const currentE = levels.find((l) => l.n === boxLevelN) || levels[0];

    // Transition from n to n-1 if n > 1
    let transitionPhotonNm = 0;
    if (boxLevelN > 1) {
      const lowerE = levels.find((l) => l.n === boxLevelN - 1);
      if (lowerE) {
        const deltaJ = currentE.eJ - lowerE.eJ;
        if (deltaJ > 0) {
          transitionPhotonNm = ((H_PLANCK * C_LIGHT) / deltaJ) * 1e9;
        }
      }
    }

    return {
      levels,
      currentE,
      transitionPhotonNm
    };
  }, [boxLengthNm, currentMass, boxLevelN]);

  // Save to history
  const handleSaveToHistory = () => {
    if (activeTab === 'debroglie' && deBroglieResult && !('error' in deBroglieResult)) {
      onSaveHistory({
        calculatorId: 'quantum-physics',
        calculatorTitle: 'Fisica Quantistica: De Broglie',
        summary: `v = ${deBroglieResult.v.toExponential(3)} m/s ➔ λ = ${deBroglieResult.wavelengthNm.toFixed(4)} nm`,
        formula: 'λ = h / p = h / (γ m v)',
        details: [
          { label: 'Particella', value: particleType },
          { label: 'Energia cinetica', value: `${deBroglieResult.kineticEnergyEv.toFixed(2)} eV` },
          { label: 'Fattore Lorentz γ', value: `${deBroglieResult.gamma.toFixed(5)}` },
          { label: 'Rapporto raggio di Bohr (a₀)', value: `${deBroglieResult.ratioToBohr.toFixed(3)}` }
        ]
      });
      showToast('Calcolo De Broglie salvato!');
    } else if (activeTab === 'photon' && photonResult) {
      onSaveHistory({
        calculatorId: 'quantum-physics',
        calculatorTitle: 'Fisica Quantistica: Fotone Planck',
        summary: `λ = ${photonWavelengthNm} nm ➔ E = ${photonResult.energyEv.toFixed(3)} eV`,
        formula: 'E = hν = hc / λ',
        details: [
          { label: 'Frequenza', value: `${(photonResult.frequencyHz / 1e12).toFixed(2)} THz` },
          { label: 'Banda spettrale', value: photonResult.band },
          { label: 'Fotoni/sec (a potenza data)', value: `${photonResult.photonsPerSec.toExponential(3)} fotoni/s` }
        ]
      });
      showToast('Calcolo fotone salvato!');
    } else if (activeTab === 'tunneling' && tunnelingResult && !('warning' in tunnelingResult)) {
      onSaveHistory({
        calculatorId: 'quantum-physics',
        calculatorTitle: 'Fisica Quantistica: Effetto Tunnel',
        summary: `V₀ = ${barrierV0Ev} eV, E = ${particleEnergyEv} eV ➔ T = ${tunnelingResult.transmission.toExponential(3)}`,
        formula: 'T ≈ exp(-2κL), κ = √(2m(V₀-E))/ℏ',
        details: [
          { label: 'Costante decadimento κ', value: `${tunnelingResult.kappa.toExponential(3)} m⁻¹` },
          { label: 'Lunghezza attenuazione', value: `${tunnelingResult.decayLengthNm.toFixed(3)} nm` }
        ]
      });
      showToast('Calcolo effetto tunnel salvato!');
    }
  };

  const sectionHistory = history.filter((h) => h.calculatorId === 'quantum-physics');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-cyan-950 border border-cyan-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 border border-cyan-400/30 rounded-xl text-cyan-400">
              <Atom className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Fisica & Meccanica Quantistica</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Planck & Schrödinger Studio
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
                De Broglie, principio di indeterminazione Heisenberg, quantizzazione fotonica, barriera a effetto tunnel e buca 1D.
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
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salva Risultato</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submodule Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'debroglie', label: 'Lunghezza d\'Onda De Broglie' },
          { id: 'heisenberg', label: 'Indeterminazione Heisenberg' },
          { id: 'photon', label: 'Fotoni & Legge di Planck' },
          { id: 'tunneling', label: 'Effetto Tunnel Quantistico' },
          { id: 'box', label: 'Buca di Potenziale 1D' },
          { id: 'constants', label: 'Costanti NIST' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: De Broglie */}
      {activeTab === 'debroglie' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Parametri Particella & Cinematica
            </h3>

            {/* Particle Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Tipo di Particella:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['electron', 'proton', 'neutron', 'custom'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setParticleType(p)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      particleType === p
                        ? 'bg-cyan-500 text-white border-cyan-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {p === 'electron' ? 'Elettrone' : p === 'proton' ? 'Protone' : p === 'neutron' ? 'Neutrone' : 'Personalizzata'}
                  </button>
                ))}
              </div>
            </div>

            {particleType === 'custom' && (
              <CalcInput
                label="Massa Particella (kg)"
                value={customMassKg}
                onChange={setCustomMassKg}
                placeholder="es. 1.67e-27"
              />
            )}

            {/* Input Mode */}
            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Input tramite:
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeBroglieMode('velocity')}
                  className={`px-3 py-1 rounded-lg ${deBroglieMode === 'velocity' ? 'bg-white dark:bg-zinc-700 shadow-xs text-cyan-600 dark:text-cyan-400' : 'text-slate-600'}`}
                >
                  Velocità (m/s)
                </button>
                <button
                  type="button"
                  onClick={() => setDeBroglieMode('energy')}
                  className={`px-3 py-1 rounded-lg ${deBroglieMode === 'energy' ? 'bg-white dark:bg-zinc-700 shadow-xs text-cyan-600 dark:text-cyan-400' : 'text-slate-600'}`}
                >
                  Energia Cinetica (eV)
                </button>
              </div>
            </div>

            {deBroglieMode === 'velocity' ? (
              <CalcInput
                label="Velocità v (m/s)"
                value={velocityMps}
                onChange={setVelocityMps}
                suffix="m/s"
                helperText="Fino a ~300.000.000 m/s (c)"
              />
            ) : (
              <CalcInput
                label="Energia Cinetica (eV)"
                value={energyEv}
                onChange={setEnergyEv}
                suffix="eV"
                helperText="1 eV = 1.602 × 10⁻¹⁹ J"
              />
            )}
          </div>

          {/* Results Box */}
          <div className="lg:col-span-6 space-y-4">
            {deBroglieResult && !('error' in deBroglieResult) ? (
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                    Lunghezza d'Onda De Broglie λ = h / p
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    β = v/c = {(deBroglieResult.beta * 100).toFixed(3)}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-cyan-300">
                    {deBroglieResult.wavelengthNm < 0.001
                      ? `${(deBroglieResult.wavelengthM * 1e12).toFixed(4)} pm`
                      : `${deBroglieResult.wavelengthNm.toFixed(4)} nm`}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    = {deBroglieResult.wavelengthAngstrom.toFixed(4)} Ångström (Å) = {deBroglieResult.wavelengthM.toExponential(4)} m
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Quantità di Moto (p):</span>
                    <span className="font-bold text-white">{deBroglieResult.momentum.toExponential(4)} kg·m/s</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Fattore Relativistico (γ):</span>
                    <span className="font-bold text-white">{deBroglieResult.gamma.toFixed(6)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Energia Cinetica:</span>
                    <span className="font-bold text-white">{deBroglieResult.kineticEnergyEv.toFixed(2)} eV</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Rapporto raggio di Bohr:</span>
                    <span className="font-bold text-cyan-400">{deBroglieResult.ratioToBohr.toFixed(3)} × a₀</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200">
                  💡 <strong>Applicazione:</strong> Se la lunghezza d'onda λ è confrontabile con il reticolo cristallino (~0.1-0.3 nm), si verifica <em>diffrazione di elettroni (esperimento Davisson-Germer)</em>, principio alla base del microscopio elettronico a trasmissione (TEM).
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                {(deBroglieResult as any)?.error || 'Inserisci parametri validi.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Heisenberg */}
      {activeTab === 'heisenberg' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Incertezza di Posizione & Tempo
            </h3>

            <CalcInput
              label="Incertezza sulla Posizione Δx (nm)"
              value={deltaXNm}
              onChange={setDeltaXNm}
              suffix="nm"
              helperText="Tipico diametro atomico: ~0.1 nm"
            />

            <CalcInput
              label="Incertezza sul Tempo / Vita Media Δt (ns)"
              value={deltaTNs}
              onChange={setDeltaTNs}
              suffix="ns"
              helperText="Tempo di vita stato atomico eccitato (~10 ns)"
            />
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 border-b border-cyan-500/20 pb-2">
              Limiti Inferiori di Indeterminazione (Δx Δp ≥ ℏ/2)
            </h4>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Minima Incertezza sulla Quantità di Moto (Δp):</span>
                <div className="text-xl font-mono font-bold text-cyan-300">
                  ≥ {heisenbergResult.deltaPMin.toExponential(4)} kg·m/s
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  Incertezza minima sulla velocità (Δv = Δp/m):{' '}
                  <strong className="text-white">{heisenbergResult.deltaVMin.toExponential(3)} m/s</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Incertezza sull'Energia (ΔE Δt ≥ ℏ/2):</span>
                <div className="text-xl font-mono font-bold text-purple-300">
                  ≥ {heisenbergResult.deltaEMinEv.toExponential(4)} eV
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  Larghezza naturale di riga spettroscopica (Δν):{' '}
                  <strong className="text-white">{(heisenbergResult.deltaNuMin / 1e6).toFixed(2)} MHz</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Photon */}
      {activeTab === 'photon' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Parametri della Radiazione Elettromagnetica
            </h3>

            <CalcInput
              label="Lunghezza d'onda λ (nm)"
              value={photonWavelengthNm}
              onChange={setPhotonWavelengthNm}
              suffix="nm"
              helperText="Es. 532 nm (Verde laser), 633 nm (He-Ne), 1064 nm (Nd:YAG)"
            />

            <CalcInput
              label="Potenza Sorgente Laser (mW)"
              value={laserPowerMw}
              onChange={setLaserPowerMw}
              suffix="mW"
              helperText="Per il calcolo del flusso di quanti emessi"
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            {photonResult && (
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                    Energia del Singolo Fotone (E = hν = hc/λ)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: photonResult.colorHex }} />
                    <span className="text-xs font-bold text-white font-mono">{photonResult.band}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-emerald-400">
                    {photonResult.energyEv.toFixed(3)} eV
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    = {photonResult.energyJ.toExponential(4)} Joule
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Frequenza Ottica (ν):</span>
                    <span className="font-bold text-white">{(photonResult.frequencyHz / 1e12).toFixed(2)} THz</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Momento Fotone (p=E/c):</span>
                    <span className="font-bold text-white">{photonResult.momentum.toExponential(4)} N·s</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2">
                    <span className="text-slate-400 block mb-1">Flusso Fotoni al Secondo ({laserPowerMw} mW):</span>
                    <span className="font-bold text-cyan-300 text-sm">
                      {photonResult.photonsPerSec.toExponential(4)} fotoni / secondo
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Quantum Tunneling */}
      {activeTab === 'tunneling' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Barriera di Potenziale Rettangolare
            </h3>

            <CalcInput
              label="Altezza Barriera V₀ (eV)"
              value={barrierV0Ev}
              onChange={setBarrierV0Ev}
              suffix="eV"
            />

            <CalcInput
              label="Energia Incidente della Particella E (eV)"
              value={particleEnergyEv}
              onChange={setParticleEnergyEv}
              suffix="eV"
              helperText="E deve essere < V₀ per tunneling puro"
            />

            <CalcInput
              label="Spessore della Barriera L (nm)"
              value={barrierWidthNm}
              onChange={setBarrierWidthNm}
              suffix="nm"
              helperText="Es. 0.5 nm (barriera dielettrica / giunzione tunnel)"
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            {tunnelingResult && !('warning' in tunnelingResult) ? (
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                    Coefficiente di Trasmissione Tunnel (T)
                  </span>
                  <span className="text-xs font-mono text-purple-300">
                    Decadimento evanescente
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                    T = {tunnelingResult.transmission.toExponential(4)}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Probabilità di attraversamento: {tunnelingResult.transmissionPercent}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Vettore d'Onda di Decadimento (κ):</span>
                    <span className="font-bold text-white">{tunnelingResult.kappa.toExponential(3)} m⁻¹</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Lunghezza Caratteristica (1/κ):</span>
                    <span className="font-bold text-white">{tunnelingResult.decayLengthNm.toFixed(3)} nm</span>
                  </div>
                </div>

                {/* Tunneling Wave SVG diagram */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                  <svg viewBox="0 0 280 90" className="w-full max-w-[280px]">
                    {/* Potential barrier rect */}
                    <rect x="110" y="20" width="60" height="60" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="140" y="55" fill="#fca5a5" fontSize="10" textAnchor="middle" fontFamily="monospace">V₀ ({barrierV0Ev} eV)</text>

                    {/* Incident & reflected wave */}
                    <path d="M 10 50 Q 25 30 40 50 T 70 50 T 100 50 T 110 50" fill="none" stroke="#38bdf8" strokeWidth="2" />
                    
                    {/* Decaying wave inside barrier */}
                    <path d="M 110 50 Q 130 55 170 65" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,2" />

                    {/* Attenuated transmitted wave */}
                    <path d="M 170 65 Q 185 60 200 65 T 230 65 T 260 65" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">
                    Incidente (blu) → Decadimento esponenziale (arancio) → Trasmessa (verde)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                {(tunnelingResult as any)?.warning || 'Parametri non validi.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Particle in a 1D Box */}
      {activeTab === 'box' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Buca Infinita di Potenziale 1D
            </h3>

            <CalcInput
              label="Larghezza della Buca L (nm)"
              value={boxLengthNm}
              onChange={setBoxLengthNm}
              suffix="nm"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Numero Quantico Principale n (1-5):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setBoxLevelN(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      boxLevelN === lvl
                        ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    n = {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {boxResult && (
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                    Livelli Energetici Quantizzati: Eₙ = n²h² / (8mL²)
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Stato n = {boxLevelN}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                  {boxResult.levels.map((lvl) => (
                    <div
                      key={lvl.n}
                      onClick={() => setBoxLevelN(lvl.n)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        lvl.n === boxLevelN
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">n = {lvl.n}</div>
                      <div className="text-[11px] mt-1">{lvl.eEv.toFixed(2)} eV</div>
                    </div>
                  ))}
                </div>

                {boxResult.transitionPhotonNm > 0 && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs font-mono text-purple-200 flex items-center justify-between">
                    <span>Emissione fotone per transizione n={boxLevelN} → n={boxLevelN - 1}:</span>
                    <strong className="text-white text-sm">λ = {boxResult.transitionPhotonNm.toFixed(2)} nm</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Fundamental NIST Constants Table */}
      {activeTab === 'constants' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Atom className="w-5 h-5 text-cyan-500" />
                Costanti Fondamentali della Fisica Quantistica (NIST / CODATA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Valori di precisione raccomandati a livello internazionale. Clicca per copiare.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { symbol: 'h', name: 'Costante di Planck', val: '6.62607015 × 10⁻³⁴ J·s' },
              { symbol: 'ℏ', name: 'Costante di Planck ridotta (h/2π)', val: '1.054571817 × 10⁻³⁴ J·s' },
              { symbol: 'c', name: 'Velocità della luce nel vuoto', val: '299 792 458 m/s' },
              { symbol: 'mₑ', name: 'Massa a riposo dell\'elettrone', val: '9.1093837015 × 10⁻³¹ kg' },
              { symbol: 'mₚ', name: 'Massa a riposo del protone', val: '1.67262192369 × 10⁻²⁷ kg' },
              { symbol: 'e', name: 'Carica elettrica elementare', val: '1.602176634 × 10⁻¹⁹ C' },
              { symbol: 'a₀', name: 'Raggio di Bohr', val: '5.29177210903 × 10⁻¹¹ m' },
              { symbol: 'α', name: 'Costante di struttura fine', val: '7.2973525693 × 10⁻³ (≈ 1/137)' },
              { symbol: 'R_∞', name: 'Costante di Rydberg', val: '1.0973731568 × 10⁷ m⁻¹' }
            ].map((c) => (
              <div
                key={c.symbol}
                onClick={() => {
                  navigator.clipboard.writeText(c.val);
                  showToast(`${c.name} copiata!`);
                }}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-cyan-500 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-cyan-600 dark:text-cyan-400">{c.symbol}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{c.name}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-1">{c.val}</div>
                </div>
                <Copy className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History section */}
      <SectionHistoryTape
        calculatorId="quantum-physics"
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

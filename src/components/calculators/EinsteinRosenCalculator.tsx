import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Infinity as InfinityIcon,
  Compass,
  Layers,
  Activity,
  Bookmark,
  Share2,
  Info,
  Clock,
  Radio,
  Globe,
  ArrowRight,
  Zap,
  Play,
  Pause,
  Star
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface EinsteinRosenCalculatorProps {
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

const C_LIGHT = 299792458; // m/s
const G_CONST = 6.67430e-11; // m^3 / (kg * s^2)
const LIGHT_YEAR_METERS = 9.4607304725808e15; // meters in 1 ly

export const EinsteinRosenCalculator: React.FC<EinsteinRosenCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'wormhole' | 'timedilation' | 'length' | 'velocityadd' | 'energy'>('wormhole');

  // Wormhole parameters
  const [throatRadiusKm, setThroatRadiusKm] = useState<string>('100'); // 100 km throat
  const [externalDistLy, setExternalDistLy] = useState<string>('4.24'); // 4.24 ly (Proxima Centauri)
  const [throatLengthKm, setThroatLengthKm] = useState<string>('1000'); // 1,000 km internal tunnel
  const [traversalSpeedFractionC, setTraversalSpeedFractionC] = useState<string>('0.1'); // 0.1c

  // Time Dilation & Lorentz inputs
  const [vFractionC, setVFractionC] = useState<string>('0.95'); // 0.95c
  const [restTimeYears, setRestTimeYears] = useState<string>('10'); // 10 Earth years

  // Length Contraction
  const [properLengthM, setProperLengthM] = useState<string>('100'); // 100 m spaceship
  const [lengthSpeedFractionC, setLengthSpeedFractionC] = useState<string>('0.9');

  // Velocity Addition
  const [v1C, setV1C] = useState<string>('0.75');
  const [v2C, setV2C] = useState<string>('0.85');

  // Mass-Energy Equivalence
  const [restMassKg, setRestMassKg] = useState<string>('1.0');
  const [energySpeedC, setEnergySpeedC] = useState<string>('0.8');

  // 1. Einstein-Rosen Wormhole Calculations
  const wormholeResult = useMemo(() => {
    const r0Meters = (parseFloat(throatRadiusKm.replace(',', '.')) || 0) * 1000;
    const dExtMeters = (parseFloat(externalDistLy.replace(',', '.')) || 0) * LIGHT_YEAR_METERS;
    const lTunnelMeters = (parseFloat(throatLengthKm.replace(',', '.')) || 0) * 1000;
    const beta = parseFloat(traversalSpeedFractionC.replace(',', '.')) || 0.1;

    if (r0Meters <= 0 || lTunnelMeters <= 0 || beta <= 0 || beta >= 1) return null;

    // Equivalent mass of throat if Schwarzschild: r_0 = 2GM / c^2 => M = r_0 * c^2 / (2G)
    const massEquivalentKg = (r0Meters * C_LIGHT * C_LIGHT) / (2 * G_CONST);

    // Throat tension (force/area required, negative surface tension for exotic matter):
    // tau_0 = c^4 / (8 * pi * G * r0^2)
    const throatTensionPa = Math.pow(C_LIGHT, 4) / (8 * Math.PI * G_CONST * Math.pow(r0Meters, 2));

    // Traversal speed (m/s)
    const speedMps = beta * C_LIGHT;
    // Proper traversal time through tunnel for travelers
    const properTimeSec = lTunnelMeters / speedMps;
    const properTimeHours = properTimeSec / 3600;
    const properTimeDays = properTimeSec / 86400;

    // Normal flat spacetime travel time at speed of light:
    const flatTimeSec = dExtMeters / C_LIGHT;
    const flatTimeYears = flatTimeSec / (86400 * 365.25);

    // Hyperspace Shortcut Factor: S = D_ext / L_tunnel
    const shortcutFactor = dExtMeters / lTunnelMeters;

    // Apparent superluminal speed factor: v_apparent / c = (D_ext / properTimeSec) / c
    const apparentSuperluminalFactor = (dExtMeters / properTimeSec) / C_LIGHT;

    return {
      r0Meters,
      massEquivalentKg,
      throatTensionPa,
      properTimeSec,
      properTimeHours,
      properTimeDays,
      flatTimeYears,
      shortcutFactor,
      apparentSuperluminalFactor
    };
  }, [throatRadiusKm, externalDistLy, throatLengthKm, traversalSpeedFractionC]);

  // 2. Kinematic Time Dilation
  const dilationResult = useMemo(() => {
    const beta = parseFloat(vFractionC.replace(',', '.')) || 0;
    const t0Years = parseFloat(restTimeYears.replace(',', '.')) || 0;

    if (beta < 0 || beta >= 1 || t0Years <= 0) return null;

    // Lorentz factor gamma = 1 / sqrt(1 - beta^2)
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    // Traveler experienced time: tau = t0 / gamma
    const travelerYears = t0Years / gamma;
    const timeSavedYears = t0Years - travelerYears;

    return {
      beta,
      gamma,
      travelerYears,
      timeSavedYears,
      speedKms: (beta * C_LIGHT) / 1000
    };
  }, [vFractionC, restTimeYears]);

  // 3. Length Contraction
  const lengthResult = useMemo(() => {
    const l0 = parseFloat(properLengthM.replace(',', '.')) || 0;
    const beta = parseFloat(lengthSpeedFractionC.replace(',', '.')) || 0;

    if (l0 <= 0 || beta < 0 || beta >= 1) return null;

    const gamma = 1 / Math.sqrt(1 - beta * beta);
    const contractedL = l0 / gamma;
    const contractionPercent = ((l0 - contractedL) / l0) * 100;

    return {
      l0,
      contractedL,
      gamma,
      contractionPercent
    };
  }, [properLengthM, lengthSpeedFractionC]);

  // 4. Relativistic Velocity Addition
  const velocityResult = useMemo(() => {
    const u = parseFloat(v1C.replace(',', '.')) || 0;
    const v = parseFloat(v2C.replace(',', '.')) || 0;

    if (Math.abs(u) > 1 || Math.abs(v) > 1) return null;

    // w = (u + v) / (1 + u*v)
    const w = (u + v) / (1 + u * v);
    const classicW = u + v;

    return {
      w,
      classicW,
      diffPercent: Math.abs(classicW - w) * 100
    };
  }, [v1C, v2C]);

  // 5. Mass-Energy Equivalence
  const energyResult = useMemo(() => {
    const m0 = parseFloat(restMassKg.replace(',', '.')) || 0;
    const beta = parseFloat(energySpeedC.replace(',', '.')) || 0;

    if (m0 <= 0 || beta < 0 || beta >= 1) return null;

    const gamma = 1 / Math.sqrt(1 - beta * beta);
    const restEnergyJ = m0 * C_LIGHT * C_LIGHT;
    const totalEnergyJ = gamma * restEnergyJ;
    const kineticEnergyJ = (gamma - 1) * restEnergyJ;
    const momentumKgmps = gamma * m0 * beta * C_LIGHT;

    // TNT equivalent (1 ton TNT = 4.184e9 J)
    const tonsTNT = totalEnergyJ / 4.184e9;

    return {
      gamma,
      restEnergyJ,
      totalEnergyJ,
      kineticEnergyJ,
      momentumKgmps,
      tonsTNT
    };
  }, [restMassKg, energySpeedC]);

  // Save to history
  const handleSaveToHistory = () => {
    if (activeTab === 'wormhole' && wormholeResult) {
      onSaveHistory({
        calculatorId: 'einstein-rosen',
        calculatorTitle: 'Ponte di Einstein-Rosen (Wormhole)',
        summary: `Gola r₀ = ${throatRadiusKm} km, Distanza: ${externalDistLy} a.l. ➔ Traversata: ${wormholeResult.properTimeHours < 24 ? `${wormholeResult.properTimeHours.toFixed(1)} ore` : `${wormholeResult.properTimeDays.toFixed(1)} giorni`}`,
        formula: 'ds² = -c²dt² + dl² + (r₀² + l²)(dθ² + sin²θ dφ²)',
        details: [
          { label: 'Raggio della gola r₀', value: `${throatRadiusKm} km` },
          { label: 'Distanza esterna nello spaziotempo', value: `${externalDistLy} Anni Luce` },
          { label: 'Fattore di scorciatoia iperspaziale', value: `${wormholeResult.shortcutFactor.toExponential(3)}x` },
          { label: 'Massa equivalente del ponte', value: `${wormholeResult.massEquivalentKg.toExponential(3)} kg` },
          { label: 'Tensione negativa richiesta', value: `${wormholeResult.throatTensionPa.toExponential(3)} N/m²` }
        ]
      });
      showToast('Calcolo Wormhole salvato nella cronologia!');
    } else if (activeTab === 'timedilation' && dilationResult) {
      onSaveHistory({
        calculatorId: 'einstein-rosen',
        calculatorTitle: 'Relatività: Dilatazione Temporale',
        summary: `v = ${vFractionC}c, Terra: ${restTimeYears} anni ➔ Viaggiatore: ${dilationResult.travelerYears.toFixed(2)} anni`,
        formula: 'Δt = γ Δt₀ = Δt₀ / √(1 - v²/c²)',
        details: [
          { label: 'Fattore Lorentz γ', value: `${dilationResult.gamma.toFixed(4)}` },
          { label: 'Tempo vissuto dall\'astronauta', value: `${dilationResult.travelerYears.toFixed(2)} anni` },
          { label: 'Anni risparmiati (paradosso gemelli)', value: `${dilationResult.timeSavedYears.toFixed(2)} anni` }
        ]
      });
      showToast('Calcolo dilatazione temporale salvato!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border border-violet-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/20 border border-violet-400/30 rounded-xl text-violet-400">
              <InfinityIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ponte di Einstein-Rosen & Relatività</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  Wormhole & Relatività Speciale
                </span>
              </div>
              <p className="text-xs sm:text-sm text-violet-200/80 mt-1">
                Geometria della gola del wormhole di Schwarzschild/Morris-Thorne, materia esotica, dilatazione temporale, contrazione e composizione delle velocità.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`min-w-[38px] h-[38px] p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-sm'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
                title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti ⭐'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="h-[38px] px-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salva Calcolo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Ribbon */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 overflow-x-auto no-scrollbar">
        {[
          { id: 'wormhole', label: 'Ponte di Einstein-Rosen (Wormhole)' },
          { id: 'timedilation', label: 'Dilatazione Temporale (Gemelli)' },
          { id: 'length', label: 'Contrazione di Lorentz' },
          { id: 'velocityadd', label: 'Somma Relativistica Velocità' },
          { id: 'energy', label: 'Massa-Energia E=mc²' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-700/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Wormhole */}
      {activeTab === 'wormhole' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Parametri Geometrici del Ponte
            </h3>

            <CalcInput
              label="Raggio della Gola r₀ (km)"
              value={throatRadiusKm}
              onChange={setThroatRadiusKm}
              suffix="km"
              helperText="Strettoia spaziotemporale del cunicolo"
            />

            <CalcInput
              label="Distanza Spaziotempo Esterno (Anni Luce)"
              value={externalDistLy}
              onChange={setExternalDistLy}
              suffix="a.l."
              helperText="Es. 4.24 a.l. per Proxima Centauri, 25.000 a.l. Centro Galattico"
            />

            <CalcInput
              label="Lunghezza Propria del Tunnel Interno (km)"
              value={throatLengthKm}
              onChange={setThroatLengthKm}
              suffix="km"
              helperText="Distanza reale che l'astronave deve percorrere"
            />

            <CalcInput
              label="Velocità di Traversata della Nave (frazione di c)"
              value={traversalSpeedFractionC}
              onChange={setTraversalSpeedFractionC}
              suffix="c"
              helperText="Es. 0.1c (30.000 km/s)"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {wormholeResult && (
              <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-violet-400">
                    Proprietà del Tunnel Spazio-Temporale
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Scorciatoia: {wormholeResult.shortcutFactor.toExponential(2)}x
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-violet-300">
                    {wormholeResult.properTimeHours < 24
                      ? `${wormholeResult.properTimeHours.toFixed(2)} ore`
                      : `${wormholeResult.properTimeDays.toFixed(1)} giorni`}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Tempo proprio a bordo per attraversare {externalDistLy} Anni Luce (contro {wormholeResult.flatTimeYears.toFixed(1)} anni nello spazio piatto esterno!)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Massa Equivalente Gola:</span>
                    <span className="font-bold text-white">{wormholeResult.massEquivalentKg.toExponential(3)} kg</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Tensione Esotica Necessaria:</span>
                    <span className="font-bold text-amber-300">{wormholeResult.throatTensionPa.toExponential(3)} N/m²</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2">
                    <span className="text-slate-400 block mb-1">Velocità Apparente Superluminale Efficace:</span>
                    <span className="font-bold text-violet-300 text-sm">
                      {wormholeResult.apparentSuperluminalFactor.toFixed(1)} × c (Senza violare la relatività locale!)
                    </span>
                  </div>
                </div>

                {/* SVG Visualizer of Flamm's Paraboloid embedding */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                  <svg viewBox="0 0 280 120" className="w-full max-w-[280px]">
                    {/* Top Universe sheet */}
                    <path d="M 10 20 Q 90 20 120 45" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                    <path d="M 160 45 Q 190 20 270 20" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                    <text x="30" y="16" fill="#a78bfa" fontSize="9" fontFamily="monospace">Universo Superiore</text>

                    {/* Wormhole throat connecting cylinder */}
                    <path d="M 120 45 C 130 55 130 65 120 75" fill="none" stroke="#ec4899" strokeWidth="2.5" />
                    <path d="M 160 45 C 150 55 150 65 160 75" fill="none" stroke="#ec4899" strokeWidth="2.5" />
                    <text x="140" y="63" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace">Gola r₀</text>

                    {/* Bottom Universe sheet */}
                    <path d="M 120 75 Q 90 100 10 100" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                    <path d="M 160 75 Q 190 100 270 100" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                    <text x="30" y="112" fill="#a78bfa" fontSize="9" fontFamily="monospace">Universo Inferiore</text>

                    {/* Moving photon/particle */}
                    <circle cx="140" cy="60" r="3" fill="#fbbf24" className="animate-ping" />
                  </svg>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">
                    Paraboloide di Flamm: cunicolo spazio-temporale con topologia a connessione multipla
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Kinematic Time Dilation */}
      {activeTab === 'timedilation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Velocità Relativistica & Tempo di Riferimento
            </h3>

            <CalcInput
              label="Velocità v (frazione di c)"
              value={vFractionC}
              onChange={setVFractionC}
              suffix="c"
              helperText="Es. 0.95c = 284.802 km/s"
            />

            <CalcInput
              label="Tempo Trascorso sulla Terra (Anni)"
              value={restTimeYears}
              onChange={setRestTimeYears}
              suffix="anni"
              helperText="Tempo per l'osservatore stazionario a terra"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {dilationResult && (
              <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-violet-400">
                    Fattore di Lorentz γ = 1 / √(1 - v²/c²)
                  </span>
                  <span className="text-xs font-mono text-purple-300 font-bold">
                    γ = {dilationResult.gamma.toFixed(4)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-emerald-400">
                    {dilationResult.travelerYears.toFixed(2)} Anni per il Viaggiatore
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Mentre sulla Terra trascorrono {restTimeYears} anni interi!
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Anni Risparmiati (Invecchiamento):</span>
                    <span className="font-bold text-amber-300">-{dilationResult.timeSavedYears.toFixed(2)} anni</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Velocità di Crociera:</span>
                    <span className="font-bold text-white">{dilationResult.speedKms.toLocaleString('it-IT')} km/s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Length Contraction */}
      {activeTab === 'length' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Contrazione di FitzGerald-Lorentz
            </h3>

            <CalcInput
              label="Lunghezza a Riposo L₀ (metri)"
              value={properLengthM}
              onChange={setProperLengthM}
              suffix="m"
            />

            <CalcInput
              label="Velocità Relativa v (frazione di c)"
              value={lengthSpeedFractionC}
              onChange={setLengthSpeedFractionC}
              suffix="c"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {lengthResult && (
              <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-violet-400">
                    Formula: L = L₀ / γ = L₀ √(1 - v²/c²)
                  </span>
                  <span className="text-xs font-mono text-amber-300">
                    Accorciamento: -{lengthResult.contractionPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-sky-400">
                    L = {lengthResult.contractedL.toFixed(2)} metri
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Lunghezza contratta misurata dall'osservatore esterno rispetto ai {properLengthM} m a riposo.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Velocity Addition */}
      {activeTab === 'velocityadd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Composizione Relativistica delle Velocità
            </h3>

            <CalcInput
              label="Velocità Primo Corpo u (frazione di c)"
              value={v1C}
              onChange={setV1C}
              suffix="c"
            />

            <CalcInput
              label="Velocità Secondo Corpo v (frazione di c)"
              value={v2C}
              onChange={setV2C}
              suffix="c"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {velocityResult && (
              <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-violet-400">
                    Formula di Einstein: w = (u + v) / (1 + uv/c²)
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Limite invalicabile: c
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-emerald-400">
                    w = {velocityResult.w.toFixed(5)} c
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    La somma classica newtoniana darebbe erroneamente {velocityResult.classicW.toFixed(2)} c (superluminale vietata).
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: E=mc2 */}
      {activeTab === 'energy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Equivalenza Massa-Energia E² = (pc)² + (m₀c²)²
            </h3>

            <CalcInput
              label="Massa a Riposo m₀ (kg)"
              value={restMassKg}
              onChange={setRestMassKg}
              suffix="kg"
            />

            <CalcInput
              label="Velocità Particella v (frazione di c)"
              value={energySpeedC}
              onChange={setEnergySpeedC}
              suffix="c"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {energyResult && (
              <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-violet-400">
                    Energia Totale Relativistica E = γ m₀ c²
                  </span>
                  <span className="text-xs font-mono text-amber-300">
                    γ = {energyResult.gamma.toFixed(4)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-amber-300">
                    {energyResult.totalEnergyJ.toExponential(4)} Joule
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Equivalente energetico: {(energyResult.tonsTNT / 1e6).toFixed(2)} Megatoni di TNT
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Energia a Riposo (E₀ = m₀c²):</span>
                    <span className="font-bold text-white">{energyResult.restEnergyJ.toExponential(3)} J</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Energia Cinetica (E_k = (γ-1)m₀c²):</span>
                    <span className="font-bold text-emerald-400">{energyResult.kineticEnergyJ.toExponential(3)} J</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      <SectionHistoryTape
        calculatorId="einstein-rosen"
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

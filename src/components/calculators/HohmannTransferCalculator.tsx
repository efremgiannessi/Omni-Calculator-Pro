import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Rocket,
  Compass,
  Layers,
  Activity,
  Bookmark,
  Share2,
  Info,
  Calendar,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface HohmannTransferCalculatorProps {
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

// Heliocentric Gravitational Parameter: GM_sun (km^3 / s^2)
const MU_SUN = 1.32712440018e11;
const AU_KM = 149597870.7; // 1 AU in km
const G0 = 9.80665; // m/s^2

interface PlanetData {
  id: string;
  name: string;
  radiusAU: number;
  radiusKm: number;
  orbitalPeriodDays: number;
  color: string;
}

const PLANETS: PlanetData[] = [
  { id: 'mercury', name: 'Mercurio', radiusAU: 0.387098, radiusKm: 57909050, orbitalPeriodDays: 87.97, color: '#94a3b8' },
  { id: 'venus', name: 'Venere', radiusAU: 0.723332, radiusKm: 108208000, orbitalPeriodDays: 224.70, color: '#f59e0b' },
  { id: 'earth', name: 'Terra', radiusAU: 1.000000, radiusKm: 149597870.7, orbitalPeriodDays: 365.256, color: '#38bdf8' },
  { id: 'mars', name: 'Marte', radiusAU: 1.523679, radiusKm: 227939200, orbitalPeriodDays: 686.98, color: '#ef4444' },
  { id: 'jupiter', name: 'Giove', radiusAU: 5.2044, radiusKm: 778570000, orbitalPeriodDays: 4332.59, color: '#fb923c' },
  { id: 'saturn', name: 'Saturno', radiusAU: 9.5826, radiusKm: 1433530000, orbitalPeriodDays: 10759.22, color: '#eab308' },
  { id: 'uranus', name: 'Urano', radiusAU: 19.2184, radiusKm: 2872460000, orbitalPeriodDays: 30685.4, color: '#2dd4bf' },
  { id: 'neptune', name: 'Nettuno', radiusAU: 30.0700, radiusKm: 4495060000, orbitalPeriodDays: 60189.0, color: '#3b82f6' }
];

export const HohmannTransferCalculator: React.FC<HohmannTransferCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [departureId, setDepartureId] = useState<string>('earth');
  const [arrivalId, setArrivalId] = useState<string>('mars');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customR1Km, setCustomR1Km] = useState<string>('149597870');
  const [customR2Km, setCustomR2Km] = useState<string>('227939200');

  // Rocket Propellant equation input
  const [ispSeconds, setIspSeconds] = useState<string>('380'); // e.g. Raptor LOX/CH4
  const [dryMassKg, setDryMassKg] = useState<string>('5000'); // 5 tons spacecraft

  // Animation / Visualizer progress (0 to 100%)
  const [flightProgress, setFlightProgress] = useState<number>(35);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Play/pause loop for trajectory
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setFlightProgress((p) => (p >= 100 ? 0 : p + 0.5));
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Radii
  const depPlanet = PLANETS.find((p) => p.id === departureId) || PLANETS[2];
  const arrPlanet = PLANETS.find((p) => p.id === arrivalId) || PLANETS[3];

  const r1 = isCustomMode ? (parseFloat(customR1Km.replace(',', '.')) || 149597870) : depPlanet.radiusKm;
  const r2 = isCustomMode ? (parseFloat(customR2Km.replace(',', '.')) || 227939200) : arrPlanet.radiusKm;

  // Transfer Orbit Calculations
  const transferData = useMemo(() => {
    if (r1 <= 0 || r2 <= 0 || r1 === r2) return null;

    // Semi-major axis of transfer ellipse (km)
    const aTransfer = (r1 + r2) / 2;

    // Eccentricity of transfer ellipse
    const eTransfer = Math.abs(r1 - r2) / (r1 + r2);

    // Time of flight (half an orbital period): t = pi * sqrt(a^3 / mu)
    const timeOfFlightSec = Math.PI * Math.sqrt(Math.pow(aTransfer, 3) / MU_SUN);
    const timeOfFlightDays = timeOfFlightSec / (24 * 3600);
    const timeOfFlightMonths = timeOfFlightDays / 30.4375;
    const timeOfFlightYears = timeOfFlightDays / 365.25;

    // Departure circular velocity (km/s)
    const v1Circular = Math.sqrt(MU_SUN / r1);
    // Departure transfer velocity at perihelion/aphelion (km/s)
    const v1Transfer = Math.sqrt(MU_SUN * (2 / r1 - 1 / aTransfer));
    // Delta-v 1 (departure burn) (km/s)
    const deltaV1 = Math.abs(v1Transfer - v1Circular);

    // Arrival circular velocity (km/s)
    const v2Circular = Math.sqrt(MU_SUN / r2);
    // Arrival transfer velocity (km/s)
    const v2Transfer = Math.sqrt(MU_SUN * (2 / r2 - 1 / aTransfer));
    // Delta-v 2 (insertion/capture burn) (km/s)
    const deltaV2 = Math.abs(v2Circular - v2Transfer);

    // Total mission Delta-V (km/s)
    const deltaVTotal = deltaV1 + deltaV2;

    // Planetary orbital periods in days
    const t1Days = 2 * Math.PI * Math.sqrt(Math.pow(r1, 3) / MU_SUN) / 86400;
    const t2Days = 2 * Math.PI * Math.sqrt(Math.pow(r2, 3) / MU_SUN) / 86400;

    // Synodic period (launch window interval)
    let synodicDays = 0;
    if (Math.abs(t1Days - t2Days) > 0.01) {
      synodicDays = Math.abs((t1Days * t2Days) / (t1Days - t2Days));
    }
    const synodicYears = synodicDays / 365.25;

    // Phase angle required at launch (lead angle in degrees)
    // theta = pi - omega_2 * t_flight
    const omega2 = (2 * Math.PI) / (t2Days * 86400); // rad/s
    const angleRad = Math.PI - omega2 * timeOfFlightSec;
    let angleDeg = (angleRad * (180 / Math.PI)) % 360;
    if (angleDeg < 0) angleDeg += 360;

    // Rocket Equation calculation
    const isp = parseFloat(ispSeconds.replace(',', '.')) || 380;
    const dryM = parseFloat(dryMassKg.replace(',', '.')) || 5000;
    // deltaV in m/s
    const dvMs = deltaVTotal * 1000;
    const massRatio = Math.exp(dvMs / (isp * G0));
    const totalMassKg = dryM * massRatio;
    const fuelMassKg = totalMassKg - dryM;
    const fuelFractionPercent = (fuelMassKg / totalMassKg) * 100;

    return {
      aTransfer,
      eTransfer,
      timeOfFlightDays,
      timeOfFlightMonths,
      timeOfFlightYears,
      v1Circular,
      v1Transfer,
      deltaV1,
      v2Circular,
      v2Transfer,
      deltaV2,
      deltaVTotal,
      synodicDays,
      synodicYears,
      angleDeg,
      massRatio,
      totalMassKg,
      fuelMassKg,
      fuelFractionPercent
    };
  }, [r1, r2, ispSeconds, dryMassKg]);

  // Save to History
  const handleSaveToHistory = () => {
    if (!transferData) return;
    const depName = isCustomMode ? `${(r1 / 1e6).toFixed(1)}M km` : depPlanet.name;
    const arrName = isCustomMode ? `${(r2 / 1e6).toFixed(1)}M km` : arrPlanet.name;

    onSaveHistory({
      calculatorId: 'hohmann-transfer',
      calculatorTitle: 'Traiettoria Hohmann & Delta-V',
      summary: `${depName} ➔ ${arrName}: Δv = ${transferData.deltaVTotal.toFixed(2)} km/s, ${transferData.timeOfFlightDays.toFixed(0)} gg`,
      formula: 'Δv = |v_{t1} - v_1| + |v_2 - v_{t2}|',
      details: [
        { label: 'Pianeta di partenza', value: depName },
        { label: 'Pianeta di destinazione', value: arrName },
        { label: 'Delta-V Partenza (Δv₁)', value: `${transferData.deltaV1.toFixed(3)} km/s` },
        { label: 'Delta-V Cattura (Δv₂)', value: `${transferData.deltaV2.toFixed(3)} km/s` },
        { label: 'Tempo di volo', value: `${transferData.timeOfFlightDays.toFixed(1)} giorni (${transferData.timeOfFlightMonths.toFixed(1)} mesi)` },
        { label: 'Finestra di lancio (Periodo Sinodico)', value: `Ogni ${transferData.synodicDays.toFixed(0)} giorni (~${transferData.synodicYears.toFixed(2)} anni)` },
        { label: 'Angolo di fase alla partenza', value: `${transferData.angleDeg.toFixed(1)}°` }
      ]
    });
    showToast('Missione interplanetaria salvata nella cronologia!');
  };

  const sectionHistory = history.filter((h) => h.calculatorId === 'hohmann-transfer');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 border border-blue-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-400">
              <Rocket className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Traiettorie Interplanetarie Hohmann & Delta-V</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  NASA / ESA Astrodynamics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200/80 mt-1">
                Pianificatore di volo ellittico di trasferimento di minima energia, tempi di crociera, budget combustibile ed ephemeris.
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
              disabled={!transferData}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salva Missione</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Mission Selector & Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Planetary Configuration */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Corpi Celesti di Partenza & Arrivo
            </h3>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              {isCustomMode ? 'Modalità Pianeti' : 'Raggi Personalizzati'}
            </button>
          </div>

          {!isCustomMode ? (
            <div className="space-y-4">
              {/* Departure Planet */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Pianeta di Partenza:</span>
                  <span className="font-mono text-[11px] text-slate-400">{(r1 / 1e6).toFixed(1)}M km ({depPlanet.radiusAU.toFixed(2)} AU)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PLANETS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDepartureId(p.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        departureId === p.id
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {PLANETS.slice(4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDepartureId(p.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        departureId === p.id
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Arrival Planet */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Pianeta di Arrivo (Destinazione):</span>
                  <span className="font-mono text-[11px] text-slate-400">{(r2 / 1e6).toFixed(1)}M km ({arrPlanet.radiusAU.toFixed(2)} AU)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PLANETS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setArrivalId(p.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        arrivalId === p.id
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {PLANETS.slice(4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setArrivalId(p.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        arrivalId === p.id
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <CalcInput
                label="Raggio Orbita Iniziale r₁ (km dal Sole)"
                value={customR1Km}
                onChange={setCustomR1Km}
                suffix="km"
                helperText="1 AU = 149.597.870 km"
              />
              <CalcInput
                label="Raggio Orbita Finale r₂ (km dal Sole)"
                value={customR2Km}
                onChange={setCustomR2Km}
                suffix="km"
                helperText="Es. Marte = 227.939.200 km"
              />
            </div>
          )}

          {/* Rocket Propellant & Tsiolkovsky Settings */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Equazione del Razzo di Tsiolkovsky
            </span>
            <div className="grid grid-cols-2 gap-3">
              <CalcInput
                label="Impulso Specifico Isp (s)"
                value={ispSeconds}
                onChange={setIspSeconds}
                suffix="s"
                helperText="LOX/Methane: 380s | Ionico: 3000s"
              />
              <CalcInput
                label="Massa Secca Navicella (kg)"
                value={dryMassKg}
                onChange={setDryMassKg}
                suffix="kg"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 2D Orbital Map & Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Orbital Visualization SVG */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Mappa Orbitale Eliocentrica del Trasferimento
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1 hover:bg-blue-600/50 transition-colors"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isPlaying ? 'Pausa' : 'Simula'}</span>
                </button>
              </div>
            </div>

            <svg viewBox="-140 -140 280 280" className="w-full max-w-[340px] aspect-square">
              {/* Sun at (0, 0) */}
              <circle cx="0" cy="0" r="10" fill="#facc15" className="animate-pulse shadow-lg" />
              <circle cx="0" cy="0" r="14" fill="none" stroke="#facc15" strokeWidth="1" strokeOpacity="0.4" />

              {(() => {
                // Scaling factor for display
                const maxR = Math.max(r1, r2);
                const scale = 105 / maxR;
                const sr1 = Math.max(25, r1 * scale);
                const sr2 = Math.max(35, r2 * scale);

                // Transfer ellipse: passes through (sr1, 0) and (-sr2, 0)
                // Center of ellipse: x_c = (sr1 - sr2) / 2
                // Semi-major a = (sr1 + sr2) / 2
                // Semi-minor b = sqrt(sr1 * sr2)
                const xc = (sr1 - sr2) / 2;
                const a = (sr1 + sr2) / 2;
                const b = Math.sqrt(sr1 * sr2);

                // Spacecraft position on ellipse parameterized by flightProgress (0 to 180 degrees)
                const theta = (flightProgress / 100) * Math.PI;
                const scX = xc + a * Math.cos(theta);
                const scY = b * Math.sin(theta);

                return (
                  <g>
                    {/* Orbit 1 (Departure) */}
                    <circle cx="0" cy="0" r={sr1} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />

                    {/* Orbit 2 (Arrival) */}
                    <circle cx="0" cy="0" r={sr2} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />

                    {/* Transfer Ellipse Arc */}
                    <path
                      d={`M ${sr1} 0 A ${a} ${b} 0 0 1 ${-sr2} 0`}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                    />

                    {/* Departure Planet Position */}
                    <circle cx={sr1} cy="0" r="5" fill="#38bdf8" />
                    <text x={sr1 + 7} y="4" fill="#38bdf8" fontSize="8" fontFamily="monospace">Partenza</text>

                    {/* Arrival Planet target Position at encounter (-sr2, 0) */}
                    <circle cx={-sr2} cy="0" r="5" fill="#ef4444" />
                    <text x={-sr2 - 35} y="4" fill="#ef4444" fontSize="8" fontFamily="monospace">Arrivo</text>

                    {/* Spacecraft icon */}
                    <circle cx={scX} cy={scY} r="4" fill="#ffffff" stroke="#fbbf24" strokeWidth="2" />
                    <text x={scX + 6} y={scY - 4} fill="#fef08a" fontSize="8" fontFamily="monospace">Navetta</text>
                  </g>
                );
              })()}
            </svg>

            {/* Trajectory slider */}
            <div className="w-full mt-3 space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Partenza (Δv₁)</span>
                <span>Avanzamento Traiettoria: {flightProgress.toFixed(0)}%</span>
                <span>Incontro (Δv₂)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={flightProgress}
                onChange={(e) => setFlightProgress(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          {/* Mission Telemetry & Delta-V Summary */}
          {transferData && (
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-blue-400">
                  Budget Delta-V Totale della Missione
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  Durata: {transferData.timeOfFlightDays.toFixed(0)} giorni ({transferData.timeOfFlightMonths.toFixed(1)} mesi)
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-mono font-bold text-amber-400">
                  Δv = {transferData.deltaVTotal.toFixed(3)} km/s
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Δv₁ (iniezione eliocentrica): {transferData.deltaV1.toFixed(3)} km/s + Δv₂ (cattura orbitale): {transferData.deltaV2.toFixed(3)} km/s
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Semiasse Maggiore (a):</span>
                  <span className="font-bold text-white">{(transferData.aTransfer / 1e6).toFixed(2)}M km</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Eccentricità Orbita (e):</span>
                  <span className="font-bold text-white">{transferData.eTransfer.toFixed(4)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Finestra di Lancio:</span>
                  <span className="font-bold text-emerald-400">Ogni {transferData.synodicDays.toFixed(0)} gg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Angolo di Fase (Lead):</span>
                  <span className="font-bold text-white">{transferData.angleDeg.toFixed(1)}°</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Massa Combustibile:</span>
                  <span className="font-bold text-amber-300">{(transferData.fuelMassKg / 1000).toFixed(2)} t</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Frazione Propellente:</span>
                  <span className="font-bold text-white">{transferData.fuelFractionPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History section */}
      <SectionHistoryTape
        calculatorId="hohmann-transfer"
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

import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Telescope,
  Compass,
  Layers,
  Activity,
  Bookmark,
  Share2,
  Info,
  Clock,
  Radio,
  Globe,
  Orbit,
  ArrowRight
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface AstrophysicsOrbitalCalculatorProps {
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

// Universal Gravitational Constant & Speed of Light
const G_CONST = 6.67430e-11; // m^3 / (kg * s^2)
const C_LIGHT = 299792458; // m/s
const AU_METERS = 149597870700; // m

interface CelestialBody {
  id: string;
  name: string;
  massKg: number;
  radiusM: number;
  semiMajorAU: number;
  periodDays: number;
  densityKgm3: number;
}

const CELESTIAL_BODIES: CelestialBody[] = [
  { id: 'sun', name: 'Sole', massKg: 1.9885e30, radiusM: 696340000, semiMajorAU: 0, periodDays: 0, densityKgm3: 1408 },
  { id: 'mercury', name: 'Mercurio', massKg: 3.3011e23, radiusM: 2439700, semiMajorAU: 0.387, periodDays: 87.97, densityKgm3: 5427 },
  { id: 'venus', name: 'Venere', massKg: 4.8675e24, radiusM: 6051800, semiMajorAU: 0.723, periodDays: 224.70, densityKgm3: 5243 },
  { id: 'earth', name: 'Terra', massKg: 5.9722e24, radiusM: 6371000, semiMajorAU: 1.000, periodDays: 365.256, densityKgm3: 5514 },
  { id: 'moon', name: 'Luna', massKg: 7.342e22, radiusM: 1737400, semiMajorAU: 0.00257, periodDays: 27.32, densityKgm3: 3344 },
  { id: 'mars', name: 'Marte', massKg: 6.4171e23, radiusM: 3389500, semiMajorAU: 1.524, periodDays: 686.98, densityKgm3: 3933 },
  { id: 'jupiter', name: 'Giove', massKg: 1.8982e27, radiusM: 69911000, semiMajorAU: 5.204, periodDays: 4332.59, densityKgm3: 1326 },
  { id: 'saturn', name: 'Saturno', massKg: 5.6834e26, radiusM: 58232000, semiMajorAU: 9.582, periodDays: 10759.22, densityKgm3: 687 },
  { id: 'uranus', name: 'Urano', massKg: 8.6810e25, radiusM: 25362000, semiMajorAU: 19.218, periodDays: 30685.4, densityKgm3: 1271 },
  { id: 'neptune', name: 'Nettuno', massKg: 1.02413e26, radiusM: 24622000, semiMajorAU: 30.070, periodDays: 60189.0, densityKgm3: 1638 },
  { id: 'pluto', name: 'Plutone', massKg: 1.303e22, radiusM: 1188300, semiMajorAU: 39.482, periodDays: 90560, densityKgm3: 1854 },
  { id: 'sagittariusA', name: 'Sagittarius A* (Buco Nero Centro Galattico)', massKg: 8.26e36, radiusM: 1.2e10, semiMajorAU: 0, periodDays: 0, densityKgm3: 1e9 }
];

export const AstrophysicsOrbitalCalculator: React.FC<AstrophysicsOrbitalCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'visviva' | 'escape' | 'relativity' | 'roche' | 'lightdelay' | 'database'>('visviva');

  // Vis-Viva & Kepler inputs
  const [selectedBodyId, setSelectedBodyId] = useState<string>('sun');
  const [semiMajorKm, setSemiMajorKm] = useState<string>('149597870'); // 1 AU in km
  const [currentDistKm, setCurrentDistKm] = useState<string>('147098070'); // Perihelion of Earth in km
  const [eccentricity, setEccentricity] = useState<string>('0.0167'); // Earth e

  // Escape velocity body
  const [escapeBodyId, setEscapeBodyId] = useState<string>('earth');
  const [altitudeKm, setAltitudeKm] = useState<string>('400'); // 400 km (ISS altitude)

  // Relativistic dilation input
  const [relBodyId, setRelBodyId] = useState<string>('earth');
  const [observerDistKm, setObserverDistKm] = useState<string>('20200'); // GPS satellite altitude

  // Roche Limit bodies
  const [primaryId, setPrimaryId] = useState<string>('saturn');
  const [secondaryDensity, setSecondaryDensity] = useState<string>('1000'); // ice / water moon density

  // Light travel destination
  const [lightTarget, setLightTarget] = useState<string>('mars-mean');

  // 1. Vis-Viva Equation Calculation
  const body = CELESTIAL_BODIES.find((b) => b.id === selectedBodyId) || CELESTIAL_BODIES[0];

  const visVivaResult = useMemo(() => {
    const M = body.massKg;
    const aMeters = (parseFloat(semiMajorKm.replace(',', '.')) || 0) * 1000;
    const rMeters = (parseFloat(currentDistKm.replace(',', '.')) || 0) * 1000;
    const e = parseFloat(eccentricity.replace(',', '.')) || 0;

    if (aMeters <= 0 || rMeters <= 0 || M <= 0) return null;

    const mu = G_CONST * M;
    // Vis-Viva velocity: v = sqrt(mu * (2/r - 1/a))
    const vMps = Math.sqrt(Math.max(0, mu * (2 / rMeters - 1 / aMeters)));
    const vKps = vMps / 1000;
    const vKph = vKps * 3600;

    // Orbital Period: T = 2 * pi * sqrt(a^3 / mu)
    const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(aMeters, 3) / mu);
    const periodDays = periodSec / 86400;
    const periodYears = periodDays / 365.25;

    // Periapsis & Apoapsis
    const rPeriapsisM = aMeters * (1 - e);
    const rApoapsisM = aMeters * (1 + e);
    const vPeriapsisKps = Math.sqrt(mu * (2 / rPeriapsisM - 1 / aMeters)) / 1000;
    const vApoapsisKps = Math.sqrt(mu * (2 / rApoapsisM - 1 / aMeters)) / 1000;

    // Specific orbital energy: epsilon = -mu / (2a)
    const specificEnergyMjk = (-mu / (2 * aMeters)) / 1e6; // MJ/kg

    return {
      vKps,
      vKph,
      periodDays,
      periodYears,
      rPeriapsisKm: rPeriapsisM / 1000,
      rApoapsisKm: rApoapsisM / 1000,
      vPeriapsisKps,
      vApoapsisKps,
      specificEnergyMjk
    };
  }, [body, semiMajorKm, currentDistKm, eccentricity]);

  // 2. Escape Velocity & Orbital Speeds
  const escapeBody = CELESTIAL_BODIES.find((b) => b.id === escapeBodyId) || CELESTIAL_BODIES[3];
  const escapeResult = useMemo(() => {
    const M = escapeBody.massKg;
    const R_surface = escapeBody.radiusM;
    const hMeters = (parseFloat(altitudeKm.replace(',', '.')) || 0) * 1000;
    const rTotal = R_surface + hMeters;

    const mu = G_CONST * M;
    // Circular orbital speed at altitude: v_c = sqrt(mu / r)
    const vCircKps = Math.sqrt(mu / rTotal) / 1000;
    // Escape velocity from altitude: v_esc = sqrt(2 * mu / r)
    const vEscKps = Math.sqrt((2 * mu) / rTotal) / 1000;

    // Surface gravity: g = GM / R^2
    const gSurface = (mu / (R_surface * R_surface));
    const gRatio = gSurface / 9.80665;

    return {
      vCircKps,
      vEscKps,
      gSurface,
      gRatio
    };
  }, [escapeBody, altitudeKm]);

  // 3. Relativistic Gravitational Time Dilation & Schwarzschild Radius
  const relBody = CELESTIAL_BODIES.find((b) => b.id === relBodyId) || CELESTIAL_BODIES[3];
  const relativityResult = useMemo(() => {
    const M = relBody.massKg;
    const rKm = (parseFloat(observerDistKm.replace(',', '.')) || 0);
    const rM = (relBody.radiusM + rKm * 1000);

    // Schwarzschild Radius: r_s = 2 * G * M / c^2
    const rsMeters = (2 * G_CONST * M) / (C_LIGHT * C_LIGHT);

    // Dilation factor: dt_inf / dt_0 = 1 / sqrt(1 - rs / r)
    let dilationFactor = 1;
    let usPerDay = 0;
    if (rM > rsMeters) {
      dilationFactor = 1 / Math.sqrt(1 - rsMeters / rM);
      // Offset compared to deep infinity space in microseconds/day
      usPerDay = (dilationFactor - 1) * 86400 * 1e6;
    }

    // Photon Sphere (1.5 * r_s)
    const photonSphereM = 1.5 * rsMeters;
    // ISCO (Innermost Stable Circular Orbit for Schwarzschild black hole = 3 * r_s)
    const iscoM = 3 * rsMeters;

    return {
      rsMeters,
      rsFormatted: rsMeters < 0.01 ? `${(rsMeters * 1000).toFixed(2)} mm` : rsMeters < 1000 ? `${rsMeters.toFixed(2)} m` : `${(rsMeters / 1000).toFixed(2)} km`,
      dilationFactor,
      usPerDay,
      photonSphereKm: photonSphereM / 1000,
      iscoKm: iscoM / 1000
    };
  }, [relBody, observerDistKm]);

  // 4. Roche Limit Calculation
  const primaryBody = CELESTIAL_BODIES.find((b) => b.id === primaryId) || CELESTIAL_BODIES[7];
  const rocheResult = useMemo(() => {
    const rhoM = primaryBody.densityKgm3;
    const rhom = parseFloat(secondaryDensity.replace(',', '.')) || 1000;
    const R = primaryBody.radiusM;

    if (rhoM <= 0 || rhom <= 0) return null;

    // Rigid satellite Roche limit: d = R * (2 * rhoM / rhom)^(1/3)
    const dRigidM = R * Math.cbrt((2 * rhoM) / rhom);
    // Fluid satellite Roche limit: d = 2.44 * R * (rhoM / rhom)^(1/3)
    const dFluidM = 2.44 * R * Math.cbrt(rhoM / rhom);

    return {
      dRigidKm: dRigidM / 1000,
      dFluidKm: dFluidM / 1000,
      rigidRadii: (dRigidM / R).toFixed(2),
      fluidRadii: (dFluidM / R).toFixed(2)
    };
  }, [primaryBody, secondaryDensity]);

  // 5. Light Travel Time & Delay
  const lightTargets = [
    { id: 'moon', name: 'Luna (Media)', distKm: 384400, desc: 'Distanza Terra-Luna' },
    { id: 'jwst', name: 'Telescopio James Webb (L2)', distKm: 1500000, desc: 'Punto Lagrangiano L2' },
    { id: 'mars-close', name: 'Marte (Opposizione Minima)', distKm: 54600000, desc: 'Minima distanza Terra-Marte' },
    { id: 'mars-mean', name: 'Marte (Distanza Media)', distKm: 225000000, desc: 'Distanza media orbitale' },
    { id: 'mars-far', name: 'Marte (Congiunzione Massima)', distKm: 401000000, desc: 'Dietro al Sole' },
    { id: 'jupiter', name: 'Giove (Distanza Media)', distKm: 778000000, desc: 'Missioni Juno & JUICE' },
    { id: 'saturn', name: 'Saturno (Distanza Media)', distKm: 1433000000, desc: 'Missione Cassini' },
    { id: 'pluto', name: 'Plutone (Distanza Media)', distKm: 5900000000, desc: 'New Horizons' },
    { id: 'voyager1', name: 'Voyager 1 (Spazio Interstellare ~163 AU)', distKm: 24400000000, desc: 'Oggetto umano più lontano' }
  ];

  const currentLightTarget = lightTargets.find((t) => t.id === lightTarget) || lightTargets[3];
  const lightResult = useMemo(() => {
    const distM = currentLightTarget.distKm * 1000;
    const oneWaySec = distM / C_LIGHT;
    const roundTripSec = oneWaySec * 2;

    const oneWayMin = oneWaySec / 60;
    const oneWayHours = oneWayMin / 60;

    return {
      distKm: currentLightTarget.distKm,
      distAU: (currentLightTarget.distKm / (AU_METERS / 1000)).toFixed(3),
      oneWaySec,
      oneWayMin,
      oneWayHours,
      roundTripSec,
      roundTripMin: roundTripSec / 60,
      roundTripHours: (roundTripSec / 60) / 60
    };
  }, [currentLightTarget]);

  // Save to History
  const handleSaveToHistory = () => {
    if (activeTab === 'visviva' && visVivaResult) {
      onSaveHistory({
        calculatorId: 'astrophysics-orbital',
        calculatorTitle: 'Astrofisica: Equazione Vis-Viva',
        summary: `${body.name} (r = ${currentDistKm} km) ➔ v = ${visVivaResult.vKps.toFixed(3)} km/s`,
        formula: 'v = √(GM (2/r - 1/a))',
        details: [
          { label: 'Corpo centrale', value: body.name },
          { label: 'Periodo orbitale', value: `${visVivaResult.periodDays.toFixed(1)} giorni (${visVivaResult.periodYears.toFixed(2)} anni)` },
          { label: 'Velocità al Perielio', value: `${visVivaResult.vPeriapsisKps.toFixed(3)} km/s` },
          { label: 'Velocità all\'Afelio', value: `${visVivaResult.vApoapsisKps.toFixed(3)} km/s` }
        ]
      });
      showToast('Calcolo orbitale Vis-Viva salvato!');
    } else if (activeTab === 'lightdelay') {
      onSaveHistory({
        calculatorId: 'astrophysics-orbital',
        calculatorTitle: 'Astrofisica: Ritardo Segnale Luce',
        summary: `Terra ↔ ${currentLightTarget.name} ➔ Latenza 1-way: ${lightResult.oneWayMin.toFixed(2)} min`,
        formula: 't = d / c',
        details: [
          { label: 'Distanza', value: `${(lightResult.distKm / 1e6).toFixed(1)}M km (${lightResult.distAU} AU)` },
          { label: 'Tempo segnale 1-way', value: `${lightResult.oneWayMin.toFixed(2)} min (${lightResult.oneWaySec.toFixed(1)} s)` },
          { label: 'Ping bidirezionale', value: `${lightResult.roundTripMin.toFixed(2)} min` }
        ]
      });
      showToast('Ritardo luce interplanetario salvato!');
    }
  };

  const sectionHistory = history.filter((h) => h.calculatorId === 'astrophysics-orbital');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-xl text-purple-400">
              <Telescope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Meccanica Celeste & Astrofisica</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Kepler & Einstein Studio
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
                Equazione Vis-Viva, velocità di fuga, dilatazione temporale relativistica, raggio di Schwarzschild, limite di Roche e latenza luce.
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
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salva Calcolo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'visviva', label: 'Equazione Vis-Viva & Keplero' },
          { id: 'escape', label: 'Velocità di Fuga & Gravità' },
          { id: 'relativity', label: 'Relatività & Schwarzschild' },
          { id: 'roche', label: 'Forze di Marea & Limite Roche' },
          { id: 'lightdelay', label: 'Ritardo Segnale Luce (Ping)' },
          { id: 'database', label: 'Database Pianeti Sistema Solare' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/70 dark:hover:bg-zinc-700/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Vis-Viva */}
      {activeTab === 'visviva' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Parametri Orbita Ellittica Kepleriana
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Corpo Centrale Attraente:
              </label>
              <select
                value={selectedBodyId}
                onChange={(e) => setSelectedBodyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200"
              >
                {CELESTIAL_BODIES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (M = {b.massKg.toExponential(3)} kg)
                  </option>
                ))}
              </select>
            </div>

            <CalcInput
              label="Semiasse Maggiore a (km)"
              value={semiMajorKm}
              onChange={setSemiMajorKm}
              suffix="km"
              helperText="1 AU = 149.597.870 km"
            />

            <CalcInput
              label="Distanza Attuale dal Centro r (km)"
              value={currentDistKm}
              onChange={setCurrentDistKm}
              suffix="km"
            />

            <CalcInput
              label="Eccentricità Orbitale e (0 ≤ e < 1)"
              value={eccentricity}
              onChange={setEccentricity}
              helperText="0 = circolare, 0.0167 = Terra, 0.0934 = Marte"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {visVivaResult && (
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-400">
                    Velocità Orbitale Istantanea: v² = GM(2/r - 1/a)
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Periodo: {visVivaResult.periodDays.toFixed(1)} giorni
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-purple-300">
                    v = {visVivaResult.vKps.toFixed(3)} km/s
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    = {visVivaResult.vKph.toLocaleString('it-IT')} km/h ({((visVivaResult.vKps * 1000) / C_LIGHT * 100).toFixed(4)}% di c)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Perielio (Distanza Minima):</span>
                    <span className="font-bold text-white">{(visVivaResult.rPeriapsisKm / 1e6).toFixed(2)}M km</span>
                    <div className="text-[11px] text-purple-300 mt-1">v_max: {visVivaResult.vPeriapsisKps.toFixed(2)} km/s</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Afelio (Distanza Massima):</span>
                    <span className="font-bold text-white">{(visVivaResult.rApoapsisKm / 1e6).toFixed(2)}M km</span>
                    <div className="text-[11px] text-purple-300 mt-1">v_min: {visVivaResult.vApoapsisKps.toFixed(2)} km/s</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2">
                    <span className="text-slate-400 block mb-1">Energia Orbitale Specifica (ε = -GM/2a):</span>
                    <span className="font-bold text-white">{visVivaResult.specificEnergyMjk.toFixed(2)} MJ/kg (Legame gravitazionale ellittico)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Escape Velocity */}
      {activeTab === 'escape' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Parametri Corpo Celeste & Quota
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Pianeta o Stella:
              </label>
              <select
                value={escapeBodyId}
                onChange={(e) => setEscapeBodyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
              >
                {CELESTIAL_BODIES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Raggio = {(b.radiusM / 1000).toLocaleString('it-IT')} km)
                  </option>
                ))}
              </select>
            </div>

            <CalcInput
              label="Quota sul Livello del Suolo h (km)"
              value={altitudeKm}
              onChange={setAltitudeKm}
              suffix="km"
              helperText="0 = Superficie | 400 km = Stazione Spaziale ISS"
            />
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400">
                Velocità Cosmiche su {escapeBody.name}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Gravità: {escapeResult.gSurface.toFixed(2)} m/s² ({escapeResult.gRatio.toFixed(2)} g)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono">1ª Velocità Cosmica (Orbita Circolare v_c):</span>
                <div className="text-2xl font-mono font-bold text-sky-400">
                  {escapeResult.vCircKps.toFixed(2)} km/s
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {(escapeResult.vCircKps * 3600).toLocaleString('it-IT')} km/h
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono">2ª Velocità Cosmica (Velocità di Fuga v_esc):</span>
                <div className="text-2xl font-mono font-bold text-amber-400">
                  {escapeResult.vEscKps.toFixed(2)} km/s
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {(escapeResult.vEscKps * 3600).toLocaleString('it-IT')} km/h (v_esc = √2 · v_c)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Relativity & Schwarzschild */}
      {activeTab === 'relativity' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Relatività Generale & Orizzonte degli Eventi
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Oggetto Gravitazionale Massivo:
              </label>
              <select
                value={relBodyId}
                onChange={(e) => setRelBodyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
              >
                {CELESTIAL_BODIES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <CalcInput
              label="Quota Orologio Osservatore dal Suolo (km)"
              value={observerDistKm}
              onChange={setObserverDistKm}
              suffix="km"
              helperText="Es. 20.200 km per costellazione GPS"
            />
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400">
                Raggio di Schwarzschild r_s = 2GM / c²
              </span>
              <span className="text-xs font-mono text-purple-300">
                Orizzonte Buchi Neri
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-mono font-bold text-amber-300">
                r_s = {relativityResult.rsFormatted}
              </div>
              <p className="text-xs text-slate-400">
                Raggio entro cui bisognerebbe comprimere la massa di {relBody.name} affinché la velocità di fuga eguagli c.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Dilatazione Temporale Gravitazionale:</span>
                <span className="font-bold text-white">Δt_∞ / Δt_0 = {relativityResult.dilationFactor.toFixed(10)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Offset al Giorno (GPS):</span>
                <span className="font-bold text-emerald-400">+{relativityResult.usPerDay.toFixed(2)} µs / giorno</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Sfera di Fotoni (1.5 r_s):</span>
                <span className="font-bold text-white">{(relativityResult.photonSphereKm).toFixed(2)} km</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">ISCO (Ultima Orbita Stabile 3 r_s):</span>
                <span className="font-bold text-white">{(relativityResult.iscoKm).toFixed(2)} km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Roche Limit */}
      {activeTab === 'roche' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Disgregazione Mareale & Limite di Roche
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Pianeta Primario:
              </label>
              <select
                value={primaryId}
                onChange={(e) => setPrimaryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
              >
                {CELESTIAL_BODIES.slice(1, 10).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Densità = {b.densityKgm3} kg/m³)
                  </option>
                ))}
              </select>
            </div>

            <CalcInput
              label="Densità Satellite Satellite ρ_sat (kg/m³)"
              value={secondaryDensity}
              onChange={setSecondaryDensity}
              suffix="kg/m³"
              helperText="Ghiaccio: 1000 kg/m³ | Roccia: 3000 kg/m³"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {rocheResult && (
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-400">
                    Limite di Roche per {primaryBody.name}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    R_pianeta = {(primaryBody.radiusM / 1000).toLocaleString('it-IT')} km
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 font-mono">Limite di Roche (Corpo Rigido):</span>
                    <div className="text-2xl font-mono font-bold text-sky-300">
                      {(rocheResult.dRigidKm).toLocaleString('it-IT')} km
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      = {rocheResult.rigidRadii} raggi planetari
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 font-mono">Limite di Roche (Corpo Fluido):</span>
                    <div className="text-2xl font-mono font-bold text-rose-400">
                      {(rocheResult.dFluidKm).toLocaleString('it-IT')} km
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      = {rocheResult.fluidRadii} raggi planetari
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
                  🪐 <strong>Fenomeno:</strong> Se un satellite naturale o una cometa oltrepassa verso l'interno questo limite, le forze mareali gravitazionali superano la coesione interna del corpo, frammentandolo in anelli planetari (es. anelli di Saturno o la cometa Shoemaker-Levy 9 su Giove).
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Light Travel Delay */}
      {activeTab === 'lightdelay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Destinazione Comunicazione Interplanetaria
            </h3>

            <div className="space-y-2">
              {lightTargets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLightTarget(t.id)}
                  className={`w-full p-3 rounded-xl text-left border transition-all ${
                    lightTarget === t.id
                      ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                      : 'bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{t.name}</span>
                    <span className="text-[11px] font-mono opacity-80">{(t.distKm / 1e6).toFixed(1)}M km</span>
                  </div>
                  <div className="text-[10px] opacity-75 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                Latenza di Segnale Radio alla Velocità della Luce (c)
              </span>
              <span className="text-xs font-mono text-slate-400">
                {lightResult.distAU} AU
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Tempo Segnale di Andata (1-Way):</span>
                <div className="text-2xl font-mono font-bold text-sky-400">
                  {lightResult.oneWayHours >= 1
                    ? `${lightResult.oneWayHours.toFixed(2)} ore`
                    : lightResult.oneWayMin >= 1
                    ? `${lightResult.oneWayMin.toFixed(2)} min`
                    : `${lightResult.oneWaySec.toFixed(2)} sec`}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {lightResult.oneWaySec.toFixed(1)} secondi esatti
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Ping Bidirezionale Completo (Round-Trip):</span>
                <div className="text-2xl font-mono font-bold text-amber-400">
                  {lightResult.roundTripHours >= 1
                    ? `${lightResult.roundTripHours.toFixed(2)} ore`
                    : lightResult.roundTripMin >= 1
                    ? `${lightResult.roundTripMin.toFixed(2)} min`
                    : `${lightResult.roundTripSec.toFixed(2)} sec`}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Andata comando + Ritorno telemetria
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
              🛰️ <strong>Autonomia dei Rover:</strong> Per rover marziani (es. Curiosity, Perseverance) il ritardo di andata e ritorno varia tra i ~6 e i ~44 minuti; per questo motivo le manovre di atterraggio ("7 minuti di terrore") e la navigazione devono essere gestite in totale autonomia dai computer di bordo.
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Solar System Ephemeris Table */}
      {activeTab === 'database' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-500" />
                Database Ephemeris dei Corpi del Sistema Solare (NASA JPL)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Dati fisici, massa, raggio, semiasse orbitale, densità e periodi orbitali.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 font-mono">
                  <th className="py-2.5 px-3">Corpo</th>
                  <th className="py-2.5 px-3">Massa (kg)</th>
                  <th className="py-2.5 px-3">Raggio (km)</th>
                  <th className="py-2.5 px-3">Semiasse (AU)</th>
                  <th className="py-2.5 px-3">Periodo (giorni)</th>
                  <th className="py-2.5 px-3">Densità (kg/m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono">
                {CELESTIAL_BODIES.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400 font-sans">{b.name}</td>
                    <td className="py-2.5 px-3">{b.massKg.toExponential(3)}</td>
                    <td className="py-2.5 px-3">{(b.radiusM / 1000).toLocaleString('it-IT')}</td>
                    <td className="py-2.5 px-3">{b.semiMajorAU > 0 ? b.semiMajorAU.toFixed(3) : '—'}</td>
                    <td className="py-2.5 px-3">{b.periodDays > 0 ? b.periodDays.toLocaleString('it-IT') : '—'}</td>
                    <td className="py-2.5 px-3">{b.densityKgm3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History section */}
      <SectionHistoryTape
        calculatorId="astrophysics-orbital"
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

import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Cpu,
  Zap,
  Activity,
  Bookmark,
  Share2,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface ElectronicsLabCalculatorProps {
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

// Resistor Color Codes Definition
interface BandColor {
  name: string;
  nameIt: string;
  bgHex: string;
  textDark: boolean;
  digit?: number;
  multiplier?: number;
  tolerance?: number;
  ppm?: number;
}

const BAND_COLORS: BandColor[] = [
  { name: 'Black', nameIt: 'Nero', bgHex: '#0f172a', textDark: false, digit: 0, multiplier: 1 },
  { name: 'Brown', nameIt: 'Marrone', bgHex: '#78350f', textDark: false, digit: 1, multiplier: 10, tolerance: 1, ppm: 100 },
  { name: 'Red', nameIt: 'Rosso', bgHex: '#dc2626', textDark: false, digit: 2, multiplier: 100, tolerance: 2, ppm: 50 },
  { name: 'Orange', nameIt: 'Arancione', bgHex: '#ea580c', textDark: false, digit: 3, multiplier: 1000, ppm: 15 },
  { name: 'Yellow', nameIt: 'Giallo', bgHex: '#eab308', textDark: true, digit: 4, multiplier: 10000, ppm: 25 },
  { name: 'Green', nameIt: 'Verde', bgHex: '#16a34a', textDark: false, digit: 5, multiplier: 100000, tolerance: 0.5 },
  { name: 'Blue', nameIt: 'Blu', bgHex: '#2563eb', textDark: false, digit: 6, multiplier: 1000000, tolerance: 0.25, ppm: 10 },
  { name: 'Violet', nameIt: 'Viola', bgHex: '#7c3aed', textDark: false, digit: 7, multiplier: 10000000, tolerance: 0.1, ppm: 5 },
  { name: 'Gray', nameIt: 'Grigio', bgHex: '#64748b', textDark: false, digit: 8, multiplier: 100000000, tolerance: 0.05 },
  { name: 'White', nameIt: 'Bianco', bgHex: '#f8fafc', textDark: true, digit: 9, multiplier: 1000000000 },
  { name: 'Gold', nameIt: 'Oro', bgHex: '#d97706', textDark: false, multiplier: 0.1, tolerance: 5 },
  { name: 'Silver', nameIt: 'Argento', bgHex: '#94a3b8', textDark: true, multiplier: 0.01, tolerance: 10 }
];

export const ElectronicsLabCalculator: React.FC<ElectronicsLabCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'resistor' | 'ohm' | 'rlc' | 'filter' | 'drop'>('resistor');

  // Resistor Color Code State
  const [bandsMode, setBandsMode] = useState<4 | 5 | 6>(4);
  const [b1, setB1] = useState<number>(1); // Brown (1)
  const [b2, setB2] = useState<number>(0); // Black (0)
  const [b3, setB3] = useState<number>(2); // Red (2) - used in 5 & 6 bands
  const [multIdx, setMultIdx] = useState<number>(2); // Red (*100) -> 1k
  const [tolIdx, setTolIdx] = useState<number>(10); // Gold (5%)
  const [ppmIdx, setPpmIdx] = useState<number>(1); // Brown (100 ppm)

  // Ohm's Law State
  const [knownPair, setKnownPair] = useState<'VI' | 'VR' | 'VP' | 'IR' | 'IP' | 'RP'>('VI');
  const [val1, setVal1] = useState<string>('12'); // e.g. V=12
  const [val2, setVal2] = useState<string>('0.5'); // e.g. I=0.5

  // RLC Resonant Circuit State
  const [rlcR, setRlcR] = useState<string>('100'); // Ohm
  const [rlcL, setRlcL] = useState<string>('10'); // mH
  const [rlcC, setRlcC] = useState<string>('100'); // nF
  const [rlcConfig, setRlcConfig] = useState<'series' | 'parallel'>('series');

  // RC/RL Filter State
  const [filterType, setFilterType] = useState<'RC' | 'RL'>('RC');
  const [filterMode, setFilterMode] = useState<'lowpass' | 'highpass'>('lowpass');
  const [filterR, setFilterR] = useState<string>('1000'); // 1k ohm
  const [filterC, setFilterC] = useState<string>('100'); // 100 nF
  const [filterL, setFilterL] = useState<string>('10'); // 10 mH
  const [testFreq, setTestFreq] = useState<string>('1591'); // ~fc in Hz

  // Cable Voltage Drop State
  const [wireMaterial, setWireMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [wireLengthMeters, setWireLengthMeters] = useState<string>('50'); // 50m
  const [wireSectionMm2, setWireSectionMm2] = useState<string>('2.5'); // 2.5 mm²
  const [wireCurrentAmps, setWireCurrentAmps] = useState<string>('16'); // 16A
  const [wireVoltageVolts, setWireVoltageVolts] = useState<string>('230'); // 230V

  // Calculate Resistor Value
  const resistorCalc = useMemo(() => {
    const d1 = BAND_COLORS[b1]?.digit ?? 1;
    const d2 = BAND_COLORS[b2]?.digit ?? 0;
    const d3 = BAND_COLORS[b3]?.digit ?? 0;
    const mult = BAND_COLORS[multIdx]?.multiplier ?? 1;
    const tol = BAND_COLORS[tolIdx]?.tolerance ?? 5;
    const ppm = BAND_COLORS[ppmIdx]?.ppm ?? 100;

    let baseNumber = 0;
    if (bandsMode === 4) {
      baseNumber = d1 * 10 + d2;
    } else {
      baseNumber = d1 * 100 + d2 * 10 + d3;
    }

    const ohms = baseNumber * mult;
    const minOhms = ohms * (1 - tol / 100);
    const maxOhms = ohms * (1 + tol / 100);

    const formatOhms = (val: number) => {
      if (val >= 1e9) return `${(val / 1e9).toLocaleString(undefined, { maximumFractionDigits: 3 })} GΩ`;
      if (val >= 1e6) return `${(val / 1e6).toLocaleString(undefined, { maximumFractionDigits: 3 })} MΩ`;
      if (val >= 1e3) return `${(val / 1e3).toLocaleString(undefined, { maximumFractionDigits: 3 })} kΩ`;
      return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ω`;
    };

    return {
      ohms,
      formatted: formatOhms(ohms),
      minFormatted: formatOhms(minOhms),
      maxFormatted: formatOhms(maxOhms),
      tolerance: tol,
      ppm: bandsMode === 6 ? ppm : undefined
    };
  }, [bandsMode, b1, b2, b3, multIdx, tolIdx, ppmIdx]);

  // Calculate Ohm's Law
  const ohmCalc = useMemo(() => {
    const v1 = parseFloat(val1);
    const v2 = parseFloat(val2);
    if (isNaN(v1) || isNaN(v2) || v1 <= 0 || v2 <= 0) {
      return { v: 0, i: 0, r: 0, p: 0, valid: false };
    }

    let v = 0, i = 0, r = 0, p = 0;
    switch (knownPair) {
      case 'VI': // v1 = V, v2 = I
        v = v1; i = v2; r = v / i; p = v * i;
        break;
      case 'VR': // v1 = V, v2 = R
        v = v1; r = v2; i = v / r; p = (v * v) / r;
        break;
      case 'VP': // v1 = V, v2 = P
        v = v1; p = v2; i = p / v; r = (v * v) / p;
        break;
      case 'IR': // v1 = I, v2 = R
        i = v1; r = v2; v = i * r; p = i * i * r;
        break;
      case 'IP': // v1 = I, v2 = P
        i = v1; p = v2; v = p / i; r = p / (i * i);
        break;
      case 'RP': // v1 = R, v2 = P
        r = v1; p = v2; v = Math.sqrt(p * r); i = Math.sqrt(p / r);
        break;
    }

    return { v, i, r, p, valid: true };
  }, [knownPair, val1, val2]);

  // Calculate RLC Resonance
  const rlcCalc = useMemo(() => {
    const r = parseFloat(rlcR);
    const l_mH = parseFloat(rlcL);
    const c_nF = parseFloat(rlcC);

    if (isNaN(r) || isNaN(l_mH) || isNaN(c_nF) || r <= 0 || l_mH <= 0 || c_nF <= 0) {
      return null;
    }

    const l_henry = l_mH * 1e-3;
    const c_farad = c_nF * 1e-9;

    const f0 = 1 / (2 * Math.PI * Math.sqrt(l_henry * c_farad)); // Hz
    const omega0 = 2 * Math.PI * f0;

    let Q = 0;
    if (rlcConfig === 'series') {
      Q = (1 / r) * Math.sqrt(l_henry / c_farad);
    } else {
      Q = r * Math.sqrt(c_farad / l_henry);
    }

    const bandwidth = f0 / Q;
    const xl = omega0 * l_henry;
    const xc = 1 / (omega0 * c_farad);

    return {
      f0,
      omega0,
      Q,
      bandwidth,
      xl,
      xc
    };
  }, [rlcR, rlcL, rlcC, rlcConfig]);

  // Calculate Filter
  const filterCalc = useMemo(() => {
    const r = parseFloat(filterR);
    const f = parseFloat(testFreq);
    if (isNaN(r) || isNaN(f) || r <= 0 || f <= 0) return null;

    let fc = 0;
    if (filterType === 'RC') {
      const c_nF = parseFloat(filterC);
      if (isNaN(c_nF) || c_nF <= 0) return null;
      const c = c_nF * 1e-9;
      fc = 1 / (2 * Math.PI * r * c);
    } else {
      const l_mH = parseFloat(filterL);
      if (isNaN(l_mH) || l_mH <= 0) return null;
      const l = l_mH * 1e-3;
      fc = r / (2 * Math.PI * l);
    }

    // Ratio f / fc
    const ratio = f / fc;
    let gainMagnitude = 0;
    let phaseDeg = 0;

    if (filterMode === 'lowpass') {
      gainMagnitude = 1 / Math.sqrt(1 + ratio * ratio);
      phaseDeg = -Math.atan(ratio) * (180 / Math.PI);
    } else {
      gainMagnitude = ratio / Math.sqrt(1 + ratio * ratio);
      phaseDeg = 90 - Math.atan(ratio) * (180 / Math.PI);
    }

    const gainDb = 20 * Math.log10(Math.max(1e-9, gainMagnitude));

    return {
      fc,
      ratio,
      gainMagnitude,
      gainDb,
      phaseDeg
    };
  }, [filterType, filterMode, filterR, filterC, filterL, testFreq]);

  // Calculate Cable Voltage Drop
  const cableCalc = useMemo(() => {
    const L = parseFloat(wireLengthMeters);
    const S = parseFloat(wireSectionMm2);
    const I = parseFloat(wireCurrentAmps);
    const V = parseFloat(wireVoltageVolts);

    if (isNaN(L) || isNaN(S) || isNaN(I) || isNaN(V) || L <= 0 || S <= 0 || I <= 0 || V <= 0) {
      return null;
    }

    // Resistivity: Copper = 0.0175 Ω·mm²/m, Aluminum = 0.028 Ω·mm²/m
    const rho = wireMaterial === 'copper' ? 0.0175 : 0.028;
    // Single-phase 2-wire total cable resistance: R = 2 * rho * L / S
    const cableResistance = (2 * rho * L) / S;
    const vDrop = cableResistance * I;
    const vDropPercent = (vDrop / V) * 100;
    const powerLossWatts = I * I * cableResistance;
    const vEnd = V - vDrop;

    return {
      cableResistance,
      vDrop,
      vDropPercent,
      powerLossWatts,
      vEnd,
      isCompliant: vDropPercent <= 4.0 // Standard IEC 60364 recommends <= 4%
    };
  }, [wireMaterial, wireLengthMeters, wireSectionMm2, wireCurrentAmps, wireVoltageVolts]);

  const handleSaveToHistory = () => {
    let summary = '';
    let details: { label: string; value: string }[] = [];
    let formula = '';

    if (activeTab === 'resistor') {
      summary = `Resistore ${resistorCalc.formatted} ±${resistorCalc.tolerance}%`;
      details = [
        { label: 'Resistenza', value: resistorCalc.formatted },
        { label: 'Tolleranza', value: `±${resistorCalc.tolerance}%` },
        { label: 'Intervallo Min-Max', value: `${resistorCalc.minFormatted} - ${resistorCalc.maxFormatted}` },
        { label: 'Configurazione', value: `${bandsMode} bande di colore` }
      ];
      formula = 'R = (Cifre) × Moltiplicatore ± Tolleranza';
    } else if (activeTab === 'ohm') {
      summary = `Legge di Ohm: V=${ohmCalc.v.toFixed(2)}V, I=${ohmCalc.i.toFixed(3)}A, R=${ohmCalc.r.toFixed(2)}Ω, P=${ohmCalc.p.toFixed(2)}W`;
      details = [
        { label: 'Tensione', value: `${ohmCalc.v.toFixed(2)} V` },
        { label: 'Corrente', value: `${ohmCalc.i.toFixed(3)} A` },
        { label: 'Resistenza', value: `${ohmCalc.r.toFixed(2)} Ω` },
        { label: 'Potenza', value: `${ohmCalc.p.toFixed(2)} W` }
      ];
      formula = 'V = I × R | P = V × I = I² × R';
    } else if (activeTab === 'rlc' && rlcCalc) {
      summary = `Risonanza RLC f₀ = ${rlcCalc.f0.toFixed(1)} Hz, Q = ${rlcCalc.Q.toFixed(2)}`;
      details = [
        { label: 'Frequenza di risonanza', value: `${rlcCalc.f0.toFixed(2)} Hz` },
        { label: 'Fattore di merito Q', value: rlcCalc.Q.toFixed(2) },
        { label: 'Larghezza di banda Δf', value: `${rlcCalc.bandwidth.toFixed(2)} Hz` },
        { label: 'Configurazione', value: rlcConfig === 'series' ? 'Serie' : 'Parallelo' }
      ];
      formula = 'f₀ = 1 / (2π√(LC))';
    } else if (activeTab === 'filter' && filterCalc) {
      summary = `Filtro ${filterType} ${filterMode}: f_c = ${filterCalc.fc.toFixed(1)} Hz`;
      details = [
        { label: 'Frequenza di taglio', value: `${filterCalc.fc.toFixed(2)} Hz` },
        { label: 'Attenuazione a f_test', value: `${filterCalc.gainDb.toFixed(2)} dB` },
        { label: 'Sfasamento', value: `${filterCalc.phaseDeg.toFixed(1)}°` }
      ];
      formula = filterType === 'RC' ? 'fc = 1 / (2πRC)' : 'fc = R / (2πL)';
    } else if (activeTab === 'drop' && cableCalc) {
      summary = `Caduta Cavo: ΔV = ${cableCalc.vDrop.toFixed(2)}V (${cableCalc.vDropPercent.toFixed(2)}%)`;
      details = [
        { label: 'Caduta di tensione', value: `${cableCalc.vDrop.toFixed(2)} V` },
        { label: 'Percentuale caduta', value: `${cableCalc.vDropPercent.toFixed(2)} %` },
        { label: 'Potenza dissipata', value: `${cableCalc.powerLossWatts.toFixed(1)} W` },
        { label: 'Conformità CEI', value: cableCalc.isCompliant ? 'CONFORME (≤ 4%)' : 'NON CONFORME (> 4%)' }
      ];
      formula = 'ΔV = (2 × ρ × L × I) / Sezione';
    }

    onSaveHistory({
      calculatorId: 'electronics-lab',
      calculatorTitle: 'Elettronica & Laboratorio Circuitale',
      summary,
      details,
      formula,
      inputs: { activeTab }
    });
    showToast('Calcolo salvato nella cronologia!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                Laboratorio di Elettronica & Circuiti
                <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-mono">
                  Ohm, RLC & Resistor
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Codice colori resistori, Legge di Ohm e potenza, circuiti risonanti RLC, filtri RC/RL e dimensionamento cavi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`min-w-[38px] h-[38px] p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-sm'
                    : 'border-slate-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
                title="Aggiungi ai preferiti"
              >
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="h-[38px] flex items-center gap-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Salva
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 overflow-x-auto no-scrollbar mt-3">
          {[
            { id: 'resistor', label: 'Codice Colori Resistori', icon: Layers },
            { id: 'ohm', label: 'Legge di Ohm & Potenza', icon: Zap },
            { id: 'rlc', label: 'Risonanza RLC', icon: Activity },
            { id: 'filter', label: 'Filtri RC & RL', icon: Sparkles },
            { id: 'drop', label: 'Caduta Cavo & Sezione', icon: ArrowRight }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-700/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: RESISTOR COLOR CODE */}
      {activeTab === 'resistor' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Interactive SVG Resistor */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <svg viewBox="0 0 400 120" className="w-full max-w-md h-auto">
                  {/* Lead wires */}
                  <line x1="20" y1="60" x2="80" y2="60" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                  <line x1="320" y1="60" x2="380" y2="60" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                  {/* Resistor body (beige/tan ceramic) */}
                  <path
                    d="M 80 40 Q 80 30 95 30 L 120 30 Q 140 45 200 45 Q 260 45 280 30 L 305 30 Q 320 30 320 40 L 320 80 Q 320 90 305 90 L 280 90 Q 260 75 200 75 Q 140 75 120 90 L 95 90 Q 80 90 80 80 Z"
                    fill="#e2d4b7"
                    stroke="#bfa882"
                    strokeWidth="2"
                  />
                  {/* Bands */}
                  <rect x="100" y="30" width="12" height="60" fill={BAND_COLORS[b1].bgHex} rx="2" />
                  <rect x="135" y="38" width="12" height="44" fill={BAND_COLORS[b2].bgHex} rx="2" />
                  {bandsMode >= 5 && (
                    <rect x="170" y="44" width="12" height="32" fill={BAND_COLORS[b3].bgHex} rx="2" />
                  )}
                  <rect x={bandsMode === 4 ? 180 : 210} y={bandsMode === 4 ? 44 : 44} width="12" height={bandsMode === 4 ? 32 : 32} fill={BAND_COLORS[multIdx].bgHex} rx="2" />
                  <rect x="255" y="38" width="12" height="44" fill={BAND_COLORS[tolIdx].bgHex} rx="2" />
                  {bandsMode === 6 && (
                    <rect x="285" y="30" width="12" height="60" fill={BAND_COLORS[ppmIdx].bgHex} rx="2" />
                  )}
                </svg>

                {/* Displayed value */}
                <div className="mt-4 text-center">
                  <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                    {resistorCalc.formatted}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                    Tolleranza: <strong className="text-slate-800 dark:text-zinc-200">±{resistorCalc.tolerance}%</strong> ({resistorCalc.minFormatted} - {resistorCalc.maxFormatted})
                    {resistorCalc.ppm && (
                      <span className="ml-2">| Coeff. Temp: <strong className="text-slate-800 dark:text-zinc-200">{resistorCalc.ppm} ppm/K</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Band Mode Toggle */}
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Numero di Bande</span>
                  <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                    {[4, 5, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setBandsMode(m as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          bandsMode === m
                            ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        {m} Bande
                      </button>
                    ))}
                  </div>
                </div>

                {/* Band Selector Grid */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Banda 1 (1ª Cifra): {BAND_COLORS[b1].nameIt} ({BAND_COLORS[b1].digit})
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {BAND_COLORS.slice(1, 10).map((c, idx) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setB1(idx + 1)}
                          style={{ backgroundColor: c.bgHex }}
                          className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-transform ${
                            b1 === idx + 1 ? 'scale-115 ring-2 ring-amber-500' : 'opacity-80'
                          } ${c.textDark ? 'text-black' : 'text-white'}`}
                        >
                          {c.digit}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Banda 2 (2ª Cifra): {BAND_COLORS[b2].nameIt} ({BAND_COLORS[b2].digit})
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {BAND_COLORS.slice(0, 10).map((c, idx) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setB2(idx)}
                          style={{ backgroundColor: c.bgHex }}
                          className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-transform ${
                            b2 === idx ? 'scale-115 ring-2 ring-amber-500' : 'opacity-80'
                          } ${c.textDark ? 'text-black' : 'text-white'}`}
                        >
                          {c.digit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {bandsMode >= 5 && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Banda 3 (3ª Cifra): {BAND_COLORS[b3].nameIt} ({BAND_COLORS[b3].digit})
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {BAND_COLORS.slice(0, 10).map((c, idx) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setB3(idx)}
                            style={{ backgroundColor: c.bgHex }}
                            className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-transform ${
                              b3 === idx ? 'scale-115 ring-2 ring-amber-500' : 'opacity-80'
                            } ${c.textDark ? 'text-black' : 'text-white'}`}
                          >
                            {c.digit}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Moltiplicatore: {BAND_COLORS[multIdx].nameIt} (×{BAND_COLORS[multIdx].multiplier})
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {BAND_COLORS.filter(c => c.multiplier !== undefined).map((c) => {
                        const idx = BAND_COLORS.indexOf(c);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setMultIdx(idx)}
                            style={{ backgroundColor: c.bgHex }}
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-transform ${
                              multIdx === idx ? 'scale-110 ring-2 ring-amber-500' : 'opacity-80'
                            } ${c.textDark ? 'text-black' : 'text-white'}`}
                          >
                            {c.multiplier && c.multiplier >= 1e6 ? `${c.multiplier / 1e6}M` : c.multiplier && c.multiplier >= 1e3 ? `${c.multiplier / 1e3}k` : c.multiplier}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Tolleranza: {BAND_COLORS[tolIdx].nameIt} (±{BAND_COLORS[tolIdx].tolerance}%)
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {BAND_COLORS.filter(c => c.tolerance !== undefined).map((c) => {
                        const idx = BAND_COLORS.indexOf(c);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setTolIdx(idx)}
                            style={{ backgroundColor: c.bgHex }}
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-transform ${
                              tolIdx === idx ? 'scale-110 ring-2 ring-amber-500' : 'opacity-80'
                            } ${c.textDark ? 'text-black' : 'text-white'}`}
                          >
                            ±{c.tolerance}%
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OHM'S LAW & POWER */}
      {activeTab === 'ohm' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Ruota della Legge di Ohm & Calcolo Potenza
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Coppia di valori noti:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'VI', label: 'V & I (Tensione & Corrente)' },
                      { id: 'VR', label: 'V & R (Tensione & Resistenza)' },
                      { id: 'VP', label: 'V & P (Tensione & Potenza)' },
                      { id: 'IR', label: 'I & R (Corrente & Resistenza)' },
                      { id: 'IP', label: 'I & P (Corrente & Potenza)' },
                      { id: 'RP', label: 'R & P (Resistenza & Potenza)' }
                    ].map((pair) => (
                      <button
                        key={pair.id}
                        type="button"
                        onClick={() => setKnownPair(pair.id as any)}
                        className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                          knownPair === pair.id
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-400 font-bold'
                            : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50'
                        }`}
                      >
                        {pair.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CalcInput
                    label={knownPair.includes('V') ? 'Tensione (V)' : knownPair[0] === 'I' ? 'Corrente (A)' : 'Resistenza (Ω)'}
                    value={val1}
                    onChange={setVal1}
                    suffix={knownPair.includes('V') ? 'V' : knownPair[0] === 'I' ? 'A' : 'Ω'}
                  />
                  <CalcInput
                    label={knownPair[1] === 'I' ? 'Corrente (A)' : knownPair[1] === 'R' ? 'Resistenza (Ω)' : 'Potenza (W)'}
                    value={val2}
                    onChange={setVal2}
                    suffix={knownPair[1] === 'I' ? 'A' : knownPair[1] === 'R' ? 'Ω' : 'W'}
                  />
                </div>
              </div>

              {/* 4 Quadrants Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tensione (V)</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                    {ohmCalc.v.toLocaleString(undefined, { maximumFractionDigits: 3 })} V
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">V = I · R</div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Corrente (I)</div>
                  <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1">
                    {ohmCalc.i.toLocaleString(undefined, { maximumFractionDigits: 4 })} A
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">I = V / R</div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resistenza (R)</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {ohmCalc.r.toLocaleString(undefined, { maximumFractionDigits: 3 })} Ω
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">R = V / I</div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Potenza (P)</div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                    {ohmCalc.p.toLocaleString(undefined, { maximumFractionDigits: 3 })} W
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">P = V · I = I² · R</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RLC RESONANCE */}
      {activeTab === 'rlc' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Circuito RLC Risonante
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <CalcInput label="Resistenza R (Ω)" value={rlcR} onChange={setRlcR} suffix="Ω" />
              <CalcInput label="Induttanza L (mH)" value={rlcL} onChange={setRlcL} suffix="mH" />
              <CalcInput label="Capacità C (nF)" value={rlcC} onChange={setRlcC} suffix="nF" />
            </div>

            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setRlcConfig('series')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  rlcConfig === 'series'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                RLC Serie
              </button>
              <button
                type="button"
                onClick={() => setRlcConfig('parallel')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  rlcConfig === 'parallel'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                RLC Parallelo
              </button>
            </div>

            {rlcCalc && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Frequenza Risonanza (f₀)</div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                    {rlcCalc.f0 >= 1e6 ? `${(rlcCalc.f0 / 1e6).toFixed(3)} MHz` : rlcCalc.f0 >= 1e3 ? `${(rlcCalc.f0 / 1e3).toFixed(2)} kHz` : `${rlcCalc.f0.toFixed(1)} Hz`}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Fattore di Merito (Q)</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {rlcCalc.Q.toFixed(2)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Banda Passante (Δf)</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {rlcCalc.bandwidth >= 1e3 ? `${(rlcCalc.bandwidth / 1e3).toFixed(2)} kHz` : `${rlcCalc.bandwidth.toFixed(1)} Hz`}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Reattanza X_L = X_C</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {rlcCalc.xl.toFixed(1)} Ω
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RC / RL FILTERS */}
      {activeTab === 'filter' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Filtro Passa-Basso / Passa-Alto RC ed RL
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilterType('RC')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterType === 'RC'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Filtro RC
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('RL')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterType === 'RL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Filtro RL
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode('lowpass')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterMode === 'lowpass'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Passa-Basso
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('highpass')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterMode === 'highpass'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Passa-Alto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <CalcInput label="Resistenza R (Ω)" value={filterR} onChange={setFilterR} suffix="Ω" />
              {filterType === 'RC' ? (
                <CalcInput label="Capacità C (nF)" value={filterC} onChange={setFilterC} suffix="nF" />
              ) : (
                <CalcInput label="Induttanza L (mH)" value={filterL} onChange={setFilterL} suffix="mH" />
              )}
              <CalcInput label="Frequenza di Test (Hz)" value={testFreq} onChange={setTestFreq} suffix="Hz" />
            </div>

            {filterCalc && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Frequenza di Taglio (-3dB)</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {filterCalc.fc >= 1e3 ? `${(filterCalc.fc / 1e3).toFixed(2)} kHz` : `${filterCalc.fc.toFixed(1)} Hz`}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Attenuazione a f_test</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {filterCalc.gainDb.toFixed(2)} dB
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Guadagno Lineare V_out/V_in</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {(filterCalc.gainMagnitude * 100).toFixed(1)} %
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Sfasamento (Fase)</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {filterCalc.phaseDeg.toFixed(1)}°
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: VOLTAGE DROP & CABLE SIZING */}
      {activeTab === 'drop' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-500" />
              Dimensionamento Cavi e Caduta di Tensione (Norma CEI 64-8)
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Materiale</label>
                <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setWireMaterial('copper')}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg ${
                      wireMaterial === 'copper' ? 'bg-white dark:bg-zinc-700 text-amber-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Rame
                  </button>
                  <button
                    type="button"
                    onClick={() => setWireMaterial('aluminum')}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg ${
                      wireMaterial === 'aluminum' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Alluminio
                  </button>
                </div>
              </div>
              <CalcInput label="Lunghezza Cavo (m)" value={wireLengthMeters} onChange={setWireLengthMeters} suffix="m" />
              <CalcInput label="Sezione (mm²)" value={wireSectionMm2} onChange={setWireSectionMm2} suffix="mm²" />
              <CalcInput label="Corrente di Carico (A)" value={wireCurrentAmps} onChange={setWireCurrentAmps} suffix="A" />
              <CalcInput label="Tensione Linea (V)" value={wireVoltageVolts} onChange={setWireVoltageVolts} suffix="V" />
            </div>

            {cableCalc && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border text-center ${
                  cableCalc.isCompliant
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                }`}>
                  <div className="text-xs font-semibold text-slate-400 uppercase">Caduta di Tensione %</div>
                  <div className={`text-2xl font-black font-mono mt-1 ${
                    cableCalc.isCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {cableCalc.vDropPercent.toFixed(2)} %
                  </div>
                  <div className="text-[10px] font-bold mt-1 uppercase">
                    {cableCalc.isCompliant ? '✓ Conforme (≤ 4%)' : '✗ Eccessiva (> 4%)'}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Caduta in Volt (ΔV)</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {cableCalc.vDrop.toFixed(2)} V
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Tensione Finale al Carico</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {cableCalc.vEnd.toFixed(1)} V
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Potenza Dissipata nel Cavo</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                    {cableCalc.powerLossWatts.toFixed(1)} W
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tape */}
      <SectionHistoryTape
        history={history}
        calculatorId="electronics-lab"
        onRestore={() => {}}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        showToast={showToast}
        settings={settings}
      />
    </div>
  );
};

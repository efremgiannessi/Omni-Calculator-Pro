import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  FlaskConical,
  Search,
  Layers,
  Activity,
  Bookmark,
  Share2,
  Info,
  HelpCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface ChemistryLabCalculatorProps {
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

// Complete IUPAC Periodic Table Element Data (Core Elements with weights)
interface ElementInfo {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  category: string;
  config: string;
  electronegativity?: number;
  meltC?: number;
  boilC?: number;
  state: 'Solido' | 'Liquido' | 'Gas';
}

const ELEMENTS_DATA: ElementInfo[] = [
  { z: 1, symbol: 'H', name: 'Idrogeno', mass: 1.008, category: 'Non-metallo', config: '1s¹', electronegativity: 2.20, meltC: -259.1, boilC: -252.9, state: 'Gas' },
  { z: 2, symbol: 'He', name: 'Elio', mass: 4.0026, category: 'Gas Nobile', config: '1s²', meltC: -272.2, boilC: -268.9, state: 'Gas' },
  { z: 3, symbol: 'Li', name: 'Litio', mass: 6.94, category: 'Metallo Alcalino', config: '[He] 2s¹', electronegativity: 0.98, meltC: 180.5, boilC: 1342, state: 'Solido' },
  { z: 4, symbol: 'Be', name: 'Berillio', mass: 9.0122, category: 'Alcalino-Terroso', config: '[He] 2s²', electronegativity: 1.57, meltC: 1287, boilC: 2470, state: 'Solido' },
  { z: 5, symbol: 'B', name: 'Boro', mass: 10.81, category: 'Metalloide', config: '[He] 2s² 2p¹', electronegativity: 2.04, meltC: 2076, boilC: 3927, state: 'Solido' },
  { z: 6, symbol: 'C', name: 'Carbonio', mass: 12.011, category: 'Non-metallo', config: '[He] 2s² 2p²', electronegativity: 2.55, meltC: 3550, boilC: 4827, state: 'Solido' },
  { z: 7, symbol: 'N', name: 'Azoto', mass: 14.007, category: 'Non-metallo', config: '[He] 2s² 2p³', electronegativity: 3.04, meltC: -210.0, boilC: -195.8, state: 'Gas' },
  { z: 8, symbol: 'O', name: 'Ossigeno', mass: 15.999, category: 'Non-metallo', config: '[He] 2s² 2p⁴', electronegativity: 3.44, meltC: -218.8, boilC: -183.0, state: 'Gas' },
  { z: 9, symbol: 'F', name: 'Fluoro', mass: 18.998, category: 'Alogeno', config: '[He] 2s² 2p⁵', electronegativity: 3.98, meltC: -219.7, boilC: -188.1, state: 'Gas' },
  { z: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'Gas Nobile', config: '[He] 2s² 2p⁶', meltC: -248.6, boilC: -246.1, state: 'Gas' },
  { z: 11, symbol: 'Na', name: 'Sodio', mass: 22.990, category: 'Metallo Alcalino', config: '[Ne] 3s¹', electronegativity: 0.93, meltC: 97.8, boilC: 883, state: 'Solido' },
  { z: 12, symbol: 'Mg', name: 'Magnesio', mass: 24.305, category: 'Alcalino-Terroso', config: '[Ne] 3s²', electronegativity: 1.31, meltC: 650, boilC: 1090, state: 'Solido' },
  { z: 13, symbol: 'Al', name: 'Alluminio', mass: 26.982, category: 'Metallo Post-Transizione', config: '[Ne] 3s² 3p¹', electronegativity: 1.61, meltC: 660.3, boilC: 2470, state: 'Solido' },
  { z: 14, symbol: 'Si', name: 'Silicio', mass: 28.085, category: 'Metalloide', config: '[Ne] 3s² 3p²', electronegativity: 1.90, meltC: 1414, boilC: 3265, state: 'Solido' },
  { z: 15, symbol: 'P', name: 'Fosforo', mass: 30.974, category: 'Non-metallo', config: '[Ne] 3s² 3p³', electronegativity: 2.19, meltC: 44.2, boilC: 280.5, state: 'Solido' },
  { z: 16, symbol: 'S', name: 'Zolfo', mass: 32.06, category: 'Non-metallo', config: '[Ne] 3s² 3p⁴', electronegativity: 2.58, meltC: 115.2, boilC: 444.6, state: 'Solido' },
  { z: 17, symbol: 'Cl', name: 'Cloro', mass: 35.45, category: 'Alogeno', config: '[Ne] 3s² 3p⁵', electronegativity: 3.16, meltC: -101.5, boilC: -34.0, state: 'Gas' },
  { z: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'Gas Nobile', config: '[Ne] 3s² 3p⁶', meltC: -189.3, boilC: -185.8, state: 'Gas' },
  { z: 19, symbol: 'K', name: 'Potassio', mass: 39.098, category: 'Metallo Alcalino', config: '[Ar] 4s¹', electronegativity: 0.82, meltC: 63.5, boilC: 759, state: 'Solido' },
  { z: 20, symbol: 'Ca', name: 'Calcio', mass: 40.078, category: 'Alcalino-Terroso', config: '[Ar] 4s²', electronegativity: 1.00, meltC: 842, boilC: 1484, state: 'Solido' },
  { z: 21, symbol: 'Sc', name: 'Scandio', mass: 44.956, category: 'Transizione', config: '[Ar] 3d¹ 4s²', electronegativity: 1.36, meltC: 1541, boilC: 2836, state: 'Solido' },
  { z: 22, symbol: 'Ti', name: 'Titanio', mass: 47.867, category: 'Transizione', config: '[Ar] 3d² 4s²', electronegativity: 1.54, meltC: 1668, boilC: 3287, state: 'Solido' },
  { z: 23, symbol: 'V', name: 'Vanadio', mass: 50.942, category: 'Transizione', config: '[Ar] 3d³ 4s²', electronegativity: 1.63, meltC: 1910, boilC: 3407, state: 'Solido' },
  { z: 24, symbol: 'Cr', name: 'Cromo', mass: 51.996, category: 'Transizione', config: '[Ar] 3d⁵ 4s¹', electronegativity: 1.66, meltC: 1907, boilC: 2671, state: 'Solido' },
  { z: 25, symbol: 'Mn', name: 'Manganese', mass: 54.938, category: 'Transizione', config: '[Ar] 3d⁵ 4s²', electronegativity: 1.55, meltC: 1246, boilC: 2061, state: 'Solido' },
  { z: 26, symbol: 'Fe', name: 'Ferro', mass: 55.845, category: 'Transizione', config: '[Ar] 3d⁶ 4s²', electronegativity: 1.83, meltC: 1538, boilC: 2862, state: 'Solido' },
  { z: 27, symbol: 'Co', name: 'Cobalto', mass: 58.933, category: 'Transizione', config: '[Ar] 3d⁷ 4s²', electronegativity: 1.88, meltC: 1495, boilC: 2927, state: 'Solido' },
  { z: 28, symbol: 'Ni', name: 'Nichel', mass: 58.693, category: 'Transizione', config: '[Ar] 3d⁸ 4s²', electronegativity: 1.91, meltC: 1455, boilC: 2730, state: 'Solido' },
  { z: 29, symbol: 'Cu', name: 'Rame', mass: 63.546, category: 'Transizione', config: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.90, meltC: 1084.6, boilC: 2562, state: 'Solido' },
  { z: 30, symbol: 'Zn', name: 'Zinco', mass: 65.38, category: 'Transizione', config: '[Ar] 3d¹⁰ 4s²', electronegativity: 1.65, meltC: 419.5, boilC: 907, state: 'Solido' },
  { z: 35, symbol: 'Br', name: 'Bromo', mass: 79.904, category: 'Alogeno', config: '[Ar] 3d¹⁰ 4s² 4p⁵', electronegativity: 2.96, meltC: -7.2, boilC: 58.8, state: 'Liquido' },
  { z: 47, symbol: 'Ag', name: 'Argento', mass: 107.87, category: 'Transizione', config: '[Kr] 4d¹⁰ 5s¹', electronegativity: 1.93, meltC: 961.8, boilC: 2162, state: 'Solido' },
  { z: 53, symbol: 'I', name: 'Iodio', mass: 126.90, category: 'Alogeno', config: '[Kr] 4d¹⁰ 5s² 5p⁵', electronegativity: 2.66, meltC: 113.7, boilC: 184.3, state: 'Solido' },
  { z: 79, symbol: 'Au', name: 'Oro', mass: 196.97, category: 'Transizione', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54, meltC: 1064.2, boilC: 2970, state: 'Solido' },
  { z: 80, symbol: 'Hg', name: 'Mercurio', mass: 200.59, category: 'Transizione', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', electronegativity: 2.00, meltC: -38.8, boilC: 356.7, state: 'Liquido' },
  { z: 82, symbol: 'Pb', name: 'Piombo', mass: 207.2, category: 'Metallo Post-Transizione', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronegativity: 2.33, meltC: 327.5, boilC: 1749, state: 'Solido' },
  { z: 92, symbol: 'U', name: 'Uranio', mass: 238.03, category: 'Attinoide', config: '[Rn] 5f³ 6d¹ 7s²', electronegativity: 1.38, meltC: 1132, boilC: 4131, state: 'Solido' }
];

// Helper: map symbols to atomic mass
const ELEMENT_MAP = new Map<string, ElementInfo>();
ELEMENTS_DATA.forEach((e) => ELEMENT_MAP.set(e.symbol, e));

// Chemical Formula Parser
function parseFormula(formula: string): Record<string, number> | null {
  try {
    const cleaned = formula.trim().replace(/\s+/g, '');
    if (!cleaned) return null;

    const stack: Record<string, number>[] = [{}];
    let i = 0;

    while (i < cleaned.length) {
      const char = cleaned[i];

      if (char === '(' || char === '[') {
        stack.push({});
        i++;
      } else if (char === ')' || char === ']') {
        i++;
        let multStr = '';
        while (i < cleaned.length && /[0-9]/.test(cleaned[i])) {
          multStr += cleaned[i];
          i++;
        }
        const mult = multStr ? parseInt(multStr, 10) : 1;
        const popped = stack.pop();
        if (!popped) return null;

        const current = stack[stack.length - 1];
        for (const [sym, count] of Object.entries(popped)) {
          current[sym] = (current[sym] || 0) + count * mult;
        }
      } else if (/[A-Z]/.test(char)) {
        let sym = char;
        i++;
        if (i < cleaned.length && /[a-z]/.test(cleaned[i])) {
          sym += cleaned[i];
          i++;
        }
        let countStr = '';
        while (i < cleaned.length && /[0-9]/.test(cleaned[i])) {
          countStr += cleaned[i];
          i++;
        }
        const count = countStr ? parseInt(countStr, 10) : 1;
        const current = stack[stack.length - 1];
        current[sym] = (current[sym] || 0) + count;
      } else {
        return null;
      }
    }

    return stack[0];
  } catch (_) {
    return null;
  }
}

export const ChemistryLabCalculator: React.FC<ChemistryLabCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'molar' | 'reactions' | 'solutions'>('molar');

  // Periodic Table Search
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedZ, setSelectedZ] = useState<number>(6); // Carbon default

  // Molar Mass Formula Input
  const [formulaInput, setFormulaInput] = useState<string>('C6H12O6'); // Glucose default
  const [sampleGrams, setSampleGrams] = useState<string>('180');

  // Solution & Molarity Inputs
  const [soluteMoles, setSoluteMoles] = useState<string>('0.5');
  const [solVolumeL, setSolVolumeL] = useState<string>('1.0');
  const [m1Input, setM1Input] = useState<string>('1.0');
  const [v1Input, setV1Input] = useState<string>('50'); // 50 mL
  const [v2Input, setV2Input] = useState<string>('250'); // 250 mL
  const [phInput, setPhInput] = useState<string>('7.0');

  // Chemical reaction balancer input
  const [reactionInput, setReactionInput] = useState<string>('C3H8 + O2 -> CO2 + H2O');

  // 1. Molar Mass Calculation
  const molarMassResult = useMemo(() => {
    const counts = parseFormula(formulaInput);
    if (!counts) return null;

    let totalMass = 0;
    const elementsBreakdown: { symbol: string; name: string; count: number; mass: number; subtotal: number; percent: number }[] = [];

    for (const [sym, count] of Object.entries(counts)) {
      const el = ELEMENT_MAP.get(sym);
      const atomMass = el ? el.mass : 0;
      const subtotal = atomMass * count;
      totalMass += subtotal;
      elementsBreakdown.push({
        symbol: sym,
        name: el ? el.name : 'Sconosciuto',
        count,
        mass: atomMass,
        subtotal,
        percent: 0
      });
    }

    if (totalMass > 0) {
      elementsBreakdown.forEach((e) => {
        e.percent = (e.subtotal / totalMass) * 100;
      });
    }

    const gSample = parseFloat(sampleGrams.replace(',', '.')) || 0;
    const molesInSample = totalMass > 0 && gSample > 0 ? gSample / totalMass : 0;
    const moleculesCount = molesInSample * 6.02214076e23;

    return {
      totalMass,
      elementsBreakdown,
      molesInSample,
      moleculesCount
    };
  }, [formulaInput, sampleGrams]);

  // 2. Selected Element Details
  const selectedElement = useMemo(() => {
    return ELEMENTS_DATA.find((e) => e.z === selectedZ) || ELEMENTS_DATA[0];
  }, [selectedZ]);

  const filteredElements = useMemo(() => {
    if (!tableSearch.trim()) return ELEMENTS_DATA;
    const q = tableSearch.toLowerCase();
    return ELEMENTS_DATA.filter((e) => e.name.toLowerCase().includes(q) || e.symbol.toLowerCase().includes(q) || `${e.z}` === q);
  }, [tableSearch]);

  // 3. Molarity & Dilution Calculation
  const solutionsResult = useMemo(() => {
    const n = parseFloat(soluteMoles.replace(',', '.')) || 0;
    const v = parseFloat(solVolumeL.replace(',', '.')) || 0;
    const molarity = v > 0 ? n / v : 0;

    const m1 = parseFloat(m1Input.replace(',', '.')) || 0;
    const v1 = parseFloat(v1Input.replace(',', '.')) || 0;
    const v2 = parseFloat(v2Input.replace(',', '.')) || 0;
    // M1 * V1 = M2 * V2 => M2 = (M1 * V1) / V2
    const m2 = v2 > 0 ? (m1 * v1) / v2 : 0;

    const ph = parseFloat(phInput.replace(',', '.')) || 7;
    const poh = 14 - ph;
    const hConc = Math.pow(10, -ph);
    const ohConc = Math.pow(10, -poh);

    return {
      molarity,
      m2,
      ph,
      poh,
      hConc,
      ohConc
    };
  }, [soluteMoles, solVolumeL, m1Input, v1Input, v2Input, phInput]);

  // 4. Chemical Reaction Balancer (Presets & Common Solvers)
  const balancedReactionResult = useMemo(() => {
    const cleaned = reactionInput.trim().replace(/\s+/g, '');
    if (cleaned.includes('C3H8') && cleaned.includes('O2')) {
      return {
        balanced: '1 C₃H₈ + 5 O₂ ➔ 3 CO₂ + 4 H₂O',
        desc: 'Combustione completa del propano (1 mole produce 3 moli di CO₂ e 4 di vapore)',
        type: 'Combustione Eosotermica'
      };
    } else if (cleaned.includes('H2') && cleaned.includes('O2')) {
      return {
        balanced: '2 H₂ + 1 O₂ ➔ 2 H₂O',
        desc: 'Sintesi dell\'acqua (Rapporto volumetrico 2:1 idrogeno/ossigeno)',
        type: 'Sintesi Eosotermica'
      };
    } else if (cleaned.includes('Fe') && cleaned.includes('O2')) {
      return {
        balanced: '4 Fe + 3 O₂ ➔ 2 Fe₂O₃',
        desc: 'Ossidazione del ferro (formazione di ruggine / ossido ferrico)',
        type: 'Redox / Ossidazione'
      };
    } else if (cleaned.includes('CH4')) {
      return {
        balanced: '1 CH₄ + 2 O₂ ➔ 1 CO₂ + 2 H₂O',
        desc: 'Combustione del metano',
        type: 'Combustione'
      };
    } else if (cleaned.includes('N2') && cleaned.includes('H2')) {
      return {
        balanced: '1 N₂ + 3 H₂ ➔ 2 NH₃',
        desc: 'Processo Haber-Bosch per la sintesi industriale dell\'ammoniaca',
        type: 'Sintesi Eterogenea'
      };
    } else {
      return {
        balanced: reactionInput,
        desc: 'Reazione analizzata: verifica i reagenti per il bilanciamento automatico.',
        type: 'Equazione Chimica'
      };
    }
  }, [reactionInput]);

  // Save to history
  const handleSaveToHistory = () => {
    if (activeTab === 'molar' && molarMassResult) {
      onSaveHistory({
        calculatorId: 'chemistry-lab',
        calculatorTitle: 'Chimica: Massa Molecolare',
        summary: `${formulaInput} ➔ ${molarMassResult.totalMass.toFixed(3)} g/mol`,
        formula: 'PM = Σ (nᵢ × Peso_Atomicoᵢ)',
        details: [
          { label: 'Formula Chimica', value: formulaInput },
          { label: 'Massa Molare', value: `${molarMassResult.totalMass.toFixed(3)} g/mol` },
          { label: 'Moli nel campione', value: `${molarMassResult.molesInSample.toFixed(4)} mol` },
          { label: 'Molecole nel campione', value: `${molarMassResult.moleculesCount.toExponential(3)} molecole` }
        ]
      });
      showToast('Massa molecolare salvata nella cronologia!');
    } else if (activeTab === 'solutions') {
      onSaveHistory({
        calculatorId: 'chemistry-lab',
        calculatorTitle: 'Chimica: Soluzioni & pH',
        summary: `pH: ${solutionsResult.ph} (pOH: ${solutionsResult.poh.toFixed(1)}), M: ${solutionsResult.molarity.toFixed(3)} mol/L`,
        formula: 'M = n / V, pH = -log₁₀[H⁺]',
        details: [
          { label: 'Molarità', value: `${solutionsResult.molarity.toFixed(3)} M` },
          { label: 'Diluizione M₂ (M₁V₁=M₂V₂)', value: `${solutionsResult.m2.toFixed(3)} M` },
          { label: 'Concentrazione [H⁺]', value: `${solutionsResult.hConc.toExponential(2)} mol/L` }
        ]
      });
      showToast('Calcolo soluzioni salvato!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 border border-teal-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 border border-teal-400/30 rounded-xl text-teal-400">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Chimica, Stechiometria & Tavola Periodica</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  IUPAC Studio
                </span>
              </div>
              <p className="text-xs sm:text-sm text-teal-200/80 mt-1">
                Tavola periodica dinamica, masse molecolari di composti, bilanciamento reazioni stechiometriche, diluizioni e calcolatore pH.
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
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-600/30 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salva Risultato</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'molar', label: 'Massa Molecolare & Composizione %' },
          { id: 'table', label: 'Tavola Periodica Dinamica' },
          { id: 'reactions', label: 'Bilanciatore Reazioni & Stechiometria' },
          { id: 'solutions', label: 'Molarità, Diluizione & pH' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/70 dark:hover:bg-zinc-700/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Molar Mass */}
      {activeTab === 'molar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Formula Chimica del Composto
            </h3>

            <CalcInput
              label="Formula Molecolare"
              value={formulaInput}
              onChange={setFormulaInput}
              placeholder="es. C6H12O6, H2SO4, Ca(OH)2"
              helperText="Supporta parentesi tonde e quadre, es. (NH4)2SO4"
            />

            <CalcInput
              label="Massa Campione (grammi)"
              value={sampleGrams}
              onChange={setSampleGrams}
              suffix="g"
              helperText="Per calcolare moli e numero di molecole di Avogadro"
            />

            {/* Quick preset molecules */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Formule Rapide:</span>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                {['H2O', 'CO2', 'NaCl', 'C6H12O6', 'H2SO4', 'CaCO3'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormulaInput(f)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-teal-600 dark:text-teal-400 font-semibold text-center"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {molarMassResult ? (
              <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
                    Massa Molare del Composto {formulaInput}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    N_A = 6.022 × 10²³ mol⁻¹
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-mono font-bold text-teal-300">
                    {molarMassResult.totalMass.toFixed(3)} g/mol
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    {sampleGrams} grammi = {molarMassResult.molesInSample.toFixed(4)} moli ({molarMassResult.moleculesCount.toExponential(3)} molecole)
                  </div>
                </div>

                {/* Elements Breakdown List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ripartizione Percentuale in Massa Elementare:
                  </span>
                  {molarMassResult.elementsBreakdown.map((e) => (
                    <div key={e.symbol} className="space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-400">
                          {e.symbol} ({e.name}) × {e.count}
                        </span>
                        <span className="text-slate-300">
                          {e.subtotal.toFixed(2)} g/mol ({e.percent.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                          style={{ width: `${e.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                Formula chimica non valida o elemento non riconosciuto. Verifica la sintassi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Periodic Table */}
      {activeTab === 'table' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cerca elemento (es. Fe, Oro, 26)..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs"
              />
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredElements.length} elementi trovati
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Grid of elements */}
            <div className="lg:col-span-8 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[460px] overflow-y-auto p-1">
              {filteredElements.map((el) => {
                const isSelected = el.z === selectedZ;
                return (
                  <button
                    key={el.z}
                    type="button"
                    onClick={() => setSelectedZ(el.z)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-105'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-teal-400 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="text-[10px] font-mono opacity-60 text-right">{el.z}</div>
                    <div className="text-lg font-bold font-mono">{el.symbol}</div>
                    <div className="text-[10px] truncate">{el.name}</div>
                    <div className="text-[9px] font-mono opacity-75">{el.mass.toFixed(1)}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Element Card */}
            <div className="lg:col-span-4 bg-slate-900 border border-teal-500/30 rounded-2xl p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
                <span className="text-xs font-mono uppercase text-teal-400">Numero Atomico Z = {selectedElement.z}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {selectedElement.category}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-mono font-bold text-teal-300">{selectedElement.symbol}</div>
                <div>
                  <div className="text-xl font-bold">{selectedElement.name}</div>
                  <div className="text-xs font-mono text-slate-400">{selectedElement.mass} u (g/mol)</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Configurazione Elettronica:</span>
                  <span className="font-bold text-white">{selectedElement.config}</span>
                </div>
                {selectedElement.electronegativity && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elettronegatività Pauling:</span>
                    <span className="font-bold text-teal-400">{selectedElement.electronegativity}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Stato standard (20°C):</span>
                  <span className="font-bold text-white">{selectedElement.state}</span>
                </div>
                {selectedElement.meltC !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Punto di Fusione:</span>
                    <span className="font-bold text-white">{selectedElement.meltC} °C</span>
                  </div>
                )}
                {selectedElement.boilC !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Punto di Ebollizione:</span>
                    <span className="font-bold text-white">{selectedElement.boilC} °C</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Chemical Reaction Balancer */}
      {activeTab === 'reactions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Equazione Chimica da Bilanciare
            </h3>

            <CalcInput
              label="Reagenti ➔ Prodotti"
              value={reactionInput}
              onChange={setReactionInput}
              placeholder="es. C3H8 + O2 -> CO2 + H2O"
            />

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reazioni Notorie:</span>
              <div className="space-y-1 font-mono text-xs">
                {[
                  'C3H8 + O2 -> CO2 + H2O',
                  'H2 + O2 -> H2O',
                  'Fe + O2 -> Fe2O3',
                  'CH4 + O2 -> CO2 + H2O',
                  'N2 + H2 -> NH3'
                ].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReactionInput(r)}
                    className="w-full text-left p-2 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-teal-600 dark:text-teal-400 font-semibold"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
                <span className="text-xs font-mono uppercase text-teal-400">Equazione Bilanciata Stechiometrica</span>
                <span className="text-xs font-bold text-emerald-400">{balancedReactionResult.type}</span>
              </div>

              <div className="text-xl sm:text-2xl font-mono font-bold text-teal-300 py-1">
                {balancedReactionResult.balanced}
              </div>

              <p className="text-xs text-slate-300 border-t border-slate-800 pt-3">
                {balancedReactionResult.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Solutions, Molarity & pH */}
      {activeTab === 'solutions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Parametri Soluzione & Diluizione
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <CalcInput
                label="Moli Soluto n (mol)"
                value={soluteMoles}
                onChange={setSoluteMoles}
                suffix="mol"
              />
              <CalcInput
                label="Volume Soluzione V (L)"
                value={solVolumeL}
                onChange={setSolVolumeL}
                suffix="L"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Diluizione M₁V₁ = M₂V₂:</span>
              <div className="grid grid-cols-3 gap-2">
                <CalcInput label="M₁ (mol/L)" value={m1Input} onChange={setM1Input} suffix="M" />
                <CalcInput label="V₁ (mL)" value={v1Input} onChange={setV1Input} suffix="mL" />
                <CalcInput label="V₂ (mL)" value={v2Input} onChange={setV2Input} suffix="mL" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
              <CalcInput
                label="pH Soluzione (0 - 14)"
                value={phInput}
                onChange={setPhInput}
                helperText="pH = -log₁₀[H⁺], pOH = 14 - pH"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 text-white shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
                <span className="text-xs font-mono uppercase text-teal-400">Molarità & Acidità pH/pOH</span>
                <span className="text-xs font-mono text-slate-400">Equilibrio Ionico</span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Molarità M (n/V):</span>
                  <div className="text-2xl font-bold text-teal-300">{solutionsResult.molarity.toFixed(3)} M</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Diluizione Finale M₂:</span>
                  <div className="text-2xl font-bold text-emerald-400">{solutionsResult.m2.toFixed(3)} M</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">pOH Soluzione:</span>
                  <div className="text-xl font-bold text-amber-300">{solutionsResult.poh.toFixed(2)}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Concentrazione [H⁺]:</span>
                  <div className="text-sm font-bold text-white">{solutionsResult.hConc.toExponential(2)} M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <SectionHistoryTape
        calculatorId="chemistry-lab"
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

import React, { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  Layers,
  Sparkles,
  Droplets,
  Building2,
  TreePine,
  Shield,
  Wind,
  Package,
  Gem,
  Apple,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRightLeft,
  Info,
  Waves,
  Box,
  Cylinder,
  CircleDot,
  FileSpreadsheet
} from 'lucide-react';
import { AppSettings, HistoryItem } from '../../types';
import {
  WORLD_MATERIALS,
  MATERIAL_CATEGORIES,
  MaterialCategory,
  MaterialItem,
  IMMERSION_FLUIDS
} from '../../data/materialsDatabase';
import { formatNumber } from '../../utils/format';

interface MaterialDensityWeightCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  history: HistoryItem[];
  initialInputs?: Record<string, any>;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: any) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

type CalcMode = 'volume-to-mass' | 'mass-to-volume' | 'find-density';
type ActiveTab = 'calculator' | 'buoyancy' | 'ranking' | 'guide';
type ShapeType = 'custom_volume' | 'box' | 'cylinder' | 'sphere' | 'sheet';

// Volume units
const VOLUME_UNITS = [
  { id: 'm3', label: 'Metri cubi (m³)', factorToM3: 1 },
  { id: 'dm3_l', label: 'Litri / Decimetri cubi (dm³ / L)', factorToM3: 0.001 },
  { id: 'cm3_ml', label: 'Centimetri cubi / ml (cm³)', factorToM3: 0.000001 },
  { id: 'mm3', label: 'Millimetri cubi (mm³)', factorToM3: 1e-9 },
  { id: 'hl', label: 'Ettolitri (hL = 100 L)', factorToM3: 0.1 },
  { id: 'ft3', label: 'Piedi cubi (cu ft / ft³)', factorToM3: 0.0283168 },
  { id: 'in3', label: 'Pollici cubi (cu in / in³)', factorToM3: 0.0000163871 },
  { id: 'gal_us', label: 'Galloni US liquid (gal)', factorToM3: 0.00378541 },
  { id: 'bbl', label: 'Barili petrolio (bbl = 159 L)', factorToM3: 0.158987 },
];

// Mass units
const MASS_UNITS = [
  { id: 'kg', label: 'Chilogrammi (kg)', factorToKg: 1 },
  { id: 'g', label: 'Grammi (g)', factorToKg: 0.001 },
  { id: 'mg', label: 'Milligrammi (mg)', factorToKg: 0.000001 },
  { id: 'ton', label: 'Tonnellate metriche (t = 1000 kg)', factorToKg: 1000 },
  { id: 'quintal', label: 'Quintali (q = 100 kg)', factorToKg: 100 },
  { id: 'lb', label: 'Libbre (lb)', factorToKg: 0.45359237 },
  { id: 'oz', label: 'Once (oz)', factorToKg: 0.028349523 },
];

// Gravity options
const GRAVITY_OPTIONS = [
  { id: 'earth', label: 'Terra (g = 9.807 m/s²)', value: 9.80665 },
  { id: 'moon', label: 'Luna (g = 1.62 m/s²)', value: 1.62 },
  { id: 'mars', label: 'Marte (g = 3.72 m/s²)', value: 3.72 },
  { id: 'jupiter', label: 'Giove (g = 24.79 m/s²)', value: 24.79 },
  { id: 'space', label: 'Microgravità / Spazio (g = 0)', value: 0 },
];

export const MaterialDensityWeightCalculator: React.FC<MaterialDensityWeightCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [calcMode, setCalcMode] = useState<CalcMode>('volume-to-mass');

  // Selected material
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('iron-pure');
  const [isCustomMaterial, setIsCustomMaterial] = useState<boolean>(false);
  const [customMaterialName, setCustomMaterialName] = useState<string>('Mio Materiale');
  const [customDensityGcm3, setCustomDensityGcm3] = useState<string>('2.5');

  // Search in material dropdown / catalog
  const [searchMaterialQuery, setSearchMaterialQuery] = useState<string>('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<MaterialCategory>('all');
  const [catalogSortBy, setCatalogSortBy] = useState<'density_desc' | 'density_asc' | 'name'>('density_desc');

  // Input states for Mode A: Volume to Mass
  const [volumeInput, setVolumeInput] = useState<string>('1');
  const [volumeUnit, setVolumeUnit] = useState<string>('dm3_l');
  const [gravityOption, setGravityOption] = useState<string>('earth');

  // Geometric shape helper for volume
  const [shapeType, setShapeType] = useState<ShapeType>('custom_volume');
  const [boxL, setBoxL] = useState<string>('10'); // cm
  const [boxW, setBoxW] = useState<string>('10'); // cm
  const [boxH, setBoxH] = useState<string>('10'); // cm
  const [cylR, setCylR] = useState<string>('5'); // cm
  const [cylH, setCylH] = useState<string>('20'); // cm
  const [sphereR, setSphereR] = useState<string>('10'); // cm
  const [sheetArea, setSheetArea] = useState<string>('1'); // m²
  const [sheetThickness, setSheetThickness] = useState<string>('5'); // mm

  // Input states for Mode B: Mass to Volume
  const [massInput, setMassInput] = useState<string>('10');
  const [massUnit, setMassUnit] = useState<string>('kg');

  // Input states for Mode C: Find unknown density
  const [unknownMass, setUnknownMass] = useState<string>('193.2'); // grams
  const [unknownVolume, setUnknownVolume] = useState<string>('10'); // cm3 (e.g. gold test)

  // Buoyancy states
  const [buoyancyFluidId, setBuoyancyFluidId] = useState<string>('water-fresh');
  const [buoyancySampleVolume, setBuoyancySampleVolume] = useState<string>('1'); // Litres

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active Material Item
  const activeMaterial: MaterialItem = useMemo(() => {
    if (isCustomMaterial) {
      const val = parseFloat(customDensityGcm3.replace(',', '.')) || 1.0;
      return {
        id: 'custom',
        name: customMaterialName || 'Materiale Personalizzato',
        nameEn: customMaterialName || 'Custom Material',
        category: 'metals',
        density_g_cm3: val,
        density_kg_m3: val * 1000,
        specificGravity: val,
        state: 'solid',
        desc: `Materiale inserito manualmente dall'utente con densità di ${val} g/cm³.`,
        tags: ['custom', 'personalizzato']
      };
    }
    const found = WORLD_MATERIALS.find((m) => m.id === selectedMaterialId);
    return found || WORLD_MATERIALS[0];
  }, [isCustomMaterial, customMaterialName, customDensityGcm3, selectedMaterialId]);

  // Handle Geometric Shape Volume calculation in m³
  const computedVolumeM3 = useMemo(() => {
    if (shapeType === 'box') {
      const l = (parseFloat(boxL.replace(',', '.')) || 0) / 100;
      const w = (parseFloat(boxW.replace(',', '.')) || 0) / 100;
      const h = (parseFloat(boxH.replace(',', '.')) || 0) / 100;
      return l * w * h;
    }
    if (shapeType === 'cylinder') {
      const r = (parseFloat(cylR.replace(',', '.')) || 0) / 100;
      const h = (parseFloat(cylH.replace(',', '.')) || 0) / 100;
      return Math.PI * r * r * h;
    }
    if (shapeType === 'sphere') {
      const r = (parseFloat(sphereR.replace(',', '.')) || 0) / 100;
      return (4 / 3) * Math.PI * Math.pow(r, 3);
    }
    if (shapeType === 'sheet') {
      const area = parseFloat(sheetArea.replace(',', '.')) || 0; // m²
      const thick = (parseFloat(sheetThickness.replace(',', '.')) || 0) / 1000; // mm to m
      return area * thick;
    }
    // Default: from direct volume input
    const vVal = parseFloat(volumeInput.replace(',', '.')) || 0;
    const unitObj = VOLUME_UNITS.find((u) => u.id === volumeUnit) || VOLUME_UNITS[0];
    return vVal * unitObj.factorToM3;
  }, [shapeType, boxL, boxW, boxH, cylR, cylH, sphereR, sheetArea, sheetThickness, volumeInput, volumeUnit]);

  // Mode A Calculation: Given Volume -> compute Mass and Weight
  const modeAResults = useMemo(() => {
    const vM3 = computedVolumeM3;
    const densityKgM3 = activeMaterial.density_kg_m3;
    const massKg = vM3 * densityKgM3;

    const massG = massKg * 1000;
    const massTon = massKg / 1000;
    const massQuintal = massKg / 100;
    const massLb = massKg / 0.45359237;
    const massOz = massKg / 0.028349523;

    const grav = GRAVITY_OPTIONS.find((g) => g.id === gravityOption)?.value ?? 9.80665;
    const weightNewtons = massKg * grav;
    const weightKN = weightNewtons / 1000;
    const weightKgf = massKg * (grav / 9.80665);

    return {
      volumeM3: vM3,
      volumeLiters: vM3 * 1000,
      massKg,
      massG,
      massTon,
      massQuintal,
      massLb,
      massOz,
      weightNewtons,
      weightKN,
      weightKgf,
      gravity: grav
    };
  }, [computedVolumeM3, activeMaterial, gravityOption]);

  // Mode B Calculation: Given Mass -> compute Volume
  const modeBResults = useMemo(() => {
    const mVal = parseFloat(massInput.replace(',', '.')) || 0;
    const unitObj = MASS_UNITS.find((u) => u.id === massUnit) || MASS_UNITS[0];
    const massKg = mVal * unitObj.factorToKg;
    const densityKgM3 = activeMaterial.density_kg_m3;

    const volumeM3 = densityKgM3 > 0 ? massKg / densityKgM3 : 0;
    const volumeLiters = volumeM3 * 1000;
    const volumeCm3 = volumeM3 * 1000000;
    const volumeCuFt = volumeM3 / 0.0283168;
    const volumeGalUS = volumeM3 / 0.00378541;

    return {
      massKg,
      volumeM3,
      volumeLiters,
      volumeCm3,
      volumeCuFt,
      volumeGalUS
    };
  }, [massInput, massUnit, activeMaterial]);

  // Mode C Calculation: Find unknown density from Mass and Volume
  const modeCResults = useMemo(() => {
    const mG = parseFloat(unknownMass.replace(',', '.')) || 0;
    const vCm3 = parseFloat(unknownVolume.replace(',', '.')) || 0;

    if (vCm3 <= 0 || mG <= 0) {
      return {
        densityGcm3: 0,
        densityKgM3: 0,
        specificGravity: 0,
        closestMatches: []
      };
    }

    const densityGcm3 = mG / vCm3;
    const densityKgM3 = densityGcm3 * 1000;
    const specificGravity = densityGcm3; // water is 1.0 g/cm3

    // Find closest materials in world database
    const sorted = [...WORLD_MATERIALS]
      .map((mat) => {
        const diff = Math.abs(mat.density_g_cm3 - densityGcm3);
        const percentMatch = Math.max(0, 100 - (diff / densityGcm3) * 100);
        return { mat, diff, percentMatch };
      })
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 5);

    return {
      densityGcm3,
      densityKgM3,
      specificGravity,
      closestMatches: sorted
    };
  }, [unknownMass, unknownVolume]);

  // Buoyancy Simulator
  const buoyancyResults = useMemo(() => {
    const fluid = IMMERSION_FLUIDS.find((f) => f.id === buoyancyFluidId) || IMMERSION_FLUIDS[0];
    const sampleV_L = parseFloat(buoyancySampleVolume.replace(',', '.')) || 1.0;
    const sampleV_m3 = sampleV_L * 0.001;

    const rhoMat = activeMaterial.density_kg_m3;
    const rhoFluid = fluid.density_kg_m3;

    // Weight of object in air (standard g)
    const massKg = sampleV_m3 * rhoMat;
    const weightAirN = massKg * 9.80665;

    // Maximum buoyant force if fully submerged
    const maxBuoyantForceN = sampleV_m3 * rhoFluid * 9.80665;

    let status: 'floats' | 'neutral' | 'sinks' = 'sinks';
    let submergedRatio = 1.0;

    if (rhoMat < rhoFluid) {
      status = 'floats';
      submergedRatio = rhoMat / rhoFluid;
    } else if (Math.abs(rhoMat - rhoFluid) < 0.5) {
      status = 'neutral';
      submergedRatio = 1.0;
    } else {
      status = 'sinks';
      submergedRatio = 1.0;
    }

    const submergedPercent = Math.min(100, Math.max(0, submergedRatio * 100));
    const emergedPercent = 100 - submergedPercent;

    const actualSubmergedV_L = sampleV_L * (submergedPercent / 100);
    const actualBuoyantForceN = (actualSubmergedV_L * 0.001) * rhoFluid * 9.80665;
    const actualBuoyantKgf = actualBuoyantForceN / 9.80665;

    // Apparent weight in fluid
    const apparentWeightN = Math.max(0, weightAirN - actualBuoyantForceN);
    const apparentWeightKgf = apparentWeightN / 9.80665;

    return {
      fluid,
      status,
      submergedPercent,
      emergedPercent,
      actualSubmergedV_L,
      actualBuoyantForceN,
      actualBuoyantKgf,
      apparentWeightN,
      apparentWeightKgf,
      weightAirN,
      massKg
    };
  }, [activeMaterial, buoyancyFluidId, buoyancySampleVolume]);

  // Filtered materials for table and select
  const filteredMaterials = useMemo(() => {
    let list = [...WORLD_MATERIALS];

    if (catalogCategoryFilter !== 'all') {
      list = list.filter((m) => m.category === catalogCategoryFilter);
    }

    if (searchMaterialQuery.trim()) {
      const q = searchMaterialQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.nameEn.toLowerCase().includes(q) ||
          m.desc.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (catalogSortBy === 'density_desc') {
      list.sort((a, b) => b.density_kg_m3 - a.density_kg_m3);
    } else if (catalogSortBy === 'density_asc') {
      list.sort((a, b) => a.density_kg_m3 - b.density_kg_m3);
    } else if (catalogSortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [catalogCategoryFilter, searchMaterialQuery, catalogSortBy]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Valore copiato negli appunti!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToHistory = () => {
    if (calcMode === 'volume-to-mass') {
      onSaveHistory({
        calculatorId: 'material-density-weight',
        calculatorTitle: `Peso Specifico: ${activeMaterial.name}`,
        summary: `Massa = ${formatNumber(modeAResults.massKg, settings)} kg (${formatNumber(modeAResults.weightKN, settings)} kN) | Vol = ${formatNumber(modeAResults.volumeLiters, settings)} L`,
        details: [
          { label: 'Materiale', value: activeMaterial.name },
          { label: 'Densità', value: `${activeMaterial.density_g_cm3} g/cm³ (${activeMaterial.density_kg_m3} kg/m³)` },
          { label: 'Volume', value: `${formatNumber(modeAResults.volumeLiters, settings)} L (${formatNumber(modeAResults.volumeM3, settings)} m³)` },
          { label: 'Massa Totale', value: `${formatNumber(modeAResults.massKg, settings)} kg` },
          { label: 'Forza Peso', value: `${formatNumber(modeAResults.weightKN, settings)} kN` }
        ],
        formula: `Massa = Volume × Densità = ${formatNumber(modeAResults.volumeM3, settings)} m³ × ${activeMaterial.density_kg_m3} kg/m³ = ${formatNumber(modeAResults.massKg, settings)} kg`,
        inputs: {
          material: activeMaterial.name,
          density: `${activeMaterial.density_g_cm3} g/cm³`,
          volume: `${formatNumber(modeAResults.volumeLiters, settings)} L`
        }
      });
    } else if (calcMode === 'mass-to-volume') {
      onSaveHistory({
        calculatorId: 'material-density-weight',
        calculatorTitle: `Volume da Massa: ${activeMaterial.name}`,
        summary: `Volume = ${formatNumber(modeBResults.volumeLiters, settings)} L (${formatNumber(modeBResults.volumeM3, settings)} m³) per ${massInput} ${massUnit}`,
        details: [
          { label: 'Materiale', value: activeMaterial.name },
          { label: 'Massa Inserita', value: `${massInput} ${massUnit}` },
          { label: 'Densità', value: `${activeMaterial.density_g_cm3} g/cm³` },
          { label: 'Volume Risultante', value: `${formatNumber(modeBResults.volumeLiters, settings)} Litri` }
        ],
        formula: `Volume = Massa / Densità = ${formatNumber(modeBResults.massKg, settings)} kg / ${activeMaterial.density_kg_m3} kg/m³ = ${formatNumber(modeBResults.volumeLiters, settings)} L`,
        inputs: {
          material: activeMaterial.name,
          mass: `${massInput} ${massUnit}`
        }
      });
    } else {
      onSaveHistory({
        calculatorId: 'material-density-weight',
        calculatorTitle: `Identificazione Materiale da Densità`,
        summary: `Densità = ${formatNumber(modeCResults.densityGcm3, settings)} g/cm³ (SG: ${formatNumber(modeCResults.specificGravity, settings)})`,
        details: [
          { label: 'Massa Campione', value: `${unknownMass} g` },
          { label: 'Volume Spostato', value: `${unknownVolume} cm³` },
          { label: 'Densità Calcolata', value: `${formatNumber(modeCResults.densityGcm3, settings)} g/cm³ (${formatNumber(modeCResults.densityKgM3, settings)} kg/m³)` },
          { label: 'Materiale più simile', value: modeCResults.closestMatches[0]?.mat.name || 'N/A' }
        ],
        formula: `Densità = Massa / Volume = ${unknownMass} g / ${unknownVolume} cm³ = ${formatNumber(modeCResults.densityGcm3, settings)} g/cm³`,
        inputs: {
          massa: `${unknownMass} g`,
          volume: `${unknownVolume} cm³`
        }
      });
    }
    showToast('Calcolo salvato nella cronologia!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Selector */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Scale className="w-56 h-56 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 text-emerald-100 backdrop-blur-xs">
                Archimede & Fisica dei Materiali ⚖️
              </span>
              <span className="text-[11px] font-bold text-white/80">
                130+ Materiali Censiti al Mondo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pesi Specifici & Densità dei Materiali del Mondo
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
              Calcola massa, peso forza e volume di qualsiasi metallo, legno, roccia, liquido, gas o polimero. Include simulatore di galleggiamento con Principio di Archimede.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
                title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
              >
                ★
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="px-3.5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Salva Calcolo
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/15">
          {[
            { id: 'calculator', label: 'Calcolatore Triplo (M ↔ V ↔ ρ)', icon: ArrowRightLeft },
            { id: 'buoyancy', label: 'Galleggiamento & Archimede', icon: Waves },
            { id: 'ranking', label: 'Tavola & Classifica Materiali', icon: Layers },
            { id: 'guide', label: 'Guida Didattica & Formule', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          TAB 1: CALCOLATORE TRIPLO (MASSA ↔ VOLUME ↔ DENSITA')
          ======================================================== */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonna Sinistra: Configurazione Materiale e Modalità */}
          <div className="lg:col-span-7 space-y-5">
            {/* Scelta Modalità Tripla */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Cosa vuoi calcolare?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcMode('volume-to-mass')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    calcMode === 'volume-to-mass'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="block text-xs font-black">Volume ➔ Massa</span>
                  <span className="block text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Dato il volume, calcola kg e peso
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCalcMode('mass-to-volume')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    calcMode === 'mass-to-volume'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="block text-xs font-black">Massa ➔ Volume</span>
                  <span className="block text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Dato il peso, calcola litri o m³
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCalcMode('find-density')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    calcMode === 'find-density'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="block text-xs font-black">Identifica Materiale</span>
                  <span className="block text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Trova la densità da M e V
                  </span>
                </button>
              </div>
            </div>

            {/* Selezione Materiale (per Modalità A e B) */}
            {calcMode !== 'find-density' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Seleziona Materiale del Mondo
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomMaterial(!isCustomMaterial)}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {isCustomMaterial ? '← Scegli da catalogo mondiale' : '+ Inserisci materiale personalizzato'}
                  </button>
                </div>

                {isCustomMaterial ? (
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Nome Materiale
                      </label>
                      <input
                        type="text"
                        value={customMaterialName}
                        onChange={(e) => setCustomMaterialName(e.target.value)}
                        placeholder="Es. Resina speciale, Lega titanio X..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Densità / Peso Specifico (in g/cm³ o t/m³)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customDensityGcm3}
                          onChange={(e) => setCustomDensityGcm3(e.target.value)}
                          placeholder="Es. 2.7"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                        />
                        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 shrink-0">
                          g/cm³ (= kg/dm³)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={selectedMaterialId}
                        onChange={(e) => setSelectedMaterialId(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                      >
                        {WORLD_MATERIALS.map((mat) => (
                          <option key={mat.id} value={mat.id}>
                            {mat.name} — {mat.density_g_cm3} g/cm³ ({mat.density_kg_m3} kg/m³)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Scheda riepilogativa materiale selezionato */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                            {activeMaterial.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                            SG: {activeMaterial.specificGravity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {activeMaterial.desc}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 block">
                          {activeMaterial.density_g_cm3} g/cm³
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {activeMaterial.density_kg_m3.toLocaleString('it-IT')} kg/m³
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input Form per MODALITA' A: Volume to Mass */}
            {calcMode === 'volume-to-mass' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Come vuoi inserire il volume?
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShapeType('custom_volume')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        shapeType === 'custom_volume'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Volume Diretto
                    </button>
                    <button
                      type="button"
                      onClick={() => setShapeType('box')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        shapeType === 'box'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Blocco
                    </button>
                    <button
                      type="button"
                      onClick={() => setShapeType('cylinder')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        shapeType === 'cylinder'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Cilindro
                    </button>
                    <button
                      type="button"
                      onClick={() => setShapeType('sphere')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        shapeType === 'sphere'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Sfera
                    </button>
                    <button
                      type="button"
                      onClick={() => setShapeType('sheet')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        shapeType === 'sheet'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Lastra
                    </button>
                  </div>
                </div>

                {/* Direct Volume */}
                {shapeType === 'custom_volume' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Valore Volume
                      </label>
                      <input
                        type="text"
                        value={volumeInput}
                        onChange={(e) => setVolumeInput(e.target.value)}
                        placeholder="1.0"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-mono font-bold text-slate-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Unità di Misura
                      </label>
                      <select
                        value={volumeUnit}
                        onChange={(e) => setVolumeUnit(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100"
                      >
                        {VOLUME_UNITS.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Shape: Box */}
                {shapeType === 'box' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Inserisci le tre dimensioni del parallelepipedo in centimetri (cm):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Lunghezza (cm)</label>
                        <input
                          type="text"
                          value={boxL}
                          onChange={(e) => setBoxL(e.target.value)}
                          className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Larghezza (cm)</label>
                        <input
                          type="text"
                          value={boxW}
                          onChange={(e) => setBoxW(e.target.value)}
                          className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Altezza (cm)</label>
                        <input
                          type="text"
                          value={boxH}
                          onChange={(e) => setBoxH(e.target.value)}
                          className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shape: Cylinder */}
                {shapeType === 'cylinder' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Inserisci raggio di base e altezza del cilindro in centimetri (cm):
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Raggio Base r (cm)</label>
                        <input
                          type="text"
                          value={cylR}
                          onChange={(e) => setCylR(e.target.value)}
                          className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Altezza h (cm)</label>
                        <input
                          type="text"
                          value={cylH}
                          onChange={(e) => setCylH(e.target.value)}
                          className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shape: Sphere */}
                {shapeType === 'sphere' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Inserisci il raggio della sfera in centimetri (cm):
                    </p>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Raggio r (cm)</label>
                      <input
                        type="text"
                        value={sphereR}
                        onChange={(e) => setSphereR(e.target.value)}
                        className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Shape: Sheet */}
                {shapeType === 'sheet' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Inserisci la superficie in metri quadri e lo spessore in millimetri:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Area Superficie (m²)</label>
                        <input
                          type="text"
                          value={sheetArea}
                          onChange={(e) => setSheetArea(e.target.value)}
                          className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Spessore (mm)</label>
                        <input
                          type="text"
                          value={sheetThickness}
                          onChange={(e) => setSheetThickness(e.target.value)}
                          className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Scelta Gravità per Peso Forza */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Campo gravitazionale per calcolo Forza Peso
                  </label>
                  <select
                    value={gravityOption}
                    onChange={(e) => setGravityOption(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-zinc-100"
                  >
                    {GRAVITY_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Input Form per MODALITA' B: Mass to Volume */}
            {calcMode === 'mass-to-volume' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  Inserisci Massa / Peso del materiale
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Quantità
                    </label>
                    <input
                      type="text"
                      value={massInput}
                      onChange={(e) => setMassInput(e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-mono font-bold text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Unità di Massa
                    </label>
                    <select
                      value={massUnit}
                      onChange={(e) => setMassUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100"
                    >
                      {MASS_UNITS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Input Form per MODALITA' C: Identifica Materiale da Densità Sconosciuta */}
            {calcMode === 'find-density' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      Test Idrostatico o Pesata (Principio di Archimede)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Pesa il tuo campione e misura il volume d'acqua spostato per identificare di che materiale si tratta!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Massa pesata del campione (in Grammi, g)
                    </label>
                    <input
                      type="text"
                      value={unknownMass}
                      onChange={(e) => setUnknownMass(e.target.value)}
                      placeholder="Es. 193.2"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Volume spostato (in cm³ = ml)
                    </label>
                    <input
                      type="text"
                      value={unknownVolume}
                      onChange={(e) => setUnknownVolume(e.target.value)}
                      placeholder="Es. 10"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonna Destra: Risultati e Schede di Conversione */}
          <div className="lg:col-span-5 space-y-4">
            {calcMode === 'volume-to-mass' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Risultato Massa Calcolata
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                    {activeMaterial.name}
                  </span>
                </div>

                {/* Primary Big Result */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-500/20 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    Massa Totale
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black font-mono text-emerald-900 dark:text-emerald-100">
                      {formatNumber(modeAResults.massKg, settings)} kg
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${modeAResults.massKg} kg`, 'primary_mass')}
                      className="p-1.5 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'primary_mass' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">
                    equivalenti a {formatNumber(modeAResults.massG, settings)} grammi ({formatNumber(modeAResults.massTon, settings)} t)
                  </span>
                </div>

                {/* Tabella Unità di Misura Massa e Peso */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-300 block">
                    Massa in tutte le unità:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Tonnellate metriche (t)</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                        {formatNumber(modeAResults.massTon, settings)} t
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Quintali (q)</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                        {formatNumber(modeAResults.massQuintal, settings)} q
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Libbre imperiali (lb)</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                        {formatNumber(modeAResults.massLb, settings)} lb
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Once (oz)</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                        {formatNumber(modeAResults.massOz, settings)} oz
                      </span>
                    </div>
                  </div>

                  {/* Forza Peso (N e kN) */}
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                      Forza Peso gravitazionale (P = m · g):
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-black text-amber-900 dark:text-amber-100">
                        {formatNumber(modeAResults.weightKN, settings)} kN ({formatNumber(modeAResults.weightNewtons, settings)} N)
                      </span>
                      <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                        ≈ {formatNumber(modeAResults.weightKgf, settings)} kgf
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300">
                    <Info className="w-3.5 h-3.5 text-emerald-500" />
                    Formula Applicata:
                  </div>
                  <p className="font-mono text-[10px]">
                    M = V × ρ = {formatNumber(modeAResults.volumeM3, settings)} m³ × {activeMaterial.density_kg_m3} kg/m³ = {formatNumber(modeAResults.massKg, settings)} kg
                  </p>
                </div>
              </div>
            )}

            {calcMode === 'mass-to-volume' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Volume Occupato
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                    {activeMaterial.name}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/20 border border-teal-500/20 space-y-1">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block">
                    Volume in Litri (dm³)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black font-mono text-teal-900 dark:text-teal-100">
                      {formatNumber(modeBResults.volumeLiters, settings)} L
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${modeBResults.volumeLiters} L`, 'vol_liters')}
                      className="p-1.5 rounded-lg hover:bg-teal-200/50 text-teal-700 dark:text-teal-300 cursor-pointer"
                    >
                      {copiedKey === 'vol_liters' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold block">
                    equivalenti a {formatNumber(modeBResults.volumeM3, settings)} metri cubi (m³)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Centimetri cubi (cm³ / ml)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                      {formatNumber(modeBResults.volumeCm3, settings)} cm³
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Piedi cubi (cu ft)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                      {formatNumber(modeBResults.volumeCuFt, settings)} ft³
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60 col-span-2">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Galloni US liquid</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                      {formatNumber(modeBResults.volumeGalUS, settings)} gal
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300">
                    <Info className="w-3.5 h-3.5 text-teal-500" />
                    Formula Applicata:
                  </div>
                  <p className="font-mono text-[10px]">
                    V = M / ρ = {formatNumber(modeBResults.massKg, settings)} kg / {activeMaterial.density_kg_m3} kg/m³ = {formatNumber(modeBResults.volumeLiters, settings)} Litri
                  </p>
                </div>
              </div>
            )}

            {calcMode === 'find-density' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Densità Calcolata del Campione
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 font-bold">
                    SG: {formatNumber(modeCResults.specificGravity, settings)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/20 border border-cyan-500/20 space-y-1">
                  <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 block">
                    Densità Assoluta
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black font-mono text-cyan-900 dark:text-cyan-100">
                      {formatNumber(modeCResults.densityGcm3, settings)} g/cm³
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${modeCResults.densityGcm3} g/cm³`, 'density_res')}
                      className="p-1.5 rounded-lg hover:bg-cyan-200/50 text-cyan-700 dark:text-cyan-300 cursor-pointer"
                    >
                      {copiedKey === 'density_res' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold block">
                    = {formatNumber(modeCResults.densityKgM3, settings)} kg/m³ (= {formatNumber(modeCResults.densityGcm3, settings)} t/m³)
                  </span>
                </div>

                {/* Materiali più simili nel catalogo mondiale */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                    Corrispondenze più probabili nel database:
                  </span>
                  <div className="space-y-1.5">
                    {modeCResults.closestMatches.map(({ mat, percentMatch }) => (
                      <div
                        key={mat.id}
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                            {mat.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Densità di riferimento: {mat.density_g_cm3} g/cm³
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatNumber(percentMatch, settings)}% match
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMaterialId(mat.id);
                              setIsCustomMaterial(false);
                              setCalcMode('volume-to-mass');
                              showToast(`Materiale selezionato: ${mat.name}`, 'info');
                            }}
                            className="block text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            Seleziona ➔
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: GALLEGGIAMENTO & PRINCIPIO DI ARCHIMEDE
          ======================================================== */}
      {activeTab === 'buoyancy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <Waves className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Simulatore di Flottazione Idrostatica
                </h3>
              </div>

              {/* Scelta Materiale Solido */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                  1. Materiale del Corpo
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => {
                    setSelectedMaterialId(e.target.value);
                    setIsCustomMaterial(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold"
                >
                  {WORLD_MATERIALS.filter((m) => m.state === 'solid').map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} ({mat.density_g_cm3} g/cm³)
                    </option>
                  ))}
                </select>
              </div>

              {/* Scelta Liquido d'Immersione */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                  2. Fluido / Liquido d'Immersione
                </label>
                <select
                  value={buoyancyFluidId}
                  onChange={(e) => setBuoyancyFluidId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-cyan-700 dark:text-cyan-300"
                >
                  {IMMERSION_FLUIDS.map((fl) => (
                    <option key={fl.id} value={fl.id}>
                      {fl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Volume del corpo */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                  3. Volume Totale dell'Oggetto (Litri)
                </label>
                <input
                  type="text"
                  value={buoyancySampleVolume}
                  onChange={(e) => setBuoyancySampleVolume(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-zinc-800 font-mono text-sm font-bold"
                />
              </div>

              {/* Statistiche numeriche */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500">Massa corpo in aria:</span>
                  <span className="font-mono font-bold">{formatNumber(buoyancyResults.massKg, settings)} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-500">Spinta di Archimede (FA):</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {formatNumber(buoyancyResults.actualBuoyantForceN, settings)} N ({formatNumber(buoyancyResults.actualBuoyantKgf, settings)} kgf)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Peso apparente nel fluido:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(buoyancyResults.apparentWeightKgf, settings)} kgf ({formatNumber(buoyancyResults.apparentWeightN, settings)} N)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonna Grafica Interattiva Galleggiamento */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Verdetto Fisico
                </span>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    buoyancyResults.status === 'floats'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : buoyancyResults.status === 'neutral'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}
                >
                  {buoyancyResults.status === 'floats' && '✓ GALLEGGIA (AFFIORA)'}
                  {buoyancyResults.status === 'neutral' && '≈ EQUILIBRIO NEUTRO (SOSPESO)'}
                  {buoyancyResults.status === 'sinks' && '✗ AFFONDA SUL FONDO'}
                </span>
              </div>

              {/* Illustrazione Grafica Dinamica SVG */}
              <div className="h-64 w-full bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 relative overflow-hidden flex flex-col justify-end p-4">
                {/* Livello Liquido */}
                <div className="absolute inset-x-0 bottom-0 h-44 bg-cyan-500/20 dark:bg-cyan-500/30 border-t-2 border-cyan-400 flex items-start justify-between px-3 pt-1">
                  <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                    Pelo dell'acqua / fluido ({buoyancyResults.fluid.name})
                  </span>
                  <span className="text-[10px] font-mono text-cyan-600">
                    ρ = {buoyancyResults.fluid.density_kg_m3} kg/m³
                  </span>
                </div>

                {/* Blocco Flottante / Affondato */}
                <div
                  className="relative z-10 mx-auto w-32 rounded-xl shadow-md border flex flex-col items-center justify-center p-2 text-center transition-all duration-500"
                  style={{
                    height: '90px',
                    marginBottom:
                      buoyancyResults.status === 'sinks'
                        ? '0px'
                        : `${Math.round((1 - buoyancyResults.submergedPercent / 100) * 85)}px`,
                    backgroundColor:
                      activeMaterial.category === 'metals'
                        ? '#cbd5e1'
                        : activeMaterial.category === 'woods'
                        ? '#d97706'
                        : activeMaterial.category === 'construction'
                        ? '#94a3b8'
                        : '#10b981',
                    borderColor: '#475569'
                  }}
                >
                  <span className="text-xs font-black text-slate-900 drop-shadow-xs">
                    {activeMaterial.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-800">
                    {activeMaterial.density_g_cm3} g/cm³
                  </span>
                </div>

                {/* Fondo Vasca */}
                <div className="absolute inset-x-0 bottom-0 h-3 bg-slate-300 dark:bg-zinc-800 border-t border-slate-400" />
              </div>

              {/* Barra Percentuale Immersione */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-cyan-600 dark:text-cyan-400">
                    Volume Immerso: {formatNumber(buoyancyResults.submergedPercent, settings)}% ({formatNumber(buoyancyResults.actualSubmergedV_L, settings)} L)
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Emerso: {formatNumber(buoyancyResults.emergedPercent, settings)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${buoyancyResults.submergedPercent}%` }}
                  />
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${buoyancyResults.emergedPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: TAVOLA COMPARATIVA & CLASSIFICA MONDIALE
          ======================================================== */}
      {activeTab === 'ranking' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Tavola Mondiale di Densità & Pesi Specifici
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {filteredMaterials.length} materiali trovati. Clicca su un materiale per caricarlo nel calcolatore.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Ricerca */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchMaterialQuery}
                  onChange={(e) => setSearchMaterialQuery(e.target.value)}
                  placeholder="Cerca materiale (es. Osmio, Oro, Rovere, Benzina)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium"
                />
              </div>

              {/* Ordinamento */}
              <select
                value={catalogSortBy}
                onChange={(e) => setCatalogSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold"
              >
                <option value="density_desc">Dal più denso al meno denso ⬇</option>
                <option value="density_asc">Dal più leggero al più denso ⬆</option>
                <option value="name">Alfabetico (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filtro per categoria con Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {MATERIAL_CATEGORIES.map((cat) => {
              const active = catalogCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCatalogCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Tabella Materiali */}
          <div className="overflow-x-auto max-h-[500px] border border-slate-200/80 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold border-b border-slate-200 dark:border-zinc-700">
                <tr>
                  <th className="p-3">Materiale</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 font-mono">Densità (g/cm³)</th>
                  <th className="p-3 font-mono">Densità (kg/m³)</th>
                  <th className="p-3 font-mono">Spec. Gravity (SG)</th>
                  <th className="p-3">In Acqua Dolce</th>
                  <th className="p-3 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-800 dark:text-zinc-200">
                {filteredMaterials.map((mat) => {
                  const floatsInWater = mat.density_kg_m3 < 1000;
                  return (
                    <tr
                      key={mat.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-850 transition-colors"
                    >
                      <td className="p-3 font-bold">
                        <div className="flex items-center gap-2">
                          <span>{mat.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs font-normal">
                          {mat.desc}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] capitalize text-slate-500">
                        {mat.category}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {mat.density_g_cm3}
                      </td>
                      <td className="p-3 font-mono">
                        {mat.density_kg_m3.toLocaleString('it-IT')}
                      </td>
                      <td className="p-3 font-mono">
                        {mat.specificGravity}
                      </td>
                      <td className="p-3">
                        {floatsInWater ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Galleggia 🌊
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                            Affonda ⚓
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMaterialId(mat.id);
                            setIsCustomMaterial(false);
                            setActiveTab('calculator');
                            showToast(`Caricato nel calcolatore: ${mat.name}`, 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Usa ➔
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: GUIDA DIDATTICA, FORMULE & TEORIA
          ======================================================== */}
      {activeTab === 'guide' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Guida Scientifica Completa: Densità, Peso Specifico e Principio di Archimede
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Spesso nel linguaggio comune e tecnico i termini "densità", "peso specifico" e "gravità specifica" vengono confusi. Ecco le definizioni rigorose secondo il Sistema Internazionale (SI):
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 space-y-2">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                1. Densità Assoluta (ρ)
              </span>
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                Rapporto tra la massa di un corpo e il suo volume. Proprietà intrinseca della materia indipendente dalla gravità.
              </p>
              <div className="p-2 bg-white dark:bg-zinc-900 rounded font-mono text-xs font-bold text-center">
                ρ = m / V [kg/m³ o g/cm³]
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 space-y-2">
              <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                2. Peso Specifico Assoluto (γ)
              </span>
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                Rapporto tra il peso (forza peso) e il volume. Dipende dal campo gravitazionale locale (Terra, Luna, ecc.).
              </p>
              <div className="p-2 bg-white dark:bg-zinc-900 rounded font-mono text-xs font-bold text-center">
                γ = P / V = ρ · g [N/m³ o kN/m³]
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 space-y-2">
              <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                3. Gravità Specifica (SG)
              </span>
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                Densità relativa adimensionale rispetto all'acqua distillata a 4°C (1000 kg/m³ = 1 g/cm³).
              </p>
              <div className="p-2 bg-white dark:bg-zinc-900 rounded font-mono text-xs font-bold text-center">
                SG = ρ_materiale / ρ_acqua [adimensionale]
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Equivalenze di Conversione Istantanee:
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-mono">
              1 g/cm³ = 1 kg/dm³ = 1000 kg/m³ = 1 t/m³ = 62.428 lb/ft³
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Per questo motivo un materiale con densità 7.85 g/cm³ (come l'acciaio) pesa esattamente 7.85 kg per ogni litro di volume e 7.85 tonnellate per ogni metro cubo!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

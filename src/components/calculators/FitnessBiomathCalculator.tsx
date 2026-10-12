import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  HeartPulse,
  Activity,
  Layers,
  Bookmark,
  Share2,
  Info,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface FitnessBiomathCalculatorProps {
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

export const FitnessBiomathCalculator: React.FC<FitnessBiomathCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'tdee' | 'macros' | 'oneRm' | 'bodyFat' | 'heartRate'>('tdee');

  // Biomath Profile
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('28');
  const [weightKg, setWeightKg] = useState<string>('75');
  const [heightCm, setHeightCm] = useState<string>('178');
  const [activityFactor, setActivityFactor] = useState<number>(1.55); // Moderate exercise
  const [goalType, setGoalType] = useState<'cut' | 'maintain' | 'bulk'>('maintain');

  // Macro Split Settings
  const [proteinPerKg, setProteinPerKg] = useState<string>('2.0'); // 2.0 g/kg
  const [fatPerKg, setFatPerKg] = useState<string>('0.9'); // 0.9 g/kg

  // 1RM Settings
  const [liftWeightKg, setLiftWeightKg] = useState<string>('100');
  const [liftReps, setLiftReps] = useState<string>('5');

  // US Navy Body Fat Settings
  const [neckCm, setNeckCm] = useState<string>('38');
  const [waistCm, setWaistCm] = useState<string>('84');
  const [hipCm, setHipCm] = useState<string>('98'); // Female only

  // Heart Rate
  const [restingHr, setRestingHr] = useState<string>('60');

  // Calculate BMR & TDEE
  const bmrTdeeCalc = useMemo(() => {
    const w = parseFloat(weightKg) || 70;
    const h = parseFloat(heightCm) || 175;
    const a = parseFloat(age) || 25;

    // Mifflin-St Jeor Formula
    let bmr = 10 * w + 6.25 * h - 5 * a;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = bmr * activityFactor;
    let targetCalories = tdee;
    if (goalType === 'cut') targetCalories = tdee - 450;
    if (goalType === 'bulk') targetCalories = tdee + 350;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories)
    };
  }, [gender, weightKg, heightCm, age, activityFactor, goalType]);

  // Calculate Macros
  const macroCalc = useMemo(() => {
    const w = parseFloat(weightKg) || 70;
    const totalKcal = bmrTdeeCalc.targetCalories;
    const protG = w * (parseFloat(proteinPerKg) || 2.0);
    const fatG = w * (parseFloat(fatPerKg) || 0.9);

    const protKcal = protG * 4;
    const fatKcal = fatG * 9;
    const carbKcal = Math.max(0, totalKcal - (protKcal + fatKcal));
    const carbG = carbKcal / 4;

    return {
      protG: Math.round(protG),
      fatG: Math.round(fatG),
      carbG: Math.round(carbG),
      protKcal: Math.round(protKcal),
      fatKcal: Math.round(fatKcal),
      carbKcal: Math.round(carbKcal),
      protPct: Math.round((protKcal / totalKcal) * 100),
      fatPct: Math.round((fatKcal / totalKcal) * 100),
      carbPct: Math.round((carbKcal / totalKcal) * 100)
    };
  }, [weightKg, bmrTdeeCalc.targetCalories, proteinPerKg, fatPerKg]);

  // Calculate 1RM (One Rep Max)
  const oneRmCalc = useMemo(() => {
    const w = parseFloat(liftWeightKg) || 100;
    const r = parseInt(liftReps) || 5;
    if (r === 1) return { oneRm: w, brzycki: w, epley: w, table: [] };

    // Brzycki: 1RM = w / (1.0278 - 0.0278 * r)
    const brzycki = w / (1.0278 - 0.0278 * r);
    // Epley: 1RM = w * (1 + r / 30)
    const epley = w * (1 + r / 30);
    // Average
    const oneRm = Math.round((brzycki + epley) / 2);

    const percentages = [95, 90, 85, 80, 75, 70, 65, 60, 50];
    const table = percentages.map((p) => ({
      pct: p,
      weight: Math.round((oneRm * p) / 100),
      estReps: p === 95 ? 2 : p === 90 ? 4 : p === 85 ? 6 : p === 80 ? 8 : p === 75 ? 10 : p === 70 ? 12 : 15
    }));

    return {
      oneRm,
      brzycki: Math.round(brzycki),
      epley: Math.round(epley),
      table
    };
  }, [liftWeightKg, liftReps]);

  // Calculate US Navy Body Fat %
  const bodyFatCalc = useMemo(() => {
    const h = parseFloat(heightCm) || 175;
    const neck = parseFloat(neckCm) || 38;
    const waist = parseFloat(waistCm) || 84;
    const hip = parseFloat(hipCm) || 98;
    const w = parseFloat(weightKg) || 75;

    let bf = 0;
    if (gender === 'male') {
      // 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      const diff = Math.max(1, waist - neck);
      bf = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(h)) - 450;
    } else {
      // 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
      const sumDiff = Math.max(1, waist + hip - neck);
      bf = 495 / (1.29579 - 0.35004 * Math.log10(sumDiff) + 0.221 * Math.log10(h)) - 450;
    }

    const fatKg = (w * Math.max(3, Math.min(60, bf))) / 100;
    const leanKg = w - fatKg;

    return {
      bfPct: Math.max(3, Math.min(60, bf)),
      fatKg,
      leanKg
    };
  }, [gender, heightCm, neckCm, waistCm, hipCm, weightKg]);

  // Calculate Karvonen Heart Rate Zones
  const hrCalc = useMemo(() => {
    const a = parseFloat(age) || 28;
    const rhr = parseFloat(restingHr) || 60;

    // Tanaka formula: HR_max = 208 - 0.7 * age
    const maxHr = Math.round(208 - 0.7 * a);
    const hrr = maxHr - rhr; // Heart Rate Reserve

    const zones = [
      { name: 'Zona 1: Recupero Attivo', range: '50-60%', min: Math.round(rhr + hrr * 0.5), max: Math.round(rhr + hrr * 0.6), color: 'text-sky-500' },
      { name: 'Zona 2: Brucia Grassi & Base Aerobica', range: '60-70%', min: Math.round(rhr + hrr * 0.6), max: Math.round(rhr + hrr * 0.7), color: 'text-emerald-500' },
      { name: 'Zona 3: Soglia Aerobica & Passo Gara', range: '70-80%', min: Math.round(rhr + hrr * 0.7), max: Math.round(rhr + hrr * 0.8), color: 'text-amber-500' },
      { name: 'Zona 4: Soglia Anaerobica / Lattato', range: '80-90%', min: Math.round(rhr + hrr * 0.8), max: Math.round(rhr + hrr * 0.9), color: 'text-orange-500' },
      { name: 'Zona 5: Massimale / VO2 Max Sprint', range: '90-100%', min: Math.round(rhr + hrr * 0.9), max: maxHr, color: 'text-rose-500' }
    ];

    return {
      maxHr,
      hrr,
      zones
    };
  }, [age, restingHr]);

  const handleSaveToHistory = () => {
    let summary = '';
    let details: { label: string; value: string }[] = [];
    let formula = '';

    if (activeTab === 'tdee') {
      summary = `TDEE: ${bmrTdeeCalc.tdee} kcal (Obiettivo: ${bmrTdeeCalc.targetCalories} kcal)`;
      details = [
        { label: 'BMR', value: `${bmrTdeeCalc.bmr} kcal` },
        { label: 'TDEE', value: `${bmrTdeeCalc.tdee} kcal` },
        { label: 'Calorie Target', value: `${bmrTdeeCalc.targetCalories} kcal` },
        { label: 'Obiettivo', value: goalType.toUpperCase() }
      ];
      formula = 'Mifflin-St Jeor Formula';
    } else if (activeTab === 'macros') {
      summary = `Macro: ${macroCalc.protG}g Proteine, ${macroCalc.carbG}g Carboidrati, ${macroCalc.fatG}g Grassi`;
      details = [
        { label: 'Proteine', value: `${macroCalc.protG}g (${macroCalc.protPct}%)` },
        { label: 'Carboidrati', value: `${macroCalc.carbG}g (${macroCalc.carbPct}%)` },
        { label: 'Grassi', value: `${macroCalc.fatG}g (${macroCalc.fatPct}%)` },
        { label: 'Totale', value: `${bmrTdeeCalc.targetCalories} kcal` }
      ];
      formula = 'Ripartizione personalizzata su peso corporeo';
    } else if (activeTab === 'oneRm') {
      summary = `1RM Massimale Stimato: ${oneRmCalc.oneRm} kg da ${liftWeightKg}kg x ${liftReps} rep`;
      details = [
        { label: '1RM Stimato', value: `${oneRmCalc.oneRm} kg` },
        { label: 'Brzycki', value: `${oneRmCalc.brzycki} kg` },
        { label: 'Epley', value: `${oneRmCalc.epley} kg` }
      ];
      formula = 'Brzycki / Epley Combined Math';
    } else if (activeTab === 'bodyFat') {
      summary = `Massa Grassa Navy: ${bodyFatCalc.bfPct.toFixed(1)}% (LBM: ${bodyFatCalc.leanKg.toFixed(1)} kg)`;
      details = [
        { label: 'Massa Grassa', value: `${bodyFatCalc.bfPct.toFixed(1)} %` },
        { label: 'Massa Grassa (kg)', value: `${bodyFatCalc.fatKg.toFixed(1)} kg` },
        { label: 'Massa Magra (LBM)', value: `${bodyFatCalc.leanKg.toFixed(1)} kg` }
      ];
      formula = 'US Navy Body Fat Circumference Equation';
    } else {
      summary = `Zone Cardio Karvonen: FC Max ${hrCalc.maxHr} bpm, Riserva ${hrCalc.hrr} bpm`;
      details = [
        { label: 'FC Max (Tanaka)', value: `${hrCalc.maxHr} bpm` },
        { label: 'FC a Riposo', value: `${restingHr} bpm` },
        { label: 'Zona 2 Aerobica', value: `${hrCalc.zones[1].min} - ${hrCalc.zones[1].max} bpm` }
      ];
      formula = 'Karvonen Formula = RHR + HRR × %Intensità';
    }

    onSaveHistory({
      calculatorId: 'fitness-biomath',
      calculatorTitle: 'Biometria, Nutrizione & Fitness Biomath',
      summary,
      details,
      formula,
      inputs: { activeTab }
    });
    showToast('Dati fitness salvati!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                Biomatematica, Nutrizione & Fitness
                <span className="text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-mono">
                  Mifflin, 1RM & Karvonen
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Calcolo BMR, TDEE, ripartizione macronutrienti per obiettivi, massimale 1RM, percentuale di grasso corporeo US Navy e zone di frequenza cardiaca.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-2 rounded-xl border transition-all ${
                  isFavorite
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                }`}
                title="Aggiungi ai preferiti"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              Salva
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
          {[
            { id: 'tdee', label: 'BMR & TDEE Calorie', icon: Activity },
            { id: 'macros', label: 'Macronutrienti', icon: Layers },
            { id: 'oneRm', label: '1RM Massimale Pesi', icon: TrendingUp },
            { id: 'bodyFat', label: 'Massa Grassa (Navy %)', icon: Sparkles },
            { id: 'heartRate', label: 'Zone Cardio Karvonen', icon: HeartPulse }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Bar */}
      <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Sesso</label>
            <div className="flex gap-1 bg-white dark:bg-zinc-700 p-1 rounded-xl border border-slate-200 dark:border-zinc-600">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg ${gender === 'male' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
              >
                Uomo
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg ${gender === 'female' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
              >
                Donna
              </button>
            </div>
          </div>
          <CalcInput label="Età (anni)" value={age} onChange={setAge} suffix="anni" />
          <CalcInput label="Peso Corporeo" value={weightKg} onChange={setWeightKg} suffix="kg" />
          <CalcInput label="Altezza" value={heightCm} onChange={setHeightCm} suffix="cm" />
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Attività Fisica</label>
            <select
              value={activityFactor}
              onChange={(e) => setActivityFactor(parseFloat(e.target.value))}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-xl font-medium text-slate-800 dark:text-zinc-200"
            >
              <option value={1.2}>Sedentario (ufficio)</option>
              <option value={1.375}>Leggero (1-3 allenamenti/sett)</option>
              <option value={1.55}>Moderato (3-5 allenamenti/sett)</option>
              <option value={1.725}>Intenso (6-7 allenamenti/sett)</option>
              <option value={1.9}>Atleta / Lavoro Fisico Pesante</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: BMR & TDEE */}
      {activeTab === 'tdee' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-2 mb-6">
              {[
                { id: 'cut', label: 'Definizione / Cut (-450 kcal)' },
                { id: 'maintain', label: 'Mantenimento Peso' },
                { id: 'bulk', label: 'Massa Muscolare / Bulk (+350 kcal)' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoalType(g.id as any)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    goalType === g.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-5 rounded-2xl text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase">Metabolismo Basale (BMR)</div>
                <div className="text-3xl font-black text-slate-800 dark:text-zinc-100 font-mono mt-1">
                  {bmrTdeeCalc.bmr} <span className="text-sm font-normal text-slate-400">kcal/giorno</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">Calorie consumate a riposo assoluto per le funzioni vitali</div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-5 rounded-2xl text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase">Fabbisogno Totale (TDEE)</div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                  {bmrTdeeCalc.tdee} <span className="text-sm font-normal text-slate-400">kcal/giorno</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">Calorie per mantenere esattamente il peso attuale</div>
              </div>

              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 rounded-2xl text-center">
                <div className="text-xs font-semibold text-rose-500 uppercase">Calorie Target Giornaliere</div>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                  {bmrTdeeCalc.targetCalories} <span className="text-sm font-normal text-slate-400">kcal/giorno</span>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Obiettivo selezionato: {goalType.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MACRONUTRIENTS */}
      {activeTab === 'macros' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <CalcInput label="Proteine (g per kg di peso)" value={proteinPerKg} onChange={setProteinPerKg} suffix="g/kg" />
              <CalcInput label="Grassi (g per kg di peso)" value={fatPerKg} onChange={setFatPerKg} suffix="g/kg" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-4 rounded-xl text-center">
                <div className="text-xs font-semibold text-rose-500 uppercase">Proteine</div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                  {macroCalc.protG} g
                </div>
                <div className="text-xs text-slate-400 mt-1">{macroCalc.protKcal} kcal ({macroCalc.protPct}%)</div>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl text-center">
                <div className="text-xs font-semibold text-amber-500 uppercase">Grassi (Lipidi)</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                  {macroCalc.fatG} g
                </div>
                <div className="text-xs text-slate-400 mt-1">{macroCalc.fatKcal} kcal ({macroCalc.fatPct}%)</div>
              </div>

              <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 p-4 rounded-xl text-center">
                <div className="text-xs font-semibold text-sky-500 uppercase">Carboidrati</div>
                <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1">
                  {macroCalc.carbG} g
                </div>
                <div className="text-xs text-slate-400 mt-1">{macroCalc.carbKcal} kcal ({macroCalc.carbPct}%)</div>
              </div>
            </div>

            {/* Macro Bar */}
            <div className="w-full bg-slate-200 dark:bg-zinc-700 h-4 rounded-full overflow-hidden flex">
              <div style={{ width: `${macroCalc.protPct}%` }} className="bg-rose-500 h-full" title="Proteine" />
              <div style={{ width: `${macroCalc.fatPct}%` }} className="bg-amber-500 h-full" title="Grassi" />
              <div style={{ width: `${macroCalc.carbPct}%` }} className="bg-sky-500 h-full" title="Carboidrati" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 1RM STRENGTH */}
      {activeTab === 'oneRm' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <CalcInput label="Carico Sollevato" value={liftWeightKg} onChange={setLiftWeightKg} suffix="kg" />
              <CalcInput label="Ripetizioni Eseguite (1-12)" value={liftReps} onChange={setLiftReps} suffix="rep" />
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 p-6 rounded-2xl border border-slate-200 dark:border-zinc-700 text-center mb-6">
              <div className="text-xs font-semibold text-slate-400 uppercase">Massimale Teorico 1RM</div>
              <div className="text-4xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                {oneRmCalc.oneRm} kg
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Formula Brzycki: {oneRmCalc.brzycki} kg | Formula Epley: {oneRmCalc.epley} kg
              </div>
            </div>

            {/* Percentage Breakdown Table */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {oneRmCalc.table.map((row) => (
                <div key={row.pct} className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-center">
                  <div className="text-xs font-bold text-slate-400">{row.pct}% 1RM</div>
                  <div className="text-base font-black text-slate-800 dark:text-zinc-100 font-mono">{row.weight} kg</div>
                  <div className="text-[10px] text-slate-500">~{row.estReps} rep</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: US NAVY BODY FAT */}
      {activeTab === 'bodyFat' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <CalcInput label="Circonferenza Collo" value={neckCm} onChange={setNeckCm} suffix="cm" />
              <CalcInput label="Circonferenza Vita (ombelico)" value={waistCm} onChange={setWaistCm} suffix="cm" />
              {gender === 'female' && (
                <CalcInput label="Circonferenza Fianchi" value={hipCm} onChange={setHipCm} suffix="cm" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 rounded-2xl text-center">
                <div className="text-xs font-semibold text-rose-500 uppercase">Massa Grassa (Body Fat %)</div>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                  {bodyFatCalc.bfPct.toFixed(1)} %
                </div>
                <div className="text-xs text-slate-400 mt-1">Metodo US Navy</div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-5 rounded-2xl text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase">Massa Magra (LBM)</div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {bodyFatCalc.leanKg.toFixed(1)} kg
                </div>
                <div className="text-xs text-slate-400 mt-1">Muscoli, ossa, organi e acqua</div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-5 rounded-2xl text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase">Massa Grassa Totale</div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                  {bodyFatCalc.fatKg.toFixed(1)} kg
                </div>
                <div className="text-xs text-slate-400 mt-1">Grasso essenziale e di deposito</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HEART RATE KARVONEN */}
      {activeTab === 'heartRate' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <CalcInput label="Frequenza Cardiaca a Riposo (RHR)" value={restingHr} onChange={setRestingHr} suffix="bpm" />
              <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
                <div className="text-xs text-slate-400">FC Max Stimata (Tanaka 208 - 0.7×età)</div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">{hrCalc.maxHr} bpm</div>
              </div>
            </div>

            <div className="space-y-2">
              {hrCalc.zones.map((zone, idx) => (
                <div
                  key={zone.name}
                  className="bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-200 dark:border-zinc-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">{zone.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Intensità Riserva {zone.range}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black font-mono text-slate-900 dark:text-zinc-100">
                      {zone.min} - {zone.max}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">bpm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tape */}
      <SectionHistoryTape
        history={history}
        calculatorId="fitness-biomath"
        onRestore={() => {}}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        showToast={showToast}
        settings={settings}
      />
    </div>
  );
};

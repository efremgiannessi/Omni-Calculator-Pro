import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Zap,
  Timer,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { CalcCard } from '../common/CalcCard';
import { SectionHistoryTape } from '../common/SectionHistoryTape';
import { useAutoHistory } from '../../hooks/useAutoHistory';

interface MentalMathTrainerProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  showToast: (text: string) => void;
  history: HistoryItem[];
  onDeleteHistoryEntry?: (id: string) => void;
  onClearSectionHistory?: (calculatorId: CalculatorId) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

interface Question {
  text: string;
  options: number[];
  correct: number;
  tip: string;
}

const TRICKS = [
  {
    rate: '10%',
    title: 'Sposta la virgola di un posto',
    explanation: 'Per trovare il 10% di qualsiasi numero, basta spostare la virgola a sinistra di 1 cifra.',
    example: '10% di 480 = 48  |  10% di 75 = 7,5'
  },
  {
    rate: '5%',
    title: 'Fai il 10% e dividi per 2',
    explanation: 'Poiché 5 è la metà di 10, trova il 10% e dimezzalo immediatamente.',
    example: '5% di 80: il 10% è 8, la metà è 4!'
  },
  {
    rate: '20%',
    title: 'Fai il 10% e raddoppia (× 2)',
    explanation: 'Trova il 10% spostando la virgola, poi moltiplica per 2.',
    example: '20% di 65: 10% è 6,5 → raddoppiato fa 13!'
  },
  {
    rate: '25%',
    title: 'Dividi per 4 (metà della metà)',
    explanation: '25% corrisponde alla frazione 1/4. Dimezza il numero, poi dimezzalo di nuovo.',
    example: '25% di 120: metà è 60, metà ancora è 30!'
  },
  {
    rate: '15%',
    title: 'Fai il 10% + il 5% (somma la metà)',
    explanation: 'Il trucco ideale per le mance: calcola il 10% e aggiungi la sua metà.',
    example: '15% di 40: 10% è 4, la metà è 2 → 4 + 2 = 6!'
  },
  {
    rate: '50%',
    title: 'Dividi esattamente per 2',
    explanation: 'Il 50% è semplicemente la metà del valore.',
    example: '50% di 360 = 180'
  },
  {
    rate: 'X% di Y = Y% di X',
    title: 'La Regola della Reversibilità (Inversione)',
    explanation: 'La moltiplicazione è commutativa! Se un calcolo sembra difficile, scambia i numeri.',
    example: 'Quanto è il 16% di 50? È identico al 50% di 16, cioè 8! Risolto in un secondo!'
  }
];

function generateQuestion(): Question {
  const types = ['percentOf', 'tip15', 'discount', 'invertible'];
  const t = types[Math.floor(Math.random() * types.length)];

  if (t === 'invertible') {
    // e.g. 18% of 50 or 14% of 50 -> 50% of 18 = 9
    const even = [12, 14, 16, 18, 22, 24, 28, 36][Math.floor(Math.random() * 8)];
    const correct = even / 2;
    const options = [correct, correct + 2, Math.max(1, correct - 2), correct + 4].sort(() => Math.random() - 0.5);
    return {
      text: `Quanto è il ${even}% di 50?`,
      options,
      correct,
      tip: `Trucco di reversibilità: equivale al 50% di ${even}, cioè la metà (${correct})!`
    };
  }

  if (t === 'tip15') {
    const bases = [20, 40, 60, 80, 100, 120, 200];
    const b = bases[Math.floor(Math.random() * bases.length)];
    const correct = (b * 15) / 100;
    const options = [correct, correct + 3, Math.max(1, correct - 2), correct + 5].sort(() => Math.random() - 0.5);
    return {
      text: `Mancia del 15% su un conto di ${b}€:`,
      options,
      correct,
      tip: `10% di ${b} fa ${b / 10}, più la metà (${b / 20}) = ${correct}€!`
    };
  }

  if (t === 'discount') {
    const bases = [40, 60, 80, 100, 120, 200];
    const b = bases[Math.floor(Math.random() * bases.length)];
    const pcts = [10, 20, 25, 50];
    const p = pcts[Math.floor(Math.random() * pcts.length)];
    const discountAmount = (b * p) / 100;
    const correct = b - discountAmount;
    const options = [correct, correct + 5, Math.max(5, correct - 10), correct + 10].sort(() => Math.random() - 0.5);
    return {
      text: `Prezzo finale con Sconto del ${p}% su un capo da ${b}€:`,
      options,
      correct,
      tip: `Sconto = ${discountAmount}€, quindi ${b} - ${discountAmount} = ${correct}€.`
    };
  }

  // percentOf standard
  const rates = [10, 20, 25, 5, 50];
  const r = rates[Math.floor(Math.random() * rates.length)];
  const num = [30, 40, 60, 80, 120, 160, 200, 300][Math.floor(Math.random() * 8)];
  const correct = (num * r) / 100;
  const options = [correct, correct + (correct > 10 ? 5 : 2), Math.max(1, correct - (correct > 10 ? 5 : 2)), correct + 10].sort(
    () => Math.random() - 0.5
  );

  return {
    text: `Quanto è il ${r}% di ${num}?`,
    options,
    correct,
    tip: `Basta applicare la scorciatoia per il ${r}%.`
  };
}

export const MentalMathTrainer: React.FC<MentalMathTrainerProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [tab, setTab] = useState<'quiz' | 'tricks'>('quiz');

  // Quiz State
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const s = localStorage.getItem('pc_trainer_best');
      return s ? parseInt(s, 10) : 0;
    } catch (_) {
      return 0;
    }
  });

  const [currentQ, setCurrentQ] = useState<Question>(generateQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);

      // Save Best Score
      if (score > bestScore) {
        setBestScore(score);
        try {
          localStorage.setItem('pc_trainer_best', score.toString());
        } catch (_) {}
        showToast(settings.language === 'it' ? `Nuovo Record Personale: ${score} punti! 🏆` : `New High Score: ${score}! 🏆`);
      }

      // Record in History
      onSaveHistory({
        calculatorId: 'trainer',
        calculatorTitle: settings.language === 'it' ? 'Palestra Percentuali Rapide' : 'Mental Math Gym',
        summary: `Sessione Quiz completata con ${score} risposte corrette in 60s`,
        details: [
          { label: 'Punteggio finale', value: `${score} punti` },
          { label: 'Tempo', value: '60 secondi' },
          { label: 'Record personale', value: `${Math.max(score, bestScore)} punti` }
        ],
        formula: 'Quiz calcolo mentale a tempo'
      });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft, score, bestScore]);

  const handleStartGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setCurrentQ(generateQuestion());
    setIsPlaying(true);
  };

  const handleSelectOption = (ans: number) => {
    if (!isPlaying || selectedAnswer !== null) return;

    setSelectedAnswer(ans);
    const correct = ans === currentQ.correct;
    setIsAnswerCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      setCurrentQ(generateQuestion());
    }, 750);
  };

  return (
    <CalcCard
      title={settings.language === 'it' ? 'Palestra Calcolo Mentale & Quiz %' : 'Mental Math Gym & Speed Quiz'}
      description={
        settings.language === 'it'
          ? 'Allena il cervello a calcolare al volo qualsiasi percentuale con trucchi mentali e sfide sprint da 60 secondi.'
          : 'Train your brain to calculate percentages instantly in seconds.'
      }
      onClear={() => {}}
      onCopy={() => {}}
      onShare={() => {}}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      formula="X% di Y = Y% di X | 10% = ÷10 | 5% = 10%÷2 | 20% = 10%×2 | 25% = ÷4"
      steps={[
        'Allenamento rapido con feedback istantaneo per padroneggiare sconti, mance e ricarichi a mente.'
      ]}
      notes="Memorizzare queste scorciatoie ti farà calcolare qualsiasi percentuale nei negozi o al ristorante senza nemmeno aprire la calcolatrice!"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setTab('quiz')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'quiz'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{settings.language === 'it' ? 'Sfida Sprint 60s' : '60s Sprint Quiz'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('tricks')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'tricks'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{settings.language === 'it' ? 'Trucchi Mentali' : 'Mental Tricks'}</span>
          </button>
        </div>

        {tab === 'quiz' ? (
          /* QUIZ VIEW */
          <div className="space-y-6">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 shrink-0">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block font-medium">Tempo</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100">
                    {timeLeft}s
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block font-medium">Punti</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100">{score}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block font-medium">Streak</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100">{streak} 🔥</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block font-medium">Record</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100">{bestScore}</span>
                </div>
              </div>
            </div>

            {!isPlaying ? (
              /* START SCREEN */
              <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                  {settings.language === 'it' ? 'Pronto a testare i tuoi riflessi?' : 'Ready to test your math speed?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                  {settings.language === 'it'
                    ? 'Hai 60 secondi per risolvere quante più percentuali mentali possibili. Mantieni la streak per battere il tuo record!'
                    : '60 seconds to solve as many mental percentage questions as possible. Keep your streak alive!'}
                </p>
                <div>
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{settings.language === 'it' ? 'Inizia Sfida (60 Secondi)' : 'Start Challenge'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE QUESTION CARD */
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 text-center">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Calcola al volo a mente:
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 font-sans">
                    {currentQ.text}
                  </h2>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    const isThisCorrect = opt === currentQ.correct;

                    let btnStyle =
                      'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 hover:border-emerald-500 text-slate-900 dark:text-zinc-100';

                    if (selectedAnswer !== null) {
                      if (isThisCorrect) {
                        btnStyle = 'bg-emerald-500 text-white border-emerald-600';
                      } else if (isSelected && !isThisCorrect) {
                        btnStyle = 'bg-rose-500 text-white border-rose-600';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        disabled={selectedAnswer !== null}
                        className={`p-4 rounded-xl border text-xl font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedAnswer !== null && isThisCorrect && <CheckCircle2 className="w-4 h-4" />}
                        {selectedAnswer !== null && isSelected && !isThisCorrect && <XCircle className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>

                {/* Live Hint */}
                <div className="text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-lg max-w-md mx-auto">
                  💡 <strong>Suggerimento rapido:</strong> {currentQ.tip}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* TRICKS CHEAT SHEET */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRICKS.map((trick, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    {trick.rate}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {trick.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {trick.explanation}
                </p>
                <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 text-xs font-mono text-emerald-700 dark:text-emerald-300 font-medium">
                  {trick.example}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section History Tape */}
        <SectionHistoryTape
          calculatorId="trainer"
          history={history}
          onRestore={() => {}}
          onDeleteEntry={onDeleteHistoryEntry}
          onClearSectionHistory={onClearSectionHistory}
          settings={settings}
          showToast={showToast}
        />
      </div>
    </CalcCard>
  );
};

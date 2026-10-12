import { useEffect, useRef } from 'react';
import { HistoryItem, CalculatorId } from '../types';

interface AutoHistoryOptions {
  calculatorId: CalculatorId;
  calculatorTitle: string;
  summary: string;
  details: { label: string; value: string }[];
  formula: string;
  inputs: Record<string, string>;
  isValid: boolean;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  debounceMs?: number;
}

export function useAutoHistory({
  calculatorId,
  calculatorTitle,
  summary,
  details,
  formula,
  inputs,
  isValid,
  onSaveHistory,
  debounceMs = 1200
}: AutoHistoryOptions) {
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!isValid || !summary) return;

    // Signature to avoid saving duplicate identical calculations
    const currentSignature = `${calculatorId}:${summary}:${JSON.stringify(inputs)}`;
    if (lastSavedRef.current === currentSignature) return;

    const timer = setTimeout(() => {
      lastSavedRef.current = currentSignature;
      onSaveHistory({
        calculatorId,
        calculatorTitle,
        summary,
        details,
        formula,
        inputs
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [calculatorId, calculatorTitle, summary, details, formula, inputs, isValid, onSaveHistory, debounceMs]);
}

export type CalculatorCategory =
  | 'all'
  | 'favorites'
  | 'materials'
  | 'everyday'
  | 'business'
  | 'science'
  | 'quantum'
  | 'astronomy'
  | 'chemistry'
  | 'matrices'
  | 'electronics'
  | 'finance-fire'
  | 'health'
  | 'graphing-3d'
  | 'geometry'
  | 'trainer'
  | 'converter';

export type CalculatorId =
  | 'simple'
  | 'increase-decrease'
  | 'discount'
  | 'price-comparator'
  | 'tip'
  | 'fractions'
  | 'percentage-points'
  | 'percent-of-percent'
  | 'batch-percentage'
  | 'markup'
  | 'margin'
  | 'break-even'
  | 'salary-increase'
  | 'vat'
  | 'trader'
  | 'compound-interest'
  | 'cagr'
  | 'inflation'
  | 'doubling-time'
  | 'loan'
  | 'amortization-schedule'
  | 'scientific'
  | 'equations'
  | 'statistics'
  | 'quantum-lab'
  | 'quantum-physics'
  | 'hohmann-transfer'
  | 'astrophysics-orbital'
  | 'einstein-rosen'
  | 'chemistry-lab'
  | 'matrix-lab'
  | 'electronics-lab'
  | 'fire-finance'
  | 'fitness-biomath'
  | 'graph-3d'
  | 'geometry-surface-volume'
  | 'material-density-weight'
  | 'trainer'
  | 'unit-converter';

export interface CalculatorMeta {
  id: CalculatorId;
  titleKey: string;
  descriptionKey: string;
  category:
    | 'everyday'
    | 'business'
    | 'materials'
    | 'science'
    | 'quantum'
    | 'astronomy'
    | 'chemistry'
    | 'matrices'
    | 'electronics'
    | 'finance-fire'
    | 'health'
    | 'graphing-3d'
    | 'geometry'
    | 'trainer'
    | 'converter';
  icon: string;
  badge?: string;
  keywords?: string[];
}

export type SupportedLanguage = 'it' | 'en' | 'es' | 'fr' | 'de';

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY' | 'INR' | 'CAD' | 'AUD' | 'BRL';

export interface AppSettings {
  language: SupportedLanguage;
  currency: {
    code: CurrencyCode;
    symbol: string;
  };
  decimalPrecision: number; // 0, 1, 2, 3, 4
  decimalSeparator: ',' | '.';
  theme: 'light' | 'dark' | 'system';
  showKeypad: boolean;
  soundEnabled: boolean;
  favorites: CalculatorId[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  calculatorId: CalculatorId;
  calculatorTitle: string;
  summary: string;
  details: { label: string; value: string }[];
  formula: string;
  inputs?: Record<string, string>;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
}


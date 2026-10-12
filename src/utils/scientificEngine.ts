// Comprehensive, robust Scientific & Mathematical Engine

export type AngleUnit = 'RAD' | 'DEG' | 'GRAD';

export interface PhysicalConstant {
  id: string;
  name: string;
  symbol: string;
  value: number;
  unit: string;
  category: 'Math' | 'Universal' | 'Atomic' | 'Electromagnetism' | 'Astronomy';
  description: string;
}

export const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
  // Math
  {
    id: 'pi',
    name: 'Pi Greco',
    symbol: 'π',
    value: Math.PI,
    unit: 'adimensionale',
    category: 'Math',
    description: 'Rapporto tra circonferenza e diametro del cerchio (3.14159...)'
  },
  {
    id: 'e',
    name: 'Numero di Eulero',
    symbol: 'e',
    value: Math.E,
    unit: 'adimensionale',
    category: 'Math',
    description: 'Base dei logaritmi naturali (2.71828...)'
  },
  {
    id: 'phi',
    name: 'Sezione Aurea (Phi)',
    symbol: 'φ',
    value: (1 + Math.sqrt(5)) / 2,
    unit: 'adimensionale',
    category: 'Math',
    description: 'Proporzione divina / Sezione aurea (1.61803...)'
  },
  {
    id: 'gamma',
    name: 'Costante di Eulero-Mascheroni',
    symbol: 'γ',
    value: 0.57721566490153286,
    unit: 'adimensionale',
    category: 'Math',
    description: 'Limite della differenza tra serie armonica e logaritmo'
  },
  {
    id: 'sqrt2',
    name: 'Radice di 2 (Costante di Pitagora)',
    symbol: '√2',
    value: Math.SQRT2,
    unit: 'adimensionale',
    category: 'Math',
    description: 'Diagonale del quadrato unitario (1.41421...)'
  },

  // Universal Physics (CODATA / NIST)
  {
    id: 'c',
    name: 'Velocità della luce nel vuoto',
    symbol: 'c',
    value: 299792458,
    unit: 'm / s',
    category: 'Universal',
    description: 'Velocità massima di propagazione dell\'informazione e della radiazione EM'
  },
  {
    id: 'G',
    name: 'Costante di Gravitazione Universale',
    symbol: 'G',
    value: 6.67430e-11,
    unit: 'm³ / (kg · s²)',
    category: 'Universal',
    description: 'Costante della legge di Newton e della Relatività Generale'
  },
  {
    id: 'h',
    name: 'Costante di Planck',
    symbol: 'h',
    value: 6.62607015e-34,
    unit: 'J · s',
    category: 'Universal',
    description: 'Quanto d\'azione fondamentale della meccanica quantistica'
  },
  {
    id: 'hbar',
    name: 'Costante di Planck ridotta (Dirac)',
    symbol: 'ħ',
    value: 1.054571817e-34,
    unit: 'J · s',
    category: 'Universal',
    description: 'h diviso per 2π'
  },
  {
    id: 'g0',
    name: 'Accelerazione di Gravità Standard',
    symbol: 'g',
    value: 9.80665,
    unit: 'm / s²',
    category: 'Universal',
    description: 'Accelerazione gravitazionale convenzionale al livello del mare'
  },

  // Atomic & Thermodynamics
  {
    id: 'kB',
    name: 'Costante di Boltzmann',
    symbol: 'k_B',
    value: 1.380649e-23,
    unit: 'J / K',
    category: 'Atomic',
    description: 'Collega l\'energia cinetica microscopica alla temperatura termodinamica'
  },
  {
    id: 'NA',
    name: 'Costante di Avogadro',
    symbol: 'N_A',
    value: 6.02214076e23,
    unit: 'mol⁻¹',
    category: 'Atomic',
    description: 'Numero di entità elementari in una mole di sostanza'
  },
  {
    id: 'R',
    name: 'Costante Universale dei Gas',
    symbol: 'R',
    value: 8.314462618,
    unit: 'J / (mol · K)',
    category: 'Atomic',
    description: 'Costante nell\'equazione di stato dei gas perfetti (P·V = n·R·T)'
  },
  {
    id: 'sigma_sb',
    name: 'Costante di Stefan-Boltzmann',
    symbol: 'σ',
    value: 5.670374419e-8,
    unit: 'W / (m² · K⁴)',
    category: 'Atomic',
    description: 'Costante di emissione del corpo nero'
  },
  {
    id: 'me',
    name: 'Massa a riposo dell\'elettrone',
    symbol: 'm_e',
    value: 9.1093837015e-31,
    unit: 'kg',
    category: 'Atomic',
    description: 'Massa invariante dell\'elettrone'
  },
  {
    id: 'mp',
    name: 'Massa a riposo del protone',
    symbol: 'm_p',
    value: 1.67262192369e-27,
    unit: 'kg',
    category: 'Atomic',
    description: 'Massa invariante del protone'
  },
  {
    id: 'mn',
    name: 'Massa a riposo del neutrone',
    symbol: 'm_n',
    value: 1.67492749804e-27,
    unit: 'kg',
    category: 'Atomic',
    description: 'Massa invariante del neutrone'
  },
  {
    id: 'a0',
    name: 'Raggio di Bohr',
    symbol: 'a₀',
    value: 5.29177210903e-11,
    unit: 'm',
    category: 'Atomic',
    description: 'Raggio orbitale più probabile nello stato fondamentale dell\'idrogeno'
  },

  // Electromagnetism
  {
    id: 'e_charge',
    name: 'Carica Elementare',
    symbol: 'e',
    value: 1.602176634e-19,
    unit: 'C',
    category: 'Electromagnetism',
    description: 'Carica elettrica trasportata da un singolo protone o elettrone'
  },
  {
    id: 'eps0',
    name: 'Costante Dielettrica del Vuoto (Permittività)',
    symbol: 'ε₀',
    value: 8.8541878128e-12,
    unit: 'F / m',
    category: 'Electromagnetism',
    description: 'Permittività dielettrica fondamentale nel vuoto'
  },
  {
    id: 'mu0',
    name: 'Permeabilità Magnetica del Vuoto',
    symbol: 'μ₀',
    value: 1.25663706212e-6,
    unit: 'N / A²',
    category: 'Electromagnetism',
    description: 'Costante magnetica fondamentale nel vuoto (4π × 10⁻⁷)'
  },
  {
    id: 'Z0',
    name: 'Impedenza Caratteristica del Vuoto',
    symbol: 'Z₀',
    value: 376.730313668,
    unit: 'Ω',
    category: 'Electromagnetism',
    description: 'Rapporto tra campo elettrico e magnetico di un\'onda EM nel vuoto'
  },

  // Astronomy
  {
    id: 'au',
    name: 'Unità Astronomica',
    symbol: 'AU',
    value: 149597870700,
    unit: 'm',
    category: 'Astronomy',
    description: 'Distanza media tra la Terra e il Sole'
  },
  {
    id: 'ly',
    name: 'Anno Luce',
    symbol: 'ly',
    value: 9.4607304725808e15,
    unit: 'm',
    category: 'Astronomy',
    description: 'Distanza percorsa dalla luce in un anno giuliano'
  },
  {
    id: 'parsec',
    name: 'Parsec',
    symbol: 'pc',
    value: 3.08567758149137e16,
    unit: 'm',
    category: 'Astronomy',
    description: 'Parallasse di un secondo d\'arco (circa 3.26 anni luce)'
  },
  {
    id: 'M_earth',
    name: 'Massa della Terra',
    symbol: 'M_⊕',
    value: 5.9722e24,
    unit: 'kg',
    category: 'Astronomy',
    description: 'Massa del pianeta Terra'
  },
  {
    id: 'R_earth',
    name: 'Raggio Medio della Terra',
    symbol: 'R_⊕',
    value: 6371000,
    unit: 'm',
    category: 'Astronomy',
    description: 'Raggio volumetrico medio terrestre'
  }
];

// Factorial with cache
const factCache: number[] = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800];
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    // Gamma function approximation for non-integers could be used, or error
    return NaN;
  }
  if (n > 170) return Infinity; // JS Number overflow
  if (factCache[n] !== undefined) return factCache[n];
  let res = factCache[factCache.length - 1];
  for (let i = factCache.length; i <= n; i++) {
    res *= i;
    factCache[i] = res;
  }
  return res;
}

// Permutations nPr
export function nPr(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n) return 0;
  return factorial(n) / factorial(n - r);
}

// Combinations nCr
export function nCr(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

// Greatest Common Divisor
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Least Common Multiple
export function lcm(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

// Angle conversions
export function toRadians(val: number, unit: AngleUnit): number {
  if (unit === 'RAD') return val;
  if (unit === 'DEG') return (val * Math.PI) / 180;
  if (unit === 'GRAD') return (val * Math.PI) / 200;
  return val;
}

export function fromRadians(rad: number, unit: AngleUnit): number {
  if (unit === 'RAD') return rad;
  if (unit === 'DEG') return (rad * 180) / Math.PI;
  if (unit === 'GRAD') return (rad * 200) / Math.PI;
  return rad;
}

// Decimal to Fraction with high accuracy
export function toFractionString(val: number, tolerance = 1e-6): string | null {
  if (isNaN(val) || !isFinite(val)) return null;
  if (Number.isInteger(val)) return `${val}`;
  
  const sign = val < 0 ? -1 : 1;
  val = Math.abs(val);

  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = val;

  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(val - h1 / k1) > val * tolerance && k1 < 100000);

  if (k1 <= 1) return `${sign * h1}`;
  if (k1 > 100000) return null; // No clean fraction found

  return `${sign < 0 ? '-' : ''}${h1}/${k1}`;
}

/**
 * Robust Expression Evaluator for Scientific Calculator
 * Supports variables, nested parentheses, trig, exp, constants, etc.
 */
export function evaluateMathExpression(
  expr: string,
  angleUnit: AngleUnit = 'RAD',
  variables: Record<string, number> = {}
): number {
  if (!expr || expr.trim() === '') return 0;

  // Clean expression: normalize symbols
  let cleaned = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .trim();

  // Create environment with functions adapted for angle unit
  const env: Record<string, any> = {
    pi: Math.PI,
    e: Math.E,
    phi: (1 + Math.sqrt(5)) / 2,
    ...variables,

    // Trigonometry (honoring DEG/RAD/GRAD)
    sin: (x: number) => {
      const rad = toRadians(x, angleUnit);
      // Clean precision for exact angles (e.g. sin(180 deg) = 0)
      const res = Math.sin(rad);
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    cos: (x: number) => {
      const rad = toRadians(x, angleUnit);
      const res = Math.cos(rad);
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    tan: (x: number) => {
      const rad = toRadians(x, angleUnit);
      const cosVal = Math.cos(rad);
      if (Math.abs(cosVal) < 1e-15) return NaN;
      const res = Math.tan(rad);
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    cot: (x: number) => {
      const rad = toRadians(x, angleUnit);
      const sinVal = Math.sin(rad);
      if (Math.abs(sinVal) < 1e-15) return NaN;
      return 1 / Math.tan(rad);
    },
    sec: (x: number) => {
      const rad = toRadians(x, angleUnit);
      const cosVal = Math.cos(rad);
      if (Math.abs(cosVal) < 1e-15) return NaN;
      return 1 / cosVal;
    },
    csc: (x: number) => {
      const rad = toRadians(x, angleUnit);
      const sinVal = Math.sin(rad);
      if (Math.abs(sinVal) < 1e-15) return NaN;
      return 1 / sinVal;
    },

    // Inverse trig (converts result from radians to current angle unit)
    asin: (x: number) => fromRadians(Math.asin(x), angleUnit),
    acos: (x: number) => fromRadians(Math.acos(x), angleUnit),
    atan: (x: number) => fromRadians(Math.atan(x), angleUnit),
    atan2: (y: number, x: number) => fromRadians(Math.atan2(y, x), angleUnit),

    // Hyperbolics (hyperbolics are purely in real units, not angles)
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    asinh: Math.asinh,
    acosh: Math.acosh,
    atanh: Math.atanh,

    // Powers, Roots, Logs
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    nthRoot: (x: number, n: number) => Math.pow(x, 1 / n),
    ln: Math.log,
    log: Math.log10,
    log10: Math.log10,
    log2: Math.log2,
    logb: (x: number, b: number) => Math.log(x) / Math.log(b),
    exp: Math.exp,
    abs: Math.abs,

    // Number theory
    fact: factorial,
    nPr: nPr,
    nCr: nCr,
    gcd: gcd,
    lcm: lcm,
    mod: (a: number, b: number) => ((a % b) + b) % b,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    sign: Math.sign,
    rand: Math.random
  };

  // Pre-process syntax helpers:
  // e.g. 5! -> fact(5), (2+3)! -> fact(2+3)
  cleaned = cleaned.replace(/(\d+(\.\d+)?|\([^\(\)]+\))!/g, 'fact($1)');
  
  // Implicit multiplication: 2pi -> 2*pi, 3(4) -> 3*(4), (2)(3) -> (2)*(3)
  cleaned = cleaned.replace(/(\d)\s*(pi|e|phi|\()/g, '$1*$2');
  cleaned = cleaned.replace(/\)\s*(\d|\(|pi|e|phi|[a-zA-Z]+)/g, ')*$1');

  // Evaluate safely using Function constructor with scope keys
  try {
    const keys = Object.keys(env);
    const values = keys.map((k) => env[k]);
    // Validate that expression only contains allowed characters
    // Numbers, letters, underscores, arithmetic operators, parentheses, commas
    if (!/^[a-zA-Z0-9_\s\+\-\*\/\%\.\,\(\)\!\<\>\=\&\|\^]+$/.test(cleaned)) {
      throw new Error('Carattere non consentito');
    }

    const evaluator = new Function(...keys, `"use strict"; return (${cleaned});`);
    const result = evaluator(...values);
    return typeof result === 'number' ? result : NaN;
  } catch (err) {
    return NaN;
  }
}

/**
 * Numerical Derivative: f'(x0) using central finite difference
 */
export function calculateDerivative(
  fnExpr: string,
  x0: number,
  angleUnit: AngleUnit = 'RAD',
  h = 1e-5
): number {
  const f1 = evaluateMathExpression(fnExpr, angleUnit, { x: x0 + h });
  const f0 = evaluateMathExpression(fnExpr, angleUnit, { x: x0 - h });
  if (isNaN(f1) || isNaN(f0)) return NaN;
  return (f1 - f0) / (2 * h);
}

/**
 * Numerical Definite Integral: ∫[a, b] f(x) dx using Composite Simpson's 1/3 Rule
 */
export function calculateDefiniteIntegral(
  fnExpr: string,
  a: number,
  b: number,
  angleUnit: AngleUnit = 'RAD',
  intervals = 1000
): { value: number; intervals: number } {
  if (a === b) return { value: 0, intervals: 0 };
  const n = intervals % 2 === 0 ? intervals : intervals + 1; // n must be even
  const h = (b - a) / n;

  const fa = evaluateMathExpression(fnExpr, angleUnit, { x: a });
  const fb = evaluateMathExpression(fnExpr, angleUnit, { x: b });
  if (isNaN(fa) || isNaN(fb)) return { value: NaN, intervals: n };

  let sum = fa + fb;

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = evaluateMathExpression(fnExpr, angleUnit, { x });
    if (isNaN(fx)) return { value: NaN, intervals: n };
    sum += (i % 2 === 1 ? 4 : 2) * fx;
  }

  const result = (h / 3) * sum;
  return { value: result, intervals: n };
}

/**
 * Series Summation: ∑_{k=m}^n f(k)
 */
export function calculateSummation(
  fnExpr: string,
  start: number,
  end: number,
  angleUnit: AngleUnit = 'RAD'
): number {
  if (start > end) return 0;
  let total = 0;
  for (let k = start; k <= end; k++) {
    const val = evaluateMathExpression(fnExpr, angleUnit, { k, x: k });
    if (isNaN(val)) return NaN;
    total += val;
  }
  return total;
}

/**
 * Series Product: ∏_{k=m}^n f(k)
 */
export function calculateProduct(
  fnExpr: string,
  start: number,
  end: number,
  angleUnit: AngleUnit = 'RAD'
): number {
  if (start > end) return 0;
  let total = 1;
  for (let k = start; k <= end; k++) {
    const val = evaluateMathExpression(fnExpr, angleUnit, { k, x: k });
    if (isNaN(val)) return NaN;
    total *= val;
  }
  return total;
}

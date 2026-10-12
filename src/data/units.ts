export interface UnitDefinition {
  id: string;
  name: string;
  nameEn: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
  description?: string;
  system?: 'metric' | 'imperial' | 'us' | 'astronomy' | 'si' | 'binary' | 'culinary' | 'science' | 'other';
}

export interface UnitBenchmark {
  label: string;
  unitId: string;
  value: number;
  fact: string;
}

export interface UnitCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  baseUnit: string;
  group: 'everyday' | 'science' | 'tech' | 'practical';
  description: string;
  units: UnitDefinition[];
  benchmarks: UnitBenchmark[];
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  // 1. LUNGHEZZA & DISTANZA
  {
    id: 'length',
    name: 'Lunghezza & Distanza',
    nameEn: 'Length & Distance',
    icon: 'Ruler',
    baseUnit: 'm',
    group: 'everyday',
    description: 'Dal nanometro all\'anno luce, tutte le misure metriche, imperiali e astronomiche.',
    units: [
      { id: 'm', name: 'Metro', nameEn: 'Meter', symbol: 'm', toBase: v => v, fromBase: v => v, system: 'metric', description: 'Unità base del Sistema Internazionale' },
      { id: 'km', name: 'Chilometro', nameEn: 'Kilometer', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'metric', description: '1.000 metri' },
      { id: 'cm', name: 'Centimetro', nameEn: 'Centimeter', symbol: 'cm', toBase: v => v * 0.01, fromBase: v => v * 100, system: 'metric' },
      { id: 'mm', name: 'Millimetro', nameEn: 'Millimeter', symbol: 'mm', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'metric' },
      { id: 'dm', name: 'Decimetro', nameEn: 'Decimeter', symbol: 'dm', toBase: v => v * 0.1, fromBase: v => v * 10, system: 'metric' },
      { id: 'um', name: 'Micrometro (Micron)', nameEn: 'Micrometer', symbol: 'µm', toBase: v => v * 1e-6, fromBase: v => v * 1e6, system: 'metric' },
      { id: 'nm', name: 'Nanometro', nameEn: 'Nanometer', symbol: 'nm', toBase: v => v * 1e-9, fromBase: v => v * 1e9, system: 'metric' },
      { id: 'angstrom', name: 'Ångström', nameEn: 'Angstrom', symbol: 'Å', toBase: v => v * 1e-10, fromBase: v => v * 1e10, system: 'science', description: '0,1 nanometri (raggio atomico)' },
      { id: 'in', name: 'Pollice (Inch)', nameEn: 'Inch', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254, system: 'imperial', description: 'Esattamente 25,4 mm' },
      { id: 'ft', name: 'Piede (Foot)', nameEn: 'Foot', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048, system: 'imperial', description: '12 pollici = 30,48 cm' },
      { id: 'yd', name: 'Iarda (Yard)', nameEn: 'Yard', symbol: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144, system: 'imperial', description: '3 piedi = 91,44 cm' },
      { id: 'mi', name: 'Miglio terrestre', nameEn: 'Mile', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344, system: 'imperial', description: '5.280 piedi = 1,609 km' },
      { id: 'nmi', name: 'Miglio nautico', nameEn: 'Nautical Mile', symbol: 'NM', toBase: v => v * 1852, fromBase: v => v / 1852, system: 'other', description: 'Esattamente 1.852 m (1 minuto d\'arco)' },
      { id: 'fathom', name: 'Braccio / Passo nautico (Fathom)', nameEn: 'Fathom', symbol: 'ftm', toBase: v => v * 1.8288, fromBase: v => v / 1.8288, system: 'imperial', description: '6 piedi = 1,8288 m' },
      { id: 'furlong', name: 'Furlong (Ippica)', nameEn: 'Furlong', symbol: 'fur', toBase: v => v * 201.168, fromBase: v => v / 201.168, system: 'imperial', description: '660 piedi = 201,168 m' },
      { id: 'chain', name: 'Catena (Chain)', nameEn: 'Chain', symbol: 'ch', toBase: v => v * 20.1168, fromBase: v => v / 20.1168, system: 'imperial', description: '66 piedi' },
      { id: 'rod', name: 'Canna / Pertica (Rod/Perch)', nameEn: 'Rod', symbol: 'rd', toBase: v => v * 5.0292, fromBase: v => v / 5.0292, system: 'imperial', description: '16,5 piedi' },
      { id: 'thou', name: 'Mil / Thou', nameEn: 'Thou / Mil', symbol: 'mil', toBase: v => v * 0.0000254, fromBase: v => v / 0.0000254, system: 'imperial', description: '1/1000 di pollice (0,0254 mm)' },
      { id: 'league', name: 'Lega terrestre (League)', nameEn: 'League', symbol: 'lea', toBase: v => v * 4828.032, fromBase: v => v / 4828.032, system: 'imperial', description: '3 miglia terrestri' },
      { id: 'au', name: 'Unità Astronomica', nameEn: 'Astronomical Unit', symbol: 'AU', toBase: v => v * 149597870700, fromBase: v => v / 149597870700, system: 'astronomy', description: 'Distanza media Terra-Sole (~150M km)' },
      { id: 'ly', name: 'Anno Luce', nameEn: 'Light Year', symbol: 'ly', toBase: v => v * 9.4607304725808e15, fromBase: v => v / 9.4607304725808e15, system: 'astronomy', description: '~9,46 trilioni di chilometri' },
      { id: 'pc', name: 'Parsec', nameEn: 'Parsec', symbol: 'pc', toBase: v => v * 3.08567758149137e16, fromBase: v => v / 3.08567758149137e16, system: 'astronomy', description: '~3,26 anni luce' },
      { id: 'cubit', name: 'Cubito antico biblico', nameEn: 'Biblical Cubit', symbol: 'cubit', toBase: v => v * 0.4572, fromBase: v => v / 0.4572, system: 'other', description: 'Distanza gomito-punta del dito (~45,7 cm)' }
    ],
    benchmarks: [
      { label: 'Maratona Olimpica', unitId: 'km', value: 42.195, fact: 'Distanza ufficiale 42,195 km = 26,219 miglia' },
      { label: 'Monte Everest', unitId: 'm', value: 8848.86, fact: 'Punto più alto della Terra = 29.032 piedi' },
      { label: 'Luna da Terra', unitId: 'km', value: 384400, fact: 'Distanza orbitale media della Luna' },
      { label: 'Proxima Centauri', unitId: 'ly', value: 4.2465, fact: 'La stella più vicina al nostro Sole' }
    ]
  },

  // 2. MASSA & PESO
  {
    id: 'mass',
    name: 'Massa & Peso',
    nameEn: 'Mass & Weight',
    icon: 'Scale',
    baseUnit: 'kg',
    group: 'everyday',
    description: 'Dal microgrammo alla tonnellata, libbre, once, carati per gemme e once troy d\'oro.',
    units: [
      { id: 'kg', name: 'Chilogrammo', nameEn: 'Kilogram', symbol: 'kg', toBase: v => v, fromBase: v => v, system: 'metric', description: 'Unità base SI' },
      { id: 'g', name: 'Grammo', nameEn: 'Gram', symbol: 'g', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'metric' },
      { id: 'mg', name: 'Milligrammo', nameEn: 'Milligram', symbol: 'mg', toBase: v => v * 1e-6, fromBase: v => v * 1e6, system: 'metric' },
      { id: 'ug', name: 'Microgrammo', nameEn: 'Microgram', symbol: 'µg', toBase: v => v * 1e-9, fromBase: v => v * 1e9, system: 'metric' },
      { id: 'hg', name: 'Ettogrammo (Etto)', nameEn: 'Hectogram', symbol: 'hg', toBase: v => v * 0.1, fromBase: v => v * 10, system: 'metric', description: '100 grammi' },
      { id: 'q', name: 'Quintale', nameEn: 'Metric Quintal', symbol: 'q', toBase: v => v * 100, fromBase: v => v / 100, system: 'metric', description: '100 kg' },
      { id: 't', name: 'Tonnellata metrica', nameEn: 'Metric Tonne', symbol: 't', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'metric', description: '1.000 kg' },
      { id: 'lb', name: 'Libbra (Pound)', nameEn: 'Pound', symbol: 'lb', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237, system: 'imperial', description: 'Esattamente 453,59237 grammi (16 oz)' },
      { id: 'oz', name: 'Oncia (Ounce)', nameEn: 'Ounce', symbol: 'oz', toBase: v => v * 0.028349523125, fromBase: v => v / 0.028349523125, system: 'imperial', description: '28,3495 grammi' },
      { id: 'st', name: 'Pietra (Stone UK)', nameEn: 'Stone', symbol: 'st', toBase: v => v * 6.35029318, fromBase: v => v / 6.35029318, system: 'imperial', description: '14 libbre = ~6,35 kg' },
      { id: 'ozt', name: 'Oncia Troy (Oro/Preziosi)', nameEn: 'Troy Ounce', symbol: 'oz t', toBase: v => v * 0.0311034768, fromBase: v => v / 0.0311034768, system: 'other', description: '31,1035 g (standard quotazioni oro/argento)' },
      { id: 'ct', name: 'Carato metrico (Diamanti)', nameEn: 'Carat', symbol: 'ct', toBase: v => v * 0.0002, fromBase: v => v * 5000, system: 'other', description: '0,2 grammi = 200 milligrammi' },
      { id: 'grain', name: 'Grano (Grain)', nameEn: 'Grain', symbol: 'gr', toBase: v => v * 0.00006479891, fromBase: v => v / 0.00006479891, system: 'imperial', description: '~64,8 mg (usato in polvere da sparo/frecce)' },
      { id: 'dr', name: 'Dram (Avoirdupois)', nameEn: 'Dram', symbol: 'dr', toBase: v => v * 0.0017718451953125, fromBase: v => v / 0.0017718451953125, system: 'imperial' },
      { id: 'short_ton', name: 'Short Ton (Tonnellata USA)', nameEn: 'Short Ton (US)', symbol: 'tn (US)', toBase: v => v * 907.18474, fromBase: v => v / 907.18474, system: 'us', description: '2.000 libbre = 907,18 kg' },
      { id: 'long_ton', name: 'Long Ton (Tonnellata Imperiale UK)', nameEn: 'Long Ton (UK)', symbol: 'tn (UK)', toBase: v => v * 1016.0469088, fromBase: v => v / 1016.0469088, system: 'imperial', description: '2.240 libbre = 1.016 kg' },
      { id: 'cwt', name: 'Hundredweight USA', nameEn: 'Hundredweight (US)', symbol: 'cwt', toBase: v => v * 45.359237, fromBase: v => v / 45.359237, system: 'us', description: '100 libbre = 45,36 kg' },
      { id: 'slug', name: 'Slug (Massa gravitazionale)', nameEn: 'Slug', symbol: 'slug', toBase: v => v * 14.5939029, fromBase: v => v / 14.5939029, system: 'imperial', description: '32,174 lb = 14,59 kg' }
    ],
    benchmarks: [
      { label: 'Lingotto Standard Good Delivery d\'Oro', unitId: 'kg', value: 12.4, fact: '~400 once Troy = 12,4 kg' },
      { label: 'Valigia da cabina aereo', unitId: 'kg', value: 10, fact: '10 kg = 22,046 libbre' },
      { label: 'Diamante Cullinan (il più grande trovato)', unitId: 'ct', value: 3106, fact: '3.106 carati = 621,35 grammi' }
    ]
  },

  // 3. VOLUME & CAPACITÀ
  {
    id: 'volume',
    name: 'Volume & Capacità',
    nameEn: 'Volume & Capacity',
    icon: 'Package',
    baseUnit: 'L',
    group: 'everyday',
    description: 'Litri, millilitri, metri cubi, galloni USA e UK, pinte, tazze, cucchiai e barili di petrolio.',
    units: [
      { id: 'L', name: 'Litro', nameEn: 'Liter', symbol: 'L', toBase: v => v, fromBase: v => v, system: 'metric', description: '1 dm³ = 1.000 mL' },
      { id: 'mL', name: 'Millilitro (cc / cm³)', nameEn: 'Milliliter', symbol: 'mL', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'metric', description: '1 cm³' },
      { id: 'cL', name: 'Centilitro', nameEn: 'Centiliter', symbol: 'cL', toBase: v => v * 0.01, fromBase: v => v * 100, system: 'metric', description: '10 mL' },
      { id: 'dL', name: 'Decilitro', nameEn: 'Deciliter', symbol: 'dL', toBase: v => v * 0.1, fromBase: v => v * 10, system: 'metric', description: '100 mL' },
      { id: 'hL', name: 'Ettolitro', nameEn: 'Hectoliter', symbol: 'hL', toBase: v => v * 100, fromBase: v => v / 100, system: 'metric', description: '100 litri (usato per vino e birra)' },
      { id: 'm3', name: 'Metro cubo', nameEn: 'Cubic Meter', symbol: 'm³', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'metric', description: '1.000 litri' },
      { id: 'uL', name: 'Microlitro', nameEn: 'Microliter', symbol: 'µL', toBase: v => v * 1e-6, fromBase: v => v * 1e6, system: 'metric' },
      { id: 'gal_us', name: 'Gallone Liquido USA', nameEn: 'US Liquid Gallon', symbol: 'gal (US)', toBase: v => v * 3.785411784, fromBase: v => v / 3.785411784, system: 'us', description: '231 cu in = 3,7854 L' },
      { id: 'qt_us', name: 'Quarto USA (Quart)', nameEn: 'US Liquid Quart', symbol: 'qt (US)', toBase: v => v * 0.946352946, fromBase: v => v / 0.946352946, system: 'us', description: '1/4 di gallone = 946,35 mL' },
      { id: 'pt_us', name: 'Pinta USA (Pint)', nameEn: 'US Liquid Pint', symbol: 'pt (US)', toBase: v => v * 0.473176473, fromBase: v => v / 0.473176473, system: 'us', description: '16 fl oz = 473,18 mL' },
      { id: 'cup_us', name: 'Tazza USA (Cup)', nameEn: 'US Legal Cup', symbol: 'cup', toBase: v => v * 0.2365882365, fromBase: v => v / 0.2365882365, system: 'us', description: '8 fl oz = ~236,6 mL' },
      { id: 'floz_us', name: 'Oncia Liquida USA (fl oz)', nameEn: 'US Fluid Ounce', symbol: 'fl oz (US)', toBase: v => v * 0.0295735295625, fromBase: v => v / 0.0295735295625, system: 'us', description: '29,5735 mL' },
      { id: 'tbsp_us', name: 'Cucchiaio USA (Tablespoon)', nameEn: 'US Tablespoon', symbol: 'tbsp', toBase: v => v * 0.01478676478125, fromBase: v => v / 0.01478676478125, system: 'us', description: '3 cucchiaini = 14,79 mL' },
      { id: 'tsp_us', name: 'Cucchiaino USA (Teaspoon)', nameEn: 'US Teaspoon', symbol: 'tsp', toBase: v => v * 0.00492892159375, fromBase: v => v / 0.00492892159375, system: 'us', description: '4,93 mL' },
      { id: 'gal_uk', name: 'Gallone Imperiale UK', nameEn: 'Imperial Gallon', symbol: 'gal (UK)', toBase: v => v * 4.54609, fromBase: v => v / 4.54609, system: 'imperial', description: 'Esattamente 4,54609 L' },
      { id: 'pt_uk', name: 'Pinta Imperiale UK (Pint)', nameEn: 'Imperial Pint', symbol: 'pt (UK)', toBase: v => v * 0.56826125, fromBase: v => v / 0.56826125, system: 'imperial', description: '20 UK fl oz = 568,26 mL (classica pinta da pub)' },
      { id: 'floz_uk', name: 'Oncia Liquida UK', nameEn: 'Imperial Fluid Ounce', symbol: 'fl oz (UK)', toBase: v => v * 0.0284130625, fromBase: v => v / 0.0284130625, system: 'imperial', description: '28,413 mL' },
      { id: 'bbl', name: 'Barile di Petrolio Greggio (Oil Barrel)', nameEn: 'Oil Barrel', symbol: 'bbl', toBase: v => v * 158.987294928, fromBase: v => v / 158.987294928, system: 'other', description: '42 galloni USA = 158,987 L' },
      { id: 'cu_ft', name: 'Piede cubo (Cubic Foot)', nameEn: 'Cubic Foot', symbol: 'cu ft', toBase: v => v * 28.316846592, fromBase: v => v / 28.316846592, system: 'imperial', description: '28,32 L' },
      { id: 'cu_in', name: 'Pollice cubo (Cubic Inch)', nameEn: 'Cubic Inch', symbol: 'cu in', toBase: v => v * 0.016387064, fromBase: v => v / 0.016387064, system: 'imperial', description: '16,387 mL' },
      { id: 'cu_yd', name: 'Iarda cubica (Cubic Yard)', nameEn: 'Cubic Yard', symbol: 'cu yd', toBase: v => v * 764.554857984, fromBase: v => v / 764.554857984, system: 'imperial', description: '764,55 L' },
      { id: 'bushel', name: 'Bushel Secco USA (Moggio)', nameEn: 'US Dry Bushel', symbol: 'bu', toBase: v => v * 35.23907016688, fromBase: v => v / 35.23907016688, system: 'us', description: '35,24 L (usato per grano e cereali)' }
    ],
    benchmarks: [
      { label: 'Pinta di birra in Pub Inglese', unitId: 'pt_uk', value: 1, fact: '1 Pinta UK = 568,26 mL (contro i 473 mL della pinta USA)' },
      { label: 'Barile di petrolio Brent', unitId: 'bbl', value: 1, fact: '1 Barile (bbl) = 158,99 litri = 42 galloni USA' },
      { label: 'Piscina Olimpionica', unitId: 'm3', value: 2500, fact: '2.500 m³ = 2.500.000 litri' }
    ]
  },

  // 4. AREA & SUPERFICIE
  {
    id: 'area',
    name: 'Area & Superficie',
    nameEn: 'Area & Surface',
    icon: 'Layers',
    baseUnit: 'm2',
    group: 'everyday',
    description: 'Metri quadri, ettari, acri, miglia quadrate, pertiche agrarie e unità catastali.',
    units: [
      { id: 'm2', name: 'Metro quadro', nameEn: 'Square Meter', symbol: 'm²', toBase: v => v, fromBase: v => v, system: 'metric', description: 'Unità base SI' },
      { id: 'ha', name: 'Ettaro', nameEn: 'Hectare', symbol: 'ha', toBase: v => v * 10000, fromBase: v => v / 10000, system: 'metric', description: '10.000 m² (100 m × 100 m)' },
      { id: 'km2', name: 'Chilometro quadro', nameEn: 'Square Kilometer', symbol: 'km²', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'metric', description: '1.000.000 m² = 100 ettari' },
      { id: 'a', name: 'Ara', nameEn: 'Are', symbol: 'a', toBase: v => v * 100, fromBase: v => v / 100, system: 'metric', description: '100 m²' },
      { id: 'cm2', name: 'Centimetro quadro', nameEn: 'Square Centimeter', symbol: 'cm²', toBase: v => v * 0.0001, fromBase: v => v * 10000, system: 'metric' },
      { id: 'mm2', name: 'Millimetro quadro', nameEn: 'Square Millimeter', symbol: 'mm²', toBase: v => v * 1e-6, fromBase: v => v * 1e6, system: 'metric' },
      { id: 'acre', name: 'Acro (Acre)', nameEn: 'Acre', symbol: 'ac', toBase: v => v * 4046.8564224, fromBase: v => v / 4046.8564224, system: 'imperial', description: '4.046,86 m² = 43.560 sq ft' },
      { id: 'sq_ft', name: 'Piede quadro (Square Foot)', nameEn: 'Square Foot', symbol: 'sq ft', toBase: v => v * 0.09290304, fromBase: v => v / 0.09290304, system: 'imperial', description: '0,0929 m²' },
      { id: 'sq_in', name: 'Pollice quadro (Square Inch)', nameEn: 'Square Inch', symbol: 'sq in', toBase: v => v * 0.00064516, fromBase: v => v / 0.00064516, system: 'imperial', description: '6,4516 cm²' },
      { id: 'sq_yd', name: 'Iarda quadra (Square Yard)', nameEn: 'Square Yard', symbol: 'sq yd', toBase: v => v * 0.83612736, fromBase: v => v / 0.83612736, system: 'imperial', description: '9 sq ft = 0,836 m²' },
      { id: 'sq_mi', name: 'Miglio quadro (Square Mile)', nameEn: 'Square Mile', symbol: 'sq mi', toBase: v => v * 2589988.110336, fromBase: v => v / 2589988.110336, system: 'imperial', description: '640 acri = 2,59 km²' },
      { id: 'pertica', name: 'Pertica agraria italiana (media)', nameEn: 'Italian Pertica', symbol: 'pertica', toBase: v => v * 662, fromBase: v => v / 662, system: 'other', description: 'Circa 662 m² (varia storicamente per provincia)' },
      { id: 'biolca', name: 'Biolca (Tradizionale padana)', nameEn: 'Biolca', symbol: 'biolca', toBase: v => v * 3000, fromBase: v => v / 3000, system: 'other', description: 'Circa 3.000 m² (giornata di lavoro con buoi)' }
    ],
    benchmarks: [
      { label: 'Campo da Calcio Serie A / UEFA', unitId: 'm2', value: 7140, fact: '105m × 68m = 7.140 m² (~0,714 ettari)' },
      { label: 'Central Park (New York)', unitId: 'acre', value: 843, fact: '843 acri = 3,41 km²' },
      { label: 'Città del Vaticano', unitId: 'km2', value: 0.49, fact: 'Lo stato sovrano più piccolo del mondo = 49 ettari' }
    ]
  },

  // 5. TEMPERATURA
  {
    id: 'temperature',
    name: 'Temperatura',
    nameEn: 'Temperature',
    icon: 'Thermometer',
    baseUnit: 'C',
    group: 'everyday',
    description: 'Celsius, Fahrenheit, Kelvin assoluto, Rankine, Réaumur e scala Delisle.',
    units: [
      { id: 'C', name: 'Celsius (Grado Centigrado)', nameEn: 'Celsius', symbol: '°C', toBase: v => v, fromBase: v => v, system: 'metric', description: '0 °C congelamento acqua, 100 °C ebollizione' },
      { id: 'F', name: 'Fahrenheit', nameEn: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) * (5 / 9), fromBase: v => (v * 9 / 5) + 32, system: 'us', description: '32 °F congelamento, 212 °F ebollizione' },
      { id: 'K', name: 'Kelvin', nameEn: 'Kelvin', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15, system: 'si', description: '0 K = Zero assoluto (-273,15 °C)' },
      { id: 'R', name: 'Rankine', nameEn: 'Rankine', symbol: '°R', toBase: v => (v - 491.67) * (5 / 9), fromBase: v => (v + 273.15) * (9 / 5), system: 'imperial', description: 'Scala termodinamica imperiale basata sul Fahrenheit' },
      { id: 'Re', name: 'Réaumur', nameEn: 'Réaumur', symbol: '°Ré', toBase: v => v * 1.25, fromBase: v => v * 0.8, system: 'other', description: '0 °Ré congelamento, 80 °Ré ebollizione' },
      { id: 'De', name: 'Delisle', nameEn: 'Delisle', symbol: '°De', toBase: v => 100 - (v * 2 / 3), fromBase: v => (100 - v) * 1.5, system: 'other', description: 'Scala invertita: 0 °De ebollizione, 150 °De congelamento' }
    ],
    benchmarks: [
      { label: 'Zero Assoluto', unitId: 'K', value: 0, fact: '-273,15 °C = 0 K (cessazione del moto molecolare)' },
      { label: 'Temperatura Corporea Umana Media', unitId: 'C', value: 37, fact: '37 °C = 98,6 °F = 310,15 K' },
      { label: 'Ebollizione dell\'Acqua al livello del mare', unitId: 'C', value: 100, fact: '100 °C = 212 °F = 373,15 K' },
      { label: 'Superficie del Sole', unitId: 'C', value: 5505, fact: '~5.500 °C = 9.940 °F = 5.778 K' }
    ]
  },

  // 6. VELOCITÀ
  {
    id: 'speed',
    name: 'Velocità & Andatura',
    nameEn: 'Speed & Velocity',
    icon: 'Zap',
    baseUnit: 'm_s',
    group: 'everyday',
    description: 'km/h, miglia orarie (mph), nodi nautici, Mach nel suono, frazione della luce (c).',
    units: [
      { id: 'km_h', name: 'Chilometri orari', nameEn: 'Kilometers per Hour', symbol: 'km/h', toBase: v => v / 3.6, fromBase: v => v * 3.6, system: 'metric', description: '1 m/s = 3,6 km/h' },
      { id: 'm_s', name: 'Metri al secondo', nameEn: 'Meters per Second', symbol: 'm/s', toBase: v => v, fromBase: v => v, system: 'si', description: 'Unità base SI' },
      { id: 'mph', name: 'Miglia orarie', nameEn: 'Miles per Hour', symbol: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704, system: 'imperial', description: '1 mph = 1,60934 km/h' },
      { id: 'knot', name: 'Nodo marittimo / aereo', nameEn: 'Knot', symbol: 'kn', toBase: v => v * 0.51444444444, fromBase: v => v / 0.51444444444, system: 'other', description: '1 miglio nautico all\'ora = 1,852 km/h' },
      { id: 'ft_s', name: 'Piedi al secondo', nameEn: 'Feet per Second', symbol: 'ft/s', toBase: v => v * 0.3048, fromBase: v => v / 0.3048, system: 'imperial' },
      { id: 'mach', name: 'Numero di Mach (in aria a 20°C)', nameEn: 'Mach Number', symbol: 'Ma', toBase: v => v * 343, fromBase: v => v / 343, system: 'science', description: 'Velocità del suono = 343 m/s (~1.234,8 km/h)' },
      { id: 'c', name: 'Frazione velocità della luce (c)', nameEn: 'Speed of Light', symbol: 'c', toBase: v => v * 299792458, fromBase: v => v / 299792458, system: 'science', description: '299.792.458 m/s nel vuoto' }
    ],
    benchmarks: [
      { label: 'Limite Autostradale Italia', unitId: 'km_h', value: 130, fact: '130 km/h = 80,78 mph = 36,1 m/s' },
      { label: 'Velocità del Suono (Mach 1)', unitId: 'km_h', value: 1234.8, fact: '1 Mach = 1.234,8 km/h = 767,3 mph' },
      { label: 'Velocità di Fuga della Terra', unitId: 'km_h', value: 40270, fact: '11,186 km/s (~40.270 km/h) per sfuggire alla gravità terrestre' }
    ]
  },

  // 7. TEMPO
  {
    id: 'time',
    name: 'Tempo',
    nameEn: 'Time',
    icon: 'Clock',
    baseUnit: 's',
    group: 'everyday',
    description: 'Dal nanosecondo all\'anno, secoli, decenni e millenni.',
    units: [
      { id: 's', name: 'Secondo', nameEn: 'Second', symbol: 's', toBase: v => v, fromBase: v => v, system: 'si', description: 'Unità base SI' },
      { id: 'min', name: 'Minuto', nameEn: 'Minute', symbol: 'min', toBase: v => v * 60, fromBase: v => v / 60, system: 'other', description: '60 secondi' },
      { id: 'h', name: 'Ora', nameEn: 'Hour', symbol: 'h', toBase: v => v * 3600, fromBase: v => v / 3600, system: 'other', description: '3.600 secondi' },
      { id: 'd', name: 'Giorno', nameEn: 'Day', symbol: 'd', toBase: v => v * 86400, fromBase: v => v / 86400, system: 'other', description: '24 ore = 86.400 secondi' },
      { id: 'wk', name: 'Settimana', nameEn: 'Week', symbol: 'wk', toBase: v => v * 604800, fromBase: v => v / 604800, system: 'other', description: '7 giorni' },
      { id: 'mo', name: 'Mese medio gregoriano (30.44 gg)', nameEn: 'Month (Average)', symbol: 'mo', toBase: v => v * 2629800, fromBase: v => v / 2629800, system: 'other', description: '30,4375 giorni' },
      { id: 'yr', name: 'Anno civile standard (365 gg)', nameEn: 'Year (Calendar)', symbol: 'yr', toBase: v => v * 31536000, fromBase: v => v / 31536000, system: 'other', description: '8.760 ore = 31,536 milioni di secondi' },
      { id: 'yr_julian', name: 'Anno giuliano astronomico (365.25 gg)', nameEn: 'Julian Year', symbol: 'a', toBase: v => v * 31557600, fromBase: v => v / 31557600, system: 'astronomy', description: '365,25 giorni' },
      { id: 'decade', name: 'Decennio', nameEn: 'Decade', symbol: 'dec', toBase: v => v * 315576000, fromBase: v => v / 315576000, system: 'other', description: '10 anni' },
      { id: 'century', name: 'Secolo', nameEn: 'Century', symbol: 'sec', toBase: v => v * 3155760000, fromBase: v => v / 3155760000, system: 'other', description: '100 anni' },
      { id: 'millennium', name: 'Millennio', nameEn: 'Millennium', symbol: 'mil', toBase: v => v * 31557600000, fromBase: v => v / 31557600000, system: 'other', description: '1.000 anni' },
      { id: 'ms', name: 'Millisecondo', nameEn: 'Millisecond', symbol: 'ms', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'si' },
      { id: 'us', name: 'Microsecondo', nameEn: 'Microsecond', symbol: 'µs', toBase: v => v * 1e-6, fromBase: v => v * 1e6, system: 'si' },
      { id: 'ns', name: 'Nanosecondo', nameEn: 'Nanosecond', symbol: 'ns', toBase: v => v * 1e-9, fromBase: v => v * 1e9, system: 'si' }
    ],
    benchmarks: [
      { label: 'Un giorno solare sulla Terra', unitId: 's', value: 86400, fact: '86.400 secondi = 1.440 minuti = 24 ore' },
      { label: 'Un miliardo di secondi', unitId: 'yr', value: 31.69, fact: '1 miliardo di secondi equivale a circa 31 anni e 8 mesi' }
    ]
  },

  // 8. PRESSIONE
  {
    id: 'pressure',
    name: 'Pressione',
    nameEn: 'Pressure',
    icon: 'Gauge',
    baseUnit: 'Pa',
    group: 'science',
    description: 'Pascal, bar, atmosfere standard (atm), psi per pneumatici, mmHg/Torr per meteo e medicina.',
    units: [
      { id: 'bar', name: 'Bar', nameEn: 'Bar', symbol: 'bar', toBase: v => v * 100000, fromBase: v => v / 100000, system: 'metric', description: '100.000 Pa (~1 atmosfera)' },
      { id: 'mbar', name: 'Millibar / Ettopascal', nameEn: 'Millibar / hPa', symbol: 'mbar / hPa', toBase: v => v * 100, fromBase: v => v / 100, system: 'metric', description: 'Standard previsioni meteorologiche' },
      { id: 'atm', name: 'Atmosfera standard', nameEn: 'Standard Atmosphere', symbol: 'atm', toBase: v => v * 101325, fromBase: v => v / 101325, system: 'other', description: 'Esattamente 101.325 Pa (pressione al livello del mare)' },
      { id: 'psi', name: 'Pound per Square Inch (PSI)', nameEn: 'Pounds per Sq Inch', symbol: 'psi', toBase: v => v * 6894.757293, fromBase: v => v / 6894.757293, system: 'imperial', description: 'Pressione pneumatici USA/UK (1 bar = ~14,5 psi)' },
      { id: 'Pa', name: 'Pascal', nameEn: 'Pascal', symbol: 'Pa', toBase: v => v, fromBase: v => v, system: 'si', description: '1 N/m² (unità base SI)' },
      { id: 'kPa', name: 'Kilopascal', nameEn: 'Kilopascal', symbol: 'kPa', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'si', description: '1.000 Pa' },
      { id: 'MPa', name: 'Megapascal', nameEn: 'Megapascal', symbol: 'MPa', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'si', description: '1.000.000 Pa = 10 bar' },
      { id: 'mmHg', name: 'Millimetro di mercurio (Torr)', nameEn: 'Torr / mmHg', symbol: 'mmHg', toBase: v => v * 133.3223684, fromBase: v => v / 133.3223684, system: 'other', description: 'Misurazione pressione sanguigna arteriosa' },
      { id: 'inHg', name: 'Pollici di mercurio', nameEn: 'Inches of Mercury', symbol: 'inHg', toBase: v => v * 3386.389, fromBase: v => v / 3386.389, system: 'imperial', description: 'Usato nell\'aviazione USA' },
      { id: 'at', name: 'Atmosfera tecnica (kp/cm²)', nameEn: 'Technical Atmosphere', symbol: 'at', toBase: v => v * 98066.5, fromBase: v => v / 98066.5, system: 'metric', description: '1 kgf/cm²' },
      { id: 'mmH2O', name: 'Millimetri di colonna d\'acqua', nameEn: 'mm of Water', symbol: 'mmH2O', toBase: v => v * 9.80665, fromBase: v => v / 9.80665, system: 'other' }
    ],
    benchmarks: [
      { label: 'Pressione Pneumatici Auto Tipica', unitId: 'bar', value: 2.3, fact: '2,3 bar = ~33,35 PSI = 230 kPa' },
      { label: 'Pressione Atmosferica Standard', unitId: 'atm', value: 1, fact: '1013,25 hPa = 760 mmHg = 14,7 PSI' },
      { label: 'Fossa delle Marianne (punto più profondo)', unitId: 'bar', value: 1086, fact: 'Oltre 1.000 bar di pressione oceanica' }
    ]
  },

  // 9. ENERGIA & LAVORO
  {
    id: 'energy',
    name: 'Energia & Lavoro',
    nameEn: 'Energy & Work',
    icon: 'Flame',
    baseUnit: 'J',
    group: 'science',
    description: 'Joule, calorie nutrizionali (kcal), kilowattora (kWh), BTU, elettronvolt ed erg.',
    units: [
      { id: 'J', name: 'Joule', nameEn: 'Joule', symbol: 'J', toBase: v => v, fromBase: v => v, system: 'si', description: '1 N·m = 1 W·s' },
      { id: 'kJ', name: 'Kilojoule', nameEn: 'Kilojoule', symbol: 'kJ', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'si', description: '1.000 Joule' },
      { id: 'MJ', name: 'Megajoule', nameEn: 'Megajoule', symbol: 'MJ', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'si' },
      { id: 'GJ', name: 'Gigajoule', nameEn: 'Gigajoule', symbol: 'GJ', toBase: v => v * 1e9, fromBase: v => v / 1e9, system: 'si' },
      { id: 'kcal', name: 'Kilocaloria (Caloria alimentare)', nameEn: 'Kilocalorie (Calorie)', symbol: 'kcal', toBase: v => v * 4184, fromBase: v => v / 4184, system: 'other', description: '1 kcal = 4.184 Joule' },
      { id: 'cal', name: 'Caloria termica', nameEn: 'Small Calorie', symbol: 'cal', toBase: v => v * 4.184, fromBase: v => v / 4.184, system: 'other', description: '4,184 Joule' },
      { id: 'kWh', name: 'Kilowattora', nameEn: 'Kilowatt-hour', symbol: 'kWh', toBase: v => v * 3.6e6, fromBase: v => v / 3.6e6, system: 'other', description: '3.600.000 Joule = consumo bollette elettriche' },
      { id: 'Wh', name: 'Wattora', nameEn: 'Watt-hour', symbol: 'Wh', toBase: v => v * 3600, fromBase: v => v / 3600, system: 'other', description: '3.600 Joule' },
      { id: 'MWh', name: 'Megawattora', nameEn: 'Megawatt-hour', symbol: 'MWh', toBase: v => v * 3.6e9, fromBase: v => v / 3.6e9, system: 'other', description: '1.000 kWh' },
      { id: 'eV', name: 'Elettronvolt', nameEn: 'Electronvolt', symbol: 'eV', toBase: v => v * 1.602176634e-19, fromBase: v => v / 1.602176634e-19, system: 'science', description: 'Energia su scala atomica' },
      { id: 'btu', name: 'BTU (British Thermal Unit)', nameEn: 'BTU', symbol: 'BTU', toBase: v => v * 1055.05585, fromBase: v => v / 1055.05585, system: 'imperial', description: '1.055,06 Joule' },
      { id: 'therm', name: 'Therm (Gas naturale US)', nameEn: 'Therm', symbol: 'thm', toBase: v => v * 105480400, fromBase: v => v / 105480400, system: 'us', description: '100.000 BTU' },
      { id: 'ft_lbf', name: 'Piede-libbra (Foot-pound)', nameEn: 'Foot-pound', symbol: 'ft·lbf', toBase: v => v * 1.355817948, fromBase: v => v / 1.355817948, system: 'imperial' },
      { id: 'erg', name: 'Erg (Sistema CGS)', nameEn: 'Erg', symbol: 'erg', toBase: v => v * 1e-7, fromBase: v => v * 1e7, system: 'science', description: '10⁻⁷ Joule' },
      { id: 'tnt', name: 'Tonnellata TNT', nameEn: 'Ton of TNT', symbol: 't TNT', toBase: v => v * 4.184e9, fromBase: v => v / 4.184e9, system: 'science', description: '4,184 Gigajoule' }
    ],
    benchmarks: [
      { label: 'Fabbisogno calorico giornaliero adulto', unitId: 'kcal', value: 2000, fact: '2.000 kcal = 8.368 kJ = 2,32 kWh' },
      { label: '1 Litro di Benzina (Energia chimica)', unitId: 'MJ', value: 34.2, fact: '~34,2 MJ = 9,5 kWh di energia termica' },
      { label: 'Batteria smartphone media (15 Wh)', unitId: 'Wh', value: 15, fact: '15 Wh = 54.000 Joule (~4.000 mAh a 3,7V)' }
    ]
  },

  // 10. POTENZA
  {
    id: 'power',
    name: 'Potenza',
    nameEn: 'Power',
    icon: 'Zap',
    baseUnit: 'W',
    group: 'science',
    description: 'Watt, kilowatt, cavalli vapore (CV/PS metrico e HP imperiale), BTU/h e tonnellate di refrigerazione.',
    units: [
      { id: 'kW', name: 'Kilowatt', nameEn: 'Kilowatt', symbol: 'kW', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'si', description: '1.000 Watt' },
      { id: 'W', name: 'Watt', nameEn: 'Watt', symbol: 'W', toBase: v => v, fromBase: v => v, system: 'si', description: '1 Joule/secondo' },
      { id: 'mW', name: 'Milliwatt', nameEn: 'Milliwatt', symbol: 'mW', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'si' },
      { id: 'MW', name: 'Megawatt', nameEn: 'Megawatt', symbol: 'MW', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'si', description: '1 milione di Watt' },
      { id: 'GW', name: 'Gigawatt', nameEn: 'Gigawatt', symbol: 'GW', toBase: v => v * 1e9, fromBase: v => v / 1e9, system: 'si', description: '1 miliardo di Watt' },
      { id: 'cv', name: 'Cavallo vapore metrico (CV / PS)', nameEn: 'Metric Horsepower', symbol: 'CV', toBase: v => v * 735.49875, fromBase: v => v / 735.49875, system: 'metric', description: '735,5 Watt (usato per automobili in Europa)' },
      { id: 'hp', name: 'Cavallo vapore meccanico (Imperial HP)', nameEn: 'Mechanical Horsepower', symbol: 'hp', toBase: v => v * 745.699872, fromBase: v => v / 745.699872, system: 'imperial', description: '745,7 Watt (standard USA/UK)' },
      { id: 'btu_h', name: 'BTU per ora (Condizionatori)', nameEn: 'BTU per Hour', symbol: 'BTU/h', toBase: v => v * 0.29307107, fromBase: v => v / 0.29307107, system: 'imperial', description: 'Climatizzatori (es. 9000 o 12000 BTU/h)' },
      { id: 'tr', name: 'Tonnellata di refrigerazione (TR)', nameEn: 'Ton of Refrigeration', symbol: 'TR', toBase: v => v * 3516.85284, fromBase: v => v / 3516.85284, system: 'us', description: '12.000 BTU/h = 3,517 kW' },
      { id: 'kcal_h', name: 'Kilocalorie all\'ora', nameEn: 'Kilocalories per Hour', symbol: 'kcal/h', toBase: v => v * 1.163, fromBase: v => v / 1.163, system: 'other' }
    ],
    benchmarks: [
      { label: 'Contratto Luce Domestico Italia', unitId: 'kW', value: 3, fact: '3 kW di potenza impegnata standard monofase' },
      { label: 'Auto da 100 Cavalli Vapore (CV)', unitId: 'cv', value: 100, fact: '100 CV = 73,55 kW di potenza del motore' },
      { label: 'Climatizzatore 9.000 BTU/h', unitId: 'btu_h', value: 9000, fact: '9.000 BTU/h = 2,637 kW termici' }
    ]
  },

  // 11. DATI DIGITALI & STORAGE
  {
    id: 'data',
    name: 'Dati Digitali & Storage',
    nameEn: 'Digital Data & Storage',
    icon: 'HardDrive',
    baseUnit: 'B',
    group: 'tech',
    description: 'Byte, KB, MB, GB, TB, PB e distinzione tra standard decimale SI (1000) e binario IEC (1024 KiB/MiB).',
    units: [
      { id: 'B', name: 'Byte', nameEn: 'Byte', symbol: 'B', toBase: v => v, fromBase: v => v, system: 'metric', description: '8 bit' },
      { id: 'bit', name: 'Bit', nameEn: 'Bit', symbol: 'b', toBase: v => v * 0.125, fromBase: v => v * 8, system: 'other', description: 'Unità fondamentale di informazione (0 o 1)' },
      { id: 'KB', name: 'Kilobyte (Decimale SI)', nameEn: 'Kilobyte', symbol: 'KB', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'metric', description: '1.000 Byte' },
      { id: 'KiB', name: 'Kibibyte (Binario IEC)', nameEn: 'Kibibyte', symbol: 'KiB', toBase: v => v * 1024, fromBase: v => v / 1024, system: 'binary', description: '1.024 Byte (2¹⁰)' },
      { id: 'MB', name: 'Megabyte (Decimale SI)', nameEn: 'Megabyte', symbol: 'MB', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'metric', description: '1.000.000 Byte' },
      { id: 'MiB', name: 'Mebibyte (Binario IEC)', nameEn: 'Mebibyte', symbol: 'MiB', toBase: v => v * 1048576, fromBase: v => v / 1048576, system: 'binary', description: '1.048.576 Byte (1024²)' },
      { id: 'GB', name: 'Gigabyte (Decimale SI)', nameEn: 'Gigabyte', symbol: 'GB', toBase: v => v * 1e9, fromBase: v => v / 1e9, system: 'metric', description: '1 miliardo di Byte (standard produttori hard disk)' },
      { id: 'GiB', name: 'Gibibyte (Binario Windows)', nameEn: 'Gibibyte', symbol: 'GiB', toBase: v => v * 1073741824, fromBase: v => v / 1073741824, system: 'binary', description: '1.073.741.824 Byte (rilevato da Windows come "GB")' },
      { id: 'TB', name: 'Terabyte (Decimale SI)', nameEn: 'Terabyte', symbol: 'TB', toBase: v => v * 1e12, fromBase: v => v / 1e12, system: 'metric', description: '1 trilione di Byte' },
      { id: 'TiB', name: 'Tebibyte (Binario IEC)', nameEn: 'Tebibyte', symbol: 'TiB', toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776, system: 'binary', description: '1.024 GiB (~1,1 TB)' },
      { id: 'PB', name: 'Petabyte', nameEn: 'Petabyte', symbol: 'PB', toBase: v => v * 1e15, fromBase: v => v / 1e15, system: 'metric', description: '1.000 Terabyte' },
      { id: 'PiB', name: 'Pebibyte', nameEn: 'Pebibyte', symbol: 'PiB', toBase: v => v * 1.125899906842624e15, fromBase: v => v / 1.125899906842624e15, system: 'binary', description: '1.024 TiB' },
      { id: 'EB', name: 'Exabyte', nameEn: 'Exabyte', symbol: 'EB', toBase: v => v * 1e18, fromBase: v => v / 1e18, system: 'metric', description: '1 miliardo di Gigabyte' },
      { id: 'nibble', name: 'Nibble (Semi-byte)', nameEn: 'Nibble', symbol: 'nibble', toBase: v => v * 0.5, fromBase: v => v * 2, system: 'binary', description: '4 bit (1 cifra esadecimale)' }
    ],
    benchmarks: [
      { label: 'Perché un Hard Disk da 1 TB segna 931 GB?', unitId: 'TB', value: 1, fact: '1 TB = 1.000.000.000.000 Byte = 931,32 GiB effettivi in Windows!' },
      { label: 'Capacità standard CD Audio', unitId: 'MB', value: 700, fact: '700 MB = ~80 minuti di musica non compressa' },
      { label: 'Capacità standard DVD Singolo Strato', unitId: 'GB', value: 4.7, fact: '4,7 GB = ~4,38 GiB' }
    ]
  },

  // 12. VELOCITÀ RETE & TRASFERIMENTO DATI
  {
    id: 'bandwidth',
    name: 'Velocità Rete & Banda',
    nameEn: 'Data Transfer & Bandwidth',
    icon: 'Wifi',
    baseUnit: 'bps',
    group: 'tech',
    description: 'Megabit al secondo (Mbps), Gigabit (Gbps), Megabyte/s (MB/s download effettivo) e throughput.',
    units: [
      { id: 'Mbps', name: 'Megabit al secondo', nameEn: 'Megabits per Second', symbol: 'Mbps', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'metric', description: 'Velocità nominale contratti internet fibra' },
      { id: 'Gbps', name: 'Gigabit al secondo', nameEn: 'Gigabits per Second', symbol: 'Gbps', toBase: v => v * 1e9, fromBase: v => v / 1e9, system: 'metric', description: 'Fibra ottica FTTH 1 o 2.5 Gbps' },
      { id: 'MB_s', name: 'Megabyte al secondo (Download)', nameEn: 'Megabytes per Second', symbol: 'MB/s', toBase: v => v * 8e6, fromBase: v => v / 8e6, system: 'metric', description: 'Velocità reale download file (1 MB/s = 8 Mbps)' },
      { id: 'KB_s', name: 'Kilobyte al secondo', nameEn: 'Kilobytes per Second', symbol: 'KB/s', toBase: v => v * 8000, fromBase: v => v / 8000, system: 'metric' },
      { id: 'GB_s', name: 'Gigabyte al secondo', nameEn: 'Gigabytes per Second', symbol: 'GB/s', toBase: v => v * 8e9, fromBase: v => v / 8e9, system: 'metric', description: 'NVMe SSD e bus PCIe veloci' },
      { id: 'Kbps', name: 'Kilobit al secondo', nameEn: 'Kilobits per Second', symbol: 'Kbps', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'metric', description: 'Vecchi modem 56k e streaming audio base' },
      { id: 'bps', name: 'Bit al secondo', nameEn: 'Bits per Second', symbol: 'bps', toBase: v => v, fromBase: v => v, system: 'si' },
      { id: 'Tbps', name: 'Terabit al secondo', nameEn: 'Terabits per Second', symbol: 'Tbps', toBase: v => v * 1e12, fromBase: v => v / 1e12, system: 'metric', description: 'Cavi sottomarini transoceanici' }
    ],
    benchmarks: [
      { label: 'Fibra Gigabit 1000 Mbps', unitId: 'Mbps', value: 1000, fact: '1000 Mbps corrisponde a una velocità di scaricamento di 125 MB/s!' },
      { label: 'Streaming Video Netflix 4K HDR', unitId: 'Mbps', value: 25, fact: 'Banda minima consigliata: 25 Mbps (~3,125 MB/s)' }
    ]
  },

  // 13. ANGOLO & GONIOMETRIA
  {
    id: 'angle',
    name: 'Angolo & Rotazione',
    nameEn: 'Angle & Rotation',
    icon: 'Compass',
    baseUnit: 'rad',
    group: 'science',
    description: 'Gradi sessagesimali (°), radianti, gradienti (gon), minuti d\'arco e giri completi.',
    units: [
      { id: 'deg', name: 'Grado sessagesimale', nameEn: 'Degree', symbol: '°', toBase: v => (v * Math.PI) / 180, fromBase: v => (v * 180) / Math.PI, system: 'other', description: '360° in un cerchio completo' },
      { id: 'rad', name: 'Radiante', nameEn: 'Radian', symbol: 'rad', toBase: v => v, fromBase: v => v, system: 'si', description: '2π radianti = 360° (unità base SI)' },
      { id: 'grad', name: 'Gradiente / Grado centesimale (Gon)', nameEn: 'Gradian / Gon', symbol: 'grad', toBase: v => (v * Math.PI) / 200, fromBase: v => (v * 200) / Math.PI, system: 'other', description: '400 grad in un cerchio (100 grad = angolo retto)' },
      { id: 'rev', name: 'Giro / Rivoluzione completa', nameEn: 'Revolution / Turn', symbol: 'rev', toBase: v => v * 2 * Math.PI, fromBase: v => v / (2 * Math.PI), system: 'other', description: '1 giro = 360° = 2π rad' },
      { id: 'arcmin', name: 'Minuto d\'arco (MOA)', nameEn: 'Minute of Arc (MOA)', symbol: 'arcmin', toBase: v => (v * Math.PI) / (180 * 60), fromBase: v => (v * 180 * 60) / Math.PI, system: 'other', description: '1/60 di grado (usato in ottica e balistica)' },
      { id: 'arcsec', name: 'Secondo d\'arco', nameEn: 'Second of Arc', symbol: 'arcsec', toBase: v => (v * Math.PI) / (180 * 3600), fromBase: v => (v * 180 * 3600) / Math.PI, system: 'other', description: '1/3600 di grado (usato in astronomia)' },
      { id: 'mrad', name: 'Milliradiante', nameEn: 'Milliradian', symbol: 'mrad', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'si', description: '1 metro a 1 km di distanza' }
    ],
    benchmarks: [
      { label: 'Angolo Retto', unitId: 'deg', value: 90, fact: '90° = π/2 radianti (~1,5708 rad) = 100 gon' },
      { label: 'Angolo Piatto', unitId: 'deg', value: 180, fact: '180° = π radianti (~3,14159 rad) = 200 gon' }
    ]
  },

  // 14. CONSUMO CARBURANTE
  {
    id: 'fuel',
    name: 'Consumo Carburante',
    nameEn: 'Fuel Consumption',
    icon: 'Fuel',
    baseUnit: 'l_100km',
    group: 'practical',
    description: 'Litri per 100 km (standard europeo), km al litro, miglia per gallone USA (MPG) e UK.',
    units: [
      { id: 'l_100km', name: 'Litri per 100 km', nameEn: 'Liters per 100 km', symbol: 'L/100km', toBase: v => v, fromBase: v => v, system: 'metric', description: 'Standard ufficiale europeo di consumo' },
      { id: 'km_l', name: 'Chilometri per litro', nameEn: 'Kilometers per Liter', symbol: 'km/L', toBase: v => (v > 0 ? 100 / v : 0), fromBase: v => (v > 0 ? 100 / v : 0), system: 'metric', description: 'Quanti km percorri con 1 litro di carburante' },
      { id: 'mpg_us', name: 'Miglia per Gallone USA (MPG)', nameEn: 'Miles per Gallon (US)', symbol: 'mpg (US)', toBase: v => (v > 0 ? 235.214583 / v : 0), fromBase: v => (v > 0 ? 235.214583 / v : 0), system: 'us', description: 'Standard automobili USA' },
      { id: 'mpg_uk', name: 'Miglia per Gallone Imperiale UK', nameEn: 'Miles per Gallon (UK)', symbol: 'mpg (UK)', toBase: v => (v > 0 ? 282.481 / v : 0), fromBase: v => (v > 0 ? 282.481 / v : 0), system: 'imperial', description: 'Standard automobili Regno Unito' },
      { id: 'gal_100mi', name: 'Galloni USA per 100 miglia', nameEn: 'Gallons per 100 Miles', symbol: 'gal/100mi', toBase: v => v * 2.35214583, fromBase: v => v / 2.35214583, system: 'us' }
    ],
    benchmarks: [
      { label: 'Auto Economica (20 km/L)', unitId: 'km_l', value: 20, fact: '20 km/L = 5,0 L/100km = 47,04 MPG USA = 56,49 MPG UK' },
      { label: 'Auto da 6 Litri per 100 km', unitId: 'l_100km', value: 6, fact: '6,0 L/100km = 16,67 km/L = 39,2 MPG USA' }
    ]
  },

  // 15. FORZA
  {
    id: 'force',
    name: 'Forza',
    nameEn: 'Force',
    icon: 'Activity',
    baseUnit: 'N',
    group: 'science',
    description: 'Newton, kilonewton, chilogrammo-forza (kgf/kp), libbra-forza (lbf) e dyne.',
    units: [
      { id: 'N', name: 'Newton', nameEn: 'Newton', symbol: 'N', toBase: v => v, fromBase: v => v, system: 'si', description: '1 kg·m/s² (unità base SI)' },
      { id: 'kN', name: 'Kilonewton', nameEn: 'Kilonewton', symbol: 'kN', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'si', description: '1.000 Newton (usato in ingegneria e arrampicata)' },
      { id: 'kgf', name: 'Chilogrammo-forza (Kilopond, kp)', nameEn: 'Kilogram-force', symbol: 'kgf', toBase: v => v * 9.80665, fromBase: v => v / 9.80665, system: 'metric', description: 'Peso di 1 kg alla gravità terrestre standard = 9,80665 N' },
      { id: 'lbf', name: 'Libbra-forza (Pound-force)', nameEn: 'Pound-force', symbol: 'lbf', toBase: v => v * 4.448221615, fromBase: v => v / 4.448221615, system: 'imperial', description: '4,448 Newton' },
      { id: 'dyn', name: 'Dyne', nameEn: 'Dyne', symbol: 'dyn', toBase: v => v * 1e-5, fromBase: v => v * 1e5, system: 'science', description: '10⁻⁵ N' },
      { id: 'MN', name: 'Meganewton', nameEn: 'Meganewton', symbol: 'MN', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'si', description: '1 milione di Newton (spinta razzi spaziali)' },
      { id: 'kip', name: 'Kip (Kilo-pound)', nameEn: 'Kip', symbol: 'kip', toBase: v => v * 4448.221615, fromBase: v => v / 4448.221615, system: 'us', description: '1.000 lbf = 4,448 kN' },
      { id: 'pdl', name: 'Poundal', nameEn: 'Poundal', symbol: 'pdl', toBase: v => v * 0.138254954, fromBase: v => v / 0.138254954, system: 'imperial' }
    ],
    benchmarks: [
      { label: 'Moschettone da arrampicata (Resistenza)', unitId: 'kN', value: 24, fact: '24 kN = circa 2.447 kgf di tenuta prima della rottura' },
      { label: 'Spinta al decollo Razzo Saturn V Apollo', unitId: 'MN', value: 34.5, fact: '34,5 Meganewton di spinta' }
    ]
  },

  // 16. FREQUENZA
  {
    id: 'frequency',
    name: 'Frequenza & Giri',
    nameEn: 'Frequency',
    icon: 'Radio',
    baseUnit: 'Hz',
    group: 'tech',
    description: 'Hertz, kilohertz, megahertz, gigahertz, giri al minuto (RPM) e battiti al minuto (BPM).',
    units: [
      { id: 'Hz', name: 'Hertz', nameEn: 'Hertz', symbol: 'Hz', toBase: v => v, fromBase: v => v, system: 'si', description: '1 ciclo al secondo' },
      { id: 'kHz', name: 'Kilohertz', nameEn: 'Kilohertz', symbol: 'kHz', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'si', description: '1.000 Hz (frequenze audio campionate)' },
      { id: 'MHz', name: 'Megahertz', nameEn: 'Megahertz', symbol: 'MHz', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'si', description: '1 milione di Hz (radio FM)' },
      { id: 'GHz', name: 'Gigahertz', nameEn: 'Gigahertz', symbol: 'GHz', toBase: v => v * 1e9, fromBase: v => v / 1e9, system: 'si', description: '1 miliardo di Hz (clock processori CPU e Wi-Fi)' },
      { id: 'rpm', name: 'Giri al minuto (RPM)', nameEn: 'Revolutions per Minute', symbol: 'RPM', toBase: v => v / 60, fromBase: v => v * 60, system: 'other', description: 'Giri motore auto e centrifughe' },
      { id: 'bpm', name: 'Battiti al minuto (BPM)', nameEn: 'Beats per Minute', symbol: 'BPM', toBase: v => v / 60, fromBase: v => v * 60, system: 'other', description: 'Frequenza cardiaca e tempo musicale' },
      { id: 'THz', name: 'Terahertz', nameEn: 'Terahertz', symbol: 'THz', toBase: v => v * 1e12, fromBase: v => v / 1e12, system: 'si' }
    ],
    benchmarks: [
      { label: 'Nota musicale LA fondamentale (A4)', unitId: 'Hz', value: 440, fact: '440 Hz = diapason standard internazionale' },
      { label: 'Wi-Fi Moderno a 5 GHz', unitId: 'GHz', value: 5, fact: '5 GHz = 5.000.000.000 cicli al secondo' }
    ]
  },

  // 17. FLUSSO VOLUMETRICO & PORTATA
  {
    id: 'flow',
    name: 'Portata & Flusso Volumetrico',
    nameEn: 'Volumetric Flow Rate',
    icon: 'Waves',
    baseUnit: 'm3_s',
    group: 'practical',
    description: 'Litri al minuto, metri cubi/ora, galloni al minuto (GPM), CFM per ventilazione e bpd.',
    units: [
      { id: 'L_min', name: 'Litri al minuto', nameEn: 'Liters per Minute', symbol: 'L/min', toBase: v => (v * 0.001) / 60, fromBase: v => (v * 1000) * 60, system: 'metric', description: 'Portata rubinetti ed elettrodomestici' },
      { id: 'm3_h', name: 'Metri cubi all\'ora', nameEn: 'Cubic Meters per Hour', symbol: 'm³/h', toBase: v => v / 3600, fromBase: v => v * 3600, system: 'metric', description: 'Portata condutture idrauliche' },
      { id: 'L_s', name: 'Litri al secondo', nameEn: 'Liters per Second', symbol: 'L/s', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'metric' },
      { id: 'm3_s', name: 'Metri cubi al secondo', nameEn: 'Cubic Meters per Second', symbol: 'm³/s', toBase: v => v, fromBase: v => v, system: 'si', description: 'Unità base SI (fiumi e dighe)' },
      { id: 'gpm_us', name: 'Galloni USA al minuto (GPM)', nameEn: 'US Gallons per Minute', symbol: 'GPM', toBase: v => (v * 0.003785411784) / 60, fromBase: v => (v * 60) / 0.003785411784, system: 'us' },
      { id: 'cfm', name: 'Piedi cubi al minuto (CFM)', nameEn: 'Cubic Feet per Minute', symbol: 'CFM', toBase: v => (v * 0.028316846592) / 60, fromBase: v => (v * 60) / 0.028316846592, system: 'imperial', description: 'Flusso aria ventole PC e HVAC' },
      { id: 'bpd', name: 'Barili al giorno (Oil BPD)', nameEn: 'Barrels per Day', symbol: 'bpd', toBase: v => (v * 0.158987294928) / 86400, fromBase: v => (v * 86400) / 0.158987294928, system: 'other', description: 'Produzione pozzi petroliferi' }
    ],
    benchmarks: [
      { label: 'Doccia da Bagno Standard', unitId: 'L_min', value: 12, fact: 'Circa 10-14 litri al minuto' },
      { label: 'Cascate del Niagara (Portata media)', unitId: 'm3_s', value: 2400, fact: 'Circa 2.400 m³/s di acqua che precipitano' }
    ]
  },

  // 18. DENSITÀ
  {
    id: 'density',
    name: 'Densità',
    nameEn: 'Density',
    icon: 'Box',
    baseUnit: 'kg_m3',
    group: 'science',
    description: 'Chilogrammi al metro cubo, grammi per cm³ (o mL), libbre per piede cubo.',
    units: [
      { id: 'kg_m3', name: 'Chilogrammo al metro cubo', nameEn: 'kg per Cubic Meter', symbol: 'kg/m³', toBase: v => v, fromBase: v => v, system: 'si', description: 'Unità base SI' },
      { id: 'g_cm3', name: 'Grammo al cm³ (g/mL)', nameEn: 'Gram per cm³', symbol: 'g/cm³', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'metric', description: 'Acqua = esattamente 1 g/cm³ a 4°C' },
      { id: 'kg_L', name: 'Chilogrammo al litro', nameEn: 'kg per Liter', symbol: 'kg/L', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'metric', description: 'Equivalente a g/cm³' },
      { id: 'lb_cuft', name: 'Libbre per piede cubo', nameEn: 'Pounds per Cubic Foot', symbol: 'lb/cu ft', toBase: v => v * 16.018463, fromBase: v => v / 16.018463, system: 'imperial', description: 'Acqua = ~62,4 lb/cu ft' },
      { id: 'lb_cuin', name: 'Libbre per pollice cubo', nameEn: 'Pounds per Cubic Inch', symbol: 'lb/cu in', toBase: v => v * 27679.904, fromBase: v => v / 27679.904, system: 'imperial' }
    ],
    benchmarks: [
      { label: 'Densità dell\'Acqua Pura a 4°C', unitId: 'g_cm3', value: 1, fact: '1 g/cm³ = 1.000 kg/m³ = 1 kg/L' },
      { label: 'Densità dell\'Oro Puro (24k)', unitId: 'g_cm3', value: 19.32, fact: 'L\'oro è 19,3 volte più denso dell\'acqua' }
    ]
  },

  // 19. COPPIA & MOMENTO TORCENTE
  {
    id: 'torque',
    name: 'Coppia & Momento Torcente',
    nameEn: 'Torque',
    icon: 'Repeat',
    baseUnit: 'Nm',
    group: 'practical',
    description: 'Newton-metro (N·m), libbra-piede (lb-ft auto USA), chilogrammo-forza metro.',
    units: [
      { id: 'Nm', name: 'Newton-metro', nameEn: 'Newton-meter', symbol: 'N·m', toBase: v => v, fromBase: v => v, system: 'si', description: 'Unità base SI (coppia motori auto)' },
      { id: 'lb_ft', name: 'Libbra-piede (Pound-foot)', nameEn: 'Pound-foot', symbol: 'lbf·ft', toBase: v => v * 1.355817948, fromBase: v => v / 1.355817948, system: 'imperial', description: 'Standard coppia veicoli USA (1 lbf·ft = 1,356 N·m)' },
      { id: 'lb_in', name: 'Libbra-pollice', nameEn: 'Pound-inch', symbol: 'lbf·in', toBase: v => v * 0.112984829, fromBase: v => v / 0.112984829, system: 'imperial' },
      { id: 'kgf_m', name: 'Chilogrammo-forza metro', nameEn: 'kgf-meter', symbol: 'kgf·m', toBase: v => v * 9.80665, fromBase: v => v / 9.80665, system: 'metric', description: '9,807 N·m' },
      { id: 'kNm', name: 'Kilonewton-metro', nameEn: 'Kilonewton-meter', symbol: 'kN·m', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'si' }
    ],
    benchmarks: [
      { label: 'Serraggio Bulloni Ruote Auto', unitId: 'Nm', value: 120, fact: 'La coppia standard di serraggio è 110-130 N·m (~88 lb-ft)' },
      { label: 'Auto Sportiva Moderna (Coppia Motore)', unitId: 'Nm', value: 450, fact: '450 N·m = 331,9 lbf·ft' }
    ]
  },

  // 20. TIPOGRAFIA & DISPLAY
  {
    id: 'typography',
    name: 'Tipografia & Schermi (CSS)',
    nameEn: 'Typography & Screens',
    icon: 'Type',
    baseUnit: 'mm',
    group: 'tech',
    description: 'Punti PostScript (pt), pica (pc), pixel CSS (96 DPI), millimetri, pollici e rem/em.',
    units: [
      { id: 'pt', name: 'Punto PostScript / DTP', nameEn: 'Point (pt)', symbol: 'pt', toBase: v => v * (25.4 / 72), fromBase: v => v / (25.4 / 72), system: 'other', description: '1/72 di pollice = 0,3528 mm' },
      { id: 'px', name: 'Pixel CSS (a 96 DPI)', nameEn: 'Pixel (CSS px)', symbol: 'px', toBase: v => v * (25.4 / 96), fromBase: v => v / (25.4 / 96), system: 'other', description: '1/96 di pollice = 0,2646 mm' },
      { id: 'pc', name: 'Pica (12 pt)', nameEn: 'Pica (pc)', symbol: 'pc', toBase: v => v * (25.4 / 6), fromBase: v => v / (25.4 / 6), system: 'other', description: '12 punti = 4,233 mm' },
      { id: 'rem', name: 'Rem / Em Web (a 16px)', nameEn: 'Rem / Em (16px base)', symbol: 'rem', toBase: v => v * 16 * (25.4 / 96), fromBase: v => v / (16 * (25.4 / 96)), system: 'other', description: '1 rem = 16 px = 12 pt' },
      { id: 'mm', name: 'Millimetro', nameEn: 'Millimeter', symbol: 'mm', toBase: v => v, fromBase: v => v, system: 'metric' },
      { id: 'in', name: 'Pollice fisico (Inch)', nameEn: 'Inch', symbol: 'in', toBase: v => v * 25.4, fromBase: v => v / 25.4, system: 'imperial', description: '72 pt = 96 px = 25,4 mm' },
      { id: 'twip', name: 'Twip (1/20 pt)', nameEn: 'Twip', symbol: 'twip', toBase: v => v * (25.4 / 1440), fromBase: v => v / (25.4 / 1440), system: 'other', description: '1/1440 di pollice' }
    ],
    benchmarks: [
      { label: 'Dimensione Testo Web Standard (16px)', unitId: 'px', value: 16, fact: '16 px = 1 rem = 12 pt = 4,23 mm' },
      { label: 'Foglio Carta A4 (Larghezza)', unitId: 'mm', value: 210, fact: '210 × 297 mm = 595 × 842 pt = 8,27 × 11,69 pollici' }
    ]
  },

  // 21. RADIAZIONI & DOSIMETRIA
  {
    id: 'radiation',
    name: 'Radiazioni & Dosimetria',
    nameEn: 'Radiation & Radioactivity',
    icon: 'Radio',
    baseUnit: 'Sv',
    group: 'science',
    description: 'Sievert (Sv), millisievert (mSv), Gray (Gy), Becquerel (Bq), Curie (Ci), Roentgen e Rem.',
    units: [
      { id: 'mSv', name: 'Millisievert (Dose equivalente)', nameEn: 'Millisievert', symbol: 'mSv', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'si', description: 'Misura del danno biologico da radiazioni' },
      { id: 'uSv', name: 'Microsievert', nameEn: 'Microsievert', symbol: 'µSv', toBase: v => v * 1e-6, fromBase: v => v * 1e6, system: 'si' },
      { id: 'Sv', name: 'Sievert', nameEn: 'Sievert', symbol: 'Sv', toBase: v => v, fromBase: v => v, system: 'si', description: '1 Joule/kg assorbito pesato biologicamente' },
      { id: 'Gy', name: 'Gray (Dose assorbita)', nameEn: 'Gray', symbol: 'Gy', toBase: v => v, fromBase: v => v, system: 'si', description: '1 J/kg energia fisica assorbita' },
      { id: 'rem', name: 'Rem (Roentgen Equivalent Man)', nameEn: 'Rem', symbol: 'rem', toBase: v => v * 0.01, fromBase: v => v * 100, system: 'other', description: '1 Rem = 10 mSv = 0,01 Sv' },
      { id: 'rad', name: 'Rad (Radiation Absorbed Dose)', nameEn: 'Rad', symbol: 'rad', toBase: v => v * 0.01, fromBase: v => v * 100, system: 'other', description: '1 Rad = 0,01 Gy' },
      { id: 'Bq', name: 'Becquerel (Attività radioattiva)', nameEn: 'Becquerel', symbol: 'Bq', toBase: v => v * 1e-12, fromBase: v => v * 1e12, system: 'si', description: '1 disintegrazione nucleare al secondo' },
      { id: 'Ci', name: 'Curie', nameEn: 'Curie', symbol: 'Ci', toBase: v => v * 3.7e-2, fromBase: v => v / 3.7e-2, system: 'other', description: '3,7 × 10¹⁰ Becquerel (attività di 1g di Radio-226)' }
    ],
    benchmarks: [
      { label: 'Radiografia Toracica (RX)', unitId: 'mSv', value: 0.1, fact: 'Circa 0,1 mSv di dose assorbita (equivalente a 10 giorni di fondo naturale)' },
      { label: 'Fondo di Radiazione Naturale Annuo Medio', unitId: 'mSv', value: 2.4, fact: '~2,4 mSv/anno a persona sulla Terra' },
      { label: 'Mangiare una Banana (Radiazione Potassio-40)', unitId: 'uSv', value: 0.1, fact: '~0,1 µSv di dose banana' }
    ]
  },

  // 22. ELETTROTECNICA & MAGNETISMO
  {
    id: 'electricity',
    name: 'Elettricità & Magnetismo',
    nameEn: 'Electricity & Circuits',
    icon: 'BatteryCharging',
    baseUnit: 'V',
    group: 'science',
    description: 'Tensione (Volt), Corrente (Ampere, mAh batterie), Resistenza (Ohm) e Capacità.',
    units: [
      { id: 'V', name: 'Volt (Tensione)', nameEn: 'Volt', symbol: 'V', toBase: v => v, fromBase: v => v, system: 'si', description: 'Differenza di potenziale elettrico' },
      { id: 'mV', name: 'Millivolt', nameEn: 'Millivolt', symbol: 'mV', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'si' },
      { id: 'kV', name: 'Kilovolt', nameEn: 'Kilovolt', symbol: 'kV', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'si', description: 'Linee ad alta tensione' },
      { id: 'A', name: 'Ampere (Corrente)', nameEn: 'Ampere', symbol: 'A', toBase: v => v, fromBase: v => v, system: 'si', description: 'Flusso di carica (1 Coulomb al secondo)' },
      { id: 'mA', name: 'Milliampere', nameEn: 'Milliampere', symbol: 'mA', toBase: v => v * 0.001, fromBase: v => v * 1000, system: 'si' },
      { id: 'ohm', name: 'Ohm (Resistenza)', nameEn: 'Ohm', symbol: 'Ω', toBase: v => v, fromBase: v => v, system: 'si', description: 'Resistenza elettrica (V / A)' },
      { id: 'kohm', name: 'Kiloohm', nameEn: 'Kiloohm', symbol: 'kΩ', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'si' },
      { id: 'Mohm', name: 'Megaohm', nameEn: 'Megaohm', symbol: 'MΩ', toBase: v => v * 1e6, fromBase: v => v / 1e6, system: 'si' },
      { id: 'mAh', name: 'Milliampere-ora (Capacità batteria)', nameEn: 'Milliampere-hour', symbol: 'mAh', toBase: v => v * 3.6, fromBase: v => v / 3.6, system: 'other', description: 'Capacità carica smartphone (1 mAh = 3,6 Coulomb)' },
      { id: 'Ah', name: 'Ampere-ora (Batteria Auto)', nameEn: 'Ampere-hour', symbol: 'Ah', toBase: v => v * 3600, fromBase: v => v / 3600, system: 'other', description: '1 Ah = 1.000 mAh' },
      { id: 'tesla', name: 'Tesla (Campo magnetico)', nameEn: 'Tesla', symbol: 'T', toBase: v => v * 10000, fromBase: v => v / 10000, system: 'si', description: '1 Tesla = 10.000 Gauss' },
      { id: 'gauss', name: 'Gauss', nameEn: 'Gauss', symbol: 'G', toBase: v => v, fromBase: v => v, system: 'other', description: 'Campo magnetico terrestre = ~0,5 Gauss' }
    ],
    benchmarks: [
      { label: 'Presa Elettrica Domestica Europa', unitId: 'V', value: 230, fact: '230 V a 50 Hz (contro i 120 V a 60 Hz di USA/Giappone)' },
      { label: 'Pila Stilo AA / AAA Standard', unitId: 'V', value: 1.5, fact: '1,5 V nominale alcalina' },
      { label: 'Risonanza Magnetica Ospedaliera (MRI)', unitId: 'tesla', value: 3, fact: '3 Tesla = 30.000 Gauss di potente campo magnetico' }
    ]
  },

  // 23. CUCINA & RICETTE DEL MONDO
  {
    id: 'cooking',
    name: 'Cucina & Ricette del Mondo',
    nameEn: 'Cooking & Culinary',
    icon: 'Coffee',
    baseUnit: 'mL',
    group: 'practical',
    description: 'Cucchiai, cucchiaini, tazze (cups), tazzine da caffè, bicchieri, once fluide e pizzichi per ricette.',
    units: [
      { id: 'tbsp', name: 'Cucchiaio da tavola (Tbsp)', nameEn: 'Tablespoon', symbol: 'cucchiaio / tbsp', toBase: v => v * 15, fromBase: v => v / 15, system: 'culinary', description: '15 mL = 3 cucchiaini' },
      { id: 'tsp', name: 'Cucchiaino da tè/caffè (Tsp)', nameEn: 'Teaspoon', symbol: 'cucchiaino / tsp', toBase: v => v * 5, fromBase: v => v / 5, system: 'culinary', description: '5 mL' },
      { id: 'cup_metric', name: 'Tazza metrica standard (Cup)', nameEn: 'Metric Cup', symbol: 'tazza / cup', toBase: v => v * 250, fromBase: v => v / 250, system: 'culinary', description: '250 mL' },
      { id: 'cup_us', name: 'Tazza USA (US Recipe Cup)', nameEn: 'US Cup', symbol: 'US cup', toBase: v => v * 236.588, fromBase: v => v / 236.588, system: 'us', description: 'Circa 236,6 mL' },
      { id: 'glass', name: 'Bicchiere da tavola comune', nameEn: 'Table Glass', symbol: 'bicchiere', toBase: v => v * 200, fromBase: v => v / 200, system: 'culinary', description: 'Circa 200 mL d\'acqua' },
      { id: 'espresso', name: 'Tazzina da caffè espresso', nameEn: 'Espresso Cup', symbol: 'tazzina', toBase: v => v * 50, fromBase: v => v / 50, system: 'culinary', description: 'Circa 50 mL' },
      { id: 'fl_oz', name: 'Oncia fluida (Fluid Ounce)', nameEn: 'Fluid Ounce', symbol: 'fl oz', toBase: v => v * 29.5735, fromBase: v => v / 29.5735, system: 'us', description: '~30 mL' },
      { id: 'pinch', name: 'Pizzico (Pinch)', nameEn: 'Pinch', symbol: 'pizzico', toBase: v => v * 0.35, fromBase: v => v / 0.35, system: 'culinary', description: 'Punta di 2 dita (~0,35 mL / ~0,4 g sale)' },
      { id: 'drop', name: 'Goccia (Drop)', nameEn: 'Drop', symbol: 'goccia', toBase: v => v * 0.05, fromBase: v => v / 0.05, system: 'culinary', description: 'Circa 0,05 mL (20 gocce = 1 mL)' },
      { id: 'mL', name: 'Millilitro', nameEn: 'Milliliter', symbol: 'mL', toBase: v => v, fromBase: v => v, system: 'metric' },
      { id: 'L', name: 'Litro', nameEn: 'Liter', symbol: 'L', toBase: v => v * 1000, fromBase: v => v / 1000, system: 'metric', description: '1.000 mL' }
    ],
    benchmarks: [
      { label: 'Un cucchiaio d\'olio extravergine', unitId: 'tbsp', value: 1, fact: '1 cucchiaio = 15 mL = ~13,7 g di olio = ~120 kcal' },
      { label: 'Un bicchiere d\'acqua pieno', unitId: 'glass', value: 1, fact: '1 bicchiere medio = 200 mL = 200 g di acqua' },
      { label: '1 Tazza di farina per dolci', unitId: 'cup_metric', value: 1, fact: '1 Cup da 250 mL di farina 00 pesa circa 140-150 grammi' }
    ]
  }
];

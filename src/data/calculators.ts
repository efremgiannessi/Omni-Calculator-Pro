import { CalculatorMeta } from '../types';

export const CALCULATORS_LIST: CalculatorMeta[] = [
  // Everyday Category
  {
    id: 'simple',
    titleKey: 'calc_simple_title',
    descriptionKey: 'calc_simple_desc',
    category: 'everyday',
    icon: 'Percent',
    badge: 'Base',
    keywords: ['percentuale', 'percent', 'base', 'proporzione', 'calcolo percentuale', 'frazione', '%', 'tasso', 'quota', 'valore']
  },
  {
    id: 'increase-decrease',
    titleKey: 'calc_incdec_title',
    descriptionKey: 'calc_incdec_desc',
    category: 'everyday',
    icon: 'TrendingUp',
    keywords: ['aumento', 'diminuzione', 'variazione', 'variazione percentuale', 'incremento', 'decremento', 'differenza', 'crescita', 'calo', 'delta']
  },
  {
    id: 'discount',
    titleKey: 'calc_discount_title',
    descriptionKey: 'calc_discount_desc',
    category: 'everyday',
    icon: 'Tag',
    keywords: ['sconto', 'saldi', 'saldo', 'promozione', 'ribasso', 'risparmio', 'prezzo scontato', 'black friday', 'offerta', 'prezzo finale', 'liquidazione']
  },
  {
    id: 'price-comparator',
    titleKey: 'calc_comparator_title',
    descriptionKey: 'calc_comparator_desc',
    category: 'everyday',
    icon: 'Scale',
    badge: 'Pro',
    keywords: ['confronto prezzi', 'prezzo al chilo', 'prezzo al litro', 'convenienza', 'supermercato', 'formato', 'grammi', 'chilogrammi', 'quantita', 'spesa', 'confronto']
  },
  {
    id: 'tip',
    titleKey: 'calc_tip_title',
    descriptionKey: 'calc_tip_desc',
    category: 'everyday',
    icon: 'Receipt',
    keywords: ['mancia', 'ristorante', 'coperto', 'conto', 'dividi conto', 'split bill', 'cameriere', 'cena', 'pranzo', 'bar']
  },
  {
    id: 'fractions',
    titleKey: 'calc_fractions_title',
    descriptionKey: 'calc_fractions_desc',
    category: 'everyday',
    icon: 'Divide',
    keywords: ['frazioni', 'frazione', 'semplificazione', 'mcd', 'mcm', 'numeratore', 'denominatore', 'somma frazioni', 'riduzione', 'frazione impropria']
  },
  {
    id: 'percentage-points',
    titleKey: 'calc_pp_title',
    descriptionKey: 'calc_pp_desc',
    category: 'everyday',
    icon: 'Percent',
    badge: 'pp vs %',
    keywords: ['punti percentuali', 'differenza punti', 'pp', 'spread', 'tassi', 'inflazione', 'punti base', 'bps']
  },
  {
    id: 'percent-of-percent',
    titleKey: 'calc_percent_of_percent_title',
    descriptionKey: 'calc_percent_of_percent_desc',
    category: 'everyday',
    icon: 'Layers',
    badge: 'Multi %',
    keywords: ['percentuale di percentuale', 'sconti a cascata', 'percentuali concatenate', 'multipla', 'doppio sconto', 'catena']
  },
  {
    id: 'batch-percentage',
    titleKey: 'calc_batch_title',
    descriptionKey: 'calc_batch_desc',
    category: 'everyday',
    icon: 'Grid',
    badge: 'Batch',
    keywords: ['percentuale in serie', 'tabella lotti', 'batch', 'matrice', 'calcolo multiplo', 'serie dati']
  },

  // Business Category
  {
    id: 'markup',
    titleKey: 'calc_markup_title',
    descriptionKey: 'calc_markup_desc',
    category: 'business',
    icon: 'Layers',
    keywords: ['markup', 'ricarico', 'costo di produzione', 'prezzo di vendita', 'costo', 'prezzo vendita']
  },
  {
    id: 'margin',
    titleKey: 'calc_margin_title',
    descriptionKey: 'calc_margin_desc',
    category: 'business',
    icon: 'PieChart',
    keywords: ['margine', 'margine commerciale', 'margine lordo', 'profitto', 'profit margin', 'redditivita']
  },
  {
    id: 'break-even',
    titleKey: 'calc_breakeven_title',
    descriptionKey: 'calc_breakeven_desc',
    category: 'business',
    icon: 'Target',
    badge: 'BEP',
    keywords: ['break even', 'punto di pareggio', 'bep', 'costi fissi', 'costi variabili', 'prezzo unitario', 'quantita di pareggio', 'pareggio di bilancio']
  },
  {
    id: 'salary-increase',
    titleKey: 'calc_salary_title',
    descriptionKey: 'calc_salary_desc',
    category: 'business',
    icon: 'Wallet',
    badge: 'RAL',
    keywords: ['stipendio', 'aumento stipendio', 'ral', 'retribuzione', 'busta paga', 'netto', 'lordo', 'mensile', 'annuale', 'scatto', 'negoziazione']
  },
  {
    id: 'vat',
    titleKey: 'calc_vat_title',
    descriptionKey: 'calc_vat_desc',
    category: 'business',
    icon: 'FileSpreadsheet',
    keywords: ['iva', 'scorporo iva', 'tasse', 'aliquota', 'imposta sul valore aggiunto', 'lordo netto', 'fattura', '22%', '10%', '4%', 'tax']
  },
  {
    id: 'trader',
    titleKey: 'calc_trader_title',
    descriptionKey: 'calc_trader_desc',
    category: 'business',
    icon: 'Briefcase',
    keywords: ['trader', 'trading', 'stop loss', 'take profit', 'risk reward', 'posizione', 'leva', 'borsa', 'azioni', 'crypto']
  },
  {
    id: 'compound-interest',
    titleKey: 'calc_compound_title',
    descriptionKey: 'calc_compound_desc',
    category: 'business',
    icon: 'LineChart',
    keywords: ['interesse composto', 'interessi', 'pac', 'piano di accumulo', 'investimento', 'capitale', 'rendimento', 'futuro', 'montante', 'rendita']
  },
  {
    id: 'cagr',
    titleKey: 'calc_cagr_title',
    descriptionKey: 'calc_cagr_desc',
    category: 'business',
    icon: 'Compass',
    keywords: ['cagr', 'tasso annuo di crescita', 'crescita annua composta', 'rendimento annualizzato', 'investimenti', 'ritorno']
  },
  {
    id: 'inflation',
    titleKey: 'calc_inflation_title',
    descriptionKey: 'calc_inflation_desc',
    category: 'business',
    icon: 'Gauge',
    keywords: ['inflazione', 'potere di acquisto', 'rivalutazione', 'istat', 'paniere', 'costo vita', 'svalutazione']
  },
  {
    id: 'doubling-time',
    titleKey: 'calc_doubling_title',
    descriptionKey: 'calc_doubling_desc',
    category: 'business',
    icon: 'Zap',
    keywords: ['tempo di raddoppio', 'regola del 72', 'raddoppio capitale', 'anni per raddoppiare', 'crescita esponenziale']
  },
  {
    id: 'loan',
    titleKey: 'calc_loan_title',
    descriptionKey: 'calc_loan_desc',
    category: 'business',
    icon: 'Landmark',
    keywords: ['prestito', 'mutuo', 'finanziamento', 'rata prestito', 'tan', 'taeg', 'capitale finanziato', 'banca', 'cessione del quinto']
  },
  {
    id: 'amortization-schedule',
    titleKey: 'calc_amortization_title',
    descriptionKey: 'calc_amortization_desc',
    category: 'business',
    icon: 'Table',
    badge: 'Pro',
    keywords: ['piano di ammortamento', 'ammortamento mutuo', 'rata mensile', 'francese', 'quota capitale', 'quota interessi', 'debito residuo']
  },

  // Science & Scientific Calculator Category
  {
    id: 'scientific',
    titleKey: 'calc_scientific_title',
    descriptionKey: 'calc_scientific_desc',
    category: 'science',
    icon: 'Calculator',
    badge: 'Mondo 🔬',
    keywords: ['calcolatrice scientifica', 'scientifico', 'trigonometria', 'seno', 'coseno', 'tangente', 'sin', 'cos', 'tan', 'radice', 'sqrt', 'logaritmo', 'log', 'ln', 'potenza', 'costanti fisiche', 'pi greco']
  },
  {
    id: 'equations',
    titleKey: 'calc_equations_title',
    descriptionKey: 'calc_equations_desc',
    category: 'science',
    icon: 'Spline',
    badge: 'Algebra 📐',
    keywords: ['equazioni', 'algebra', 'secondo grado', 'formula risolutiva', 'delta', 'bisezione', 'newton', 'polinomi', 'radici', 'equazione']
  },
  {
    id: 'statistics',
    titleKey: 'calc_statistics_title',
    descriptionKey: 'calc_statistics_desc',
    category: 'science',
    icon: 'Activity',
    badge: 'Gauss 📊',
    keywords: ['statistica', 'media', 'mediana', 'moda', 'deviazione standard', 'varianza', 'gauss', 'curva normale', 'distribuzione', 'intervallo']
  },

  // Quantum Computing & Physics Category
  {
    id: 'quantum-lab',
    titleKey: 'calc_quantum_lab_title',
    descriptionKey: 'calc_quantum_lab_desc',
    category: 'quantum',
    icon: 'Atom',
    badge: 'Qubit ⚛️',
    keywords: ['quantum', 'qubit', 'sfera di bloch', 'sovrapposizione', 'entanglement', 'porte logiche quantistiche', 'hadamard', 'pauli', 'fase', 'computazione quantistica']
  },
  {
    id: 'quantum-physics',
    titleKey: 'calc_quantum_physics_title',
    descriptionKey: 'calc_quantum_physics_desc',
    category: 'quantum',
    icon: 'Orbit',
    badge: 'Planck ℏ',
    keywords: ['fisica quantistica', 'lunghezza d onda', 'de broglie', 'planck', 'effetto fotoelettrico', 'compton', 'fotone', 'frequenza', 'energia elettrone']
  },

  // Interplanetary Astronomy & Celestial Mechanics Category
  {
    id: 'hohmann-transfer',
    titleKey: 'calc_hohmann_transfer_title',
    descriptionKey: 'calc_hohmann_transfer_desc',
    category: 'astronomy',
    icon: 'Rocket',
    badge: 'Missioni 🚀',
    keywords: ['trasferimento di hohmann', 'orbite', 'marte', 'veicolo spaziale', 'delta-v', 'missione spaziale', 'razzo', 'orbita di trasferimento', 'terra marte']
  },
  {
    id: 'astrophysics-orbital',
    titleKey: 'calc_astrophysics_orbital_title',
    descriptionKey: 'calc_astrophysics_orbital_desc',
    category: 'astronomy',
    icon: 'Telescope',
    badge: 'Keplero 🪐',
    keywords: ['astrofisica', 'orbita', 'periodo orbitale', 'terza legge di keplero', 'velocita di fuga', 'gravitazione universale', 'massa pianeta', 'satelliti']
  },
  {
    id: 'einstein-rosen',
    titleKey: 'calc_einstein_rosen_title',
    descriptionKey: 'calc_einstein_rosen_desc',
    category: 'astronomy',
    icon: 'Infinity',
    badge: 'Wormhole 🌌',
    keywords: ['wormhole', 'ponte di einstein rosen', 'relativita generale', 'spaziotempo', 'materia esotica', 'curvatura', 'raggio di schwarzschild', 'buco nero']
  },

  // Chemistry & Stoichiometry Category
  {
    id: 'chemistry-lab',
    titleKey: 'calc_chemistry_lab_title',
    descriptionKey: 'calc_chemistry_lab_desc',
    category: 'chemistry',
    icon: 'FlaskConical',
    badge: 'Tavola 118 🧪',
    keywords: ['chimica', 'tavola periodica', 'massa molare', 'moli', 'stechiometria', 'ph', 'acido', 'base', 'soluzioni', 'molarita', 'bilanciamento reazioni', 'elementi']
  },

  // Linear Algebra & Matrix Studio Category
  {
    id: 'matrix-lab',
    titleKey: 'calc_matrix_lab_title',
    descriptionKey: 'calc_matrix_lab_desc',
    category: 'matrices',
    icon: 'Table2',
    badge: 'Matrici 📐',
    keywords: ['matrici', 'algebra lineare', 'determinante', 'matrice inversa', 'trasposta', 'autovalori', 'prodotto tra matrici', 'rango', 'moltiplicazione matriciale']
  },

  // Electronics & Electrical Engineering Category
  {
    id: 'electronics-lab',
    titleKey: 'calc_electronics_lab_title',
    descriptionKey: 'calc_electronics_lab_desc',
    category: 'electronics',
    icon: 'Cpu',
    badge: 'Ohm & RLC ⚡',
    keywords: ['elettronica', 'legge di ohm', 'volt', 'ampere', 'watt', 'resistenza', 'resistor', 'codice colori', 'serie', 'parallelo', 'condensatore', 'filtro rc', 'led']
  },

  // FIRE & PAC Wealth Growth Category
  {
    id: 'fire-finance',
    titleKey: 'calc_fire_finance_title',
    descriptionKey: 'calc_fire_finance_desc',
    category: 'finance-fire',
    icon: 'Flame',
    badge: 'FIRE 4% 💰',
    keywords: ['fire', 'pensione anticipata', 'indipendenza finanziaria', 'regola del 4%', 'swr', 'patrimonio', 'risparmio', 'vivere di rendita']
  },

  // Fitness, Nutrition & Health Biomath Category
  {
    id: 'fitness-biomath',
    titleKey: 'calc_fitness_biomath_title',
    descriptionKey: 'calc_fitness_biomath_desc',
    category: 'health',
    icon: 'HeartPulse',
    badge: 'TDEE & 1RM 🏃',
    keywords: ['salute', 'fitness', 'bmi', 'imc', 'peso ideale', 'calorie', 'tdee', 'bmr', 'metabolismo basale', 'massa magra', 'grasso corporeo', '1rm massimale', 'fabbisogno calorico']
  },

  // 3D Mathematical Surface Plotter Category
  {
    id: 'graph-3d',
    titleKey: 'calc_graph_3d_title',
    descriptionKey: 'calc_graph_3d_desc',
    category: 'graphing-3d',
    icon: 'Box',
    badge: '3D Mesh 🧊',
    keywords: ['grafico 3d', 'grafici 3d', 'plotter 3d', 'superficie tridimensionale', 'z=f(x,y)', 'mesh', 'sombrero', 'ripple', 'sella', 'visualizzatore 3d']
  },

  // OmniGeometry Universal Surface & Volume Category
  {
    id: 'geometry-surface-volume',
    titleKey: 'calc_geometry_surface_volume_title',
    descriptionKey: 'calc_geometry_surface_volume_desc',
    category: 'geometry',
    icon: 'Shapes',
    badge: 'Tutti i Solidi & Forme 📐',
    keywords: [
      'geometria', 'superfici', 'volumi', 'superficie', 'volume', 'solidi', 'solido', 'forme',
      'cilindro', 'sfera', 'cono', 'cubo', 'parallelepipedo', 'piramide', 'prisma', 'toro',
      'toroide', 'ciambella', 'calotta', 'cupola', 'spicchio', 'emisfero', 'tubo',
      'tronco di cono', 'tronco di piramide', 'tetraedro', 'ottaedro', 'dodecaedro', 'icosaedro',
      'poliedri', 'ellissoide', 'sferoide', 'cisterna', 'serbatoio', 'botte', 'barile',
      'keplero', 'asme', 'triangolo', 'erone', 'cerchio', 'corona circolare', 'trapezio',
      'rombo', 'aquilone', 'poligono', 'glome', 'tesseract', 'ipersfera', '4d', 'litri',
      'metri cubi', 'area', 'perimetro', 'densita', 'massa', 'peso', 'solid', 'surface', 'tank'
    ]
  },

  // Materials & Specific Weights Category (Pesi Specifici di Qualsiasi Materiale Esistente al Mondo)
  {
    id: 'material-density-weight',
    titleKey: 'calc_material_density_weight_title',
    descriptionKey: 'calc_material_density_weight_desc',
    category: 'materials',
    icon: 'Scale',
    badge: 'Tutti i Materiali al Mondo ⚖️',
    keywords: [
      'peso specifico', 'pesi specifici', 'densita', 'materiali', 'materiale', 'massa', 'volume',
      'peso', 'kg/m3', 'g/cm3', 'specific gravity', 'gravita specifica', 'densita relativa',
      'archimede', 'spinta di archimede', 'galleggiamento', 'galleggia', 'affonda', 'flottazione',
      'metalli', 'leghe', 'oro', 'argento', 'ferro', 'acciaio', 'alluminio', 'rame', 'ottone',
      'bronzo', 'piombo', 'osmio', 'platino', 'tungsteno', 'uranio', 'titanio', 'ghisa', 'zinco',
      'stagno', 'magnesio', 'litio', 'mercurio', 'edilizia', 'calcestruzzo', 'cemento', 'marmo',
      'granito', 'porfido', 'basalto', 'tufo', 'pietra serena', 'pietra', 'mattoni', 'malta',
      'gesso', 'cartongesso', 'asfalto', 'vetro', 'sabbia', 'ghiaia', 'terra', 'argilla',
      'legno', 'legnami', 'ebano', 'balsa', 'sughero', 'quercia', 'rovere', 'faggio', 'pino',
      'abete', 'teak', 'noce', 'mogano', 'compensato', 'mdf', 'liquidi', 'acqua', 'acqua di mare',
      'olio', 'olio d oliva', 'olio motore', 'benzina', 'gasolio', 'diesel', 'alcol', 'etanolo',
      'acetone', 'glicerina', 'miele', 'latte', 'vino', 'acido solforico', 'sangue', 'gas',
      'aria', 'idrogeno', 'elio', 'metano', 'azoto', 'ossigeno', 'argon', 'anidride carbonica',
      'co2', 'sf6', 'plastiche', 'polimeri', 'teflon', 'ptfe', 'pvc', 'pet', 'policarbonato',
      'plexiglas', 'nylon', 'epossidica', 'resina', 'gomma', 'silicone', 'fibra di carbonio',
      'kevlar', 'polistirolo', 'abs', 'hdpe', 'polipropilene', 'minerali', 'gemme', 'diamante',
      'rubino', 'zaffiro', 'smeraldo', 'quarzo', 'giada', 'pirite', 'alimenti', 'ghiaccio',
      'sale', 'zucchero', 'farina', 'burro', 'cioccolato', 'aerogel', 'stella di neutroni',
      'sole', 'terra', 'luna', 'buco nero', 'nana bianca', 'saturno', 'density', 'specific weight'
    ]
  },

  // Trainer Category
  {
    id: 'trainer',
    titleKey: 'calc_trainer_title',
    descriptionKey: 'calc_trainer_desc',
    category: 'trainer',
    icon: 'Brain',
    badge: 'Quiz 🧠',
    keywords: ['allenatore', 'quiz', 'calcolo mentale', 'training', 'gioco', 'esercizi', 'sfida', 'test']
  },

  // Converter Category
  {
    id: 'unit-converter',
    titleKey: 'calc_unit_converter_title',
    descriptionKey: 'calc_unit_converter_desc',
    category: 'converter',
    icon: 'Ruler',
    badge: 'Mondo 🌍',
    keywords: [
      'convertitore', 'convertitore di unita', 'unita di misura', 'lunghezza', 'massa', 'peso',
      'temperatura', 'area', 'volume', 'pressione', 'energia', 'potenza', 'velocita', 'metri',
      'chilometri', 'piedi', 'pollici', 'miglia', 'chilogrammi', 'libbre', 'once', 'litri',
      'galloni', 'celsius', 'fahrenheit', 'kelvin', 'bar', 'psi', 'pascal', 'joule', 'calorie',
      'watt', 'cavalli vapore'
    ]
  }
];

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Layers,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Share2,
  Info,
  Scale,
  Compass,
  Ruler,
  Sliders,
  Eye,
  Maximize2,
  Search,
  Bookmark
} from 'lucide-react';
import { AppSettings, HistoryItem, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface OmniGeometryCalculatorProps {
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

type GeoFamily =
  | 'solids_rot'
  | 'polyhedra'
  | 'ellipsoids'
  | 'tanks_real'
  | 'surfaces_2d'
  | 'hyperspace_4d';

type ShapeId =
  // Solidi di rotazione
  | 'sphere'
  | 'hemisphere'
  | 'cylinder'
  | 'hollow_cylinder'
  | 'cone'
  | 'conical_frustum'
  | 'torus'
  | 'spherical_cap'
  | 'spherical_zone'
  | 'spherical_wedge'
  | 'paraboloid'
  // Poliedri & Prismi
  | 'cube'
  | 'cuboid'
  | 'regular_prism'
  | 'regular_pyramid'
  | 'pyramidal_frustum'
  | 'tetrahedron'
  | 'octahedron'
  | 'dodecahedron'
  | 'icosahedron'
  | 'wedge'
  // Ellissoidi & Astronomia
  | 'ellipsoid'
  | 'oblate_spheroid'
  | 'prolate_spheroid'
  | 'elliptical_torus'
  // Cisterne & Ingegneria Reale
  | 'horizontal_tank'
  | 'silo_conical'
  | 'kepler_barrel'
  | 'asme_tank'
  | 'cylindrical_ungula'
  // Superfici 2D del Mondo
  | 'regular_polygon'
  | 'triangle_heron'
  | 'circle_ring'
  | 'circle_sector'
  | 'ellipse_2d'
  | 'trapezoid'
  | 'rhombus_kite'
  // 4D Iperspazio
  | 'glome_4d'
  | 'tesseract_4d'
  | 'hypersphere_nd';

interface MaterialDensity {
  name: string;
  nameIt: string;
  density: number; // kg/m^3
}

const MATERIALS: MaterialDensity[] = [
  { name: 'Water (Liquid)', nameIt: 'Acqua pura (1000 kg/m³)', density: 1000 },
  { name: 'Reinforced Concrete', nameIt: 'Calcestruzzo armato (2400 kg/m³)', density: 2400 },
  { name: 'Structural Steel', nameIt: 'Acciaio da costruzione (7850 kg/m³)', density: 7850 },
  { name: 'Aluminum', nameIt: 'Alluminio (2700 kg/m³)', density: 2700 },
  { name: 'Pure Gold (24K)', nameIt: 'Oro puro 24K (19300 kg/m³)', density: 19300 },
  { name: 'Lead', nameIt: 'Piombo (11340 kg/m³)', density: 11340 },
  { name: 'Copper', nameIt: 'Rame (8960 kg/m³)', density: 8960 },
  { name: 'Titanium', nameIt: 'Titanio (4506 kg/m³)', density: 4506 },
  { name: 'Glass', nameIt: 'Vetro standard (2500 kg/m³)', density: 2500 },
  { name: 'Oak Wood', nameIt: 'Legno di Quercia stagionato (750 kg/m³)', density: 750 },
  { name: 'Gasoline / Petrol', nameIt: 'Benzina / Carburante (740 kg/m³)', density: 740 },
  { name: 'Olive Oil', nameIt: 'Olio d\'oliva (920 kg/m³)', density: 920 },
  { name: 'Ice (0°C)', nameIt: 'Ghiaccio (917 kg/m³)', density: 917 },
  { name: 'Compacted Soil / Gravel', nameIt: 'Terra / Ghiaia compattata (1600 kg/m³)', density: 1600 },
  { name: 'Granite Rock', nameIt: 'Roccia Granitica (2690 kg/m³)', density: 2690 }
];

export const OmniGeometrySurfaceVolumeCalculator: React.FC<OmniGeometryCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  initialInputs,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeFamily, setActiveFamily] = useState<GeoFamily>('solids_rot');
  const [activeShape, setActiveShape] = useState<ShapeId>('sphere');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0); // Acqua
  const [showFormulas, setShowFormulas] = useState(true);
  const [showUnitConversions, setShowUnitConversions] = useState(true);
  const [showMaterialWeight, setShowMaterialWeight] = useState(true);

  // Common parameters state (all in SI standard meters)
  const [r, setR] = useState('1'); // radius
  const [r2, setR2] = useState('0.5'); // secondary radius
  const [h, setH] = useState('2'); // height / length
  const [h2, setH2] = useState('1'); // secondary height
  const [a, setA] = useState('2'); // side a / semi-axis a
  const [b, setB] = useState('1.5'); // side b / semi-axis b
  const [c, setC] = useState('1'); // side c / semi-axis c
  const [d, setD] = useState('0.6'); // fill depth / side d
  const [nSides, setNSides] = useState('6'); // n polygon sides (3..20)
  const [angleDeg, setAngleDeg] = useState('90'); // degrees (0..360)
  const [dimN, setDimN] = useState('4'); // dimensions for n-sphere (1..10)

  // Restore initial inputs if passed
  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.activeShape) setActiveShape(initialInputs.activeShape as ShapeId);
      if (initialInputs.r) setR(initialInputs.r);
      if (initialInputs.r2) setR2(initialInputs.r2);
      if (initialInputs.h) setH(initialInputs.h);
      if (initialInputs.a) setA(initialInputs.a);
      if (initialInputs.b) setB(initialInputs.b);
      if (initialInputs.c) setC(initialInputs.c);
    }
  }, [initialInputs]);

  // Canvas ref for interactive wireframe preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parse numeric values safely
  const pR = Math.max(0.000001, parseFloat(r.replace(',', '.')) || 0.000001);
  const pR2 = Math.max(0.000001, parseFloat(r2.replace(',', '.')) || 0.000001);
  const pH = Math.max(0.000001, parseFloat(h.replace(',', '.')) || 0.000001);
  const pH2 = Math.max(0.000001, parseFloat(h2.replace(',', '.')) || 0.000001);
  const pA = Math.max(0.000001, parseFloat(a.replace(',', '.')) || 0.000001);
  const pB = Math.max(0.000001, parseFloat(b.replace(',', '.')) || 0.000001);
  const pC = Math.max(0.000001, parseFloat(c.replace(',', '.')) || 0.000001);
  const pD = Math.max(0, parseFloat(d.replace(',', '.')) || 0);
  const pN = Math.max(3, Math.min(100, Math.round(parseFloat(nSides) || 6)));
  const pAngle = Math.max(0.1, Math.min(360, parseFloat(angleDeg.replace(',', '.')) || 90));
  const pDimN = Math.max(1, Math.min(10, Math.round(parseFloat(dimN) || 4)));

  // Helper: Gamma function for hypersphere calculations
  const gammaApprox = (z: number): number => {
    if (z === 1) return 1;
    if (z === 0.5) return Math.sqrt(Math.PI);
    if (z === 1.5) return 0.5 * Math.sqrt(Math.PI);
    if (z === 2) return 1;
    if (z === 2.5) return 1.5 * 0.5 * Math.sqrt(Math.PI);
    if (z === 3) return 2;
    if (z === 3.5) return 2.5 * 1.5 * 0.5 * Math.sqrt(Math.PI);
    if (z === 4) return 6;
    if (z === 4.5) return 3.5 * 2.5 * 1.5 * 0.5 * Math.sqrt(Math.PI);
    if (z === 5) return 24;
    if (z === 5.5) return 4.5 * 3.5 * 2.5 * 1.5 * 0.5 * Math.sqrt(Math.PI);
    if (z === 6) return 120;
    // Stirling Lanczos approximation
    const g = 7;
    const C = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109585720572,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    let x = C[0];
    for (let i = 1; i < g + 2; i++) {
      x += C[i] / (z - 1 + i);
    }
    const t = z - 1 + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z - 0.5) * Math.exp(-t) * x;
  };

  // Comprehensive calculation engine
  const calculation = useMemo(() => {
    let volume = 0; // m^3
    let surfaceTotal = 0; // m^2
    let surfaceLateral = 0; // m^2
    let baseArea = 0; // m^2
    let formulaDesc = '';
    let steps: { label: string; formula: string; value: string }[] = [];
    let secondaryProps: { label: string; value: string }[] = [];
    let shapeTitle = '';

    const PI = Math.PI;

    switch (activeShape) {
      // 1. Sfera
      case 'sphere': {
        shapeTitle = 'Sfera Perfetta (Sphere)';
        volume = (4 / 3) * PI * Math.pow(pR, 3);
        surfaceTotal = 4 * PI * Math.pow(pR, 2);
        surfaceLateral = surfaceTotal;
        const diam = 2 * pR;
        const circum = 2 * PI * pR;
        formulaDesc = 'Volume V = (4/3)·π·r³  |  Superficie S = 4·π·r²';
        steps = [
          { label: 'Raggio r', formula: 'r', value: `${pR} m` },
          { label: 'Diametro D', formula: '2·r', value: `${diam.toFixed(4)} m` },
          { label: 'Circonferenza massima C', formula: '2·π·r', value: `${circum.toFixed(4)} m` },
          { label: 'Superficie Totale S', formula: '4·π·r²', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume V', formula: '(4/3)·π·r³', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Diametro (D)', value: `${diam.toFixed(4)} m` },
          { label: 'Circonferenza equatoriale', value: `${circum.toFixed(4)} m` },
          { label: 'Rapporto Superficie/Volume (S/V)', value: `${(3 / pR).toFixed(4)} m⁻¹` }
        ];
        break;
      }

      // 2. Emisfero
      case 'hemisphere': {
        shapeTitle = 'Emisfero (Hemisphere)';
        volume = (2 / 3) * PI * Math.pow(pR, 3);
        surfaceLateral = 2 * PI * Math.pow(pR, 2);
        baseArea = PI * Math.pow(pR, 2);
        surfaceTotal = surfaceLateral + baseArea; // 3*pi*r^2
        formulaDesc = 'Volume V = (2/3)·π·r³  |  Superficie Totale S = 3·π·r²';
        steps = [
          { label: 'Area base circolare A_b', formula: 'π·r²', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie curva laterale', formula: '2·π·r²', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: '3·π·r²', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Emisferico V', formula: '(2/3)·π·r³', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Baricentro z_G (dal piano)', value: `${((3 / 8) * pR).toFixed(4)} m` },
          { label: 'Area calotta curva', value: `${surfaceLateral.toFixed(4)} m²` }
        ];
        break;
      }

      // 3. Cilindro Retto
      case 'cylinder': {
        shapeTitle = 'Cilindro Circolare Retto (Right Cylinder)';
        baseArea = PI * Math.pow(pR, 2);
        volume = baseArea * pH;
        surfaceLateral = 2 * PI * pR * pH;
        surfaceTotal = 2 * baseArea + surfaceLateral;
        formulaDesc = 'Volume V = π·r²·h  |  Superficie Totale S = 2·π·r·(r + h)';
        steps = [
          { label: 'Area di una base A_b', formula: 'π·r²', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie Laterale S_lat', formula: '2·π·r·h', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: '2·A_b + S_lat', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Totale V', formula: 'π·r²·h', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Diagonale assiale', value: `${Math.hypot(2 * pR, pH).toFixed(4)} m` },
          { label: 'Rapporto Altezza/Diametro', value: `${(pH / (2 * pR)).toFixed(3)}` }
        ];
        break;
      }

      // 4. Cilindro Cavo / Tubo
      case 'hollow_cylinder': {
        shapeTitle = 'Tubo Cilindrico Cavo (Hollow Pipe)';
        const R_ext = Math.max(pR, pR2);
        const r_int = Math.min(pR, pR2);
        baseArea = PI * (Math.pow(R_ext, 2) - Math.pow(r_int, 2));
        volume = baseArea * pH;
        const sExt = 2 * PI * R_ext * pH;
        const sInt = 2 * PI * r_int * pH;
        surfaceLateral = sExt + sInt;
        surfaceTotal = surfaceLateral + 2 * baseArea;
        const spessore = R_ext - r_int;
        formulaDesc = 'V = π·(R² - r²)·h  |  S_tot = 2·π·(R + r)·h + 2·π·(R² - r²)';
        steps = [
          { label: 'Raggio esterno R', formula: 'R', value: `${R_ext} m` },
          { label: 'Raggio interno r', formula: 'r', value: `${r_int} m` },
          { label: 'Spessore parete', formula: 'R - r', value: `${spessore.toFixed(4)} m` },
          { label: 'Area corona di base', formula: 'π·(R² - r²)', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: 'S_ext + S_int + 2·A_base', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume del materiale V', formula: 'A_base · h', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Superficie esterna', value: `${sExt.toFixed(4)} m²` },
          { label: 'Superficie interna', value: `${sInt.toFixed(4)} m²` },
          { label: 'Volume cavità interna libera', value: `${(PI * r_int * r_int * pH).toFixed(4)} m³` }
        ];
        break;
      }

      // 5. Cono Retto
      case 'cone': {
        shapeTitle = 'Cono Circolare Retto (Right Circular Cone)';
        const apotema = Math.hypot(pR, pH);
        baseArea = PI * Math.pow(pR, 2);
        volume = (1 / 3) * baseArea * pH;
        surfaceLateral = PI * pR * apotema;
        surfaceTotal = baseArea + surfaceLateral;
        const semiVertexAngle = (Math.atan(pR / pH) * 180) / PI;
        formulaDesc = 'Volume V = (1/3)·π·r²·h  |  Apotema g = √(r²+h²)  |  S = π·r·(r + g)';
        steps = [
          { label: 'Apotema laterale g', formula: '√(r² + h²)', value: `${apotema.toFixed(4)} m` },
          { label: 'Area base circolare', formula: 'π·r²', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie laterale S_lat', formula: 'π·r·g', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: 'A_base + S_lat', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Cono V', formula: '(1/3)·π·r²·h', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Apotema (g)', value: `${apotema.toFixed(4)} m` },
          { label: 'Semi-angolo al vertice', value: `${semiVertexAngle.toFixed(2)}°` },
          { label: 'Angolo settore sviluppo piano', value: `${((360 * pR) / apotema).toFixed(2)}°` }
        ];
        break;
      }

      // 6. Tronco di Cono
      case 'conical_frustum': {
        shapeTitle = 'Tronco di Cono (Conical Frustum)';
        const R_b = Math.max(pR, pR2);
        const r_t = Math.min(pR, pR2);
        const apotema = Math.hypot(R_b - r_t, pH);
        const a1 = PI * Math.pow(R_b, 2);
        const a2 = PI * Math.pow(r_t, 2);
        baseArea = a1 + a2;
        volume = ((PI * pH) / 3) * (Math.pow(R_b, 2) + R_b * r_t + Math.pow(r_t, 2));
        surfaceLateral = PI * (R_b + r_t) * apotema;
        surfaceTotal = baseArea + surfaceLateral;
        formulaDesc = 'V = (π·h/3)·(R² + R·r + r²)  |  S_lat = π·(R + r)·g';
        steps = [
          { label: 'Apotema tronco g', formula: '√(h² + (R-r)²)', value: `${apotema.toFixed(4)} m` },
          { label: 'Superficie laterale', formula: 'π·(R + r)·g', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: 'π·R² + π·r² + S_lat', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Tronco V', formula: '(π·h/3)·(R² + R·r + r²)', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Area base maggiore', value: `${a1.toFixed(4)} m²` },
          { label: 'Area base minore', value: `${a2.toFixed(4)} m²` },
          { label: 'Apotema (g)', value: `${apotema.toFixed(4)} m` }
        ];
        break;
      }

      // 7. Toroide / Ciambella
      case 'torus': {
        shapeTitle = 'Toroide / Ciambella (Geometric Torus)';
        // R (radius from center of hole to tube center), r (tube radius)
        const R_maj = Math.max(pR, pR2);
        const r_min = Math.min(pR, pR2);
        volume = 2 * Math.pow(PI, 2) * R_maj * Math.pow(r_min, 2);
        surfaceTotal = 4 * Math.pow(PI, 2) * R_maj * r_min;
        surfaceLateral = surfaceTotal;
        formulaDesc = 'Volume V = 2·π²·R·r²  |  Superficie S = 4·π²·R·r';
        steps = [
          { label: 'Raggio maggiore R', formula: 'R (centro ciambella)', value: `${R_maj} m` },
          { label: 'Raggio minore r', formula: 'r (sezione tubo)', value: `${r_min} m` },
          { label: 'Superficie Totale S', formula: '4·π²·R·r', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Toroidale V', formula: '2·π²·R·r²', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Diametro esterno massimo', value: `${(2 * (R_maj + r_min)).toFixed(4)} m` },
          { label: 'Diametro foro centrale', value: `${(2 * Math.max(0, R_maj - r_min)).toFixed(4)} m` },
          { label: 'Rapporto di aspetto (R/r)', value: `${(R_maj / r_min).toFixed(3)}` }
        ];
        break;
      }

      // 8. Calotta Sferica
      case 'spherical_cap': {
        shapeTitle = 'Calotta Sferica & Segmento (Spherical Cap & Dome)';
        // R = sphere radius, h = cap height (h <= 2R)
        const capH = Math.min(pH, 2 * pR);
        const aBase = Math.sqrt(Math.max(0, capH * (2 * pR - capH))); // cap base radius
        baseArea = PI * Math.pow(aBase, 2);
        surfaceLateral = 2 * PI * pR * capH; // curved dome area
        surfaceTotal = surfaceLateral + baseArea;
        volume = (PI * Math.pow(capH, 2) / 3) * (3 * pR - capH);
        formulaDesc = 'V = (π·h²/3)·(3R - h)  |  S_curva = 2·π·R·h  |  r_base = √(h(2R-h))';
        steps = [
          { label: 'Raggio base calotta a', formula: '√(h·(2R - h))', value: `${aBase.toFixed(4)} m` },
          { label: 'Superficie a cupola', formula: '2·π·R·h', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale (con base)', formula: 'S_curva + π·a²', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Segmento Sferico V', formula: '(π·h²/3)·(3R - h)', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Raggio base calotta', value: `${aBase.toFixed(4)} m` },
          { label: 'Area base piatta', value: `${baseArea.toFixed(4)} m²` },
          { label: '% del volume della sfera intera', value: `${((volume / ((4 / 3) * PI * Math.pow(pR, 3))) * 100).toFixed(2)} %` }
        ];
        break;
      }

      // 9. Zona Sferica a due basi
      case 'spherical_zone': {
        shapeTitle = 'Zona Sferica a Due Basi (Spherical Frustum)';
        const r1 = pR;
        const r2 = pR2;
        const b1 = PI * r1 * r1;
        const b2 = PI * r2 * r2;
        baseArea = b1 + b2;
        // Sphere radius R can be derived:
        const sphereR = Math.sqrt(Math.max(r1 * r1, r2 * r2) + (pH * pH) / 4);
        surfaceLateral = 2 * PI * sphereR * pH;
        surfaceTotal = surfaceLateral + baseArea;
        volume = ((PI * pH) / 6) * (3 * Math.pow(r1, 2) + 3 * Math.pow(r2, 2) + Math.pow(pH, 2));
        formulaDesc = 'V = (π·h/6)·(3·r₁² + 3·r₂² + h²)  |  S_curva = 2·π·R·h';
        steps = [
          { label: 'Base inferiore e superiore', formula: 'π·r₁² + π·r₂²', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie curva laterale', formula: '2·π·R·h', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: 'S_curva + Basi', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Zona Sferica V', formula: '(π·h/6)·(3r₁² + 3r₂² + h²)', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Raggio sfera generatrice R', value: `${sphereR.toFixed(4)} m` },
          { label: 'Raggio base 1', value: `${r1} m` },
          { label: 'Raggio base 2', value: `${r2} m` }
        ];
        break;
      }

      // 10. Spicchio e Fuso Sferico
      case 'spherical_wedge': {
        shapeTitle = 'Spicchio e Fuso Sferico (Spherical Wedge)';
        const frac = pAngle / 360;
        volume = frac * (4 / 3) * PI * Math.pow(pR, 3);
        const fuso = frac * 4 * PI * Math.pow(pR, 2); // curved lobe area
        const semiDisks = PI * Math.pow(pR, 2); // two planar semicircles = 1 circle
        surfaceLateral = fuso;
        surfaceTotal = fuso + semiDisks;
        formulaDesc = 'V = (θ/360)·(4/3)·π·r³  |  S_fuso = (θ/360)·4·π·r²';
        steps = [
          { label: 'Frazione angolare', formula: 'θ / 360°', value: `${(frac * 100).toFixed(2)} %` },
          { label: 'Superficie del fuso (curva)', formula: '(θ/360)·4·π·r²', value: `${fuso.toFixed(6)} m²` },
          { label: 'Superficie Totale (con facce piane)', formula: 'S_fuso + π·r²', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume dello Spicchio V', formula: '(θ/360)·(4/3)·π·r³', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Angolo diedro θ', value: `${pAngle}°` },
          { label: 'Area due facce piane interne', value: `${semiDisks.toFixed(4)} m²` }
        ];
        break;
      }

      // 11. Paraboloide Circolare di Rotazione
      case 'paraboloid': {
        shapeTitle = 'Paraboloide di Rotazione (Parabolic Bowl)';
        baseArea = PI * Math.pow(pR, 2);
        volume = 0.5 * PI * Math.pow(pR, 2) * pH;
        // Surface area of paraboloid: pi*r/(6*h^2) * ( (r^2 + 4h^2)^(3/2) - r^3 )
        const term = Math.pow(Math.pow(pR, 2) + 4 * Math.pow(pH, 2), 1.5) - Math.pow(pR, 3);
        surfaceLateral = ((PI * pR) / (6 * Math.pow(pH, 2))) * term;
        surfaceTotal = surfaceLateral + baseArea;
        formulaDesc = 'V = (1/2)·π·r²·h  |  S = (π·r / 6h²) · [ (r² + 4h²)^(3/2) - r³ ]';
        steps = [
          { label: 'Area apertura circolare', formula: 'π·r²', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie concava curva', formula: 'Integrale analitico', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: 'S_curva + π·r²', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Capacità V', formula: '(1/2)·π·r²·h', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Distanza focale f = r² / (4h)', value: `${(Math.pow(pR, 2) / (4 * pH)).toFixed(4)} m` },
          { label: 'Rapporto con cilindro circoscritto', value: '50.00 % esatto' }
        ];
        break;
      }

      // 12. Cubo / Esaedro Regolare
      case 'cube': {
        shapeTitle = 'Cubo / Esaedro Regolare (Cube)';
        volume = Math.pow(pA, 3);
        surfaceTotal = 6 * Math.pow(pA, 2);
        surfaceLateral = 4 * Math.pow(pA, 2);
        baseArea = Math.pow(pA, 2);
        const diag = pA * Math.sqrt(3);
        const rInscritto = pA / 2;
        const rCircoscritto = (pA * Math.sqrt(3)) / 2;
        formulaDesc = 'Volume V = a³  |  Superficie S = 6·a²  |  Diagonale d = a·√3';
        steps = [
          { label: 'Area singola faccia A_f', formula: 'a²', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie Totale S (6 facce)', formula: '6·a²', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Cubo V', formula: 'a³', value: `${volume.toFixed(6)} m³` },
          { label: 'Diagonale spaziale', formula: 'a·√3', value: `${diag.toFixed(4)} m` }
        ];
        secondaryProps = [
          { label: 'Diagonale spaziale (d)', value: `${diag.toFixed(4)} m` },
          { label: 'Raggio sfera inscritta', value: `${rInscritto.toFixed(4)} m` },
          { label: 'Raggio sfera circoscritta', value: `${rCircoscritto.toFixed(4)} m` }
        ];
        break;
      }

      // 13. Parallelepipedo Rettangolo
      case 'cuboid': {
        shapeTitle = 'Parallelepipedo Rettangolo (Rectangular Cuboid)';
        volume = pA * pB * pC;
        baseArea = pA * pB;
        surfaceTotal = 2 * (pA * pB + pB * pC + pC * pA);
        surfaceLateral = 2 * (pA * pC + pB * pC);
        const diag = Math.sqrt(pA * pA + pB * pB + pC * pC);
        formulaDesc = 'V = a·b·c  |  S = 2·(a·b + b·c + c·a)  |  d = √(a²+b²+c²)';
        steps = [
          { label: 'Area base rettangolare A_b', formula: 'a·b', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: '2·(ab + bc + ca)', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Solido V', formula: 'a·b·c', value: `${volume.toFixed(6)} m³` },
          { label: 'Diagonale interna', formula: '√(a² + b² + c²)', value: `${diag.toFixed(4)} m` }
        ];
        secondaryProps = [
          { label: 'Diagonale spaziale (d)', value: `${diag.toFixed(4)} m` },
          { label: 'Perimetro di base', value: `${(2 * (pA + pB)).toFixed(4)} m` },
          { label: 'Somma di tutti i 12 spigoli', value: `${(4 * (pA + pB + pC)).toFixed(4)} m` }
        ];
        break;
      }

      // 14. Prisma Regolare a n Lati
      case 'regular_prism': {
        shapeTitle = `Prisma Regolare a ${pN} Lati (${pN}-gonal Prism)`;
        // s = side a, h = height h, n = pN
        const perimBase = pN * pA;
        const apotemaBase = pA / (2 * Math.tan(PI / pN));
        baseArea = (pN * Math.pow(pA, 2)) / (4 * Math.tan(PI / pN));
        surfaceLateral = perimBase * pH;
        surfaceTotal = 2 * baseArea + surfaceLateral;
        volume = baseArea * pH;
        formulaDesc = 'A_base = (n·s²)/(4·tan(π/n))  |  V = A_base·h  |  S_tot = 2·A_base + n·s·h';
        steps = [
          { label: `Poligono di base (${pN} lati)`, formula: 'n', value: `${pN} lati da ${pA} m` },
          { label: 'Apotema del poligono base', formula: 's / (2·tan(π/n))', value: `${apotemaBase.toFixed(4)} m` },
          { label: 'Area singola base A_b', formula: '(n·s²)/(4·tan(π/n))', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie laterale (n facce)', formula: 'n·s·h', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: '2·A_b + S_lat', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Prisma V', formula: 'A_b·h', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Apotema base (raggio inscritto)', value: `${apotemaBase.toFixed(4)} m` },
          { label: 'Raggio circoscritto base', value: `${(pA / (2 * Math.sin(PI / pN))).toFixed(4)} m` }
        ];
        break;
      }

      // 15. Piramide Regolare a n Lati
      case 'regular_pyramid': {
        shapeTitle = `Piramide Regolare a ${pN} Lati (${pN}-gonal Pyramid)`;
        const apotemaBase = pA / (2 * Math.tan(PI / pN));
        const apotemaLaterale = Math.hypot(apotemaBase, pH);
        baseArea = (pN * Math.pow(pA, 2)) / (4 * Math.tan(PI / pN));
        surfaceLateral = 0.5 * (pN * pA) * apotemaLaterale;
        surfaceTotal = baseArea + surfaceLateral;
        volume = (1 / 3) * baseArea * pH;
        formulaDesc = 'V = (1/3)·A_base·h  |  Apotema lat = √(a_b² + h²)  |  S_lat = (1/2)·Perim·a_lat';
        steps = [
          { label: 'Apotema laterale faccia', formula: '√(a_b² + h²)', value: `${apotemaLaterale.toFixed(4)} m` },
          { label: 'Area base poligonale A_b', formula: '(n·s²)/(4·tan(π/n))', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Superficie laterale S_lat', formula: '(1/2)·n·s·a_lat', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: 'A_b + S_lat', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Piramide V', formula: '(1/3)·A_b·h', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Apotema laterale (inclinato)', value: `${apotemaLaterale.toFixed(4)} m` },
          { label: 'Lunghezza spigolo laterale', value: `${Math.hypot(pH, pA / (2 * Math.sin(PI / pN))).toFixed(4)} m` }
        ];
        break;
      }

      // 16. Tronco di Piramide
      case 'pyramidal_frustum': {
        shapeTitle = 'Tronco di Piramide (Pyramidal Frustum)';
        const a1 = (pN * Math.pow(pA, 2)) / (4 * Math.tan(PI / pN));
        const a2 = (pN * Math.pow(pB, 2)) / (4 * Math.tan(PI / pN));
        baseArea = a1 + a2;
        volume = (pH / 3) * (a1 + a2 + Math.sqrt(a1 * a2));
        const apo1 = pA / (2 * Math.tan(PI / pN));
        const apo2 = pB / (2 * Math.tan(PI / pN));
        const slantHeight = Math.hypot(apo1 - apo2, pH);
        surfaceLateral = pN * 0.5 * (pA + pB) * slantHeight;
        surfaceTotal = baseArea + surfaceLateral;
        formulaDesc = 'V = (h/3)·(A₁ + A₂ + √(A₁·A₂))  |  S_lat = n·(s₁+s₂)/2 · g';
        steps = [
          { label: 'Area base maggiore A₁', formula: 'A₁', value: `${a1.toFixed(6)} m²` },
          { label: 'Area base minore A₂', formula: 'A₂', value: `${a2.toFixed(6)} m²` },
          { label: 'Superficie laterale', formula: 'n·(s₁+s₂)/2·g', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: 'A₁ + A₂ + S_lat', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Tronco V', formula: '(h/3)·(A₁ + A₂ + √(A₁A₂))', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Apotema trapezoidale (g)', value: `${slantHeight.toFixed(4)} m` },
          { label: 'Rapporto volumi A₁/A₂', value: `${(a1 / a2).toFixed(3)}` }
        ];
        break;
      }

      // 17. Tetraedro Regolare (4 facce triangolari)
      case 'tetrahedron': {
        shapeTitle = 'Tetraedro Regolare (Platonic Tetrahedron)';
        volume = (Math.pow(pA, 3) * Math.sqrt(2)) / 12;
        surfaceTotal = Math.pow(pA, 2) * Math.sqrt(3);
        surfaceLateral = surfaceTotal;
        const altezza = (pA * Math.sqrt(6)) / 3;
        formulaDesc = 'V = (a³·√2) / 12  |  S = a²·√3  |  Altezza h = a·√(2/3)';
        steps = [
          { label: 'Spigolo a', formula: 'a', value: `${pA} m` },
          { label: 'Altezza del vertice h', formula: 'a·√(2/3)', value: `${altezza.toFixed(4)} m` },
          { label: 'Superficie Totale S (4 facce)', formula: 'a²·√3', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Tetraedro V', formula: '(a³·√2) / 12', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Altezza (h)', value: `${altezza.toFixed(4)} m` },
          { label: 'Raggio sfera inscritta', value: `${(pA / (2 * Math.sqrt(6))).toFixed(4)} m` },
          { label: 'Raggio sfera circoscritta', value: `${((pA * Math.sqrt(6)) / 4).toFixed(4)} m` }
        ];
        break;
      }

      // 18. Ottaedro Regolare (8 facce)
      case 'octahedron': {
        shapeTitle = 'Ottaedro Regolare (Platonic Octahedron)';
        volume = (Math.pow(pA, 3) * Math.sqrt(2)) / 3;
        surfaceTotal = 2 * Math.pow(pA, 2) * Math.sqrt(3);
        surfaceLateral = surfaceTotal;
        const diag = pA * Math.sqrt(2);
        formulaDesc = 'V = (a³·√2) / 3  |  S = 2·a²·√3  |  Diagonale d = a·√2';
        steps = [
          { label: 'Spigolo a', formula: 'a', value: `${pA} m` },
          { label: 'Superficie Totale S (8 facce)', formula: '2·a²·√3', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Ottaedro V', formula: '(a³·√2) / 3', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Diagonale tra vertici opposti', value: `${diag.toFixed(4)} m` },
          { label: 'Raggio sfera inscritta', value: `${(pA / Math.sqrt(6)).toFixed(4)} m` }
        ];
        break;
      }

      // 19. Dodecaedro Regolare (12 pentagoni)
      case 'dodecahedron': {
        shapeTitle = 'Dodecaedro Regolare (Platonic Dodecahedron)';
        volume = ((15 + 7 * Math.sqrt(5)) / 4) * Math.pow(pA, 3);
        surfaceTotal = 3 * Math.sqrt(25 + 10 * Math.sqrt(5)) * Math.pow(pA, 2);
        surfaceLateral = surfaceTotal;
        formulaDesc = 'V = (15 + 7√5)/4 · a³  |  S = 3·√(25 + 10√5) · a²';
        steps = [
          { label: 'Spigolo a', formula: 'a', value: `${pA} m` },
          { label: 'Superficie Totale S (12 pentagoni)', formula: '3·√(25+10√5)·a²', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Dodecaedro V', formula: '((15+7√5)/4)·a³', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Raggio sfera inscritta', value: `${((pA / 4) * Math.sqrt(10 + (22 / Math.sqrt(5)))).toFixed(4)} m` },
          { label: 'Raggio sfera circoscritta', value: `${(((Math.sqrt(3) * (1 + Math.sqrt(5))) / 4) * pA).toFixed(4)} m` }
        ];
        break;
      }

      // 20. Icosaedro Regolare (20 triangoli)
      case 'icosahedron': {
        shapeTitle = 'Icosaedro Regolare (Platonic Icosahedron)';
        volume = ((5 * (3 + Math.sqrt(5))) / 12) * Math.pow(pA, 3);
        surfaceTotal = 5 * Math.sqrt(3) * Math.pow(pA, 2);
        surfaceLateral = surfaceTotal;
        formulaDesc = 'V = 5·(3 + √5)/12 · a³  |  S = 5·√3 · a²';
        steps = [
          { label: 'Spigolo a', formula: 'a', value: `${pA} m` },
          { label: 'Superficie Totale S (20 triangoli)', formula: '5·√3·a²', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Icosaedro V', formula: '(5(3+√5)/12)·a³', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Raggio sfera circoscritta', value: `${((pA / 4) * Math.sqrt(10 + 2 * Math.sqrt(5))).toFixed(4)} m` }
        ];
        break;
      }

      // 21. Cuneo Geometrico (Wedge)
      case 'wedge': {
        shapeTitle = 'Cuneo Geometrico (Geometric Wedge)';
        // base a x b, top parallel edge c, height h
        volume = ((pB * pH) / 6) * (2 * pA + pC);
        baseArea = pA * pB;
        // Surface: base + 2 trapezoids/triangles
        const endTriangles = pB * Math.hypot(0.5 * (pA - pC), pH);
        const sides = (pA + pC) * Math.hypot(pB / 2, pH);
        surfaceTotal = baseArea + endTriangles + sides;
        formulaDesc = 'Volume V = (b·h / 6) · (2·a + c)  |  Base rettangolare a·b';
        steps = [
          { label: 'Base rettangolare', formula: 'a · b', value: `${baseArea.toFixed(6)} m²` },
          { label: 'Spigolo di colmo superiore c', formula: 'c', value: `${pC} m` },
          { label: 'Superficie Totale S appross.', formula: 'Somma 5 facce', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume del Cuneo V', formula: '(b·h / 6)·(2a + c)', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Rapporto colmo/base (c/a)', value: `${(pC / pA).toFixed(3)}` }
        ];
        break;
      }

      // 22. Ellissoide Triassiale
      case 'ellipsoid': {
        shapeTitle = 'Ellissoide Triassiale (Triaxial Ellipsoid)';
        volume = (4 / 3) * PI * pA * pB * pC;
        // Knud Thomsen formula with p = 1.6075 gives < 1.061% error
        const p = 1.6075;
        const ab = Math.pow(pA * pB, p);
        const bc = Math.pow(pB * pC, p);
        const ca = Math.pow(pC * pA, p);
        surfaceTotal = 4 * PI * Math.pow((ab + bc + ca) / 3, 1 / p);
        surfaceLateral = surfaceTotal;
        formulaDesc = 'V = (4/3)·π·a·b·c  |  S ≈ 4·π·[((ab)^p + (bc)^p + (ca)^p)/3]^(1/p) (Knud Thomsen)';
        steps = [
          { label: 'Semiassi (a, b, c)', formula: 'a, b, c', value: `${pA} m, ${pB} m, ${pC} m` },
          { label: 'Formula di Knud Thomsen', formula: 'p = 1.6075 (errore max 1.06%)', value: 'Applicata' },
          { label: 'Superficie Totale S', formula: 'Approssimazione Thomsen', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Ellissoide V', formula: '(4/3)·π·a·b·c', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Volume', value: `${volume.toFixed(6)} m³` },
          { label: 'Raggio medio geometrico', value: `${Math.cbrt(pA * pB * pC).toFixed(4)} m` }
        ];
        break;
      }

      // 23. Sferoide Oblato (Pianeti in rotazione, es. Terra WGS84)
      case 'oblate_spheroid': {
        shapeTitle = 'Sferoide Oblato (Oblate Spheroid, es. Terra/Giove)';
        // a = b = equator, c = polar (a > c)
        const a_eq = Math.max(pA, pC);
        const c_pol = Math.min(pA, pC);
        volume = (4 / 3) * PI * Math.pow(a_eq, 2) * c_pol;
        const e = Math.sqrt(1 - Math.pow(c_pol / a_eq, 2)); // eccentricity
        // S = 2*pi*a^2 * (1 + ((1-e^2)/e) * atanh(e))
        const atanh_e = 0.5 * Math.log((1 + e) / (1 - e));
        surfaceTotal = 2 * PI * Math.pow(a_eq, 2) * (1 + ((1 - e * e) / e) * atanh_e);
        surfaceLateral = surfaceTotal;
        const flattening = (a_eq - c_pol) / a_eq;
        formulaDesc = 'V = (4/3)·π·a²·c  |  Eccentricità e = √(1 - c²/a²)  |  Sferoide schiacciato ai poli';
        steps = [
          { label: 'Semiasse equatoriale a', formula: 'a', value: `${a_eq} m` },
          { label: 'Semiasse polare c', formula: 'c', value: `${c_pol} m` },
          { label: 'Schiacciamento ellittico f', formula: '(a - c) / a', value: `${flattening.toFixed(6)}` },
          { label: 'Eccentricità e', formula: '√(1 - c²/a²)', value: `${e.toFixed(6)}` },
          { label: 'Superficie Esatta S', formula: '2·π·a²·[1 + ((1-e²)/e)·atanh(e)]', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Sferoide V', formula: '(4/3)·π·a²·c', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Schiacciamento ai poli (f)', value: `1 / ${(1 / flattening).toFixed(2)}` },
          { label: 'Eccentricità orbitale/forma (e)', value: `${e.toFixed(5)}` }
        ];
        break;
      }

      // 24. Sferoide Prolato (es. Pallone da Rugby)
      case 'prolate_spheroid': {
        shapeTitle = 'Sferoide Prolato (Prolate Spheroid, Rugby / Ellisse allungata)';
        // a = b = equator, c = polar (c > a)
        const a_eq = Math.min(pA, pC);
        const c_pol = Math.max(pA, pC);
        volume = (4 / 3) * PI * Math.pow(a_eq, 2) * c_pol;
        const e = Math.sqrt(1 - Math.pow(a_eq / c_pol, 2));
        // S = 2*pi*a^2 * (1 + (c / (a*e)) * asin(e))
        surfaceTotal = 2 * PI * Math.pow(a_eq, 2) * (1 + (c_pol / (a_eq * e)) * Math.asin(e));
        surfaceLateral = surfaceTotal;
        formulaDesc = 'V = (4/3)·π·a²·c  |  Eccentricità e = √(1 - a²/c²)  |  Sferoide allungato lungo asse c';
        steps = [
          { label: 'Semiasse trasversale a', formula: 'a', value: `${a_eq} m` },
          { label: 'Semiasse allungato c', formula: 'c', value: `${c_pol} m` },
          { label: 'Eccentricità e', formula: '√(1 - a²/c²)', value: `${e.toFixed(6)}` },
          { label: 'Superficie Esatta S', formula: '2·π·a²·[1 + (c/(a·e))·asin(e)]', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Prolato V', formula: '(4/3)·π·a²·c', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Rapporto di allungamento (c/a)', value: `${(c_pol / a_eq).toFixed(3)}` },
          { label: 'Eccentricità (e)', value: `${e.toFixed(5)}` }
        ];
        break;
      }

      // 25. Toroide Ellittico
      case 'elliptical_torus': {
        shapeTitle = 'Toroide a Sezione Ellittica (Elliptical Torus)';
        const R_maj = Math.max(pR, pR2);
        // a = pA, b = pB
        volume = 2 * Math.pow(PI, 2) * R_maj * pA * pB;
        // Ramanujan approx for ellipse perimeter:
        const P_ellipse = PI * (3 * (pA + pB) - Math.sqrt((3 * pA + pB) * (pA + 3 * pB)));
        surfaceTotal = 2 * PI * R_maj * P_ellipse;
        surfaceLateral = surfaceTotal;
        formulaDesc = 'V = 2·π²·R·a·b  |  S = 2·π·R · Perimetro_Ellisse(Ramanujan)';
        steps = [
          { label: 'Raggio toroide R', formula: 'R', value: `${R_maj} m` },
          { label: 'Semiassi sezione ellittica', formula: 'a, b', value: `${pA} m, ${pB} m` },
          { label: 'Perimetro sezione tubo', formula: 'Formula Ramanujan', value: `${P_ellipse.toFixed(4)} m` },
          { label: 'Superficie Totale S', formula: '2·π·R · P_ellisse', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Toroide Ellittico V', formula: '2·π²·R·a·b', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Area sezione tubo ellittico', value: `${(PI * pA * pB).toFixed(4)} m²` }
        ];
        break;
      }

      // 26. Serbatoio Orizzontale Cilindrico (con calcolo livello liquido d)
      case 'horizontal_tank': {
        shapeTitle = 'Cisterna Orizzontale con Livello Liquido (Horizontal Tank)';
        // R = pR, L = pH, d = pD (liquid level 0..2R)
        const tankR = pR;
        const tankL = pH;
        const levelD = Math.min(2 * tankR, Math.max(0, pD));
        const totalV = PI * Math.pow(tankR, 2) * tankL;
        surfaceTotal = 2 * PI * tankR * tankL + 2 * PI * Math.pow(tankR, 2);
        surfaceLateral = 2 * PI * tankR * tankL;
        // Partial liquid volume formula:
        // Area segmento circolare: R^2 * acos((R-d)/R) - (R-d)*sqrt(2*R*d - d^2)
        const alpha = Math.acos((tankR - levelD) / tankR);
        const segmentArea = Math.pow(tankR, 2) * alpha - (tankR - levelD) * Math.sqrt(Math.max(0, 2 * tankR * levelD - Math.pow(levelD, 2)));
        const liquidV = segmentArea * tankL;
        const fillPercent = (liquidV / totalV) * 100;
        volume = liquidV; // Display the liquid volume by default or total
        formulaDesc = 'V_liq = L · [ R²·arccos((R-d)/R) - (R-d)·√(2Rd - d²) ]  |  Capacità idraulica';
        steps = [
          { label: 'Raggio cisterna R', formula: 'R', value: `${tankR} m` },
          { label: 'Lunghezza cisterna L', formula: 'L', value: `${tankL} m` },
          { label: 'Livello liquido misurato d', formula: 'd', value: `${levelD} m` },
          { label: 'Volume Totale Cisterna', formula: 'π·R²·L', value: `${totalV.toFixed(6)} m³ (${(totalV * 1000).toFixed(1)} L)` },
          { label: 'Volume Liquido Effettivo V_liq', formula: 'Integrale idraulico', value: `${liquidV.toFixed(6)} m³ (${(liquidV * 1000).toFixed(1)} L)` },
          { label: 'Percentuale Riempimento', formula: '(V_liq / V_tot)·100', value: `${fillPercent.toFixed(2)} %` }
        ];
        secondaryProps = [
          { label: 'Capacità totale nominale', value: `${(totalV * 1000).toFixed(1)} Litri` },
          { label: 'Liquido presente', value: `${(liquidV * 1000).toFixed(1)} Litri` },
          { label: 'Volume vuoto residuo (ullage)', value: `${((totalV - liquidV) * 1000).toFixed(1)} Litri` }
        ];
        break;
      }

      // 27. Silos Verticale con Fondo Conico
      case 'silo_conical': {
        shapeTitle = 'Silos Verticale con Tramoggia Conica (Conical Bottom Silo)';
        // R = pR, h_cyl = pH, h_cone = pH2
        const vCyl = PI * Math.pow(pR, 2) * pH;
        const vCone = (1 / 3) * PI * Math.pow(pR, 2) * pH2;
        volume = vCyl + vCone;
        const sCylLat = 2 * PI * pR * pH;
        const sTopBase = PI * Math.pow(pR, 2);
        const apoCone = Math.hypot(pR, pH2);
        const sConeLat = PI * pR * apoCone;
        surfaceTotal = sTopBase + sCylLat + sConeLat;
        surfaceLateral = sCylLat + sConeLat;
        formulaDesc = 'V_tot = V_cilindro (π·r²·h₁) + V_cono ((1/3)·π·r²·h₂)  |  Stoccaggio granaglie e polveri';
        steps = [
          { label: 'Raggio cilindro e cono R', formula: 'R', value: `${pR} m` },
          { label: 'Altezza corpo cilindrico h₁', formula: 'h₁', value: `${pH} m` },
          { label: 'Altezza tramoggia conica h₂', formula: 'h₂', value: `${pH2} m` },
          { label: 'Superficie Totale Silos S', formula: 'Tetto + Mantello + Fondo', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Complessivo V', formula: 'V_cil + V_cono', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Volume corpo cilindrico', value: `${vCyl.toFixed(4)} m³` },
          { label: 'Volume tramoggia conica', value: `${vCone.toFixed(4)} m³` },
          { label: 'Altezza totale complessiva', value: `${(pH + pH2).toFixed(4)} m` }
        ];
        break;
      }

      // 28. Barile Parabolico di Keplero
      case 'kepler_barrel': {
        shapeTitle = 'Botte / Barile Parabolico di Keplero (Wine & Whiskey Barrel)';
        // R = belly radius (max center), r = head radius (ends), L = length/height
        const R_center = Math.max(pR, pR2);
        const r_ends = Math.min(pR, pR2);
        // Formula di Keplero / Simpson per doghe paraboliche:
        // V = (pi * L / 15) * (2*D^2 + D*d + (3/4)*d^2)  dove D = 2*R, d = 2*r
        // oppure V = (pi * L / 3) * (2*R^2 + r^2)
        volume = ((PI * pH) / 3) * (2 * Math.pow(R_center, 2) + Math.pow(r_ends, 2));
        baseArea = 2 * PI * Math.pow(r_ends, 2);
        // Approx lateral doghe surface:
        surfaceLateral = 2 * PI * ((2 * R_center + r_ends) / 3) * pH;
        surfaceTotal = baseArea + surfaceLateral;
        formulaDesc = 'Formula di Keplero: V = (π·L/3)·(2·R² + r²)  |  Doghe a curvatura parabolica';
        steps = [
          { label: 'Raggio centrale pancia R', formula: 'R_centro', value: `${R_center} m` },
          { label: 'Raggio testate r', formula: 'r_estremità', value: `${r_ends} m` },
          { label: 'Altezza/Lunghezza L', formula: 'L', value: `${pH} m` },
          { label: 'Superficie doghe e testate', formula: 'Formula doghe', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Barile V', formula: '(π·L/3)·(2R² + r²)', value: `${volume.toFixed(6)} m³ (${(volume * 1000).toFixed(1)} L)` }
        ];
        secondaryProps = [
          { label: 'Capacità in Barili USA (bbl da 159L)', value: `${((volume * 1000) / 158.987).toFixed(2)} bbl` },
          { label: 'Diametro pancia massima', value: `${(2 * R_center).toFixed(4)} m` }
        ];
        break;
      }

      // 29. Serbatoio ASME con Teste Bombate 2:1
      case 'asme_tank': {
        shapeTitle = 'Serbatoio con Teste Semi-Ellittiche ASME 2:1 (Pressure Vessel)';
        // R = pR, L_cyl = pH. Head depth = R/2 (standard 2:1 ASME head)
        const headH = pR / 2;
        const vCyl = PI * Math.pow(pR, 2) * pH;
        // Two 2:1 elliptical heads volume = 2 * ( (2/3)*pi*R^2 * (R/2) ) = (2/3)*pi*R^3
        const vHeads = (2 / 3) * PI * Math.pow(pR, 3);
        volume = vCyl + vHeads;
        const sCylLat = 2 * PI * pR * pH;
        // Surface of each 2:1 elliptical head approx: 1.084 * pi * R^2
        const sHeads = 2 * 1.084 * PI * Math.pow(pR, 2);
        surfaceLateral = sCylLat + sHeads;
        surfaceTotal = surfaceLateral;
        formulaDesc = 'Serbatoio a pressione industriale: mantello cilindrico + 2 fondi bombati ellittici ASME 2:1';
        steps = [
          { label: 'Raggio cilindro R', formula: 'R', value: `${pR} m` },
          { label: 'Lunghezza cilindro L', formula: 'L', value: `${pH} m` },
          { label: 'Profondità fondo ellittico', formula: 'R / 2', value: `${headH.toFixed(4)} m` },
          { label: 'Superficie Totale S', formula: 'S_cil + 2·S_fondo', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Totale Tank V', formula: 'V_cil + V_2teste', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Volume dei due fondi bombati', value: `${vHeads.toFixed(4)} m³` },
          { label: 'Lunghezza totale da testa a testa', value: `${(pH + 2 * headH).toFixed(4)} m` }
        ];
        break;
      }

      // 30. Unghia Cilindrica (Cylindrical Ungula)
      case 'cylindrical_ungula': {
        shapeTitle = 'Unghia Cilindrica (Cylindrical Ungula)';
        // r = pR, h = pH (cylinder cut with a plane passing through base diameter)
        volume = (2 / 3) * Math.pow(pR, 2) * pH;
        surfaceLateral = 2 * pR * pH;
        baseArea = 0.5 * PI * Math.pow(pR, 2);
        const slopedArea = 0.5 * PI * pR * Math.hypot(pR, pH);
        surfaceTotal = baseArea + surfaceLateral + slopedArea;
        formulaDesc = 'Volume V = (2/3)·r²·h  |  Superficie laterale ricurva S_lat = 2·r·h';
        steps = [
          { label: 'Raggio cilindro base r', formula: 'r', value: `${pR} m` },
          { label: 'Altezza massima al bordo h', formula: 'h', value: `${pH} m` },
          { label: 'Superficie curvata laterale', formula: '2·r·h', value: `${surfaceLateral.toFixed(6)} m²` },
          { label: 'Superficie Totale S', formula: 'Base + Laterale + Faccia obliqua', value: `${surfaceTotal.toFixed(6)} m²` },
          { label: 'Volume Unghia V', formula: '(2/3)·r²·h', value: `${volume.toFixed(6)} m³` }
        ];
        secondaryProps = [
          { label: 'Frazione di cilindro dimezzato', value: '42.44 % del semi-cilindro' }
        ];
        break;
      }

      // 31. Poligono Regolare 2D (da 3 a 100 lati)
      case 'regular_polygon': {
        shapeTitle = `Poligono Regolare Piano a ${pN} Lati (Regular Polygon)`;
        const sideS = pA;
        const perimetro = pN * sideS;
        const apotema = sideS / (2 * Math.tan(PI / pN));
        baseArea = (pN * Math.pow(sideS, 2)) / (4 * Math.tan(PI / pN));
        surfaceTotal = baseArea;
        volume = 0; // 2D surface
        const raggioCirc = sideS / (2 * Math.sin(PI / pN));
        formulaDesc = `Area A = (n·s²)/(4·tan(π/n))  |  Perimetro P = n·s  |  Apotema = s/(2·tan(π/n))`;
        steps = [
          { label: `Numero lati n`, formula: 'n', value: `${pN}` },
          { label: 'Lunghezza lato s', formula: 's', value: `${sideS} m` },
          { label: 'Apotema (raggio inscritto)', formula: 's / (2·tan(π/n))', value: `${apotema.toFixed(4)} m` },
          { label: 'Perimetro P', formula: 'n · s', value: `${perimetro.toFixed(4)} m` },
          { label: 'Area Superficiale 2D A', formula: '(n·s²)/(4·tan(π/n))', value: `${baseArea.toFixed(6)} m²` }
        ];
        secondaryProps = [
          { label: 'Perimetro (P)', value: `${perimetro.toFixed(4)} m` },
          { label: 'Apotema', value: `${apotema.toFixed(4)} m` },
          { label: 'Raggio circumcerchio', value: `${raggioCirc.toFixed(4)} m` }
        ];
        break;
      }

      // 32. Triangolo Universale (Formula di Erone)
      case 'triangle_heron': {
        shapeTitle = 'Triangolo Universale (Formula di Erone & Qualsiasi Triangolo)';
        // Sides a, b, c
        const sPerim = (pA + pB + pC) / 2;
        const radicando = sPerim * (sPerim - pA) * (sPerim - pB) * (sPerim - pC);
        const isValid = radicando > 0;
        baseArea = isValid ? Math.sqrt(radicando) : 0;
        surfaceTotal = baseArea;
        volume = 0;
        const perimetro = pA + pB + pC;
        formulaDesc = 'Formula di Erone: A = √[s·(s-a)·(s-b)·(s-c)]  dove s = (a+b+c)/2';
        steps = [
          { label: 'Lati (a, b, c)', formula: 'a, b, c', value: `${pA} m, ${pB} m, ${pC} m` },
          { label: 'Semiperimetro s', formula: '(a + b + c) / 2', value: `${sPerim.toFixed(4)} m` },
          { label: 'Perimetro totale P', formula: 'a + b + c', value: `${perimetro.toFixed(4)} m` },
          { label: 'Area Triangolo A', formula: 'Formula di Erone', value: isValid ? `${baseArea.toFixed(6)} m²` : 'Triangolo impossibile (disuguaglianza triangolare non rispettata)' }
        ];
        secondaryProps = [
          { label: 'Raggio cerchio inscritto r', value: isValid ? `${(baseArea / sPerim).toFixed(4)} m` : '-' },
          { label: 'Raggio circumcerchio R', value: isValid ? `${((pA * pB * pC) / (4 * baseArea)).toFixed(4)} m` : '-' }
        ];
        break;
      }

      // 33. Cerchio & Corona Circolare
      case 'circle_ring': {
        shapeTitle = 'Cerchio & Corona Circolare (Circle & Annulus)';
        const R_ext = Math.max(pR, pR2);
        const r_int = Math.min(pR, pR2);
        const areaCerchio = PI * Math.pow(R_ext, 2);
        const areaCorona = PI * (Math.pow(R_ext, 2) - Math.pow(r_int, 2));
        baseArea = areaCorona;
        surfaceTotal = areaCorona;
        volume = 0;
        formulaDesc = 'Area Cerchio = π·R²  |  Area Corona Circolare = π·(R² - r²)';
        steps = [
          { label: 'Raggio esterno R', formula: 'R', value: `${R_ext} m` },
          { label: 'Raggio interno r', formula: 'r', value: `${r_int} m` },
          { label: 'Area Cerchio pieno esterno', formula: 'π·R²', value: `${areaCerchio.toFixed(6)} m²` },
          { label: 'Area Corona Circolare A', formula: 'π·(R² - r²)', value: `${areaCorona.toFixed(6)} m²` }
        ];
        secondaryProps = [
          { label: 'Circonferenza esterna', value: `${(2 * PI * R_ext).toFixed(4)} m` },
          { label: 'Circonferenza interna', value: `${(2 * PI * r_int).toFixed(4)} m` },
          { label: 'Larghezza corona (R - r)', value: `${(R_ext - r_int).toFixed(4)} m` }
        ];
        break;
      }

      // 34. Settore & Segmento Circolare
      case 'circle_sector': {
        shapeTitle = 'Settore & Segmento Circolare (Circle Sector & Segment)';
        const rad = (pAngle * PI) / 180;
        const areaSettore = 0.5 * Math.pow(pR, 2) * rad;
        // Segment area = 0.5 * r^2 * (rad - sin(rad))
        const areaSegmento = 0.5 * Math.pow(pR, 2) * (rad - Math.sin(rad));
        const lunghezzaArco = pR * rad;
        baseArea = areaSettore;
        surfaceTotal = areaSettore;
        volume = 0;
        formulaDesc = 'Area Settore = (θ/360)·π·r²  |  Area Segmento = (r²/2)·(θ_rad - sin(θ_rad))';
        steps = [
          { label: 'Raggio r e Angolo θ', formula: 'r, θ', value: `${pR} m, ${pAngle}°` },
          { label: 'Lunghezza arco circolare L', formula: 'r · θ_rad', value: `${lunghezzaArco.toFixed(4)} m` },
          { label: 'Area Settore Circolare', formula: '(1/2)·r²·θ_rad', value: `${areaSettore.toFixed(6)} m²` },
          { label: 'Area Segmento Circolare (fetta sottesa)', formula: '(1/2)·r²·(θ - sin θ)', value: `${areaSegmento.toFixed(6)} m²` }
        ];
        secondaryProps = [
          { label: 'Lunghezza corda sottesa', value: `${(2 * pR * Math.sin(rad / 2)).toFixed(4)} m` },
          { label: 'Area triangolo centrale', value: `${(0.5 * Math.pow(pR, 2) * Math.sin(rad)).toFixed(4)} m²` }
        ];
        break;
      }

      // 35. Ellisse 2D (Formula di Ramanujan per il perimetro)
      case 'ellipse_2d': {
        shapeTitle = 'Ellisse 2D (Planar Ellipse)';
        baseArea = PI * pA * pB;
        surfaceTotal = baseArea;
        volume = 0;
        // Ramanujan perimeter approximation:
        const perim = PI * (3 * (pA + pB) - Math.sqrt((3 * pA + pB) * (pA + 3 * pB)));
        const e = Math.sqrt(Math.max(0, 1 - Math.pow(Math.min(pA, pB) / Math.max(pA, pB), 2)));
        formulaDesc = 'Area A = π·a·b  |  Perimetro P ≈ π·[3(a+b) - √((3a+b)(a+3b))] (Ramanujan)';
        steps = [
          { label: 'Semiassi (a, b)', formula: 'a, b', value: `${pA} m, ${pB} m` },
          { label: 'Eccentricità ellittica e', formula: '√(1 - b²/a²)', value: `${e.toFixed(6)}` },
          { label: 'Perimetro di Ramanujan P', formula: 'Formula esatta Ramanujan', value: `${perim.toFixed(6)} m` },
          { label: 'Area Ellisse A', formula: 'π·a·b', value: `${baseArea.toFixed(6)} m²` }
        ];
        secondaryProps = [
          { label: 'Distanza focale 2c', value: `${(2 * Math.sqrt(Math.abs(pA * pA - pB * pB))).toFixed(4)} m` },
          { label: 'Eccentricità (e)', value: `${e.toFixed(5)}` }
        ];
        break;
      }

      // 36. Trapezio
      case 'trapezoid': {
        shapeTitle = 'Trapezio (Scaleno, Isoscele o Rettangolo)';
        // bases a, b, height h
        baseArea = ((pA + pB) * pH) / 2;
        surfaceTotal = baseArea;
        volume = 0;
        formulaDesc = 'Area A = ((Base_maggiore + Base_minore) · Altezza) / 2';
        steps = [
          { label: 'Base maggiore B', formula: 'B', value: `${Math.max(pA, pB)} m` },
          { label: 'Base minore b', formula: 'b', value: `${Math.min(pA, pB)} m` },
          { label: 'Altezza h', formula: 'h', value: `${pH} m` },
          { label: 'Area Trapezio A', formula: '((B + b) · h) / 2', value: `${baseArea.toFixed(6)} m²` }
        ];
        secondaryProps = [
          { label: 'Lunghezza linea mediana', value: `${((pA + pB) / 2).toFixed(4)} m` }
        ];
        break;
      }

      // 37. Rombo & Aquilone
      case 'rhombus_kite': {
        shapeTitle = 'Rombo & Aquilone (Rhombus & Kite)';
        // diagonals d1 = pA, d2 = pB
        baseArea = (pA * pB) / 2;
        surfaceTotal = baseArea;
        volume = 0;
        const sideRhombus = Math.hypot(pA / 2, pB / 2);
        formulaDesc = 'Area A = (Diagonale₁ · Diagonale₂) / 2  |  Rombo: 4 lati uguali';
        steps = [
          { label: 'Diagonale maggiore d₁', formula: 'd₁', value: `${Math.max(pA, pB)} m` },
          { label: 'Diagonale minore d₂', formula: 'd₂', value: `${Math.min(pA, pB)} m` },
          { label: 'Lato del rombo (se rombo)', formula: '√((d₁/2)² + (d₂/2)²)', value: `${sideRhombus.toFixed(4)} m` },
          { label: 'Area Rombo/Aquilone A', formula: '(d₁ · d₂) / 2', value: `${baseArea.toFixed(6)} m²` }
        ];
        secondaryProps = [
          { label: 'Perimetro (se rombo regolare)', value: `${(4 * sideRhombus).toFixed(4)} m` }
        ];
        break;
      }

      // 38. Ipersfera 4D (Glome)
      case 'glome_4d': {
        shapeTitle = 'Ipersfera 4D / Glome (4-Dimensional Hypersphere)';
        // R = pR. 4-Volume = (1/2)*pi^2 * R^4. 3-Surface = 2*pi^2 * R^3
        volume = 0.5 * Math.pow(PI, 2) * Math.pow(pR, 4); // 4D Volume in m^4
        surfaceTotal = 2 * Math.pow(PI, 2) * Math.pow(pR, 3); // 3D boundary in m^3
        formulaDesc = 'Ipervolume 4D V₄ = (1/2)·π²·R⁴  |  Ipersuperficie di confine 3D S₄ = 2·π²·R³';
        steps = [
          { label: 'Iper-raggio R', formula: 'R', value: `${pR} m` },
          { label: 'Formula Volume 4D', formula: '(1/2)·π²·R⁴', value: `${volume.toFixed(6)} m⁴ (Iper-metri cubi)` },
          { label: 'Ipersuperficie di confine 3D', formula: '2·π²·R³', value: `${surfaceTotal.toFixed(6)} m³ (Volume di confine 3D)` }
        ];
        secondaryProps = [
          { label: 'Iper-diametro', value: `${(2 * pR).toFixed(4)} m` },
          { label: 'Rapporto Ipersuperficie/Volume (S₄/V₄)', value: `${(4 / pR).toFixed(4)} m⁻¹` }
        ];
        break;
      }

      // 39. Tesseract (Ipercubo 4D)
      case 'tesseract_4d': {
        shapeTitle = 'Tesseract / Ipercubo 4D (8-Cell / 4D Hypercube)';
        // side a = pA
        volume = Math.pow(pA, 4); // 4D volume in m^4
        surfaceTotal = 8 * Math.pow(pA, 3); // 8 cubic boundary cells
        formulaDesc = 'Ipervolume V₄ = a⁴  |  Superficie di confine 3D (8 cubi): S₄ = 8·a³';
        steps = [
          { label: 'Spigolo 4D a', formula: 'a', value: `${pA} m` },
          { label: 'Celle di confine cubiche 3D', formula: '8 cubi da a³', value: `8 celle da ${(Math.pow(pA, 3)).toFixed(4)} m³` },
          { label: 'Superficie di confine 3D', formula: '8·a³', value: `${surfaceTotal.toFixed(6)} m³` },
          { label: 'Ipervolume 4D V₄', formula: 'a⁴', value: `${volume.toFixed(6)} m⁴` }
        ];
        secondaryProps = [
          { label: 'Diagonale quadridimensionale', value: `${(2 * pA).toFixed(4)} m (a·√4)` },
          { label: 'Numero di vertici', value: '16 vertici' },
          { label: 'Numero di spigoli', value: '32 spigoli' },
          { label: 'Numero di facce quadrate', value: '24 facce quadrate' }
        ];
        break;
      }

      // 40. Ipersfera n-Dimensionale
      case 'hypersphere_nd': {
        shapeTitle = `Ipersfera ${pDimN}-Dimensionale (n-Sphere con Funzione Gamma)`;
        // V_n = (pi^(n/2) / Gamma(n/2 + 1)) * R^n
        // S_n = n * (pi^(n/2) / Gamma(n/2 + 1)) * R^(n-1)
        const halfN = pDimN / 2;
        const gammaVal = gammaApprox(halfN + 1);
        volume = (Math.pow(PI, halfN) / gammaVal) * Math.pow(pR, pDimN);
        surfaceTotal = (pDimN * Math.pow(PI, halfN) / gammaVal) * Math.pow(pR, pDimN - 1);
        formulaDesc = `V_n = [ π^(n/2) / Γ(n/2 + 1) ] · R^n  |  S_n = n · V_n / R  (n = ${pDimN})`;
        steps = [
          { label: `Dimensione spazio n`, formula: 'n', value: `${pDimN}` },
          { label: 'Raggio R', formula: 'R', value: `${pR} m` },
          { label: 'Valore Funzione Gamma Γ(n/2 + 1)', formula: 'Γ(z)', value: `${gammaVal.toFixed(6)}` },
          { label: `Iper-volume ${pDimN}D`, formula: 'V_n(R)', value: `${volume.toFixed(6)} m^${pDimN}` },
          { label: `Iper-superficie di confine (${pDimN-1}D)`, formula: 'S_n(R)', value: `${surfaceTotal.toFixed(6)} m^${pDimN-1}` }
        ];
        secondaryProps = [
          { label: `Unità di misura del Volume`, value: `m^${pDimN}` },
          { label: `Unità di misura della Superficie`, value: `m^${pDimN-1}` }
        ];
        break;
      }

      default:
        break;
    }

    return {
      shapeTitle,
      volume,
      surfaceTotal,
      surfaceLateral,
      baseArea,
      formulaDesc,
      steps,
      secondaryProps
    };
  }, [
    activeShape,
    pR,
    pR2,
    pH,
    pH2,
    pA,
    pB,
    pC,
    pD,
    pN,
    pAngle,
    pDimN
  ]);

  // Mass / Weight calculation based on selected material density
  const selectedMaterial = MATERIALS[selectedMaterialIdx] || MATERIALS[0];
  const massKg = calculation.volume * selectedMaterial.density;
  const massTonnes = massKg / 1000;
  const massLbs = massKg * 2.20462;

  // Simultaneous multi-unit conversion tables
  const volumeUnits = useMemo(() => {
    const vM3 = calculation.volume;
    return [
      { unit: 'Metri cubi (m³)', val: vM3 },
      { unit: 'Litri (L / dm³)', val: vM3 * 1000 },
      { unit: 'Centimetri cubi (cm³ / ml)', val: vM3 * 1000000 },
      { unit: 'Millimetri cubi (mm³)', val: vM3 * 1000000000 },
      { unit: 'Galloni USA (gal)', val: vM3 * 264.172 },
      { unit: 'Galloni Imperiali UK', val: vM3 * 219.969 },
      { unit: 'Barili di Petrolio (bbl)', val: (vM3 * 1000) / 158.987 },
      { unit: 'Piedi cubi (ft³)', val: vM3 * 35.3147 },
      { unit: 'Pollici cubi (in³)', val: vM3 * 61023.7 },
      { unit: 'Chilometri cubi (km³)', val: vM3 * 1e-9 }
    ];
  }, [calculation.volume]);

  const surfaceUnits = useMemo(() => {
    const sM2 = calculation.surfaceTotal;
    return [
      { unit: 'Metri quadri (m²)', val: sM2 },
      { unit: 'Centimetri quadri (cm²)', val: sM2 * 10000 },
      { unit: 'Millimetri quadri (mm²)', val: sM2 * 1000000 },
      { unit: 'Ettari (ha = 10.000 m²)', val: sM2 / 10000 },
      { unit: 'Are (a = 100 m²)', val: sM2 / 100 },
      { unit: 'Acri (ac)', val: sM2 / 4046.86 },
      { unit: 'Piedi quadri (ft²)', val: sM2 * 10.7639 },
      { unit: 'Pollici quadri (in²)', val: sM2 * 1550 },
      { unit: 'Chilometri quadri (km²)', val: sM2 * 1e-6 }
    ];
  }, [calculation.surfaceTotal]);

  // Live Wireframe Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Styling
    ctx.save();
    const cx = width / 2;
    const cy = height / 2;
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Simple isometric projection helpers
    const drawEllipse = (x: number, y: number, rx: number, ry: number) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    };

    if (activeShape === 'sphere' || activeShape === 'glome_4d') {
      const radius = 65;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      // Equator & meridian
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.setLineDash([4, 4]);
      drawEllipse(cx, cy, radius, radius * 0.35);
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 0.35, radius, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (activeShape === 'cylinder' || activeShape === 'hollow_cylinder' || activeShape === 'horizontal_tank') {
      const rx = 60;
      const ry = 22;
      const h_px = 90;
      // top
      drawEllipse(cx, cy - h_px / 2, rx, ry);
      // sides
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy - h_px / 2);
      ctx.lineTo(cx - rx, cy + h_px / 2);
      ctx.lineTo(cx + rx, cy + h_px / 2);
      ctx.lineTo(cx + rx, cy - h_px / 2);
      ctx.fill();
      ctx.stroke();
      // bottom
      drawEllipse(cx, cy + h_px / 2, rx, ry);
    } else if (activeShape === 'cone' || activeShape === 'conical_frustum') {
      const rx = 60;
      const ry = 22;
      const h_px = 100;
      drawEllipse(cx, cy + h_px / 2, rx, ry);
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy + h_px / 2);
      ctx.lineTo(cx, cy - h_px / 2);
      ctx.lineTo(cx + rx, cy + h_px / 2);
      ctx.stroke();
    } else if (activeShape === 'torus' || activeShape === 'elliptical_torus') {
      drawEllipse(cx, cy, 80, 40);
      drawEllipse(cx, cy, 35, 18);
    } else if (activeShape === 'cube' || activeShape === 'cuboid' || activeShape === 'tesseract_4d') {
      const s = 65;
      const ox = 25;
      const oy = -25;
      // back square
      ctx.strokeRect(cx - s / 2 + ox, cy - s / 2 + oy, s, s);
      // connecting lines
      ctx.beginPath();
      ctx.moveTo(cx - s / 2, cy - s / 2);
      ctx.lineTo(cx - s / 2 + ox, cy - s / 2 + oy);
      ctx.moveTo(cx + s / 2, cy - s / 2);
      ctx.lineTo(cx + s / 2 + ox, cy - s / 2 + oy);
      ctx.moveTo(cx - s / 2, cy + s / 2);
      ctx.lineTo(cx - s / 2 + ox, cy + s / 2 + oy);
      ctx.moveTo(cx + s / 2, cy + s / 2);
      ctx.lineTo(cx + s / 2 + ox, cy + s / 2 + oy);
      ctx.stroke();
      // front square
      ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
      ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
    } else if (activeShape === 'regular_pyramid' || activeShape === 'tetrahedron' || activeShape === 'octahedron') {
      const baseW = 75;
      const baseH = 30;
      const h_px = 90;
      ctx.beginPath();
      ctx.moveTo(cx - baseW, cy + baseH);
      ctx.lineTo(cx, cy - h_px);
      ctx.lineTo(cx + baseW, cy + baseH);
      ctx.lineTo(cx, cy + baseH * 1.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - h_px);
      ctx.lineTo(cx, cy + baseH * 1.8);
      ctx.stroke();
    } else if (activeShape === 'ellipsoid' || activeShape === 'oblate_spheroid' || activeShape === 'prolate_spheroid') {
      const rx = 75;
      const ry = activeShape === 'oblate_spheroid' ? 45 : 65;
      drawEllipse(cx, cy, rx, ry);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.setLineDash([4, 4]);
      drawEllipse(cx, cy, rx, ry * 0.4);
      ctx.setLineDash([]);
    } else {
      // General polygon / other shapes
      const sides = Math.min(12, pN);
      const rad = 65;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const ang = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const px = cx + rad * Math.cos(ang);
        const py = cy + rad * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }, [activeShape, pN]);

  // Presets of iconic world structures
  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'earth':
        setActiveFamily('ellipsoids');
        setActiveShape('oblate_spheroid');
        setA('6378137'); // Equator 6,378.137 km
        setC('6356752'); // Poles 6,356.752 km
        showToast('Caricato: Pianeta Terra (Geoide WGS84 - 6.378 km)');
        break;
      case 'cheops':
        setActiveFamily('polyhedra');
        setActiveShape('regular_pyramid');
        setNSides('4');
        setA('230.4'); // Giza base
        setH('146.6'); // Height
        showToast('Caricato: Grande Piramide di Cheope (Giza)');
        break;
      case 'olympic_pool':
        setActiveFamily('polyhedra');
        setActiveShape('cuboid');
        setA('50'); // 50m
        setB('25'); // 25m
        setC('2'); // 2m
        showToast('Caricato: Piscina Olimpionica FINA (2.500.000 Litri)');
        break;
      case 'tank_5000l':
        setActiveFamily('tanks_real');
        setActiveShape('horizontal_tank');
        setR('0.6');
        setH('4.42');
        setD('0.6'); // Half full
        showToast('Caricato: Cisterna GPL Orizzontale (5.000 Litri)');
        break;
      case 'barrel_bbl':
        setActiveFamily('tanks_real');
        setActiveShape('kepler_barrel');
        setR('0.30'); // D = 60cm
        setR2('0.27'); // d = 54cm
        setH('0.88'); // 88cm
        showToast('Caricato: Barile Petrolio Standard (42 Gal / 159 L)');
        break;
      case 'soccer_ball':
        setActiveFamily('solids_rot');
        setActiveShape('sphere');
        setR('0.11'); // 11cm = 22cm diam
        showToast('Caricato: Pallone da Calcio FIFA Taglia 5 (22 cm diametro)');
        break;
      case 'tokamak':
        setActiveFamily('solids_rot');
        setActiveShape('torus');
        setR('6.2'); // ITER major radius
        setR2('2.0'); // minor radius
        showToast('Caricato: Toroide Reattore Fusione Nucleare ITER');
        break;
      case 'tesseract':
        setActiveFamily('hyperspace_4d');
        setActiveShape('tesseract_4d');
        setA('1');
        showToast('Caricato: Ipercubo 4D Tesseract (1 metro)');
        break;
      default:
        break;
    }
  };

  // Save calculation to history
  const handleSaveToHistory = () => {
    onSaveHistory({
      calculatorId: 'geometry-surface-volume',
      calculatorTitle: `Geometria: ${calculation.shapeTitle}`,
      summary: `V = ${calculation.volume.toFixed(4)} m³ | S = ${calculation.surfaceTotal.toFixed(4)} m²`,
      details: [
        { label: 'Forma Geometrica', value: calculation.shapeTitle },
        { label: 'Superficie Totale', value: `${calculation.surfaceTotal.toFixed(4)} m²` },
        { label: 'Volume Totale', value: `${calculation.volume.toFixed(4)} m³` },
        { label: 'Massa stimata', value: `${massKg.toFixed(2)} kg (${selectedMaterial.nameIt})` }
      ],
      formula: calculation.formulaDesc,
      inputs: {
        activeShape,
        r,
        r2,
        h,
        a,
        b,
        c
      }
    });
    showToast('Calcolo salvato nella cronologia!');
  };

  // Copy result text
  const handleCopySummary = () => {
    const text = `${calculation.shapeTitle}\nVolume: ${calculation.volume.toFixed(6)} m³ (${(calculation.volume * 1000).toFixed(2)} L)\nSuperficie Totale: ${calculation.surfaceTotal.toFixed(6)} m²\nMassa (${selectedMaterial.name}): ${massKg.toFixed(2)} kg\nFormula: ${calculation.formulaDesc}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Riepilogo geometrico copiato negli appunti!');
    }
  };

  // Filter shapes for fast comprehensive search across ALL shapes
  const allShapesList: { id: ShapeId; name: string; family: GeoFamily; desc: string; tags: string[] }[] = useMemo(
    () => [
      { id: 'sphere', name: 'Sfera Perfetta', family: 'solids_rot', desc: 'V = (4/3)πr³, S = 4πr²', tags: ['sfera', 'palla', 'globo', 'ball', 'sphere'] },
      { id: 'hemisphere', name: 'Emisfero', family: 'solids_rot', desc: 'V = (2/3)πr³, S = 3πr²', tags: ['emisfero', 'mezza sfera', 'cupola', 'mezzasfera'] },
      { id: 'cylinder', name: 'Cilindro Circolare Retto', family: 'solids_rot', desc: 'V = πr²h, S = 2πr(r+h)', tags: ['cilindro', 'colonna', 'rullo', 'cylinder'] },
      { id: 'hollow_cylinder', name: 'Cilindro Cavo / Tubo', family: 'solids_rot', desc: 'V = π(R²-r²)h, tubo con spessore', tags: ['tubo', 'spessore', 'cilindro cavo', 'pipe'] },
      { id: 'cone', name: 'Cono Circolare Retto', family: 'solids_rot', desc: 'V = (1/3)πr²h, apotema g', tags: ['cono', 'cappello', 'cono stradale', 'cone'] },
      { id: 'conical_frustum', name: 'Tronco di Cono', family: 'solids_rot', desc: 'V = (πh/3)(R²+Rr+r²)', tags: ['tronco di cono', 'bicchiere', 'secchio', 'vaso'] },
      { id: 'torus', name: 'Toroide / Ciambella', family: 'solids_rot', desc: 'V = 2π²Rr², S = 4π²Rr', tags: ['toro', 'toroide', 'ciambella', 'donut', 'torus'] },
      { id: 'spherical_cap', name: 'Calotta & Cupola Sferica', family: 'solids_rot', desc: 'V = (πh²/3)(3R-h), cupole', tags: ['calotta', 'cupola', 'calotta sferica', 'dome'] },
      { id: 'spherical_zone', name: 'Zona Sferica a Due Basi', family: 'solids_rot', desc: 'Tronco di sfera a due basi r₁, r²', tags: ['zona sferica', 'tronco sfera', 'fascia'] },
      { id: 'spherical_wedge', name: 'Spicchio & Fuso Sferico', family: 'solids_rot', desc: 'Angolo diedro θ gradi', tags: ['spicchio', 'fuso sferico', 'angolo diedro', 'fetta arancia'] },
      { id: 'paraboloid', name: 'Paraboloide di Rotazione', family: 'solids_rot', desc: 'V = (1/2)πr²h, ciotola parabolica', tags: ['paraboloide', 'antenna parabolica', 'ciotola'] },

      { id: 'cube', name: 'Cubo / Esaedro Regolare', family: 'polyhedra', desc: 'V = a³, S = 6a²', tags: ['cubo', 'dado', 'esaedro', 'scatola', 'cube'] },
      { id: 'cuboid', name: 'Parallelepipedo Rettangolo', family: 'polyhedra', desc: 'V = abc, S = 2(ab+bc+ca)', tags: ['parallelepipedo', 'rettangolo', 'scatola', 'pacco', 'mattone', 'box'] },
      { id: 'regular_prism', name: 'Prisma Regolare a n Lati', family: 'polyhedra', desc: 'Prisma a base poligonale regolare', tags: ['prisma', 'prisma regolare', 'colonna poligonale'] },
      { id: 'regular_pyramid', name: 'Piramide Regolare a n Lati', family: 'polyhedra', desc: 'Base n lati, apotema laterale', tags: ['piramide', 'cheope', 'egitto', 'pyramid'] },
      { id: 'pyramidal_frustum', name: 'Tronco di Piramide', family: 'polyhedra', desc: 'Basi parallele s₁, s₂', tags: ['tronco di piramide', 'mastaba', 'frustum'] },
      { id: 'tetrahedron', name: 'Tetraedro Regolare', family: 'polyhedra', desc: '4 facce triangolari equilatere', tags: ['tetraedro', '4 facce', 'triangoli equilateri'] },
      { id: 'octahedron', name: 'Ottaedro Regolare', family: 'polyhedra', desc: '8 facce triangolari', tags: ['ottaedro', '8 facce', 'diamante'] },
      { id: 'dodecahedron', name: 'Dodecaedro Regolare', family: 'polyhedra', desc: '12 facce pentagonali', tags: ['dodecaedro', '12 facce', 'pentagoni'] },
      { id: 'icosahedron', name: 'Icosaedro Regolare', family: 'polyhedra', desc: '20 facce triangolari', tags: ['icosaedro', '20 facce', 'd20'] },
      { id: 'wedge', name: 'Cuneo Geometrico (Wedge)', family: 'polyhedra', desc: 'Base rettangolare con colmo', tags: ['cuneo', 'wedge', 'zeppa', 'tetto'] },

      { id: 'ellipsoid', name: 'Ellissoide Triassiale', family: 'ellipsoids', desc: 'Semiassi a, b, c (Knud Thomsen)', tags: ['ellissoide', 'uovo', 'anguria', 'ellipsoid'] },
      { id: 'oblate_spheroid', name: 'Sferoide Oblato (Pianeti)', family: 'ellipsoids', desc: 'Terra WGS84, schiacciato ai poli', tags: ['terra', 'pianeta', 'sferoide oblato', 'wgs84'] },
      { id: 'prolate_spheroid', name: 'Sferoide Prolato (Rugby)', family: 'ellipsoids', desc: 'Allungato lungo asse di rotazione', tags: ['rugby', 'sferoide prolato', 'allungato'] },
      { id: 'elliptical_torus', name: 'Toroide Ellittico', family: 'ellipsoids', desc: 'Ciambella a sezione ellittica', tags: ['toroide ellittico', 'ciambella ovale'] },

      { id: 'horizontal_tank', name: 'Cisterna Orizzontale con Livello', family: 'tanks_real', desc: 'Calcolo litri liquidi a livello d', tags: ['cisterna', 'serbatoio', 'livello liquidi', 'tank', 'gasolio', 'acqua', 'litri'] },
      { id: 'silo_conical', name: 'Silos Verticale con Fondo Conico', family: 'tanks_real', desc: 'Cilindro + tramoggia di scarico', tags: ['silos', 'silo', 'tramoggia', 'cereali', 'grano', 'cemento'] },
      { id: 'kepler_barrel', name: 'Botte / Barile di Keplero', family: 'tanks_real', desc: 'Vino e whisky a doghe paraboliche', tags: ['botte', 'barile', 'keplero', 'vino', 'whisky', 'birra', 'doghe', 'barrel'] },
      { id: 'asme_tank', name: 'Serbatoio ASME Fondi Bombati', family: 'tanks_real', desc: 'Teste semi-ellittiche 2:1 a pressione', tags: ['asme', 'serbatoio a pressione', 'autoclave', 'fondi bombati'] },
      { id: 'cylindrical_ungula', name: 'Unghia Cilindrica', family: 'tanks_real', desc: 'Cilindro troncato diagonalmente', tags: ['unghia cilindrica', 'cilindro tagliato', 'ungula'] },

      { id: 'regular_polygon', name: 'Poligono Regolare 2D', family: 'surfaces_2d', desc: 'Qualsiasi poligono n lati (3..100)', tags: ['poligono', 'esagono', 'pentagono', 'ottagono', 'decagono'] },
      { id: 'triangle_heron', name: 'Triangolo Universale (Erone)', family: 'surfaces_2d', desc: 'Formula di Erone con i 3 lati a, b, c', tags: ['triangolo', 'erone', '3 lati', 'scaleno', 'isoscele', 'equilatero'] },
      { id: 'circle_ring', name: 'Cerchio & Corona Circolare', family: 'surfaces_2d', desc: 'Superfici piane circolari', tags: ['cerchio', 'corona circolare', 'anello', 'disco', 'area cerchio'] },
      { id: 'circle_sector', name: 'Settore & Segmento Circolare', family: 'surfaces_2d', desc: 'Fetta angolare e corda sottesa', tags: ['settore circolare', 'segmento circolare', 'fetta torta', 'arco'] },
      { id: 'ellipse_2d', name: 'Ellisse 2D (Ramanujan)', family: 'surfaces_2d', desc: 'Area πab e perimetro ellittico', tags: ['ellisse', 'perimetro ramanujan', 'ovale'] },
      { id: 'trapezoid', name: 'Trapezio', family: 'surfaces_2d', desc: 'Area (B+b)h/2', tags: ['trapezio', 'base maggiore', 'base minore', 'altezza'] },
      { id: 'rhombus_kite', name: 'Rombo & Aquilone', family: 'surfaces_2d', desc: 'Area d₁d₂/2', tags: ['rombo', 'aquilone', 'diagonali'] },

      { id: 'glome_4d', name: 'Ipersfera 4D (Glome)', family: 'hyperspace_4d', desc: 'V₄ = (1/2)π²R⁴, S₄ = 2π²R³', tags: ['ipersfera', 'glome', '4d', 'quarta dimensione'] },
      { id: 'tesseract_4d', name: 'Tesseract (Ipercubo 4D)', family: 'hyperspace_4d', desc: 'V₄ = a⁴, 8 cubi di confine 3D', tags: ['tesseract', 'ipercubo', '4d', 'ipercubo 4d'] },
      { id: 'hypersphere_nd', name: 'Ipersfera n-Dimensionale', family: 'hyperspace_4d', desc: 'Qualsiasi dimensione con Funzione Gamma', tags: ['ipersfera nd', 'n dimensioni', 'gamma function'] }
    ],
    []
  );

  const filteredShapes = useMemo(() => {
    if (!searchFilter.trim()) {
      return allShapesList.filter((s) => s.family === activeFamily);
    }
    const q = searchFilter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const tokens = q.split(/\s+/).filter(Boolean);

    return allShapesList.filter((s) => {
      const corpus = `${s.name} ${s.desc} ${s.id} ${s.family} ${s.tags.join(' ')}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return tokens.every((token) => corpus.includes(token));
    });
  }, [allShapesList, activeFamily, searchFilter]);

  return (
    <div className="space-y-6">
      {/* Top Presets Bar - Real-World Iconic Shapes */}
      <div className="p-3 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
              Preset Reali del Mondo
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
            Tocca per caricare istantaneamente forme iconiche
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => applyPreset('earth')}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 border border-slate-200/70 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            🌍 Pianeta Terra (Geoide)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('cheops')}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 border border-slate-200/70 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            🔺 Piramide di Cheope
          </button>
          <button
            type="button"
            onClick={() => applyPreset('olympic_pool')}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 border border-slate-200/70 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            🏊 Piscina Olimpionica
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tank_5000l')}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 border border-slate-200/70 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            ⛽ Cisterna GPL 5000L
          </button>
          <button
            type="button"
            onClick={() => applyPreset('barrel_bbl')}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 border border-slate-200/70 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            🛢️ Barile Petrolio 42gal
          </button>
          <button
            type="button"
            onClick={() => applyPreset('soccer_ball')}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 border border-slate-200/70 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            ⚽ Pallone FIFA Taglia 5
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tokamak')}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 border border-slate-200/70 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            🍩 Reattore Tokamak ITER
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tesseract')}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 border border-slate-200/70 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            🌀 Ipercubo 4D Tesseract
          </button>
        </div>
      </div>

      {/* Geometric Families Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100/90 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'solids_rot' as GeoFamily, label: 'Rotazione & Sferici', count: 11 },
            { id: 'polyhedra' as GeoFamily, label: 'Poliedri & Prismi', count: 10 },
            { id: 'ellipsoids' as GeoFamily, label: 'Ellissoidi & Pianeti', count: 4 },
            { id: 'tanks_real' as GeoFamily, label: 'Cisterne & Ingegneria', count: 5 },
            { id: 'surfaces_2d' as GeoFamily, label: 'Superfici 2D del Mondo', count: 7 },
            { id: 'hyperspace_4d' as GeoFamily, label: '4D & Iperspazio', count: 3 }
          ].map((tab) => {
            const isActive = activeFamily === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFamily(tab.id);
                  setSearchFilter('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-700/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[190px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cerca qualsiasi forma..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:border-emerald-500 outline-none text-slate-800 dark:text-zinc-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Shapes Ribbon / Buttons */}
      <div className="p-3 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center justify-between">
          <span>Seleziona Solido o Superficie ({filteredShapes.length} disponibili)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono">
            {calculation.shapeTitle}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredShapes.map((shape) => {
            const isSelected = activeShape === shape.id;
            return (
              <button
                key={shape.id}
                type="button"
                onClick={() => setActiveShape(shape.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                    : 'bg-white dark:bg-zinc-850 text-slate-700 dark:text-zinc-300 border-slate-200/90 dark:border-zinc-750 hover:border-emerald-500/60 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="font-bold truncate">{shape.name}</div>
                <div
                  className={`text-[10px] truncate max-w-[170px] ${
                    isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {shape.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Central Interactive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Parametri Dimensioni (Metri)</span>
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                Inserisci i dati dimensionali del solido
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setR('1');
                setR2('0.5');
                setH('2');
                setA('2');
                setB('1.5');
                setC('1');
                setD('0.6');
                setNSides('6');
                showToast('Campi ripristinati a default 1m');
              }}
              className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded-lg cursor-pointer"
              title="Azzera valori"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Conditional Inputs depending on selected shape */}
          <div className="space-y-3.5">
            {/* Radius r */}
            {[
              'sphere',
              'hemisphere',
              'cylinder',
              'hollow_cylinder',
              'cone',
              'conical_frustum',
              'torus',
              'spherical_cap',
              'spherical_zone',
              'spherical_wedge',
              'paraboloid',
              'horizontal_tank',
              'silo_conical',
              'kepler_barrel',
              'asme_tank',
              'cylindrical_ungula',
              'circle_ring',
              'circle_sector',
              'glome_4d',
              'hypersphere_nd'
            ].includes(activeShape) && (
              <CalcInput
                label={
                  activeShape === 'torus'
                    ? 'Raggio maggiore R (dal centro al tubo)'
                    : activeShape === 'hollow_cylinder'
                    ? 'Raggio esterno R_ext'
                    : activeShape === 'conical_frustum' || activeShape === 'spherical_zone'
                    ? 'Raggio base maggiore R₁'
                    : activeShape === 'kepler_barrel'
                    ? 'Raggio pancia centrale R'
                    : 'Raggio r (m)'
                }
                value={r}
                onChange={setR}
                suffix="m"
                placeholder="1.0"
              />
            )}

            {/* Secondary Radius r2 */}
            {[
              'hollow_cylinder',
              'conical_frustum',
              'torus',
              'spherical_zone',
              'circle_ring',
              'kepler_barrel'
            ].includes(activeShape) && (
              <CalcInput
                label={
                  activeShape === 'hollow_cylinder'
                    ? 'Raggio interno cavità r_int'
                    : activeShape === 'torus'
                    ? 'Raggio minore del tubo r'
                    : activeShape === 'conical_frustum' || activeShape === 'spherical_zone'
                    ? 'Raggio base minore r₂'
                    : activeShape === 'circle_ring'
                    ? 'Raggio interno foro r'
                    : 'Raggio testate r (m)'
                }
                value={r2}
                onChange={setR2}
                suffix="m"
                placeholder="0.5"
              />
            )}

            {/* Height / Length h */}
            {[
              'cylinder',
              'hollow_cylinder',
              'cone',
              'conical_frustum',
              'spherical_cap',
              'spherical_zone',
              'paraboloid',
              'regular_prism',
              'regular_pyramid',
              'pyramidal_frustum',
              'wedge',
              'horizontal_tank',
              'silo_conical',
              'kepler_barrel',
              'asme_tank',
              'cylindrical_ungula',
              'trapezoid'
            ].includes(activeShape) && (
              <CalcInput
                label={
                  activeShape === 'horizontal_tank'
                    ? 'Lunghezza cisterna L (m)'
                    : activeShape === 'spherical_cap'
                    ? 'Altezza calotta / cupola h (m)'
                    : activeShape === 'silo_conical'
                    ? 'Altezza corpo cilindrico h₁ (m)'
                    : 'Altezza / Lunghezza h (m)'
                }
                value={h}
                onChange={setH}
                suffix="m"
                placeholder="2.0"
              />
            )}

            {/* Secondary height h2 (for conical silo) */}
            {activeShape === 'silo_conical' && (
              <CalcInput
                label="Altezza tramoggia conica di fondo h₂ (m)"
                value={h2}
                onChange={setH2}
                suffix="m"
                placeholder="1.0"
              />
            )}

            {/* Tank liquid fill depth d */}
            {activeShape === 'horizontal_tank' && (
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-500/20 space-y-1.5">
                <CalcInput
                  label={`Profondità liquido riempito d (0 .. ${2 * pR} m)`}
                  value={d}
                  onChange={setD}
                  suffix="m"
                  placeholder="0.6"
                />
                <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                  <span>Livello d / Diametro:</span>
                  <span className="font-bold">{((pD / (2 * pR)) * 100).toFixed(1)} %</span>
                </div>
              </div>
            )}

            {/* Side a / Axis a */}
            {[
              'cube',
              'cuboid',
              'regular_prism',
              'regular_pyramid',
              'pyramidal_frustum',
              'tetrahedron',
              'octahedron',
              'dodecahedron',
              'icosahedron',
              'wedge',
              'ellipsoid',
              'oblate_spheroid',
              'prolate_spheroid',
              'elliptical_torus',
              'regular_polygon',
              'triangle_heron',
              'ellipse_2d',
              'trapezoid',
              'rhombus_kite',
              'tesseract_4d'
            ].includes(activeShape) && (
              <CalcInput
                label={
                  activeShape === 'cube' || activeShape === 'tetrahedron' || activeShape === 'octahedron' || activeShape === 'dodecahedron' || activeShape === 'icosahedron' || activeShape === 'tesseract_4d'
                    ? 'Lunghezza spigolo a (m)'
                    : activeShape === 'ellipsoid' || activeShape === 'oblate_spheroid' || activeShape === 'prolate_spheroid' || activeShape === 'ellipse_2d' || activeShape === 'elliptical_torus'
                    ? 'Semiasse equatoriale a (m)'
                    : activeShape === 'regular_polygon' || activeShape === 'regular_prism' || activeShape === 'regular_pyramid'
                    ? 'Lunghezza del lato base s (m)'
                    : activeShape === 'pyramidal_frustum'
                    ? 'Lato base maggiore s₁ (m)'
                    : activeShape === 'trapezoid'
                    ? 'Base maggiore B (m)'
                    : activeShape === 'rhombus_kite'
                    ? 'Diagonale maggiore d₁ (m)'
                    : 'Lato / Dimensione a (m)'
                }
                value={a}
                onChange={setA}
                suffix="m"
                placeholder="2.0"
              />
            )}

            {/* Side b / Axis b */}
            {[
              'cuboid',
              'pyramidal_frustum',
              'wedge',
              'ellipsoid',
              'elliptical_torus',
              'triangle_heron',
              'ellipse_2d',
              'trapezoid',
              'rhombus_kite'
            ].includes(activeShape) && (
              <CalcInput
                label={
                  activeShape === 'cuboid'
                    ? 'Larghezza b (m)'
                    : activeShape === 'pyramidal_frustum'
                    ? 'Lato base minore s₂ (m)'
                    : activeShape === 'ellipsoid' || activeShape === 'ellipse_2d' || activeShape === 'elliptical_torus'
                    ? 'Semiasse b (m)'
                    : activeShape === 'trapezoid'
                    ? 'Base minore b (m)'
                    : activeShape === 'rhombus_kite'
                    ? 'Diagonale minore d₂ (m)'
                    : 'Lato b (m)'
                }
                value={b}
                onChange={setB}
                suffix="m"
                placeholder="1.5"
              />
            )}

            {/* Side c / Axis c */}
            {[
              'cuboid',
              'wedge',
              'ellipsoid',
              'oblate_spheroid',
              'prolate_spheroid',
              'triangle_heron'
            ].includes(activeShape) && (
              <CalcInput
                label={
                  activeShape === 'cuboid'
                    ? 'Altezza c (m)'
                    : activeShape === 'wedge'
                    ? 'Lunghezza colmo superiore c (m)'
                    : activeShape === 'ellipsoid' || activeShape === 'oblate_spheroid' || activeShape === 'prolate_spheroid'
                    ? 'Semiasse polare c (m)'
                    : 'Terzo lato c (m)'
                }
                value={c}
                onChange={setC}
                suffix="m"
                placeholder="1.0"
              />
            )}

            {/* Number of polygon sides (n) */}
            {[
              'regular_prism',
              'regular_pyramid',
              'pyramidal_frustum',
              'regular_polygon'
            ].includes(activeShape) && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Numero di lati della base (n: 3..20)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={nSides}
                    onChange={(e) => setNSides(e.target.value)}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="font-mono font-bold text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                    {nSides} lati
                  </span>
                </div>
              </div>
            )}

            {/* Angle in degrees */}
            {['spherical_wedge', 'circle_sector'].includes(activeShape) && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Angolo diedro o al centro θ (0° .. 360°)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="360"
                    value={angleDeg}
                    onChange={(e) => setAngleDeg(e.target.value)}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="font-mono font-bold text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                    {angleDeg}°
                  </span>
                </div>
              </div>
            )}

            {/* Dimension n for hypersphere */}
            {activeShape === 'hypersphere_nd' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Dimensione dello spazio ipersferico (n: 1..10)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={dimN}
                    onChange={(e) => setDimN(e.target.value)}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="font-mono font-bold text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                    {dimN}D
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Real-World Material Weight Selector */}
          <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Densità & Materiale per Calcolo Peso</span>
              </label>
            </div>
            <select
              value={selectedMaterialIdx}
              onChange={(e) => setSelectedMaterialIdx(parseInt(e.target.value, 10))}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 outline-none focus:border-emerald-500 cursor-pointer"
            >
              {MATERIALS.map((m, idx) => (
                <option key={m.name} value={idx}>
                  {m.nameIt}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salva in Cronologia</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Copia riepilogo"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Output & Interactive Visualizer Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Results Card */}
          <div className="p-5 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white rounded-3xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-200 block">
                  Risultati Geometrici Calcolati
                </span>
                <h3 className="text-lg font-black tracking-tight">{calculation.shapeTitle}</h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/20 text-white font-bold backdrop-blur-xs">
                SI Metri
              </span>
            </div>

            {/* Big Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Volume */}
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                <span className="text-[11px] font-medium text-emerald-100 block">
                  Volume Complessivo (V)
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight mt-0.5">
                  {calculation.volume.toLocaleString('it-IT', {
                    maximumFractionDigits: 4,
                    minimumFractionDigits: 2
                  })}{' '}
                  <span className="text-xs font-normal">m³</span>
                </div>
                <div className="text-[11px] text-emerald-200 font-mono mt-1">
                  {(calculation.volume * 1000).toLocaleString('it-IT', {
                    maximumFractionDigits: 2
                  })}{' '}
                  Litri (L)
                </div>
              </div>

              {/* Surface */}
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                <span className="text-[11px] font-medium text-emerald-100 block">
                  Superficie Totale (S_tot)
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight mt-0.5">
                  {calculation.surfaceTotal.toLocaleString('it-IT', {
                    maximumFractionDigits: 4,
                    minimumFractionDigits: 2
                  })}{' '}
                  <span className="text-xs font-normal">m²</span>
                </div>
                <div className="text-[11px] text-emerald-200 font-mono mt-1">
                  {(calculation.surfaceTotal * 10000).toLocaleString('it-IT', {
                    maximumFractionDigits: 0
                  })}{' '}
                  cm²
                </div>
              </div>
            </div>

            {/* Mass & Weight preview */}
            <div className="p-3 bg-black/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-100">
                  Massa ({selectedMaterial.name}):
                </span>
              </div>
              <div className="font-mono font-bold text-sm">
                {massKg >= 1000
                  ? `${massTonnes.toFixed(3)} t (${massKg.toLocaleString('it-IT', { maximumFractionDigits: 1 })} kg)`
                  : `${massKg.toFixed(2)} kg (${massLbs.toFixed(1)} lbs)`}
              </div>
            </div>

            {/* Secondary geometric parameters */}
            {calculation.secondaryProps.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-white/15 text-[11px]">
                {calculation.secondaryProps.map((prop, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white/5">
                    <span className="text-emerald-200 block text-[10px]">{prop.label}</span>
                    <span className="font-mono font-bold text-white">{prop.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Wireframe Preview & Calculation Steps */}
          <div className="p-4 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  Modello Tridimensionale & Quote
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                Proiezione Assonometrica
              </span>
            </div>

            {/* Canvas wireframe container */}
            <div className="w-full flex items-center justify-center p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
              <canvas
                ref={canvasRef}
                width={260}
                height={160}
                className="max-w-full drop-shadow-xs"
              />
            </div>

            {/* Mathematical steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Passaggi di Calcolo & Formule Ufficiali</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                  {calculation.formulaDesc}
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/40">
                {calculation.steps.map((step, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 block">
                        {step.label}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                        {step.formula}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                      {step.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Multi-unit Instant Simultaneous Conversion Tables */}
          <div className="p-4 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  Conversione Istantanea in Tutte le Unità del Mondo
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                Volume & Superficie
              </span>
            </div>

            {/* Volume and Surface side-by-side tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Volume list */}
              <div className="p-3 bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block pb-1 border-b border-slate-200 dark:border-zinc-700">
                  Unità di Volume
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-[11px]">
                  {volumeUnits.map((u, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-zinc-400">{u.unit}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {u.val.toLocaleString('it-IT', {
                          maximumFractionDigits: 3,
                          minimumFractionDigits: 0
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Surface list */}
              <div className="p-3 bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block pb-1 border-b border-slate-200 dark:border-zinc-700">
                  Unità di Superficie
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-[11px]">
                  {surfaceUnits.map((u, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-zinc-400">{u.unit}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {u.val.toLocaleString('it-IT', {
                          maximumFractionDigits: 3,
                          minimumFractionDigits: 0
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Tape of Geometric Calculations */}
      <SectionHistoryTape
        history={history}
        calculatorId="geometry-surface-volume"
        settings={settings}
        showToast={showToast}
        onRestore={(inputs) => {
          if (inputs.activeShape) setActiveShape(inputs.activeShape as ShapeId);
          if (inputs.r) setR(inputs.r);
          if (inputs.r2) setR2(inputs.r2);
          if (inputs.h) setH(inputs.h);
          if (inputs.a) setA(inputs.a);
          if (inputs.b) setB(inputs.b);
          if (inputs.c) setC(inputs.c);
        }}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
      />
    </div>
  );
};

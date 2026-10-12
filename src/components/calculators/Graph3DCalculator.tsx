import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Box,
  Layers,
  Activity,
  Bookmark,
  Share2,
  Info,
  Maximize2,
  Minimize2,
  Play,
  Pause
} from 'lucide-react';
import { AppSettings, HistoryItem, ToastMessage, CalculatorId } from '../../types';
import { CalcInput } from '../common/CalcInput';
import { SectionHistoryTape } from '../common/SectionHistoryTape';

interface Graph3DCalculatorProps {
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

type SurfacePreset = 'wormhole' | 'sombrero' | 'monkey' | 'ripple' | 'pringle' | 'paraboloid';

export const Graph3DCalculator: React.FC<Graph3DCalculatorProps> = ({
  settings,
  onSaveHistory,
  showToast,
  history,
  onDeleteHistoryEntry,
  onClearSectionHistory,
  isFavorite,
  onToggleFavorite
}) => {
  const [preset, setPreset] = useState<SurfacePreset>('wormhole');
  const [gridRes, setGridRes] = useState<number>(24); // 24x24 mesh
  const [scaleZ, setScaleZ] = useState<string>('1.0');
  const [colorTheme, setColorTheme] = useState<'cosmic' | 'viridis' | 'fire'>('cosmic');

  // Camera angles (degrees)
  const [rotX, setRotX] = useState<number>(30); // Elevation
  const [rotY, setRotY] = useState<number>(45); // Azimuth
  const [zoom, setZoom] = useState<number>(1.2);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  // Dragging tracking
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 0.8) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Compute Surface Mesh Grid
  const meshData = useMemo(() => {
    const N = gridRes;
    const sz = parseFloat(scaleZ) || 1.0;
    const points: Array<{ x: number; y: number; z: number }> = [];

    // Domain bounds
    let minX = -4, maxX = 4, minY = -4, maxY = 4;
    if (preset === 'sombrero') {
      minX = -8; maxX = 8; minY = -8; maxY = 8;
    } else if (preset === 'wormhole') {
      minX = -4; maxX = 4; minY = -4; maxY = 4;
    }

    const stepX = (maxX - minX) / N;
    const stepY = (maxY - minY) / N;

    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i <= N; i++) {
      const x = minX + i * stepX;
      for (let j = 0; j <= N; j++) {
        const y = minY + j * stepY;
        let z = 0;
        const r = Math.sqrt(x * x + y * y);

        switch (preset) {
          case 'wormhole':
            // Flamm's paraboloid embedding: z = ±2 * sqrt(r - r_s)
            // Centered smoothly around throat r_s = 0.8
            const rThroat = Math.max(0.1, r - 0.8);
            z = -2.5 * Math.log(r + 0.5); // Funnel throat look
            break;
          case 'sombrero':
            z = r === 0 ? 3 : (3 * Math.sin(r)) / r;
            break;
          case 'monkey':
            // Monkey saddle: z = x^3 - 3*x*y^2
            z = (Math.pow(x / 2, 3) - 3 * (x / 2) * Math.pow(y / 2, 2)) * 1.2;
            break;
          case 'ripple':
            z = 2 * Math.sin(x) * Math.cos(y);
            break;
          case 'pringle':
            // Hyperbolic paraboloid: z = x^2 - y^2
            z = 0.25 * (x * x - y * y);
            break;
          case 'paraboloid':
            z = 0.2 * (x * x + y * y);
            break;
        }

        z *= sz;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;

        points.push({ x, y, z });
      }
    }

    return { points, N, minZ, maxZ, spanZ: maxZ - minZ || 1 };
  }, [preset, gridRes, scaleZ]);

  // Project 3D Points to 2D Screen
  const projectedFaces = useMemo(() => {
    const { points, N, minZ, spanZ } = meshData;
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    const cosX = Math.cos(radX), sinX = Math.sin(radX);
    const cosY = Math.cos(radY), sinY = Math.sin(radY);

    // Function to rotate a 3D point
    const project = (p: { x: number; y: number; z: number }) => {
      // Rotate around Y
      const x1 = p.x * cosY + p.y * sinY;
      const y1 = -p.x * sinY + p.y * cosY;
      const z1 = p.z;

      // Rotate around X
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Screen projection
      const screenX = 250 + x2 * 26 * zoom;
      const screenY = 220 - y2 * 26 * zoom;

      return { sx: screenX, sy: screenY, depth: z2, normZ: (p.z - minZ) / spanZ };
    };

    const projectedPoints = points.map(project);

    // Build grid polygon quads
    const quads: Array<{
      pts: string;
      avgDepth: number;
      color: string;
    }> = [];

    const getColor = (t: number) => {
      const clamped = Math.max(0, Math.min(1, t));
      if (colorTheme === 'cosmic') {
        // Deep purple to electric cyan/rose
        const r = Math.round(70 + clamped * 180);
        const g = Math.round(20 + (1 - clamped) * 80 + clamped * 180);
        const b = Math.round(180 + clamped * 75);
        return `rgb(${r},${g},${b})`;
      } else if (colorTheme === 'fire') {
        // Dark red to bright yellow
        const r = Math.round(160 + clamped * 95);
        const g = Math.round(clamped * 200);
        const b = Math.round(clamped * 50);
        return `rgb(${r},${g},${b})`;
      } else {
        // Viridis: purple -> teal -> yellow
        const r = Math.round(40 + clamped * 215);
        const g = Math.round(80 + clamped * 175);
        const b = Math.round(120 - clamped * 80);
        return `rgb(${r},${g},${b})`;
      }
    };

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx00 = i * (N + 1) + j;
        const idx10 = (i + 1) * (N + 1) + j;
        const idx11 = (i + 1) * (N + 1) + (j + 1);
        const idx01 = i * (N + 1) + (j + 1);

        const p0 = projectedPoints[idx00];
        const p1 = projectedPoints[idx10];
        const p2 = projectedPoints[idx11];
        const p3 = projectedPoints[idx01];

        const avgDepth = (p0.depth + p1.depth + p2.depth + p3.depth) / 4;
        const avgNormZ = (p0.normZ + p1.normZ + p2.normZ + p3.normZ) / 4;

        quads.push({
          pts: `${p0.sx},${p0.sy} ${p1.sx},${p1.sy} ${p2.sx},${p2.sy} ${p3.sx},${p3.sy}`,
          avgDepth,
          color: getColor(avgNormZ)
        });
      }
    }

    // Painter's algorithm: sort back-to-front by depth
    quads.sort((a, b) => a.avgDepth - b.avgDepth);

    return quads;
  }, [meshData, rotX, rotY, zoom, colorTheme]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsAutoRotating(false);
    isDraggingRef.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => (prev + dx * 0.6 + 360) % 360);
    setRotX((prev) => Math.max(-85, Math.min(85, prev - dy * 0.6)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleSaveToHistory = () => {
    onSaveHistory({
      calculatorId: 'graph-3d',
      calculatorTitle: 'Visualizzatore Grafico 3D Superfici z=f(x,y)',
      summary: `Superficie 3D: ${preset.toUpperCase()} (${gridRes}x${gridRes} vertici)`,
      details: [
        { label: 'Superficie', value: preset },
        { label: 'Risoluzione', value: `${gridRes}x${gridRes}` },
        { label: 'Inclinazione Camera', value: `${rotX.toFixed(0)}° Elev, ${rotY.toFixed(0)}° Azim` },
        { label: 'Intervallo Quota Z', value: `${meshData.minZ.toFixed(2)} a ${meshData.maxZ.toFixed(2)}` }
      ],
      formula: 'z = f(x, y) Proiezione Isometrica 3D',
      inputs: { preset, gridRes: String(gridRes) }
    });
    showToast('Grafico 3D salvato!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                Graficatore 3D Superfici Matematiche
                <span className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-mono">
                  z = f(x, y) & Wormhole 3D
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Visualizzatore tridimensionale interattivo a 360° con rotazione orbitale mouse/touch per superfici bivariabili, tunnel spaziotemporale e selle matematiche.
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
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-500'
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

        {/* Preset Selector Toolbar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 overflow-x-auto no-scrollbar mt-3">
          {[
            { id: 'wormhole', label: 'Imbuto Wormhole (Flamm)', desc: 'Ponte Einstein-Rosen' },
            { id: 'sombrero', label: 'Sombrero Sinc', desc: 'sin(r)/r' },
            { id: 'monkey', label: 'Sella di Scimmia', desc: 'x³ - 3xy²' },
            { id: 'ripple', label: 'Onde Incrociate', desc: 'sin(x)·cos(y)' },
            { id: 'pringle', label: 'Sella Iperbolica', desc: 'x² - y²' },
            { id: 'paraboloid', label: 'Paraboloide Ellittico', desc: 'x² + y²' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreset(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                preset === item.id
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/70 dark:hover:bg-zinc-700/70'
              }`}
            >
              <div>{item.label}</div>
              <div className={`text-[10px] font-mono ${preset === item.id ? 'text-violet-200' : 'text-slate-400'}`}>{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas / SVG Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Controls Overlay */}
        <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-white text-xs font-bold rounded-xl"
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isAutoRotating ? 'Pausa Rotazione' : 'Auto-Ruota'}
          </button>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-white text-xs font-bold rounded-xl"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-white text-xs font-bold rounded-xl"
            title="Zoom Out"
          >
            -
          </button>

          <button
            type="button"
            onClick={() => {
              setRotX(30);
              setRotY(45);
              setZoom(1.2);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Camera
          </button>
        </div>

        {/* Color Theme Selector Overlay */}
        <div className="absolute top-6 right-6 z-10 flex gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700">
          {(['cosmic', 'viridis', 'fire'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setColorTheme(t)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase transition-all ${
                colorTheme === t ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* SVG Mesh Render Area */}
        <div
          className="w-full h-[440px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 500 440"
            className="w-full h-full max-w-2xl max-h-[440px] pointer-events-none"
          >
            <defs>
              <radialGradient id="meshCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="500" height="440" fill="url(#meshCenterGlow)" />

            {/* Render 3D Quad Polygons */}
            {projectedFaces.map((quad, idx) => (
              <polygon
                key={idx}
                points={quad.pts}
                fill={quad.color}
                fillOpacity="0.82"
                stroke="#090d16"
                strokeWidth="0.6"
              />
            ))}
          </svg>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
          <div>
            Trascina con il mouse per ruotare liberamente nello spazio 3D • Elev: {rotX.toFixed(0)}°, Azim: {rotY.toFixed(0)}°
          </div>
          <div className="flex items-center gap-3">
            <span>Mesh: {gridRes}×{gridRes}</span>
            <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Grid Settings Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase">Densità Vertici:</span>
          <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
            {[16, 20, 24, 28].map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setGridRes(res)}
                className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  gridRes === res ? 'bg-white dark:bg-zinc-700 text-violet-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                {res}×{res}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-48">
          <CalcInput
            label="Fattore Scala Altezza Z"
            value={scaleZ}
            onChange={setScaleZ}
            suffix="x"
          />
        </div>
      </div>

      {/* History Tape */}
      <SectionHistoryTape
        history={history}
        calculatorId="graph-3d"
        onRestore={() => {}}
        onDeleteEntry={onDeleteHistoryEntry}
        onClearSectionHistory={onClearSectionHistory}
        showToast={showToast}
        settings={settings}
      />
    </div>
  );
};

import React from 'react';

export interface ToothStatusData {
  status: string;
  label: string;
  doctor?: string;
  price?: number;
  surface?: string;
}

interface AnatomicalToothProps {
  toothNumber: number;
  statusData?: ToothStatusData;
  isSelected?: boolean;
  onClick: (toothNum: number) => void;
  showSurfaces?: boolean;
}

/**
 * Returns anatomical tooth classification from FDI two-digit numbering
 */
export function getToothType(fdi: number): 'molar' | 'premolar' | 'canine' | 'incisor' {
  const digit = fdi % 10;
  if (digit === 1 || digit === 2) return 'incisor';
  if (digit === 3) return 'canine';
  if (digit === 4 || digit === 5) return 'premolar';
  return 'molar'; // 6, 7, 8
}

export function isUpperArch(fdi: number): boolean {
  const quadrant = Math.floor(fdi / 10);
  return quadrant === 1 || quadrant === 2 || quadrant === 5 || quadrant === 6;
}

export function getToothNameAr(fdi: number): string {
  const isUpper = isUpperArch(fdi);
  const digit = fdi % 10;
  const arch = isUpper ? 'علوي' : 'سفلي';

  switch (digit) {
    case 1: return `قاطع مركزي ${arch}`;
    case 2: return `قاطع جانبي ${arch}`;
    case 3: return `ناب ${arch}`;
    case 4: return `ضاحك أول ${arch}`;
    case 5: return `ضاحك ثانٍ ${arch}`;
    case 6: return `ضرس أول ${arch}`;
    case 7: return `ضرس ثانٍ ${arch}`;
    case 8: return `ضرس عقل ${arch}`;
    default: return `سن ${arch}`;
  }
}

export function getProcedureColor(status?: string): { bg: string; border: string; fill: string; text: string } {
  if (!status) {
    return { bg: 'fill-slate-800/80', border: 'stroke-gold-500/25', fill: '#1e293b', text: 'text-slate-300' };
  }
  switch (status) {
    case 'caries':
      return { bg: 'fill-rose-900/60', border: 'stroke-rose-500', fill: '#be123c', text: 'text-rose-300' };
    case 'filling':
    case 'composite':
      return { bg: 'fill-blue-900/60', border: 'stroke-blue-400', fill: '#2563eb', text: 'text-blue-300' };
    case 'veneer':
      return { bg: 'fill-amber-900/60', border: 'stroke-gold-400', fill: '#d97706', text: 'text-amber-300' };
    case 'crown':
      return { bg: 'fill-cyan-900/60', border: 'stroke-cyan-400', fill: '#0891b2', text: 'text-cyan-300' };
    case 'root_canal':
    case 'endo':
      return { bg: 'fill-purple-900/60', border: 'stroke-purple-400', fill: '#9333ea', text: 'text-purple-300' };
    case 'implant':
      return { bg: 'fill-emerald-900/60', border: 'stroke-emerald-400', fill: '#059669', text: 'text-emerald-300' };
    case 'extraction':
    case 'missing':
      return { bg: 'fill-slate-900/90', border: 'stroke-slate-500', fill: '#475569', text: 'text-slate-400' };
    default:
      return { bg: 'fill-gold-900/60', border: 'stroke-gold-400', fill: '#ca8a04', text: 'text-gold-300' };
  }
}

export const AnatomicalTooth: React.FC<AnatomicalToothProps> = ({
  toothNumber,
  statusData,
  isSelected = false,
  onClick
}) => {
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperArch(toothNumber);
  const toothName = getToothNameAr(toothNumber);
  const colors = getProcedureColor(statusData?.status);
  const digit = toothNumber % 10;

  // SVG paths depending on tooth anatomy
  // Width: 46px, Height: 72px
  return (
    <button
      type="button"
      onClick={() => onClick(toothNumber)}
      title={`السن #${toothNumber} - ${toothName} ${statusData ? `(${statusData.label})` : '(سليم)'}`}
      className={`group relative flex flex-col items-center justify-between p-1 rounded-xl transition-all duration-200 select-none focus:outline-none flex-shrink-0 ${
        isSelected
          ? 'bg-gold-500/20 ring-2 ring-gold-400 shadow-lg shadow-gold-500/20 scale-105 z-10'
          : 'bg-obsidian-900/90 hover:bg-obsidian-800/90 hover:scale-102 border border-gold-500/20'
      }`}
      style={{ width: toothType === 'molar' ? '54px' : '44px', minHeight: '94px' }}
    >
      {/* Top FDI number badge */}
      <span className={`text-[10px] font-mono font-extrabold ${isSelected ? 'text-gold-300' : 'text-slate-300'} group-hover:text-gold-400`}>
        #{toothNumber}
      </span>

      {/* Anatomical Tooth SVG Vector Graphic */}
      <div className="w-full flex items-center justify-center my-0.5">
        <svg
          viewBox="0 0 50 75"
          className="w-10 h-16 transition-transform group-hover:scale-105"
          style={{ transform: isUpper ? 'none' : 'scaleY(-1)' }} // Invert lower jaw roots so roots point down
        >
          <defs>
            <linearGradient id={`grad-enamel-${toothNumber}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id={`grad-root-${toothNumber}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <radialGradient id={`glow-${toothNumber}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.fill} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.fill} stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Root Anatomy */}
          {toothType === 'molar' && (
            // Triple/Double roots for molars
            <g className="transition-colors">
              {/* Left root */}
              <path
                d="M14 36 C13 22 10 14 8 4 C13 8 16 18 19 36 Z"
                fill={statusData?.status === 'root_canal' ? '#a855f7' : `url(#grad-root-${toothNumber})`}
                stroke="#64748b"
                strokeWidth="1"
              />
              {/* Right root */}
              <path
                d="M31 36 C34 18 37 8 42 4 C40 14 37 22 36 36 Z"
                fill={statusData?.status === 'root_canal' ? '#a855f7' : `url(#grad-root-${toothNumber})`}
                stroke="#64748b"
                strokeWidth="1"
              />
              {/* Center root */}
              <path
                d="M22 36 C23 20 24 10 25 2 C26 10 27 20 28 36 Z"
                fill={statusData?.status === 'root_canal' ? '#c084fc' : `url(#grad-root-${toothNumber})`}
                stroke="#64748b"
                strokeWidth="0.8"
              />
              {/* Endodontic gutta-percha filling line */}
              {statusData?.status === 'root_canal' && (
                <path d="M9 6 L18 36 M41 6 L32 36 M25 4 L25 36" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2,1" />
              )}
            </g>
          )}

          {toothType === 'premolar' && (
            // Dual/Bifurcated root for premolars
            <g className="transition-colors">
              <path
                d="M18 35 C17 20 16 10 14 5 C19 10 22 20 23 35 Z"
                fill={statusData?.status === 'root_canal' ? '#a855f7' : `url(#grad-root-${toothNumber})`}
                stroke="#64748b"
                strokeWidth="1"
              />
              <path
                d="M27 35 C28 20 31 10 36 5 C34 10 33 20 32 35 Z"
                fill={statusData?.status === 'root_canal' ? '#a855f7' : `url(#grad-root-${toothNumber})`}
                stroke="#64748b"
                strokeWidth="1"
              />
              {statusData?.status === 'root_canal' && (
                <path d="M15 7 L21 35 M35 7 L29 35" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2,1" />
              )}
            </g>
          )}

          {(toothType === 'canine' || toothType === 'incisor') && (
            // Single tapered long root
            <g className="transition-colors">
              <path
                d={
                  toothType === 'canine'
                    ? 'M17 35 C19 18 22 8 25 2 C28 8 31 18 33 35 Z' // Long robust canine root
                    : 'M18 35 C20 20 22 10 25 5 C28 10 30 20 32 35 Z' // Straight incisor root
                }
                fill={statusData?.status === 'root_canal' ? '#a855f7' : `url(#grad-root-${toothNumber})`}
                stroke="#64748b"
                strokeWidth="1"
              />
              {statusData?.status === 'root_canal' && (
                <path d="M25 4 L25 35" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="2,1" />
              )}
            </g>
          )}

          {/* Implant Titanium Screw Replacement */}
          {statusData?.status === 'implant' && (
            <g>
              <rect x="18" y="4" width="14" height="32" rx="2" fill="#10b981" stroke="#059669" strokeWidth="1.2" />
              <line x1="18" y1="10" x2="32" y2="10" stroke="#047857" strokeWidth="1.5" />
              <line x1="18" y1="16" x2="32" y2="16" stroke="#047857" strokeWidth="1.5" />
              <line x1="18" y1="22" x2="32" y2="22" stroke="#047857" strokeWidth="1.5" />
              <line x1="18" y1="28" x2="32" y2="28" stroke="#047857" strokeWidth="1.5" />
            </g>
          )}

          {/* Cementoenamel Junction (CEJ) Cervical Line */}
          <path
            d="M8 36 Q25 41 42 36"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="1,1"
          />

          {/* Anatomical Crown */}
          {toothType === 'molar' && (
            // Multi-cusped Molar Crown
            <g>
              <path
                d="M8 36 C6 44 6 56 9 66 C15 72 35 72 41 66 C44 56 44 44 42 36 C34 38 16 38 8 36 Z"
                fill={statusData ? `url(#glow-${toothNumber})` : `url(#grad-enamel-${toothNumber})`}
                stroke={statusData ? colors.fill : '#475569'}
                strokeWidth={isSelected ? '2' : '1.2'}
              />
              {/* Occlusal Grooves & Fissures */}
              <path d="M12 48 Q25 54 38 48 M25 38 L25 66 M18 44 L32 58 M18 58 L32 44" stroke="#64748b" strokeWidth="0.75" fill="none" opacity="0.7" />
            </g>
          )}

          {toothType === 'premolar' && (
            // Bicuspid Premolar Crown
            <g>
              <path
                d="M12 36 C10 44 10 56 13 65 C18 71 32 71 37 65 C40 56 40 44 38 36 C32 38 18 38 12 36 Z"
                fill={statusData ? `url(#glow-${toothNumber})` : `url(#grad-enamel-${toothNumber})`}
                stroke={statusData ? colors.fill : '#475569'}
                strokeWidth={isSelected ? '2' : '1.2'}
              />
              {/* Central Groove */}
              <path d="M18 52 Q25 55 32 52 M25 40 L25 64" stroke="#64748b" strokeWidth="0.75" fill="none" opacity="0.7" />
            </g>
          )}

          {toothType === 'canine' && (
            // Pointed Cusp Canine Crown
            <g>
              <path
                d="M13 36 C11 44 11 55 14 62 L25 72 L36 62 C39 55 39 44 37 36 C30 38 20 38 13 36 Z"
                fill={statusData ? `url(#glow-${toothNumber})` : `url(#grad-enamel-${toothNumber})`}
                stroke={statusData ? colors.fill : '#475569'}
                strokeWidth={isSelected ? '2' : '1.2'}
              />
              {/* Labial Ridge */}
              <path d="M25 38 L25 70" stroke="#94a3b8" strokeWidth="0.8" fill="none" opacity="0.6" />
            </g>
          )}

          {toothType === 'incisor' && (
            // Shovel Incisal Crown
            <g>
              <path
                d={
                  digit === 1
                    ? 'M11 36 C10 44 10 57 12 68 L38 68 C40 57 40 44 39 36 C32 38 18 38 11 36 Z' // Central wider
                    : 'M13 36 C12 44 12 56 14 66 L36 66 C38 56 38 44 37 36 C31 38 19 38 13 36 Z' // Lateral
                }
                fill={statusData ? `url(#glow-${toothNumber})` : `url(#grad-enamel-${toothNumber})`}
                stroke={statusData ? colors.fill : '#475569'}
                strokeWidth={isSelected ? '2' : '1.2'}
              />
              {/* Developmental mamelons/ridges */}
              <line x1="20" y1="40" x2="20" y2="66" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.6" />
              <line x1="30" y1="40" x2="30" y2="66" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.6" />
            </g>
          )}

          {/* Missing / Extracted X Marker */}
          {(statusData?.status === 'extraction' || statusData?.status === 'missing') && (
            <g>
              <line x1="6" y1="6" x2="44" y2="68" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="44" y1="6" x2="6" y2="68" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}

          {/* Veneer / Crown Golden Shimmer Border */}
          {(statusData?.status === 'veneer' || statusData?.status === 'crown') && (
            <path
              d="M10 36 C8 44 8 58 11 67 L39 67 C42 58 42 44 40 36 Z"
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          )}
        </svg>
      </div>

      {/* Status Label or Condition */}
      <div className="w-full text-center mt-0.5">
        <span
          className={`text-[8.5px] px-1 py-0.2 rounded font-semibold truncate block max-w-full ${
            statusData
              ? `${colors.text} bg-obsidian-950/80 border border-gold-500/20`
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          {statusData ? statusData.label.split(' ')[0] : 'سليم'}
        </span>
      </div>
    </button>
  );
};

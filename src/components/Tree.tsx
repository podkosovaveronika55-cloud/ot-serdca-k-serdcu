import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import Ornament from './Ornament'
import type { Toy } from '../lib/types'

interface Props {
  toys: Toy[]
  highlight?: { x: number; y: number }[]
  onToyClick?: (toy: Toy) => void
  newIds?: string[]
  className?: string
  starGlow?: boolean
  sway?: boolean
}

const TIERS = [
  { top: 96, bottom: 210, halfBottom: 78 },
  { top: 168, bottom: 300, halfBottom: 112 },
  { top: 246, bottom: 386, halfBottom: 146 },
  { top: 330, bottom: 470, halfBottom: 176 },
]

function tierPath(t: (typeof TIERS)[number]) {
  const cx = 200
  const hb = t.halfBottom
  return `M${cx} ${t.top} L${cx + hb} ${t.bottom} Q${cx + hb * 0.55} ${t.bottom + 14} ${cx} ${t.bottom + 16} Q${
    cx - hb * 0.55
  } ${t.bottom + 14} ${cx - hb} ${t.bottom} Z`
}

export default function Tree({
  toys,
  highlight = [],
  onToyClick,
  newIds = [],
  className = '',
  starGlow = true,
  sway = true,
}: Props) {
  const ornaments = useMemo(
    () =>
      toys.map((t, i) => ({
        toy: t,
        delay: (i % 7) * 0.42,
        dur: 4.6 + (i % 5) * 0.55,
        rot: -4 + ((i * 13) % 9),
      })),
    [toys],
  )

  return (
    <div className={`relative w-full ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[46%] h-[70%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/12 blur-3xl" />
        <div className="absolute left-1/2 top-[70%] h-[36%] w-[70%] -translate-x-1/2 rounded-[50%] bg-ice/10 blur-2xl" />
      </div>

      <svg viewBox="0 0 400 520" className="w-full drop-shadow-[0_30px_60px_rgba(0,0,0,.55)]" aria-hidden="true">
        <defs>
          <linearGradient id="fir" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3fb672" />
            <stop offset="45%" stopColor="#217a4d" />
            <stop offset="100%" stopColor="#0a3f2b" />
          </linearGradient>
          <linearGradient id="firDark" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#2f9e62" />
            <stop offset="100%" stopColor="#072b1d" />
          </linearGradient>
          <linearGradient id="snowcap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#cfe6ff" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8d6" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#ffc857" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffc857" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6b4423" />
            <stop offset="50%" stopColor="#8a5a2e" />
            <stop offset="100%" stopColor="#4a2f18" />
          </linearGradient>
        </defs>

        {/* ствол */}
        <rect x={184} y={452} width={32} height={56} rx={6} fill="url(#trunk)" />
        <ellipse cx={200} cy={508} rx={86} ry={14} fill="#04211a" opacity={0.55} />

        {/* ярусы */}
        {TIERS.map((t, i) => (
          <g key={i}>
            <path d={tierPath(t)} fill={i % 2 ? 'url(#firDark)' : 'url(#fir)'} stroke="#0a3d29" strokeWidth={1.5} />
            {/* снег на ветвях */}
            <path
              d={`M${200 - t.halfBottom * 0.9} ${t.bottom - 10} Q${200 - t.halfBottom * 0.45} ${t.bottom + 4} ${200} ${t.bottom - 4} Q${
                200 + t.halfBottom * 0.45
              } ${t.bottom + 4} ${200 + t.halfBottom * 0.9} ${t.bottom - 10}`}
              fill="none"
              stroke="url(#snowcap)"
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.75}
            />
          </g>
        ))}

        {/* гирлянды */}
        {[200, 320, 420].map((y, i) => (
          <g key={y}>
            <path
              d={`M${200 - (60 + i * 46)} ${y} Q200 ${y + 34} ${200 + (60 + i * 46)} ${y}`}
              fill="none"
              stroke="#ffe9a8"
              strokeWidth={1.4}
              strokeDasharray="5 6"
              opacity={0.5}
            />
            {Array.from({ length: 9 }).map((_, k) => {
              const spread = 60 + i * 46
              const x = 200 - spread + (k * (spread * 2)) / 8
              const yy = y + Math.sin((k / 8) * Math.PI) * 32
              return (
                <circle key={k} cx={x} cy={yy} r={2.6} fill="#ffe9a8">
                  <animate attributeName="opacity" values="0.25;1;0.25" dur={`${2 + ((k + i) % 4) * 0.6}s`} repeatCount="indefinite" />
                </circle>
              )
            })}
          </g>
        ))}

        {/* звезда на макушке */}
        <g>
          <circle cx={200} cy={74} r={64} fill="url(#starGlow)" opacity={starGlow ? 0.9 : 0.5}>
            {starGlow && <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />}
          </circle>
          <polygon
            points="200,34 209,60 236,60 214,76 223,102 200,86 177,102 186,76 164,60 191,60"
            fill="#ffd45e"
            stroke="#f0a11c"
            strokeWidth={1.2}
          />
          <polygon points="200,46 205,62 222,62 208,72 213,88 200,78 187,88 192,72 178,62 195,62" fill="#fff3c4" opacity={0.7} />
        </g>
      </svg>

      {/* игрушки */}
      <div className="absolute inset-0">
        {ornaments.map(({ toy, delay, dur, rot }) => {
          const isNew = newIds.includes(toy.id)
          return (
            <motion.button
              key={toy.id}
              type="button"
              onClick={() => onToyClick?.(toy)}
              className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              style={{ left: `${toy.pos.x}%`, top: `${toy.pos.y}%` }}
              initial={isNew ? { scale: 0.2, opacity: 0, y: -40 } : false}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={isNew ? { type: 'spring', stiffness: 220, damping: 14 } : undefined}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.96 }}
              aria-label={`Игрушка${toy.label ? ': ' + toy.label : ''} — открыть пожелание`}
            >
              <motion.span
                className="block origin-top"
                animate={sway ? { rotate: [rot, -rot, rot] } : undefined}
                transition={sway ? { duration: dur, repeat: Infinity, ease: 'easeInOut', delay } : undefined}
              >
                <Ornament
                  shape={toy.shape}
                  color={toy.color}
                  decor={toy.decor}
                  size={54}
                  glow={isNew}
                  showLabel={false}
                  title={toy.label}
                />
              </motion.span>
            </motion.button>
          )
        })}

        {/* подсветка свободных мест */}
        <AnimatePresence>
          {highlight.map((h, i) => (
            <motion.span
              key={`${h.x.toFixed(1)}-${h.y.toFixed(1)}-${i}`}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/70 bg-gold/25"
              style={{ left: `${h.x}%`, top: `${h.y}%`, width: 34, height: 34 }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

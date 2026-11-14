import { useId } from 'react'
import { COLORS, type ColorName, type Decor, type Shape } from '../lib/types'

interface Props {
  shape: Shape
  color: ColorName
  decor?: Decor[]
  label?: string
  size?: number
  glow?: boolean
  showLabel?: boolean
  spin?: number
  className?: string
  title?: string
}

const STAR_POINTS = (() => {
  const pts: string[] = []
  const cx = 50
  const cy = 54
  const R = 40
  const r = 17
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 === 0 ? R : r
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`)
  }
  return pts.join(' ')
})()

function Snowflake() {
  const arms = [0, 60, 120]
  return (
    <g stroke="#ffffff" strokeWidth={5.2} strokeLinecap="round" fill="none" opacity={0.95}>
      {arms.map((a) => (
        <g key={a} transform={`rotate(${a} 50 52)`}>
          <line x1={50} y1={14} x2={50} y2={90} />
          <line x1={50} y1={26} x2={40} y2={36} />
          <line x1={50} y1={26} x2={60} y2={36} />
          <line x1={50} y1={44} x2={42} y2={52} />
          <line x1={50} y1={44} x2={58} y2={52} />
          <line x1={50} y1={72} x2={43} y2={79} />
          <line x1={50} y1={72} x2={57} y2={79} />
        </g>
      ))}
      <circle cx={50} cy={52} r={5} fill="#fff" stroke="none" />
    </g>
  )
}

function smallStar(cx: number, cy: number, r: number, key: string, fill: string) {
  const pts: string[] = []
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * 0.38
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`)
  }
  return <polygon key={key} points={pts.join(' ')} fill={fill} opacity={0.92} />
}

function tinyHeart(cx: number, cy: number, r: number, key: string, fill: string) {
  const d = `M${cx} ${cy + r * 0.72}c${-r * 1.1} ${-r * 0.75} ${-r * 1.5} ${-r * 1.5} ${-r * 0.9} ${-r * 1.9}c${r * 0.42} ${-r * 0.28} ${r * 0.78} ${-r * 0.02} ${r * 0.9} ${r * 0.3}c${r * 0.12} ${-r * 0.32} ${r * 0.48} ${-r * 0.58} ${r * 0.9} ${-r * 0.3}c${r * 0.6} ${r * 0.4} ${r * 0.2} ${r * 1.15} ${-r * 0.9} ${r * 1.9}z`
  return <path key={key} d={d} fill={fill} opacity={0.9} />
}

function tinySnow(cx: number, cy: number, r: number, key: string) {
  return (
    <g key={key} stroke="#fff" strokeWidth={r * 0.28} strokeLinecap="round" opacity={0.9}>
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
      <line x1={cx - r * 0.5} y1={cy - r * 0.85} x2={cx + r * 0.5} y2={cy + r * 0.85} />
      <line x1={cx - r * 0.5} y1={cy + r * 0.85} x2={cx + r * 0.5} y2={cy - r * 0.85} />
    </g>
  )
}

export default function Ornament({
  shape,
  color,
  decor = [],
  label,
  size = 96,
  glow = false,
  showLabel = false,
  spin = 0,
  className = '',
  title,
}: Props) {
  const uid = useId().replace(/:/g, '')
  const c = COLORS[color]
  const gid = `g-${uid}`
  const clip = `c-${uid}`
  const soft = c.light

  const shapeEl = () => {
    switch (shape) {
      case 'ball':
        return <circle cx={50} cy={54} r={36} />
      case 'star':
        return <polygon points={STAR_POINTS} />
      case 'heart':
        return (
          <path d="M50 88C22 68 8 54 8 36 8 22 19 12 32 12c8 0 14 4 18 10 4-6 10-10 18-10 13 0 24 10 24 24 0 18-14 32-42 52z" />
        )
      case 'bell':
        return (
          <path d="M50 16c-13 0-22 10-22 25 0 13-3 20-9 27-2 3 0 7 4 7h54c4 0 6-4 4-7-6-7-9-14-9-27 0-15-9-25-22-25z" />
        )
      case 'snowflake':
      default:
        return <circle cx={50} cy={52} r={34} opacity={0.18} />
    }
  }

  const decorLayers = () => {
    const out: JSX.Element[] = []
    if (decor.includes('pattern')) {
      out.push(
        <g key="pattern" opacity={0.5}>
          <circle cx={50} cy={54} r={26} fill="none" stroke={soft} strokeWidth={1.6} strokeDasharray="3 5" />
          <circle cx={50} cy={54} r={16} fill="none" stroke={soft} strokeWidth={1.4} strokeDasharray="2 4" />
        </g>,
      )
    }
    if (decor.includes('glitter')) {
      const pts = [
        [30, 34], [66, 40], [40, 62], [62, 70], [50, 26], [24, 56], [74, 56], [46, 82], [58, 30], [34, 74],
      ]
      out.push(
        <g key="glitter">
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.9 : 1.2} fill="#fff" opacity={0.55 + (i % 4) * 0.1} />
          ))}
        </g>,
      )
    }
    if (decor.includes('snow')) {
      out.push(tinySnow(36, 40, 6, 's1'))
      out.push(tinySnow(64, 62, 5, 's2'))
      out.push(tinySnow(52, 74, 4, 's3'))
    }
    if (decor.includes('stars')) {
      out.push(smallStar(62, 38, 6, 'st1', '#fff6c9'))
      out.push(smallStar(38, 66, 5, 'st2', '#fff6c9'))
    }
    if (decor.includes('hearts')) {
      out.push(tinyHeart(62, 60, 6, 'h1', '#ffd9d4'))
      out.push(tinyHeart(40, 44, 5, 'h2', '#ffd9d4'))
    }
    if (decor.includes('garland')) {
      out.push(
        <g key="garland">
          <path d="M22 34 Q50 58 78 34" fill="none" stroke="#fff3c4" strokeWidth={1.4} strokeDasharray="4 4" opacity={0.8} />
          {[26, 38, 50, 62, 74].map((x, i) => (
            <circle key={i} cx={x} cy={34 + Math.sin((x - 22) / 56 * Math.PI) * 14} r={2.2} fill="#ffe9a8">
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>,
      )
    }
    return out
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title || label || 'Новогодняя игрушка'}
      style={glow ? { filter: `drop-shadow(0 0 14px ${c.main}bb)` } : undefined}
    >
      <defs>
        <radialGradient id={gid} cx="34%" cy="26%" r="82%">
          <stop offset="0%" stopColor={soft} />
          <stop offset="52%" stopColor={c.main} />
          <stop offset="100%" stopColor={c.deep} />
        </radialGradient>
        <clipPath id={clip}>{shapeEl()}</clipPath>
      </defs>

      {/* подвес */}
      {shape !== 'snowflake' && (
        <g>
          <line x1={50} y1={4} x2={50} y2={shape === 'bell' ? 16 : shape === 'heart' ? 14 : 18} stroke="#d9c9a2" strokeWidth={1.6} />
          <circle cx={50} cy={5} r={3} fill="none" stroke="#e8d9b4" strokeWidth={1.6} />
        </g>
      )}

      <g transform={spin ? `rotate(${spin} 50 52)` : undefined}>
        <g fill={`url(#${gid})`} stroke={c.deep} strokeWidth={1.2}>
          {shapeEl()}
        </g>

        {shape === 'snowflake' && (
          <g clipPath={`url(#${clip})`}>
            <Snowflake />
          </g>
        )}

        <g clipPath={`url(#${clip})`}>{decorLayers()}</g>

        {/* блик */}
        <ellipse cx={36} cy={30} rx={12} ry={7} fill="#fff" opacity={0.22} transform="rotate(-24 36 30)" />
        <ellipse cx={70} cy={78} rx={8} ry={4} fill="#fff" opacity={0.1} transform="rotate(-24 70 78)" />

        {showLabel && label ? (
          <text
            x={50}
            y={shape === 'star' ? 60 : 58}
            textAnchor="middle"
            fontSize={9.5}
            fontFamily="Georgia, serif"
            fontWeight={700}
            fill={c.ink}
            opacity={0.92}
          >
            {label.slice(0, 14)}
          </text>
        ) : null}

        {shape === 'bell' && <circle cx={50} cy={76} r={5} fill={c.deep} />}
      </g>
    </svg>
  )
}

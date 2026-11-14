import { useEffect, useMemo, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

interface Bldg {
  x: number
  w: number
  h: number
  roof: 'flat' | 'peak' | 'round'
  windows: { x: number; y: number; on: boolean }[]
}

function makeLayer(seed: number, count: number, baseH: number, spanH: number, wMin: number, wMax: number): Bldg[] {
  const r = rng(seed)
  const out: Bldg[] = []
  let x = -4
  while (out.length < count && x < 104) {
    const w = wMin + r() * (wMax - wMin)
    const h = baseH + r() * spanH
    const roof = r() > 0.72 ? 'peak' : r() > 0.9 ? 'round' : 'flat'
    const windows: { x: number; y: number; on: boolean }[] = []
    const cols = Math.max(2, Math.floor(w / 7))
    const rows = Math.max(2, Math.floor(h / 11))
    for (let c = 0; c < cols; c++) {
      for (let k = 0; k < rows; k++) {
        if (r() > 0.45) continue
        windows.push({
          x: ((c + 0.5) / cols) * w,
          y: ((k + 0.6) / rows) * h,
          on: r() > 0.32,
        })
      }
    }
    out.push({ x, w, h, roof, windows })
    x += w + 0.7 + r() * 1.4
  }
  return out
}

/** Зимний город с параллаксом: три плана зданий, луна, звёзды, дымки из труб */
export default function CityScene() {
  const wrap = useRef<HTMLDivElement | null>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 })

  const far = useTransform(sx, [-1, 1], [14, -14])
  const farY = useTransform(sy, [-1, 1], [7, -7])
  const mid = useTransform(sx, [-1, 1], [26, -26])
  const midY = useTransform(sy, [-1, 1], [12, -12])
  const near = useTransform(sx, [-1, 1], [46, -46])
  const nearY = useTransform(sy, [-1, 1], [20, -20])

  const layers = useMemo(
    () => ({
      far: makeLayer(7, 26, 30, 26, 3.4, 6.4),
      mid: makeLayer(21, 20, 20, 24, 5, 9),
      near: makeLayer(99, 14, 12, 18, 8, 15),
    }),
    [],
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = wrap.current
      if (!el) return
      const r = el.getBoundingClientRect()
      mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
      my.set(((e.clientY - r.top) / r.height) * 2 - 1)
    }
    const onLeave = () => {
      mx.set(0)
      my.set(0)
    }
    const el = wrap.current
    el?.addEventListener('pointermove', onMove)
    el?.addEventListener('pointerleave', onLeave)
    return () => {
      el?.removeEventListener('pointermove', onMove)
      el?.removeEventListener('pointerleave', onLeave)
    }
  }, [mx, my])

  const drawLayer = (arr: Bldg[], key: string, fill: string, lit: string, glassOpacity: number) => (
    <svg
      key={key}
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-[72%] w-[112%] -translate-x-[6%]"
      aria-hidden="true"
    >
      <g transform="translate(0,0)">
        {arr.map((b, i) => {
          const top = 60 - b.h
          return (
            <g key={i}>
              <rect x={b.x} y={top} width={b.w} height={b.h} fill={fill} />
              {/* снежная шапка на плоской крыше */}
              {b.roof === 'flat' && <rect x={b.x} y={top - 0.5} width={b.w} height={0.8} fill="#dbe9ff" opacity={0.5} />}
              {b.roof === 'peak' && (
                <>
                  <polygon
                    points={`${b.x - 0.6},${top} ${b.x + b.w / 2},${top - 5.5} ${b.x + b.w + 0.6},${top}`}
                    fill={fill}
                  />
                  <polyline
                    points={`${b.x - 0.3},${top - 0.2} ${b.x + b.w / 2},${top - 5.2} ${b.x + b.w + 0.3},${top - 0.2}`}
                    fill="none"
                    stroke="#dbe9ff"
                    strokeWidth={0.7}
                    opacity={0.55}
                  />
                </>
              )}
              {b.roof === 'round' && (
                <>
                  <ellipse cx={b.x + b.w / 2} cy={top} rx={b.w / 2} ry={2.4} fill={fill} />
                  <ellipse cx={b.x + b.w / 2} cy={top - 0.8} rx={b.w / 2 - 0.4} ry={1.4} fill="#dbe9ff" opacity={0.4} />
                </>
              )}
              {b.windows.map((w, k) => (
                <rect
                  key={k}
                  x={b.x + w.x - 0.55}
                  y={top + w.y}
                  width={1.1}
                  height={1.5}
                  fill={w.on ? lit : '#0d0b22'}
                  opacity={w.on ? 0.75 + ((i + k) % 4) * 0.06 : glassOpacity}
                  rx={0.2}
                />
              ))}
            </g>
          )
        })}
      </g>
    </svg>
  )

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* луна и звёзды */}
      <div className="absolute inset-0">
        <div className="absolute left-[80%] top-[5%] h-20 w-20 rounded-full bg-[radial-gradient(circle_at_35%_32%,#fffdf3,#ffe9b8_45%,#e9c98a_70%,rgba(233,201,138,0)_72%)] opacity-90 blur-[0.3px]" />
        <div className="absolute left-[80%] top-[5%] h-36 w-36 -translate-x-8 -translate-y-8 rounded-full bg-gold/15 blur-3xl" />
      </div>

      <motion.div style={{ x: far, y: farY }} className="absolute inset-0">
        {drawLayer(layers.far, 'far', '#171238', '#e8c17a', 0.25)}
      </motion.div>
      <motion.div style={{ x: mid, y: midY }} className="absolute inset-0">
        {drawLayer(layers.mid, 'mid', '#120e2e', '#ffd27a', 0.3)}
      </motion.div>
      <motion.div style={{ x: near, y: nearY }} className="absolute inset-0">
        {drawLayer(layers.near, 'near', '#0a081f', '#ffc857', 0.35)}
      </motion.div>

      {/* снежные крыши: мягкая полоса поверх нижнего плана */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-night-900 via-night-900/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[14%] rounded-t-[50%] bg-[radial-gradient(120%_100%_at_50%_100%,#e9f2ff_0%,#b9cfe8_38%,rgba(185,207,232,0)_72%)] opacity-25 blur-[2px]" />
      {/* мягкая «вуаль», чтобы текст читался поверх города */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,20,.5)_0%,rgba(7,7,20,.28)_45%,rgba(7,7,20,.8)_100%)] lg:bg-[linear-gradient(100deg,rgba(7,7,20,.92)_0%,rgba(7,7,20,.62)_38%,rgba(7,7,20,.08)_66%,rgba(7,7,20,0)_85%)]" />
      {/* дымка */}
      <div className="absolute inset-x-0 bottom-[18%] h-24 bg-gradient-to-t from-ice/10 to-transparent blur-2xl" />
      {/* уличные фонари */}
      {[16, 38, 62, 84].map((x, i) => (
        <div key={x} className="absolute bottom-[16%]" style={{ left: `${x}%` }}>
          <div
            className="h-2.5 w-2.5 rounded-full bg-gold"
            style={{ boxShadow: '0 0 24px 10px rgba(255,200,87,.35)', animation: `pulseGlow ${4 + i}s ease-in-out infinite` }}
          />
        </div>
      ))}
    </div>
  )
}

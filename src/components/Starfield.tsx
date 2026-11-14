import { useMemo } from 'react'

/** Мерцающие звёзды: положение детерминировано, чтобы не дёргалось при перерисовке */
function seeded(n: number) {
  let s = n
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

export default function Starfield({ count = 70, className = '' }: { count?: number; className?: string }) {
  const stars = useMemo(() => {
    const rnd = seeded(20260101)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      y: rnd() * 100,
      s: rnd() * 2.1 + 0.7,
      delay: rnd() * 6,
      dur: 2.6 + rnd() * 4.4,
      gold: rnd() > 0.68,
    }))
  }, [count])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.s}px`,
            height: `${s.s}px`,
            background: s.gold ? '#ffe7a8' : '#eaf5ff',
            boxShadow: s.gold ? '0 0 8px 2px rgba(255,220,150,.5)' : '0 0 7px 2px rgba(200,230,255,.42)',
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  )
}

import { useEffect, useRef } from 'react'

/** Мягкий падающий снег на canvas: дёшево, плавно, с уважением к prefers-reduced-motion */
export default function Snowfall({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let w = 0
    let h = 0
    let flakes: { x: number; y: number; r: number; s: number; p: number; a: number }[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round((w < 700 ? 46 : 92) * density)
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.7,
        s: Math.random() * 0.55 + 0.22,
        p: Math.random() * Math.PI * 2,
        a: Math.random() * 0.5 + 0.45,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const f of flakes) {
        if (!reduced) {
          f.y += f.s
          f.p += 0.012
          f.x += Math.sin(f.p) * 0.35
          if (f.y > h + 5) {
            f.y = -8
            f.x = Math.random() * w
          }
          if (f.x > w + 5) f.x = -5
          if (f.x < -5) f.x = w + 5
        }
        ctx.globalAlpha = f.a
        ctx.fillStyle = '#eef6ff'
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [density])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[5]" aria-hidden="true" />
}

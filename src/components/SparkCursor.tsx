import { useEffect, useRef } from 'react'

/** Золотистая искорка, летящая за курсором / пальцем */
export default function SparkCursor() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      el.style.display = 'none'
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.display = 'none'
      return
    }
    let tx = -100
    let ty = -100
    let x = -100
    let y = -100
    let raf = 0
    const move = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
    }
    const loop = () => {
      x += (tx - x) * 0.16
      y += (ty - y) * 0.16
      el.style.transform = `translate(${x - 7}px, ${y - 7}px)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] h-3.5 w-3.5 rounded-full"
      style={{
        background: 'radial-gradient(circle at 40% 35%, #fff, #ffd45e 45%, rgba(255,200,87,0) 72%)',
        boxShadow: '0 0 18px 6px rgba(255,200,87,.45)',
        mixBlendMode: 'screen',
      }}
    />
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { isMusicOn, musicOff, musicOn } from '../lib/audio'

/** Переключатель атмосферной музыки. По умолчанию выключено — никакого автозапуска. */
export default function SoundToggle({ compact = false }: { compact?: boolean }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    setOn(isMusicOn())
  }, [])

  const toggle = () => {
    if (on) {
      musicOff()
      setOn(false)
    } else {
      musicOn()
      setOn(true)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Выключить музыку' : 'Включить музыку'}
      title={on ? 'Выключить музыку' : 'Включить музыку'}
      className={`group flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
        on
          ? 'border-gold/60 bg-gold/15 text-gold-light'
          : 'border-white/15 bg-white/[0.05] text-frost/70 hover:border-gold/40 hover:text-white'
      }`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        {on && <motion.span layoutId="sound-glow" className="absolute inset-0 rounded-full bg-gold/40 blur-md" />}
        <svg viewBox="0 0 24 24" className="relative h-4 w-4" fill="currentColor" aria-hidden="true">
          {on ? (
            <path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2-3.7v7.4a4.5 4.5 0 0 0 2-3.7zM13 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
          ) : (
            <path d="M4 9v6h4l5 4V5L8 9H4zm12.7 3 2.5-2.5-1.2-1.2L15.5 10.8 13 8.3l-1.2 1.2 2.5 2.5-2.5 2.5 1.2 1.2 2.5-2.5 2.5 2.5 1.2-1.2-2.5-2.5z" />
          )}
        </svg>
      </span>
      {!compact && <span>{on ? 'Музыка включена' : 'Включить музыку'}</span>}
    </button>
  )
}

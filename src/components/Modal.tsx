import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
}

/** Модальное окно: затемнение, всплытие, закрытие по Esc и клику по фону */
export default function Modal({ open, onClose, children, labelledBy }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-night-900/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ y: 26, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-night-800 to-night-900 p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)] sm:p-8"
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-ice transition hover:bg-white/20 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z" />
              </svg>
            </button>
            <div className="relative">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

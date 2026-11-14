import { motion } from 'framer-motion'
import type { Screen } from '../lib/types'
import { storeMode } from '../lib/store'
import SoundToggle from './SoundToggle'

const STEPS: { id: Screen; title: string }[] = [
  { id: 'home', title: 'Главная' },
  { id: 'film', title: 'Мультфильм' },
  { id: 'wish', title: 'Желание' },
  { id: 'workshop', title: 'Мастерская' },
  { id: 'tree', title: 'Ёлка' },
]

interface Props {
  screen: Screen
  onGo: (s: Screen) => void
}

export default function Header({ screen, onGo }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night-900/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 sm:h-16 sm:flex-nowrap sm:py-0 sm:px-5">
        <button
          type="button"
          onClick={() => onGo('home')}
          className="group flex shrink-0 items-center gap-2.5 rounded-full pr-2 text-left"
          aria-label="На главную"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-night-900 shadow-glow">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 21s-8-4.9-8-10.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 3.8C20 16.1 12 21 12 21z" />
            </svg>
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-[15px] text-white">От сердца к сердцу</span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-frost/50">зимняя история</span>
          </span>
        </button>

        <div className="relative order-3 w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-night-900 to-transparent sm:hidden" aria-hidden="true" />
        <nav className="w-full min-w-0 overflow-x-auto scrollbar-none" aria-label="Разделы">
          <ul className="flex items-center gap-1">
            {STEPS.map((s) => {
              const active = screen === s.id
              return (
                <li key={s.id} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => onGo(s.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative rounded-full px-3 py-1.5 text-[13px] transition ${
                      active ? 'text-night-900' : 'text-frost/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-gold-light to-gold"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative font-semibold">{s.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span
            className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1.5 text-[11px] text-frost/60 md:flex"
            title={
              storeMode === 'cloud'
                ? 'Игрушки сохраняются в общей базе Supabase и видны всем посетителям'
                : 'Демо-режим: игрушки сохраняются только в этом браузере (localStorage)'
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${storeMode === 'cloud' ? 'bg-pine' : 'bg-gold'}`}
              aria-hidden="true"
            />
            {storeMode === 'cloud' ? 'Общая база' : 'Демо-режим'}
          </span>
          <SoundToggle compact />
        </div>
      </div>
    </header>
  )
}

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BaseButton from '../components/BaseButton'
import Starfield from '../components/Starfield'
import VideoPlayer from '../components/VideoPlayer'
import type { Screen } from '../lib/types'

interface Props {
  onGo: (s: Screen) => void
}

const NOTES = [
  {
    title: 'О чём эта история',
    text: 'Девочка Аня находит на снегу замёрзший огонёк и весь день носит его в рукавичке — отдаёт тепло тем, кто рядом. К вечеру огонёк становится звездой на городской ёлке.',
  },
  {
    title: 'Почему это важно',
    text: 'Доброе дело не нужно делать большим. Иногда достаточно разделить тепло — и город становится светлее.',
  },
]

export default function FilmScreen({ onGo }: Props) {
  const [ended, setEnded] = useState(false)

  return (
    <div className="relative isolate mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      <Starfield count={44} className="-z-10 opacity-60" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-eyebrow">глава первая</p>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Мультфильм</h1>
        </div>
        <p className="text-sm text-frost/60">3 мин 6 с · со звуком</p>
      </div>

      <div className="mt-6">
        <VideoPlayer
          src={`${import.meta.env.BASE_URL}media/film.mp4`}
          poster={`${import.meta.env.BASE_URL}media/poster.jpg`}
          onEnded={() => setEnded(true)}
        />
      </div>

      <AnimatePresence>
        {ended && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mt-5 flex flex-col items-start gap-4 border-gold/40 bg-gold/[0.07] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-display text-xl text-gold-light">Теперь очередь за тобой!</p>
              <p className="hint mt-1">Мультфильм закончился — самое время загадать желание и повесить игрушку на ёлку.</p>
            </div>
            <BaseButton onClick={() => onGo('wish')} glow>
              Загадать желание
            </BaseButton>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {NOTES.map((n, i) => (
          <motion.div
            key={n.title}
            className="card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.08 }}
          >
            <h2 className="text-lg text-white">{n.title}</h2>
            <p className="hint mt-2">{n.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <BaseButton variant="ghost" onClick={() => onGo('wish')}>
          К желанию
        </BaseButton>
        <BaseButton variant="ghost" onClick={() => onGo('tree')}>
          Сразу к ёлке
        </BaseButton>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-frost/45">
        Мультфильм воспроизводится из файла <code className="rounded bg-white/10 px-1.5 py-0.5 text-frost/70">public/media/film.mp4</code>.
        Если вы открыли сайт без этого файла, плеер останется тёмным — добавьте ролик в папку и пересоберите проект.
      </p>
    </div>
  )
}

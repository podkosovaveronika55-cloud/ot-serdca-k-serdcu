import { motion } from 'framer-motion'
import BaseButton from '../components/BaseButton'
import CityScene from '../components/CityScene'
import Starfield from '../components/Starfield'
import Tree from '../components/Tree'
import { DEMO, storeMode } from '../lib/store'
import type { Screen } from '../lib/types'

interface Props {
  onGo: (s: Screen) => void
  realCount: number
  total: number
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 0.68, 0.32, 1] } }),
}

const STEPS = [
  {
    n: '01',
    title: 'Посмотри мультфильм',
    text: 'Три минуты о том, как маленький огонёк согревает целый город.',
    screen: 'film' as Screen,
    icon: (
      <path d="M4 6h16v12H4zM10 9l6 3-6 3z" />
    ),
  },
  {
    n: '02',
    title: 'Загадай желание',
    text: 'Одно тёплое слово — для себя, для близких, для города или всего мира.',
    screen: 'wish' as Screen,
    icon: <path d="M12 21s-8-4.9-8-10.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 3.8C20 16.1 12 21 12 21z" />,
  },
  {
    n: '03',
    title: 'Сделай свою игрушку',
    text: 'Форма, цвет, узор и короткая надпись — собери игрушку-пожелание.',
    screen: 'workshop' as Screen,
    icon: <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.1 6.1 20.2l1.2-6.6L2.5 9l6.6-.9z" />,
  },
]

export default function HomeScreen({ onGo, realCount, total }: Props) {
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        {/* город на фоне */}
        <div className="absolute inset-0 -z-10">
          <CityScene />
          <Starfield count={80} />
          <div className="absolute inset-0 bg-gradient-to-b from-night-900/40 via-night-900/25 to-night-900" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-20">
          <div className="relative z-10">
            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0} className="label-eyebrow">
              интерактивная зимняя сказка
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-4 font-display text-[2.6rem] leading-[1.03] text-white sm:text-6xl lg:text-[4.1rem]"
            >
              От сердца
              <span className="block bg-gradient-to-r from-gold-light via-gold to-berry bg-clip-text text-transparent">
                к сердцу
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-frost/80 sm:text-lg"
            >
              Мультфильм, желание и игрушка, которую вы повесите на общую ёлку. Город зажигает огни, когда кто-то
              рядом делает доброе дело — начните с маленького шага.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <BaseButton size="lg" onClick={() => onGo('film')} glow>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Смотреть мультфильм
              </BaseButton>
              <BaseButton size="lg" variant="ghost" onClick={() => onGo('wish')}>
                Загадать желание
              </BaseButton>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-frost/60"
            >
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-pine" aria-hidden="true" />
                {realCount > 0 ? `${realCount} ${plural(realCount, 'игрушка', 'игрушки', 'игрушек')} на ёлке` : 'Ёлка ждёт первую игрушку'}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-frost/30 sm:block" aria-hidden="true" />
              <span>{storeMode === 'cloud' ? 'игрушки видны всем посетителям' : 'демо-режим: сохранение в этом браузере'}</span>
            </motion.div>
          </div>

          {/* ёлка-витрина */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 0.68, 0.32, 1] }}
            className="relative mx-auto w-full max-w-[380px]"
          >
            <div className="absolute inset-x-0 bottom-6 h-10 rounded-[50%] bg-gold/15 blur-2xl" aria-hidden="true" />
            <Tree toys={DEMO.slice(0, Math.max(3, Math.min(DEMO.length, total)))} sway />
            <button
              type="button"
              onClick={() => onGo('tree')}
              className="mx-auto mt-1 flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs text-frost/80 backdrop-blur transition hover:border-gold/50 hover:text-white"
            >
              Подойти к ёлке
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M9 6l6 6-6 6-1.4-1.4L12.2 12 7.6 7.4z" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* как это устроено */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.button
              key={s.n}
              type="button"
              onClick={() => onGo(s.screen)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="card group text-left transition hover:border-gold/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    {s.icon}
                  </svg>
                </span>
                <span className="font-display text-sm tracking-[0.2em] text-frost/30">{s.n}</span>
              </div>
              <h3 className="mt-4 text-lg text-white">{s.title}</h3>
              <p className="hint mt-2">{s.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition group-hover:gap-2.5">
                Перейти
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M9 6l6 6-6 6-1.4-1.4L12.2 12 7.6 7.4z" />
                </svg>
              </span>
            </motion.button>
          ))}
        </div>

        <div className="card mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              {storeMode === 'cloud' ? 'Подключена общая база' : 'Сейчас активен демо-режим'}
            </p>
            <p className="hint mt-1">
              {storeMode === 'cloud'
                ? 'Игрушки сохраняются в Supabase и появляются у всех посетителей в реальном времени.'
                : 'Игрушки сохраняются в этом браузере. Чтобы ёлка стала общей, добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY — инструкция в README.'}
            </p>
          </div>
          <BaseButton variant="ghost" size="sm" onClick={() => onGo('tree')}>
            Посмотреть ёлку
          </BaseButton>
        </div>
      </section>
    </div>
  )
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

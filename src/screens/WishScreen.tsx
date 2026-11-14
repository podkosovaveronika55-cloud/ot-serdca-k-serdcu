import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import BaseButton from '../components/BaseButton'
import Starfield from '../components/Starfield'
import { validateText } from '../lib/moderation'
import { CATEGORIES, type Category, type Wish } from '../lib/types'

interface Props {
  wish: Wish
  onChange: (w: Wish) => void
  onNext: () => void
}

const MAX = 180

const IDEAS: Record<Category, string> = {
  self: 'Чтобы хватило сил и тепла на всё, что задумал.',
  family: 'Чтобы мама чаще смеялась, а дом был тёплым.',
  city: 'Чтобы наш двор зимой освещали фонари и бегали дети.',
  world: 'Чтобы никто на свете не оставался один в мороз.',
}

export default function WishScreen({ wish, onChange, onNext }: Props) {
  const [touched, setTouched] = useState(false)
  const check = useMemo(() => validateText(wish.text, 'wish'), [wish.text])
  const showError = touched && wish.text.length > 0 && !check.ok

  return (
    <div className="relative isolate mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <Starfield count={50} className="-z-10 opacity-50" />

      <p className="label-eyebrow">глава вторая</p>
      <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Загадай желание</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-frost/75">
        Желание спрячется внутри вашей игрушки: прочитать его сможет тот, кто снимет игрушку с ёлки. Выберите, для кого
        оно — и напишите одно тёплое предложение.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((c, i) => {
          const active = wish.category === c.id
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onChange({ ...wish, category: c.id })}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              aria-pressed={active}
              className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-gold/70 bg-gold/[0.12] shadow-[0_0_30px_-8px_rgba(255,200,87,.6)]'
                  : 'border-white/12 bg-white/[0.04] hover:border-white/30'
              }`}
            >
              <span className="flex items-center justify-between">
                <span className="font-display text-lg text-white">{c.title}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    active ? 'border-gold bg-gold text-night-900' : 'border-white/30'
                  }`}
                  aria-hidden="true"
                >
                  {active && (
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                      <path d="M9.6 16.2 5.4 12l-1.4 1.4 5.6 5.6L20.2 8.4 18.8 7z" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="mt-1 block text-sm text-frost/65">{c.hint}</span>
            </motion.button>
          )
        })}
      </div>

      <div className="card mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="wish-text" className="font-display text-lg text-white">
            Ваше желание
          </label>
          <span className={`text-xs tabular-nums ${wish.text.length > MAX ? 'text-berry' : 'text-frost/50'}`}>
            {wish.text.length} / {MAX}
          </span>
        </div>

        <textarea
          id="wish-text"
          value={wish.text}
          onChange={(e) => onChange({ ...wish, text: e.target.value.slice(0, MAX + 20) })}
          onBlur={() => setTouched(true)}
          rows={4}
          placeholder="Например: пусть в нашем доме всегда будет кто-то, кто ждёт с чаем."
          className="field mt-3 resize-none leading-relaxed"
          aria-invalid={showError}
          aria-describedby="wish-help"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...wish, text: IDEAS[wish.category] })}
            className="chip"
          >
            Подсказать идею для «{CATEGORIES.find((c) => c.id === wish.category)?.title.toLowerCase()}»
          </button>
        </div>

        <p id="wish-help" className={`mt-3 text-xs ${showError ? 'text-berry' : 'text-frost/50'}`} role={showError ? 'alert' : undefined}>
          {showError ? check.error : 'Без ссылок, телефонов и точных адресов — так ёлка останется доброй и безопасной.'}
        </p>
      </div>

      <div className="card mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Подписать игрушку вашим именем?</p>
          <p className="hint mt-1">Если выключить — на ёлке появится «Аноним». Желание всё равно прочитают.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!wish.anonymous}
          onClick={() => onChange({ ...wish, anonymous: !wish.anonymous })}
          className="flex shrink-0 items-center gap-3 rounded-full border border-white/15 bg-white/[0.05] px-3 py-2"
        >
          <span className="text-xs text-frost/70">{wish.anonymous ? 'Анонимно' : 'С именем'}</span>
          <span
            className={`relative h-6 w-11 rounded-full transition ${
              wish.anonymous ? 'bg-white/20' : 'bg-gradient-to-r from-gold-light to-gold'
            }`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${wish.anonymous ? 'left-0.5' : 'left-[22px]'}`}
            />
          </span>
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <BaseButton
          size="lg"
          onClick={() => {
            setTouched(true)
            if (check.ok) onNext()
          }}
          disabled={!check.ok}
          glow={check.ok}
        >
          Дальше: собрать игрушку
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M9 6l6 6-6 6-1.4-1.4L12.2 12 7.6 7.4z" />
          </svg>
        </BaseButton>
        <span className="text-xs text-frost/45">
          {check.ok ? 'Желание пройдёт проверку ещё раз перед публикацией.' : 'Напишите хотя бы несколько слов.'}
        </span>
      </div>
    </div>
  )
}

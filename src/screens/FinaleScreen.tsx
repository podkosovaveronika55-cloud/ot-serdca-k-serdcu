import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BaseButton from '../components/BaseButton'
import Ornament from '../components/Ornament'
import Starfield from '../components/Starfield'
import Tree from '../components/Tree'
import { ownToyIds } from '../lib/store'
import type { Screen, Toy } from '../lib/types'

interface Props {
  toys: Toy[]
  realCount: number
  onGo: (s: Screen) => void
}

export default function FinaleScreen({ toys, realCount, onGo }: Props) {
  const [shareNote, setShareNote] = useState<string | null>(null)
  const own = ownToyIds()
  const mine = toys.filter((t) => own.includes(t.id))

  useEffect(() => {
    if (!shareNote) return
    const t = setTimeout(() => setShareNote(null), 3200)
    return () => clearTimeout(t)
  }, [shareNote])

  const share = async () => {
    const url = window.location.href
    const data = {
      title: 'От сердца к сердцу',
      text: 'Зимняя история и общая ёлка: загадай желание и повесь свою игрушку.',
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(data)
        setShareNote('Спасибо, что делитесь!')
        return
      }
      await navigator.clipboard.writeText(url)
      setShareNote('Ссылка скопирована — можно отправлять.')
    } catch {
      setShareNote('Не удалось поделиться автоматически. Скопируйте адрес из строки браузера.')
    }
  }

  return (
    <div className="relative isolate mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <Starfield count={70} className="-z-10 opacity-70" />

      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="label-eyebrow"
        >
          финал
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mx-auto mt-3 max-w-2xl font-display text-3xl leading-tight text-white sm:text-5xl"
        >
          Тепло не заканчивается,
          <span className="block bg-gradient-to-r from-gold-light via-gold to-berry bg-clip-text text-transparent">
            если его передают
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-frost/75"
        >
          {realCount > 0
            ? `На ёлке уже ${realCount} ${plural(realCount, 'игрушка', 'игрушки', 'игрушек')} от разных людей. Каждая — чьё-то желание.`
            : 'Пока на ёлке только примеры — повесьте первую свою игрушку, и история начнётся.'}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.8 }}
        className="relative mx-auto mt-8 w-full max-w-[420px]"
      >
        <div className="absolute inset-x-6 bottom-4 h-12 rounded-[50%] bg-gold/20 blur-2xl" aria-hidden="true" />
        <Tree toys={toys} sway starGlow />
      </motion.div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
        <BaseButton size="md" onClick={() => onGo('tree')} glow className="w-full whitespace-nowrap">
          Посмотреть на ёлку
        </BaseButton>
        <BaseButton size="md" variant="ghost" onClick={() => onGo('wish')} className="w-full whitespace-nowrap">
          Создать ещё одну игрушку
        </BaseButton>
        <BaseButton size="md" variant="berry" onClick={() => void share()} className="w-full whitespace-nowrap">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M18 16.1c-.8 0-1.5.3-2 .8l-6.9-4a3.2 3.2 0 0 0 0-1.8l6.8-3.9c.5.5 1.3.8 2.1.8a3 3 0 1 0-3-3c0 .3 0 .6.1.9L8.3 9.7A3 3 0 1 0 6 15.1c.8 0 1.5-.3 2-.8l6.9 4a3 3 0 1 0 3.1-2.2z" />
          </svg>
          Поделиться проектом
        </BaseButton>
      </div>

      {shareNote && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-4 max-w-xl rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm text-gold-light"
          role="status"
        >
          {shareNote}
        </motion.p>
      )}

      {mine.length > 0 && (
        <div className="card mx-auto mt-10 max-w-2xl">
          <p className="text-sm font-semibold text-white">Ваши игрушки на этой ёлке</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {mine.map((t) => (
              <div key={t.id} className="flex w-[104px] flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                <Ornament shape={t.shape} color={t.color} decor={t.decor} size={62} />
                <p className="mt-1 line-clamp-2 text-center text-[11px] text-frost/70">{t.label || 'Без надписи'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-frost/40">
        <p>
          История сделана с любовью: мультфильм, музыка и игрушки — ручная работа. Можно свободно делиться ссылкой и
          повторять этот вечер с близкими.
        </p>
        <button type="button" onClick={() => onGo('home')} className="mt-3 underline decoration-gold/40 underline-offset-4 hover:text-frost/70">
          Вернуться в начало
        </button>
      </div>
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

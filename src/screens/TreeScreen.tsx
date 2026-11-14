import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BaseButton from '../components/BaseButton'
import Modal from '../components/Modal'
import Ornament from '../components/Ornament'
import Starfield from '../components/Starfield'
import Tree from '../components/Tree'
import { sfx } from '../lib/audio'
import { distance, freeSpots, nearestFreeSpot, SPOTS, type Spot } from '../lib/spots'
import { countReal, storeMode } from '../lib/store'
import { CATEGORIES, type Toy, type ToyDraft } from '../lib/types'

interface Props {
  toys: Toy[]
  pending: ToyDraft | null
  newIds: string[]
  busy: boolean
  onPlace: (pos: { x: number; y: number }) => void
  onGo: (s: 'wish' | 'workshop' | 'finale') => void
}

interface DragState {
  x: number
  y: number
  over: boolean
  spot: Spot | null
}

export default function TreeScreen({ toys, pending, newIds, busy, onPlace, onGo }: Props) {
  const treeRef = useRef<HTMLDivElement | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [selected, setSelected] = useState<Toy | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const taken = useMemo(() => toys.map((t) => t.pos), [toys])
  const free = useMemo(() => freeSpots(taken), [taken])
  const real = countReal(toys)

  const relFromEvent = useCallback((clientX: number, clientY: number) => {
    const el = treeRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    const x = ((clientX - r.left) / r.width) * 100
    const y = ((clientY - r.top) / r.height) * 100
    const over = x > -6 && x < 106 && y > -4 && y < 104
    return { x, y, over }
  }, [])

  const updateDrag = useCallback(
    (clientX: number, clientY: number) => {
      const rel = relFromEvent(clientX, clientY)
      if (!rel) return
      const spot = rel.over ? nearestFreeSpot({ x: rel.x, y: rel.y }, taken) : null
      setDrag({ x: clientX, y: clientY, over: rel.over, spot })
    },
    [relFromEvent, taken],
  )

  const startDrag = (e: React.PointerEvent) => {
    if (!pending) return
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    setNote(null)
    updateDrag(e.clientX, e.clientY)
  }

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return
    updateDrag(e.clientX, e.clientY)
  }

  const endDrag = () => {
    const spot = drag?.spot
    setDrag(null)
    if (spot) place(spot)
  }

  const place = (spot: Spot) => {
    const tooClose = taken.some((p) => distance(spot, p) < 9.5)
    if (tooClose) {
      setNote('Здесь уже висит игрушка — выберите другое место.')
      return
    }
    sfx('chime')
    onPlace({ x: spot.x, y: spot.y })
  }

  const highlight = drag?.spot ? [drag.spot] : []

  return (
    <div className="relative isolate mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Starfield count={54} className="-z-10 opacity-60" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-eyebrow">глава четвёртая</p>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Общая ёлка</h1>
        </div>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs ${
            storeMode === 'cloud' ? 'border-pine/50 bg-pine/15 text-ice-soft' : 'border-gold/50 bg-gold/15 text-gold-light'
          }`}
        >
          {storeMode === 'cloud' ? 'общая база: игрушки видны всем' : 'демо: игрушки только в этом браузере'}
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_minmax(0,330px)]">
        {/* сцена с ёлкой */}
        <div className="card relative overflow-hidden p-3 sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_18%,rgba(255,200,87,.12),transparent_72%)]" />
          <div ref={treeRef} className="relative mx-auto w-full max-w-[520px]" onPointerLeave={() => drag && setDrag(null)}>
            <Tree
              toys={toys}
              highlight={highlight}
              newIds={newIds}
              onToyClick={(t) => {
                sfx('pop')
                setSelected(t)
              }}
            />
            {/* точки свободных мест: можно повесить нажатием */}
            {pending && (
              <div className={`absolute inset-0 transition-opacity ${drag ? 'opacity-50' : 'opacity-100'}`}>
                {free.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => place(s)}
                    aria-label="Свободное место — повесить игрушку"
                    className="group absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition hover:scale-150"
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  >
                    <span className="h-2 w-2 rounded-full bg-gold/80 shadow-[0_0_10px_2px_rgba(255,200,87,.55)] animate-twinkle group-hover:h-3 group-hover:w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* снежный пол */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-ice/15 to-transparent" />
        </div>

        {/* панель */}
        <div className="space-y-4">
          <div className="card">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="font-display text-3xl text-gold">{real}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-frost/50">игрушек на ёлке</p>
              </div>
              <div>
                <p className="font-display text-3xl text-ice">{free.length}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-frost/50">свободных мест</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-frost/45">
              {toys.length - real > 0
                ? `${toys.length - real} из них — примеры оформления`
                : `всего точек на ветвях: ${SPOTS.length}`}
            </p>
          </div>

          {pending ? (
            <div className="card border-gold/40 bg-gold/[0.07]">
              <p className="text-sm font-semibold text-white">Ваша игрушка ждёт места</p>
              <p className="hint mt-1">Перетащите её на ёлку — или нажмите на любую золотую точку.</p>

              <div className="mt-4 flex flex-col items-center">
                <motion.div
                  onPointerDown={startDrag}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  className="cursor-grab touch-none select-none active:cursor-grabbing"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  role="button"
                  tabIndex={0}
                  aria-label="Перетащите игрушку на ёлку"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      const spot = nearestFreeSpot({ x: 50, y: 55 }, taken)
                      if (spot) place(spot)
                    }
                  }}
                >
                  <Ornament shape={pending.shape} color={pending.color} decor={pending.decor} label={pending.label} size={104} glow showLabel />
                </motion.div>
                <p className="mt-2 text-[11px] text-frost/50">
                  держите и ведите к ветке {busy ? '· сохраняем…' : ''}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <BaseButton
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const spot = nearestFreeSpot({ x: 50, y: 55 }, taken)
                    if (spot) place(spot)
                    else setNote('На ёлке больше нет свободных мест.')
                  }}
                  disabled={!free.length || busy}
                >
                  Повесить автоматически
                </BaseButton>
                <BaseButton size="sm" variant="ghost" onClick={() => onGo('workshop')}>
                  Переделать
                </BaseButton>
              </div>
            </div>
          ) : (
            <div className="card">
              <p className="text-sm font-semibold text-white">Хотите свою игрушку?</p>
              <p className="hint mt-1">Загадайте желание и соберите игрушку в мастерской — она появится здесь.</p>
              <div className="mt-4 flex flex-col gap-2">
                <BaseButton size="sm" onClick={() => onGo('wish')}>
                  Загадать желание
                </BaseButton>
                <BaseButton size="sm" variant="ghost" onClick={() => onGo('workshop')}>
                  В мастерскую
                </BaseButton>
              </div>
            </div>
          )}

          <AnimatePresence>
            {note && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-berry/40 bg-berry/10 px-4 py-3 text-sm text-berry"
                role="status"
              >
                {note}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="card">
            <p className="text-sm font-semibold text-white">Как читать ёлку</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-frost/60">
              <li>· Нажмите на игрушку — откроется пожелание внутри.</li>
              <li>· Покачивание и свечение — живые игрушки, их повесили люди.</li>
              <li>· Светящиеся точки — свободные ветки.</li>
            </ul>
            <div className="mt-4">
              <BaseButton size="sm" variant="ghost" onClick={() => onGo('finale')} className="w-full">
                Завершить и поделиться
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      {/* призрак при перетаскивании */}
      {drag && pending && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 opacity-95"
          style={{ left: drag.x, top: drag.y }}
        >
          <Ornament
            shape={pending.shape}
            color={pending.color}
            decor={pending.decor}
            label={pending.label}
            size={86}
            glow
          />
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="toy-wish-title">
        {selected && (
          <div className="flex flex-col items-center text-center">
            <div className="animate-float">
              <Ornament
                shape={selected.shape}
                color={selected.color}
                decor={selected.decor}
                label={selected.label}
                size={130}
                glow
                showLabel
              />
            </div>
            <h2 id="toy-wish-title" className="mt-4 font-display text-2xl text-white">
              {selected.label?.trim() ? selected.label : 'Пожелание'}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold/80">
              {CATEGORIES.find((c) => c.id === selected.category)?.title}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-frost/85">«{selected.wish}»</p>
            <p className="mt-4 text-xs text-frost/45">
              {selected.anonymous ? 'Аноним' : 'Подписано автором'} ·{' '}
              {new Date(selected.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              {selected.demo ? ' · пример для оформления' : ''}
            </p>
            <div className="mt-6 w-full">
              <BaseButton size="sm" variant="gold" className="w-full" onClick={() => setSelected(null)}>
                Пусть сбудется
              </BaseButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BaseButton from '../components/BaseButton'
import Ornament from '../components/Ornament'
import Starfield from '../components/Starfield'
import { validateText } from '../lib/moderation'
import { sfx } from '../lib/audio'
import {
  CATEGORIES,
  COLORS,
  DECORS,
  SHAPES,
  type ColorName,
  type Decor,
  type Shape,
  type ToyDraft,
  type Wish,
} from '../lib/types'

interface Props {
  draft: ToyDraft
  wish: Wish
  onChange: (d: ToyDraft) => void
  onReady: () => void
  onBack: () => void
}

const LABEL_MAX = 18
const COLOR_KEYS = Object.keys(COLORS) as ColorName[]

export default function WorkshopScreen({ draft, wish, onChange, onReady, onBack }: Props) {
  const [spin, setSpin] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [touched, setTouched] = useState(false)
  const dragRef = useRef<{ x: number; spin: number } | null>(null)

  const labelCheck = draft.label.trim().length === 0 ? { ok: true, clean: '' } : validateText(draft.label, 'label')
  const showLabelError = touched && draft.label.trim().length > 0 && !labelCheck.ok

  const set = <K extends keyof ToyDraft>(key: K, value: ToyDraft[K]) => {
    onChange({ ...draft, [key]: value })
  }

  const toggleDecor = (d: Decor) => {
    const has = draft.decor.includes(d)
    set('decor', has ? draft.decor.filter((x) => x !== d) : [...draft.decor, d].slice(-2))
    sfx('pop')
  }

  const randomize = () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
    onChange({
      shape: pick(SHAPES).id as Shape,
      color: pick(COLOR_KEYS),
      decor: [pick(DECORS).id as Decor],
      label: draft.label,
    })
    setSpin(spin + 180)
    sfx('sparkle')
  }

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, spin }
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    setSpin(dragRef.current.spin + (e.clientX - dragRef.current.x) * 0.9)
  }
  const onPointerUp = () => {
    dragRef.current = null
    setDragging(false)
  }

  const previewSize = Math.round(190 * zoom)

  return (
    <div className="relative isolate mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Starfield count={46} className="-z-10 opacity-50" />

      <p className="label-eyebrow">глава третья</p>
      <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Мастерская игрушки</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-frost/75">
        Соберите шар, звезду, снежинку, сердечко или колокольчик. Потяните игрушку вбок — она повернётся.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* предпросмотр */}
        <div className="card relative flex flex-col items-center justify-center self-start overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_38%,rgba(255,200,87,.16),transparent_70%)]" />
          <div
            className="relative flex h-[300px] w-full cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="img"
            aria-label={`Предпросмотр игрушки: ${SHAPES.find((s) => s.id === draft.shape)?.title}, надпись «${draft.label || 'без надписи'}»`}
          >
            {/* нить */}
            <div className="absolute top-0 h-10 w-px bg-gradient-to-b from-transparent via-white/40 to-white/70" aria-hidden="true" />
            <motion.div
              animate={{ rotate: spin, y: dragging ? -6 : [0, -5, 0] }}
              transition={
                dragging
                  ? { rotate: { type: 'spring', stiffness: 320, damping: 26 }, y: { duration: 0.2 } }
                  : { y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } }
              }
              style={{ transformOrigin: '50% 0%' }}
            >
              <Ornament
                shape={draft.shape}
                color={draft.color}
                decor={draft.decor}
                label={draft.label}
                size={previewSize}
                glow
                showLabel
              />
            </motion.div>
          </div>

          <div className="mt-1 w-full space-y-3 px-1">
            <label className="flex items-center gap-3 text-xs text-frost/60">
              Размер
              <input
                type="range"
                min={0.7}
                max={1.25}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="video-range flex-1"
                style={{ ['--p' as string]: `${((zoom - 0.7) / 0.55) * 100}%` }}
              />
              <span className="w-9 text-right tabular-nums text-frost/70">{Math.round(zoom * 100)}%</span>
            </label>
            <div className="flex gap-2">
              <BaseButton size="sm" variant="ghost" onClick={() => setSpin(spin + 360)} className="flex-1">
                Покрутить
              </BaseButton>
              <BaseButton size="sm" variant="ghost" onClick={randomize} className="flex-1">
                Случайная
              </BaseButton>
            </div>
          </div>
        </div>

        {/* настройки */}
        <div className="space-y-4">
          <div className="card">
            <p className="text-sm font-semibold text-white">Форма</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {SHAPES.map((s) => {
                const active = draft.shape === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      set('shape', s.id)
                      sfx('pop')
                    }}
                    aria-pressed={active}
                    aria-label={s.title}
                    className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2 text-[11px] transition ${
                      active ? 'border-gold/70 bg-gold/15 text-white' : 'border-white/12 text-frost/65 hover:border-white/30'
                    }`}
                  >
                    <Ornament shape={s.id} color={draft.color} decor={[]} size={34} />
                    {s.title}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card">
            <p className="text-sm font-semibold text-white">Цвет</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLOR_KEYS.map((c) => {
                const active = draft.color === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      set('color', c)
                      sfx('pop')
                    }}
                    aria-pressed={active}
                    aria-label={COLORS[c].title}
                    title={COLORS[c].title}
                    className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-xs transition ${
                      active ? 'border-gold/80 bg-white/10 text-white' : 'border-white/12 text-frost/65 hover:border-white/30'
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full ring-1 ring-white/30"
                      style={{ background: `radial-gradient(circle at 35% 30%, ${COLORS[c].light}, ${COLORS[c].main} 60%, ${COLORS[c].deep})` }}
                    />
                    {COLORS[c].title}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card">
            <p className="text-sm font-semibold text-white">
              Узор <span className="font-normal text-frost/50">— до двух</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DECORS.map((d) => {
                const active = draft.decor.includes(d.id)
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDecor(d.id)}
                    aria-pressed={active}
                    className={`chip ${active ? 'chip-active' : ''}`}
                  >
                    {d.title}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card">
            <div className="flex items-baseline justify-between">
              <label htmlFor="toy-label" className="text-sm font-semibold text-white">
                Надпись на игрушке
              </label>
              <span className="text-xs tabular-nums text-frost/50">
                {draft.label.length} / {LABEL_MAX}
              </span>
            </div>
            <input
              id="toy-label"
              value={draft.label}
              onChange={(e) => set('label', e.target.value.slice(0, LABEL_MAX + 4))}
              onBlur={() => setTouched(true)}
              placeholder="Для мамы, Свети, Мира…"
              maxLength={LABEL_MAX + 4}
              className="field mt-3"
              aria-invalid={showLabelError}
            />
            <p className={`mt-2 text-xs ${showLabelError ? 'text-berry' : 'text-frost/50'}`} role={showLabelError ? 'alert' : undefined}>
              {showLabelError ? labelCheck.error : 'Короткая надпись — её увидят все, кто подойдёт к ёлке.'}
            </p>
          </div>

          <div className="card border-gold/25 bg-gold/[0.05]">
            <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Желание внутри</p>
            <p className="mt-2 text-sm leading-relaxed text-frost/85">«{wish.text.trim()}»</p>
            <p className="mt-2 text-xs text-frost/50">
              {wish.anonymous ? 'Подписано «Аноним»' : 'Подписано вашим именем'} ·{' '}
              {CATEGORIES.find((c) => c.id === wish.category)?.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <BaseButton size="lg" onClick={onReady} disabled={!labelCheck.ok} glow>
              Повесить на ёлку
            </BaseButton>
            <BaseButton size="lg" variant="ghost" onClick={onBack}>
              Изменить желание
            </BaseButton>
          </div>
        </div>
      </div>

      <AnimatePresence />
    </div>
  )
}

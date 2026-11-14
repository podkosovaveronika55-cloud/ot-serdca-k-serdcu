import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  src: string
  poster?: string
  onEnded?: () => void
  onFirstPlay?: () => void
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec)) return '0:00'
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Видеоплеер: своя рамка, кнопки воспроизведения, громкость, полный экран, прогресс */
export default function VideoPlayer({ src, poster, onEnded, onFirstPlay }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffering, setBuffering] = useState(false)
  const [ended, setEnded] = useState(false)
  const [failed, setFailed] = useState(false)

  const play = useCallback(async () => {
    const v = videoRef.current
    if (!v) return
    try {
      await v.play()
      setStarted(true)
      onFirstPlay?.()
    } catch {
      /* автоплей может быть запрещён — останется кнопка */
    }
  }, [onFirstPlay])

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) void play()
    else v.pause()
  }, [play])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setCurrent(v.currentTime)
    const onMeta = () => setDuration(v.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnd = () => {
      setPlaying(false)
      setEnded(true)
      onEnded?.()
    }
    const onError = () => {
      setFailed(true)
      setBuffering(false)
    }
    const onWait = () => setBuffering(true)
    const onCanPlay = () => setBuffering(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', onEnd)
    v.addEventListener('waiting', onWait)
    v.addEventListener('playing', onCanPlay)
    v.addEventListener('error', onError)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', onEnd)
      v.removeEventListener('waiting', onWait)
      v.removeEventListener('playing', onCanPlay)
      v.removeEventListener('error', onError)
    }
  }, [onEnded])

  const seek = (value: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = value
    setCurrent(value)
  }

  const changeVolume = (value: number) => {
    const v = videoRef.current
    if (!v) return
    v.volume = value
    v.muted = value === 0
    setVolume(value)
    setMuted(value === 0)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted && v.volume === 0) {
      v.volume = 1
      setVolume(1)
    }
  }

  const fullscreen = () => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())
  }

  return (
    <div
      ref={wrapRef}
      className="group relative overflow-hidden rounded-[26px] border border-white/12 bg-black/60 shadow-[0_40px_120px_-40px_rgba(255,200,87,.45)] ring-1 ring-gold/25"
    >
      {/* мягкое свечение рамки */}
      <div className="pointer-events-none absolute -inset-[2px] -z-10 rounded-[28px] bg-gradient-to-br from-gold/40 via-ice/20 to-berry/30 blur-[10px] opacity-70" />

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black"
        onClick={toggle}
      />

      {!started && (
        <motion.button
          type="button"
          onClick={() => void play()}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-night-900/55 backdrop-blur-[2px] transition hover:bg-night-900/40"
          aria-label="Смотреть мультфильм"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-pulseGlow rounded-full bg-gold/30 blur-xl" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-night-900 shadow-glow">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <span className="font-display text-lg text-gold-light">Смотреть мультфильм</span>
          <span className="text-xs uppercase tracking-[0.24em] text-ice/70">3 минуты · со звуком</span>
        </motion.button>
      )}

      {failed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-night-900/90 p-6 text-center">
          <span className="font-display text-lg text-gold-light">Видео не загрузилось</span>
          <span className="max-w-sm text-sm text-frost/70">
            Проверьте, что файл лежит по пути <code className="rounded bg-white/10 px-1.5 py-0.5">public/media/film.mp4</code>.
            Если он на месте — значит, браузер не поддерживает формат MP4/H.264: откройте сайт в Chrome, Safari, Edge или Firefox.
          </span>
        </div>
      )}

      {buffering && !failed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-night-900/30">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        </div>
      )}

      {ended && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-night-900/45">
          <span className="rounded-full bg-night-900/70 px-5 py-2 text-sm text-gold-light">Мультфильм закончился</span>
        </div>
      )}

      {/* панель управления */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-night-900 via-night-900/80 to-transparent px-3 pb-3 pt-8 sm:px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold hover:text-night-900"
            aria-label={playing ? 'Пауза' : 'Воспроизвести'}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <span className="w-10 shrink-0 text-center text-[11px] tabular-nums text-ice/80">{fmt(current)}</span>

          <label className="relative flex-1" aria-label="Позиция в мультфильме">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={(e) => seek(Number(e.target.value))}
              className="video-range w-full"
              style={{ ['--p' as string]: duration ? `${(current / duration) * 100}%` : '0%' }}
            />
          </label>

          <span className="hidden w-10 shrink-0 text-center text-[11px] tabular-nums text-ice/60 sm:block">{fmt(duration)}</span>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label={muted ? 'Включить звук' : 'Выключить звук'}
            >
              {muted || volume === 0 ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3 2.8-2.8-1.4-1.4L15 10.6 12.2 7.8l-1.4 1.4L13.6 12l-2.8 2.8 1.4 1.4L15 13.4l2.8 2.8 1.4-1.4L16.5 12z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2-3.7v7.4a4.5 4.5 0 0 0 2-3.7z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              aria-label="Громкость"
              className="video-range w-20"
              style={{ ['--p' as string]: `${(muted ? 0 : volume) * 100}%` }}
            />
          </div>

          <button
            type="button"
            onClick={fullscreen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Полный экран"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M4 9V4h5v2H6v3H4zm11-5h5v5h-2V6h-3V4zM4 15h2v3h3v2H4v-5zm14 3v-3h2v5h-5v-2h3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

declare global {
  interface HTMLElement {
    webkitRequestFullscreen?: () => Promise<void> | void
  }
}

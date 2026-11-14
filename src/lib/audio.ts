// Атмосферная музыка: музыкальная шкатулка → арпеджио → колокольчики.
// Полностью синтезируется в браузере, ничего не скачивается.
// Автозапуска нет: включается только по нажатию переключателя.

type Ctx = AudioContext & { webkitAudioContext?: never }

let ctx: AudioContext | null = null
let master: GainNode | null = null
let music: GainNode | null = null
let timer: number | null = null
let bar = 0
let nextTime = 0
let layer = 0
let enabled = false

const PROG = [
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [261.63, 329.63, 392.0],
  [196.0, 246.94, 293.66],
]
const BAR = 2.6

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor() as Ctx
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    music = ctx.createGain()
    music.gain.value = 0.9
    music.connect(master)
  }
  return ctx
}

function note(freq: number, start: number, dur: number, amp: number, shape: 'box' | 'piano' | 'pad' = 'box') {
  if (!ctx || !music) return
  const t0 = Math.max(start, ctx.currentTime)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = shape === 'pad' ? 'sine' : 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.linearRampToValueAtTime(amp, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain)
  gain.connect(music)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

function scheduleBar(i: number, t0: number) {
  const ch = PROG[i % 4]
  note(ch[0] / 2, t0, 3.4, 0.07)
  note(ch[2], t0 + 0.04, 2.6, 0.035)
  if (layer >= 1) {
    ;[0, 1, 2, 1, 0].forEach((k, n) => note(ch[k] * 2, t0 + 0.55 + n * 0.42, 1.0, 0.022))
  }
  if (layer >= 2) {
    ch.forEach((f) => note(f, t0 + 0.06, 3.0, 0.013, 'pad'))
    note(ch[1] * 4, t0 + 1.35, 0.9, 0.016, 'piano')
  }
  if (layer >= 3) {
    note(ch[2] * 4, t0 + 1.85, 1.5, 0.018)
    note(ch[0] * 4, t0 + 1.0, 0.8, 0.012)
  }
}

function tick() {
  if (!ctx) return
  while (nextTime < ctx.currentTime + 1.0) {
    scheduleBar(bar++, nextTime)
    nextTime += BAR
  }
}

export function setLayer(n: number) {
  layer = Math.max(0, Math.min(3, n))
}

export function musicOn() {
  const c = ensure()
  if (!c) return
  void c.resume()
  enabled = true
  if (timer === null) {
    nextTime = c.currentTime + 0.08
    tick()
    timer = window.setInterval(tick, 260)
  }
  master?.gain.setTargetAtTime(0.5, c.currentTime, 0.8)
}

export function musicOff() {
  enabled = false
  if (ctx && master) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25)
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

export function isMusicOn() {
  return enabled
}

/** короткий «динь» для действий: подвешивание, сохранение */
export function sfx(kind: 'chime' | 'pop' | 'sparkle' = 'chime') {
  const c = ensure()
  if (!c || !master) return
  void c.resume()
  const now = c.currentTime
  const freqs = kind === 'pop' ? [523.25] : kind === 'sparkle' ? [1046.5, 1318.5, 1568.0] : [784, 988, 1319]
  freqs.forEach((f, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    const t = now + i * 0.09
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(kind === 'pop' ? 0.05 : 0.03, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
    osc.connect(gain)
    if (master) gain.connect(master)
    osc.start(t)
    osc.stop(t + 1.2)
  })
}

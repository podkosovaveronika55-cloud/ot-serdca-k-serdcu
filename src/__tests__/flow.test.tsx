import { afterEach, describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import App from '../App'

// --- заглушки браузерных API, которых нет в jsdom -------------------------
class FakeGain {
  gain = { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }
  connect() {}
  disconnect() {}
}
class FakeOsc {
  type = 'sine'
  frequency = { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {} }
  connect() {}
  start() {}
  stop() {}
}
class FakeCtx {
  currentTime = 0
  destination = {}
  state = 'running'
  createGain() {
    return new FakeGain()
  }
  createOscillator() {
    return new FakeOsc()
  }
  createConvolver() {
    return new FakeGain()
  }
  createBiquadFilter() {
    return new FakeGain()
  }
  resume() {
    return Promise.resolve()
  }
  suspend() {
    return Promise.resolve()
  }
}

afterEach(() => cleanup())

beforeEach(() => {
  localStorage.clear()
  window.history.pushState(null, '', '/')
  vi.stubGlobal('AudioContext', FakeCtx)
  // matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false
      },
    }),
  })
  // canvas
  HTMLCanvasElement.prototype.getContext = (() => ({
    setTransform() {},
    clearRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    fillRect() {},
    save() {},
    restore() {},
    scale() {},
    translate() {},
    set fillStyle(_v: string) {},
    set globalAlpha(_v: number) {},
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext
  // requestAnimationFrame
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number)
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      root = null
      rootMargin = ''
      thresholds = []
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  window.scrollTo = () => {}
})

describe('путешествие по сайту', () => {
  it('главная: заголовок и переход к мультфильму', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy()
    const toFilm = screen.getAllByRole('button', { name: /Смотреть мультфильм/i })[0]
    fireEvent.click(toFilm)
    await waitFor(() => expect(screen.getByText('глава первая')).toBeTruthy())
    expect(screen.getByText(/Мультфильм воспроизводится из файла/)).toBeTruthy()
  })

  it('желание → мастерская → ёлка: игрушка появляется и открывается пожелание', async () => {
    render(<App />)

    // сразу в мастерскую нельзя — уводит на желание
    fireEvent.click(screen.getAllByRole('button', { name: 'Мастерская' })[0])
    expect(await screen.findByText('глава вторая')).toBeTruthy()

    // пишем желание
    const ta = screen.getByLabelText('Ваше желание')
    fireEvent.change(ta, { target: { value: 'Пусть в доме всегда будет тепло и чай.' } })
    fireEvent.click(screen.getByRole('button', { name: /Дальше: собрать игрушку/i }))

    // мастерская
    expect(await screen.findByText('глава третья')).toBeTruthy()
    fireEvent.click(await screen.findByRole('button', { name: 'Звезда' }, { timeout: 3000 }))
    const label = await screen.findByLabelText('Надпись на игрушке')
    fireEvent.change(label, { target: { value: 'Для мамы' } })
    fireEvent.click(await screen.findByRole('button', { name: /Повесить на ёлку/i }))

    // ёлка
    expect(await screen.findByText('глава четвёртая')).toBeTruthy()
    expect(await screen.findByText('Ваша игрушка ждёт места')).toBeTruthy()

    fireEvent.click(await screen.findByRole('button', { name: /Повесить автоматически/i }))

    await waitFor(() => expect(screen.getByText('финал')).toBeTruthy(), { timeout: 5000 })

    const stored = JSON.parse(localStorage.getItem('hh.toys.v1') || '[]')
    expect(stored.length).toBe(1)
    expect(stored[0].label).toBe('Для мамы')
    expect(stored[0].wish).toContain('тепло')
    expect(stored[0].shape).toBe('star')
  })

  it('игрушка с ёлки открывает пожелание в модалке', async () => {
    localStorage.setItem(
      'hh.toys.v1',
      JSON.stringify([
        {
          id: 'test-1',
          createdAt: new Date().toISOString(),
          shape: 'heart',
          color: 'red',
          decor: ['snow'],
          label: 'Маме',
          wish: 'Пусть мама чаще смеётся',
          category: 'family',
          anonymous: false,
          pos: { x: 50, y: 45 },
        },
      ]),
    )
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Ёлка' })[0])
    const toy = await screen.findByRole('button', { name: /Игрушка: Маме/i })
    fireEvent.click(toy)
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Пусть мама чаще смеётся/)).toBeTruthy()
  })

  it('модерация не пускает пустое желание и спам', async () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Желание' })[0])
    await screen.findByText('глава вторая')
    const next = screen.getByRole('button', { name: /Дальше: собрать игрушку/i })
    expect((next as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText('Ваше желание'), { target: { value: 'займ без процентов' } })
    fireEvent.blur(screen.getByLabelText('Ваше желание'))
    expect((next as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText(/Похоже на рекламу/i)).toBeTruthy()
  })
})

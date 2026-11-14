import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import Snowfall from './components/Snowfall'
import SparkCursor from './components/SparkCursor'
import HomeScreen from './screens/HomeScreen'
import FilmScreen from './screens/FilmScreen'
import WishScreen from './screens/WishScreen'
import WorkshopScreen from './screens/WorkshopScreen'
import TreeScreen from './screens/TreeScreen'
import FinaleScreen from './screens/FinaleScreen'
import { setLayer, sfx } from './lib/audio'
import { rateLimitOk } from './lib/moderation'
import { addToy, countReal, listToys, rememberOwn, storeMode, subscribeToys } from './lib/store'
import { SCREENS, type Screen, type Toy, type ToyDraft, type Wish } from './lib/types'

const HASH: Record<Screen, string> = {
  home: '',
  film: '#film',
  wish: '#wish',
  workshop: '#workshop',
  tree: '#tree',
  finale: '#finale',
}

function screenFromHash(): Screen {
  const h = window.location.hash.replace(/^#\/?/, '')
  const found = SCREENS.find((s) => s.id === h)
  return found ? found.id : 'home'
}

const EMPTY_WISH: Wish = { text: '', category: 'family', anonymous: false }
const EMPTY_DRAFT: ToyDraft = { shape: 'ball', color: 'red', decor: ['snow'], label: '' }

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => screenFromHash())
  const [wish, setWish] = useState<Wish>(EMPTY_WISH)
  const [draft, setDraft] = useState<ToyDraft>(EMPTY_DRAFT)
  const [pending, setPending] = useState<ToyDraft | null>(null)
  const [toys, setToys] = useState<Toy[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [newIds, setNewIds] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const notify = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4200)
  }, [])

  const refresh = useCallback(async () => {
    const list = await listToys()
    setToys(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    return subscribeToys(() => void refresh())
  }, [refresh])

  useEffect(() => {
    const onHash = () => setScreen(screenFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // музыкальная «глубина» растёт по мере прохождения истории
  useEffect(() => {
    const layers: Record<Screen, number> = { home: 0, film: 0, wish: 1, workshop: 2, tree: 3, finale: 3 }
    setLayer(layers[screen])
  }, [screen])

  const go = useCallback((next: Screen) => {
    setScreen(next)
    const hash = HASH[next]
    if (hash) {
      if (window.location.hash !== hash) window.history.pushState(null, '', hash)
    } else if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname + window.location.search)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    sfx('pop')
  }, [])

  // мастерская без желания бессмысленна: отправляем на экран желания
  useEffect(() => {
    if (screen === 'workshop' && !wish.text.trim()) {
      notify('Сначала загадайте желание — оно спрячется внутри игрушки.')
      go('wish')
    }
  }, [screen, wish.text, go, notify])

  const realCount = useMemo(() => countReal(toys), [toys])

  const workshopReady = () => {
    setPending(draft)
    go('tree')
    notify('Игрушка готова — перетащите её на ёлку.')
  }

  const placeToy = async (pos: { x: number; y: number }) => {
    if (!pending || busy) return
    if (!rateLimitOk()) {
      notify('Слишком много игрушек за час с этого устройства. Попробуйте позже.')
      return
    }
    setBusy(true)
    try {
      const toy = await addToy(pending, wish.text.trim(), wish.category, wish.anonymous, pos)
      rememberOwn(toy.id)
      setNewIds((ids) => [...ids, toy.id])
      setPending(null)
      setDraft(EMPTY_DRAFT)
      setWish((w) => ({ ...w, text: '' }))
      await refresh()
      notify(storeMode === 'cloud' ? 'Игрушка повешена на общую ёлку.' : 'Игрушка повешена (демо-режим: сохранено в браузере).')
      window.setTimeout(() => go('finale'), 900)
    } catch {
      notify('Не удалось сохранить игрушку. Попробуйте ещё раз.')
    } finally {
      setBusy(false)
    }
  }

  const navTo = (s: Screen) => {
    if (s === 'workshop' && !wish.text.trim()) {
      notify('Сначала загадайте желание — оно спрячется внутри игрушки.')
      go('wish')
      return
    }
    go(s)
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <Snowfall />
      <SparkCursor />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-night-900"
      >
        К содержимому
      </a>

      <Header screen={screen} onGo={navTo} />

      <main id="main" className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.38, ease: [0.22, 0.68, 0.32, 1] }}
          >
            {screen === 'home' && <HomeScreen onGo={navTo} realCount={realCount} total={toys.length} />}
            {screen === 'film' && <FilmScreen onGo={navTo} />}
            {screen === 'wish' && <WishScreen wish={wish} onChange={setWish} onNext={() => go('workshop')} />}
            {screen === 'workshop' && (
              <WorkshopScreen draft={draft} wish={wish} onChange={setDraft} onReady={workshopReady} onBack={() => go('wish')} />
            )}
            {screen === 'tree' && (
              <TreeScreen
                toys={toys}
                pending={pending}
                newIds={newIds}
                busy={busy}
                onPlace={(pos) => void placeToy(pos)}
                onGo={(s) => (s === 'finale' ? go('finale') : go(s))}
              />
            )}
            {screen === 'finale' && <FinaleScreen toys={toys} realCount={realCount} onGo={navTo} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-night-900/60 px-4 py-8 text-center text-xs text-frost/40 backdrop-blur">
        <p>
          «От сердца к сердцу» · зимняя история и общая ёлка
          {loading ? ' · загружаем игрушки…' : ''}
        </p>
        <p className="mt-2">
          Режим хранения: {storeMode === 'cloud' ? 'Supabase (общая база)' : 'localStorage (демо)'} · желания проходят
          проверку на спам и грубые слова
        </p>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-gold/40 bg-night-800/95 px-4 py-3 text-center text-sm text-gold-light shadow-glow backdrop-blur"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

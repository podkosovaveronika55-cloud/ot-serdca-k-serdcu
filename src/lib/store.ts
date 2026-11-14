import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Category, ColorName, Decor, Shape, Toy, ToyDraft } from './types'

/* ────────────────────────────── режим хранения ───────────────────────────── */

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isCloud = Boolean(URL_ && ANON)
export const storeMode: 'cloud' | 'local' = isCloud ? 'cloud' : 'local'

let client: SupabaseClient | null = null
function sb(): SupabaseClient | null {
  if (!isCloud) return null
  if (!client) client = createClient(URL_!, ANON!, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}

/* ────────────────────────────── локальное хранилище ───────────────────────── */

const KEY = 'hh.toys.v1'
const EVT = 'hh:toys-changed'

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function readLocal(): Toy[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as Toy[]) : []
  } catch {
    return []
  }
}

function writeLocal(toys: Toy[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(toys))
    window.dispatchEvent(new CustomEvent(EVT))
  } catch {
    /* приватный режим — просто не сохраняем */
  }
}

/* ────────────────────────────── примеры для ёлки ──────────────────────────── */

const DEMO: Toy[] = [
  {
    id: 'demo-1', createdAt: '2025-12-20T18:12:00.000Z', shape: 'heart', color: 'red', decor: ['glitter', 'snow'],
    label: 'Для мамы', wish: 'Чтобы мама чаще улыбалась и никогда не уставала.', category: 'family',
    anonymous: true, pos: { x: 50, y: 30 }, demo: true,
  },
  {
    id: 'demo-2', createdAt: '2025-12-21T09:40:00.000Z', shape: 'star', color: 'gold', decor: ['stars', 'garland'],
    label: 'Свети', wish: 'Пусть в каждом доме нашего города зимой будет тепло.', category: 'city',
    anonymous: false, pos: { x: 36, y: 46 }, demo: true,
  },
  {
    id: 'demo-3', createdAt: '2025-12-21T20:05:00.000Z', shape: 'snowflake', color: 'blue', decor: ['snow', 'pattern'],
    label: 'Мира', wish: 'Чтобы дети в любой стране встречали Новый год без войны.', category: 'world',
    anonymous: true, pos: { x: 64, y: 48 }, demo: true,
  },
  {
    id: 'demo-4', createdAt: '2025-12-22T11:30:00.000Z', shape: 'bell', color: 'silver', decor: ['garland'],
    label: 'Динь-динь', wish: 'Хочу научиться играть на пианино «В лесу родилась ёлочка».', category: 'self',
    anonymous: false, pos: { x: 44, y: 60 }, demo: true,
  },
  {
    id: 'demo-5', createdAt: '2025-12-22T19:55:00.000Z', shape: 'ball', color: 'violet', decor: ['hearts', 'glitter'],
    label: 'Бабушке', wish: 'Бабушке здоровья, а дедушке — новые валенки.', category: 'family',
    anonymous: true, pos: { x: 60, y: 66 }, demo: true,
  },
]

/* ────────────────────────────── API хранилища ────────────────────────────── */

type Row = {
  id: string
  created_at: string
  shape: Shape
  color: ColorName
  decor: Decor[]
  label: string
  wish: string
  category: Category
  anonymous: boolean
  pos_x: number
  pos_y: number
}

function fromRow(r: Row): Toy {
  return {
    id: r.id,
    createdAt: r.created_at,
    shape: r.shape,
    color: r.color,
    decor: Array.isArray(r.decor) ? r.decor : [],
    label: r.label,
    wish: r.wish,
    category: r.category,
    anonymous: r.anonymous,
    pos: { x: Number(r.pos_x), y: Number(r.pos_y) },
  }
}

function toRow(t: Toy): Row {
  return {
    id: t.id,
    created_at: t.createdAt,
    shape: t.shape,
    color: t.color,
    decor: t.decor,
    label: t.label,
    wish: t.wish,
    category: t.category,
    anonymous: t.anonymous,
    pos_x: t.pos.x,
    pos_y: t.pos.y,
  }
}

export async function listToys(): Promise<Toy[]> {
  if (isCloud) {
    const c = sb()
    if (c) {
      const { data, error } = await c
        .from('toys')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(600)
      if (!error && data) return (data as Row[]).map(fromRow)
    }
  }
  return [...DEMO, ...readLocal()]
}

export async function addToy(draft: ToyDraft, wish: string, category: Category, anonymous: boolean, pos: { x: number; y: number }): Promise<Toy> {
  const toy: Toy = {
    ...draft,
    id: uuid(),
    createdAt: new Date().toISOString(),
    wish,
    category,
    anonymous,
    pos,
  }
  if (isCloud) {
    const c = sb()
    if (c) {
      const { error } = await c.from('toys').insert(toRow(toy))
      if (!error) return toy
      // если облако недоступно, не теряем игрушку — пишем локально
      console.warn('Supabase insert failed, fallback to local', error.message)
    }
  }
  const list = readLocal()
  list.push(toy)
  writeLocal(list)
  return toy
}

export function subscribeToys(cb: () => void): () => void {
  const onCustom = () => cb()
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb()
  }
  window.addEventListener(EVT, onCustom)
  window.addEventListener('storage', onStorage)
  let unsub: (() => void) | undefined
  if (isCloud) {
    const c = sb()
    if (c) {
      const ch = c
        .channel('toys-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'toys' }, () => cb())
        .subscribe()
      unsub = () => {
        void c.removeChannel(ch)
      }
    }
  }
  return () => {
    window.removeEventListener(EVT, onCustom)
    window.removeEventListener('storage', onStorage)
    unsub?.()
  }
}

export function countReal(toys: Toy[]): number {
  return toys.filter((t) => !t.demo).length
}

/** Внутренние игрушки этого устройства — чтобы «своя» игрушка узнавалась */
export function ownToyIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem('hh.own.v1') || '[]')
  } catch {
    return []
  }
}

export function rememberOwn(id: string) {
  const ids = new Set(ownToyIds())
  ids.add(id)
  try {
    localStorage.setItem('hh.own.v1', JSON.stringify([...ids].slice(-40)))
  } catch {
    /* ignore */
  }
}

export { DEMO }

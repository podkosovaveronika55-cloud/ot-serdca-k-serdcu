// Проверка пользовательских надписей: длина, спам, ссылки, контакты, грубые слова.
// Работает и на клиенте (перед отправкой), и как образец для серверных правил Supabase.

const LINK_RE = /(https?:\/\/|www\.|\.(ru|com|net|org|io|me|xyz|shop)\b)/i
const CONTACT_RE = /(@|\+?\d[\d\s()-]{6,}\d)/
const REPEAT_RE = /(.)\1{4,}/u

const BAD = [
  'хуй', 'хуя', 'пизд', 'ебал', 'ебат', 'ебан', 'бляд', 'блят', 'сука', 'сучк', 'мудак', 'мудил',
  'говно', 'дерьмо', 'долбо', 'залуп', 'пидор', 'педик', 'шлюх', 'нахуй', 'охуе', 'уеб',
  'fuck', 'shit', 'bitch', 'cunt', 'nigg', 'porn', 'sex',
]

const SPAM = ['казино', 'ставки', 'заработ', 'крипт', 'bitcoin', 'казино', 'viagra', 'crypto', 'займ', 'микрозайм']

export interface ValidationResult {
  ok: boolean
  error?: string
  clean: string
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[её]/g, 'е')
    .replace(/[а]/g, 'а')
    .replace(/\s+/g, ' ')
    .trim()
}

export function validateText(raw: string, kind: 'wish' | 'label'): ValidationResult {
  const text = raw.replace(/\s+/g, ' ').trim()
  const max = kind === 'wish' ? 180 : 18
  if (text.length < (kind === 'wish' ? 5 : 2)) {
    return { ok: false, error: kind === 'wish' ? 'Напишите желание — хотя бы несколько слов.' : 'Надпись слишком короткая.', clean: text }
  }
  if (text.length > max) {
    return { ok: false, error: `Не больше ${max} символов.`, clean: text }
  }
  if (LINK_RE.test(text)) {
    return { ok: false, error: 'Ссылки публиковать нельзя — это защита от спама.', clean: text }
  }
  if (kind === 'wish' && CONTACT_RE.test(text)) {
    return { ok: false, error: 'Уберите телефоны и адреса почты: желания публикуются без контактов.', clean: text }
  }
  if (REPEAT_RE.test(text.replace(/\s/g, ''))) {
    return { ok: false, error: 'Слишком много одинаковых символов подряд.', clean: text }
  }
  const norm = normalize(text)
  const flat = norm.replace(/[^a-zа-я ]/g, '')
  if (BAD.some((w) => flat.includes(w))) {
    return { ok: false, error: 'Пожалуйста, без грубых слов — это добрая ёлка.', clean: text }
  }
  if (SPAM.some((w) => norm.includes(w))) {
    return { ok: false, error: 'Похоже на рекламу, а не на пожелание.', clean: text }
  }
  return { ok: true, clean: text }
}

// ограничение частоты: не больше 6 игрушек в час с одного устройства
const RATE_KEY = 'hh.rate.v1'
export function rateLimitOk(limit = 6): boolean {
  try {
    const now = Date.now()
    const arr: number[] = JSON.parse(localStorage.getItem(RATE_KEY) || '[]')
    const fresh = arr.filter((t) => now - t < 3600_000)
    if (fresh.length >= limit) return false
    fresh.push(now)
    localStorage.setItem(RATE_KEY, JSON.stringify(fresh))
    return true
  } catch {
    return true
  }
}

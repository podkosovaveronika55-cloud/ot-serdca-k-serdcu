// Типы и справочники проекта «От сердца к сердцу»

export type Screen = 'home' | 'film' | 'wish' | 'workshop' | 'tree' | 'finale'

export type Shape = 'ball' | 'star' | 'snowflake' | 'heart' | 'bell'
export type ColorName = 'red' | 'blue' | 'gold' | 'silver' | 'violet' | 'green' | 'pink'
export type Decor = 'snow' | 'stars' | 'hearts' | 'pattern' | 'glitter' | 'garland'
export type Category = 'self' | 'family' | 'city' | 'world'

export interface Wish {
  text: string
  category: Category
  anonymous: boolean
}

export interface ToyDraft {
  shape: Shape
  color: ColorName
  decor: Decor[]
  label: string
}

export interface Toy extends ToyDraft {
  id: string
  createdAt: string
  wish: string
  category: Category
  anonymous: boolean
  pos: { x: number; y: number } // проценты внутри сцены ёлки
  demo?: boolean
}

export const SHAPES: { id: Shape; title: string }[] = [
  { id: 'ball', title: 'Шар' },
  { id: 'star', title: 'Звезда' },
  { id: 'snowflake', title: 'Снежинка' },
  { id: 'heart', title: 'Сердечко' },
  { id: 'bell', title: 'Колокольчик' },
]

export const COLORS: Record<ColorName, { title: string; light: string; main: string; deep: string; ink: string }> = {
  red: { title: 'Красный', light: '#ff9a8a', main: '#ff5d5d', deep: '#a3141f', ink: '#3a0508' },
  blue: { title: 'Синий', light: '#9dbbff', main: '#5b8cff', deep: '#16307f', ink: '#050a24' },
  gold: { title: 'Золотой', light: '#ffe7a8', main: '#ffc857', deep: '#c98a12', ink: '#3a2600' },
  silver: { title: 'Серебряный', light: '#ffffff', main: '#dbe6f5', deep: '#8d9ab5', ink: '#1d2637' },
  violet: { title: 'Фиолетовый', light: '#d9c4ff', main: '#b58cff', deep: '#4b238f', ink: '#150729' },
  green: { title: 'Зелёный', light: '#a8f0c6', main: '#5fd18b', deep: '#0f6b3a', ink: '#03180d' },
  pink: { title: 'Розовый', light: '#ffd1e6', main: '#ff9ccc', deep: '#c42c7c', ink: '#3a001c' },
}

export const DECORS: { id: Decor; title: string }[] = [
  { id: 'snow', title: 'Снежинки' },
  { id: 'stars', title: 'Звёздочки' },
  { id: 'hearts', title: 'Сердечки' },
  { id: 'pattern', title: 'Узоры' },
  { id: 'glitter', title: 'Блёстки' },
  { id: 'garland', title: 'Гирлянда' },
]

export const CATEGORIES: { id: Category; title: string; hint: string }[] = [
  { id: 'self', title: 'Моё личное желание', hint: 'о себе' },
  { id: 'family', title: 'Для родных и близких', hint: 'о тех, кто рядом' },
  { id: 'city', title: 'Для моего города', hint: 'о дворе и улице' },
  { id: 'world', title: 'Для всего мира', hint: 'о большом' },
]

export const CATEGORY_TITLE: Record<Category, string> = {
  self: 'Моё личное желание',
  family: 'Для родных и близких',
  city: 'Для моего города',
  world: 'Для всего мира',
}

export const SCREENS: { id: Screen; title: string }[] = [
  { id: 'home', title: 'Начало' },
  { id: 'film', title: 'Мультфильм' },
  { id: 'wish', title: 'Желание' },
  { id: 'workshop', title: 'Мастерская' },
  { id: 'tree', title: 'Ёлка' },
  { id: 'finale', title: 'Финал' },
]

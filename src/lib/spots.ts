// Точки подвеса игрушек на ёлке (проценты внутри сцены).
// Ёлка — треугольник: на каждом ярусе свой допустимый размах по X.

export interface Spot {
  id: string
  x: number
  y: number
}

function halfWidth(y: number): number {
  // y: 0 (макушка) … 100 (низ). Ширина растёт к низу.
  const t = Math.min(1, Math.max(0, (y - 12) / 78))
  return 3 + t * 37
}

const ROWS: { y: number; counts: number[] }[] = [
  { y: 20, counts: [0] },
  { y: 28, counts: [-0.45, 0.45] },
  { y: 36, counts: [0, -0.7, 0.7] },
  { y: 45, counts: [-0.32, 0.32, -0.82, 0.82] },
  { y: 54, counts: [0, -0.55, 0.55, -0.92, 0.92] },
  { y: 63, counts: [-0.25, 0.25, -0.68, 0.68, -0.98, 0.98] },
  { y: 72, counts: [0, -0.45, 0.45, -0.8, 0.8] },
  { y: 80, counts: [-0.3, 0.3, -0.62, 0.62, -0.9, 0.9] },
]

export const SPOTS: Spot[] = ROWS.flatMap((row, ri) =>
  row.counts.map((k, ci) => ({
    id: `s${ri}-${ci}`,
    x: 50 + k * halfWidth(row.y),
    y: row.y,
  })),
)

const MIN_DIST = 9.5 // минимальное расстояние между игрушками, в процентах

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = (a.x - b.x) * 1.05
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

export function isFree(spot: Spot, taken: { x: number; y: number }[]): boolean {
  return taken.every((p) => distance(spot, p) > MIN_DIST)
}

/** ближайшая свободная точка к позиции (в процентах) */
export function nearestFreeSpot(pos: { x: number; y: number }, taken: { x: number; y: number }[]): Spot | null {
  const free = SPOTS.filter((s) => isFree(s, taken))
  if (!free.length) return null
  return free.reduce((best, s) => (distance(s, pos) < distance(best, pos) ? s : best), free[0])
}

/** ближайшая точка на ёлке — для подсветки при перетаскивании */
export function nearestSpot(pos: { x: number; y: number }): Spot {
  return SPOTS.reduce((best, s) => (distance(s, pos) < distance(best, pos) ? s : best), SPOTS[0])
}

export function freeSpots(taken: { x: number; y: number }[]): Spot[] {
  return SPOTS.filter((s) => isFree(s, taken))
}

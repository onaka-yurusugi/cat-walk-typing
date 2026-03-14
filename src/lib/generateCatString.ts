const KEYBOARD = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

export { KEYBOARD }

const MOVES = [
  { dr: -1, dc: -1 },
  { dr: -1, dc: 0 },
  { dr: -1, dc: 1 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
]

export type Difficulty = 'kitten' | 'adult' | 'boss'

interface DifficultyConfig {
  minLen: number
  maxLen: number
  sleepChance: number
  sleepMin: number
  sleepMax: number
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  kitten: { minLen: 3, maxLen: 6, sleepChance: 0.1, sleepMin: 5, sleepMax: 10 },
  adult: { minLen: 5, maxLen: 10, sleepChance: 0.3, sleepMin: 15, sleepMax: 39 },
  boss: { minLen: 8, maxLen: 15, sleepChance: 0.5, sleepMin: 20, sleepMax: 50 },
}

// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function getDailySeed(): number {
  const now = new Date()
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
}

export function generateCatString(
  difficulty: Difficulty = 'adult',
  seed?: number,
): string {
  const rng = seed !== undefined ? mulberry32(seed) : Math.random
  const config = DIFFICULTY_CONFIG[difficulty]

  let r = Math.floor(rng() * KEYBOARD.length)
  let c = Math.floor(rng() * KEYBOARD[r].length)
  const len =
    Math.floor(rng() * (config.maxLen - config.minLen + 1)) + config.minLen
  let str = KEYBOARD[r][c]

  const hasSleepEvent = rng() < config.sleepChance
  const sleepIndex = hasSleepEvent ? Math.floor(rng() * len) : -1

  for (let i = 1; i < len; i++) {
    if (rng() >= 0.2) {
      const validMoves = MOVES.filter((m) => {
        const nr = r + m.dr
        const nc = c + m.dc
        return KEYBOARD[nr] && KEYBOARD[nr][nc]
      })

      if (validMoves.length > 0) {
        const move = validMoves[Math.floor(rng() * validMoves.length)]
        r += move.dr
        c += move.dc
      }
    }

    str += KEYBOARD[r][c]

    if (i === sleepIndex) {
      const sleepLength =
        Math.floor(rng() * (config.sleepMax - config.sleepMin + 1)) +
        config.sleepMin
      str += KEYBOARD[r][c].repeat(sleepLength)
    }
  }

  return str
}

// デイリーチャレンジ用: 日付ベースで固定の問題セットを生成
export function generateDailyChallenge(
  count: number,
  difficulty: Difficulty = 'adult',
): string[] {
  const baseSeed = getDailySeed()
  return Array.from({ length: count }, (_, i) =>
    generateCatString(difficulty, baseSeed * 1000 + i),
  )
}

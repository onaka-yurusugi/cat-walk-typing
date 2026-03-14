const STORAGE_KEY = 'nekohara-typing-highscore'

export function getHighScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return 0
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

export function saveHighScore(score: number): boolean {
  const current = getHighScore()
  if (score > current) {
    try {
      localStorage.setItem(STORAGE_KEY, String(score))
    } catch {
      // localStorage unavailable
    }
    return true
  }
  return false
}

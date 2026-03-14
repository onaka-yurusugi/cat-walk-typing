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

export function generateCatString(): string {
  let r = Math.floor(Math.random() * KEYBOARD.length)
  let c = Math.floor(Math.random() * KEYBOARD[r].length)
  const len = Math.floor(Math.random() * 6) + 5 // 5〜10歩
  let str = KEYBOARD[r][c]

  // 30%の確率で寝落ちイベント
  const hasSleepEvent = Math.random() < 0.3
  const sleepIndex = hasSleepEvent ? Math.floor(Math.random() * len) : -1

  for (let i = 1; i < len; i++) {
    if (Math.random() >= 0.2) {
      // 80%で隣接キーへ移動
      const validMoves = MOVES.filter((m) => {
        const nr = r + m.dr
        const nc = c + m.dc
        return KEYBOARD[nr] && KEYBOARD[nr][nc]
      })

      if (validMoves.length > 0) {
        const move = validMoves[Math.floor(Math.random() * validMoves.length)]
        r += move.dr
        c += move.dc
      }
    }
    // 20%で同じキーに留まる（何もしない）

    str += KEYBOARD[r][c]

    // 寝落ちイベント: 15〜39回同じキー連打
    if (i === sleepIndex) {
      const sleepLength = Math.floor(Math.random() * 25) + 15
      str += KEYBOARD[r][c].repeat(sleepLength)
    }
  }

  return str
}

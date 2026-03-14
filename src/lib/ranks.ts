interface RankInfo {
  title: string
  emoji: string
  minScore: number
}

const RANKS: RankInfo[] = [
  { title: '猫神', emoji: '👑', minScore: 5000 },
  { title: '黒猫マスター', emoji: '🐈‍⬛', minScore: 3000 },
  { title: '猫使い', emoji: '✨', minScore: 2000 },
  { title: '猫好き上級者', emoji: '😺', minScore: 1500 },
  { title: '猫なで上手', emoji: '🐱', minScore: 1000 },
  { title: '猫見習い', emoji: '🐾', minScore: 500 },
  { title: 'のら猫ウォッチャー', emoji: '👀', minScore: 0 },
]

export function getRank(score: number): RankInfo {
  return RANKS.find((r) => score >= r.minScore) ?? RANKS[RANKS.length - 1]
}

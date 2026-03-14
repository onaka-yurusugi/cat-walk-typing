export interface RankInfo {
  title: string
  emoji: string
  minScore: number
}

const RANKS: RankInfo[] = [
  { title: 'ネコハラ社長', emoji: '👑', minScore: 8000 },
  { title: 'デキる飼い主', emoji: '🐈‍⬛', minScore: 5000 },
  { title: '猫と共存する者', emoji: '✨', minScore: 3500 },
  { title: 'そこそこ社員', emoji: '😺', minScore: 2500 },
  { title: '新人飼い主', emoji: '🐱', minScore: 1500 },
  { title: '猫に負けた人', emoji: '🐾', minScore: 500 },
  { title: '猫の下僕', emoji: '😿', minScore: 0 },
]

export function getRank(score: number): RankInfo {
  return RANKS.find((r) => score >= r.minScore) ?? RANKS[RANKS.length - 1]
}

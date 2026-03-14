import { useState, useEffect, useCallback, useRef } from 'react'
import { generateCatString } from '../lib/generateCatString'

interface PawStrike {
  id: number
  key: string
}

type GameState = 'title' | 'playing' | 'result'

export function useGame() {
  const [gameState, setGameState] = useState<GameState>('title')
  const [targetWord, setTargetWord] = useState('')
  const [typedChars, setTypedChars] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [paws, setPaws] = useState<PawStrike[]>([])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pawIdCounter = useRef(0)

  const addPawStrike = useCallback((key: string) => {
    const id = pawIdCounter.current++
    setPaws((prev) => [...prev, { id, key }])
    setTimeout(() => {
      setPaws((prev) => prev.filter((p) => p.id !== id))
    }, 150)
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    setTargetWord(generateCatString())
    setTypedChars('')
    setPaws([])
    setGameState('playing')

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setGameState('result')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      if (e.key.length > 1) return

      const key = e.key.toLowerCase()
      const expectedChar = targetWord[typedChars.length]

      if (key === expectedChar) {
        addPawStrike(key)
        const newTyped = typedChars + key
        setTypedChars(newTyped)
        setCombo((prev) => prev + 1)
        setScore((prev) => prev + 10 + Math.floor(combo / 10) * 10)

        if (newTyped === targetWord) {
          setTargetWord(generateCatString())
          setTypedChars('')
        }
      } else {
        setCombo(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, targetWord, typedChars, combo, addPawStrike])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return {
    gameState,
    targetWord,
    typedChars,
    score,
    combo,
    timeLeft,
    paws,
    startGame,
  }
}

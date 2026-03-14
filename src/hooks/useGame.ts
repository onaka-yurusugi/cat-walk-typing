import { useState, useEffect, useCallback, useRef } from 'react'
import {
  generateCatString,
  generateDailyChallenge,
  type Difficulty,
} from '../lib/generateCatString'
import { saveHighScore, getHighScore } from '../lib/highscore'

interface PawStrike {
  id: number
  key: string
}

export type GameMode = 'normal' | 'timeattack' | 'daily'
export type GameScreen = 'title' | 'playing' | 'result'

export interface GameStats {
  maxCombo: number
  totalKeys: number
  missCount: number
  accuracy: number
  keysPerSecond: number
}

interface ComboEvent {
  id: number
  type: 'combo-milestone' | 'purr-time' | 'kedama' | 'sleep-clear'
  message: string
}

const DIFFICULTY_TIME: Record<Difficulty, number> = {
  kitten: 30,
  adult: 60,
  boss: 90,
}

const TIMEATTACK_WORD_COUNT = 10

export function useGame() {
  const [screen, setScreen] = useState<GameScreen>('title')
  const [difficulty, setDifficulty] = useState<Difficulty>('adult')
  const [gameMode, setGameMode] = useState<GameMode>('normal')
  const [targetWord, setTargetWord] = useState('')
  const [typedChars, setTypedChars] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [paws, setPaws] = useState<PawStrike[]>([])
  const [isPurrTime, setIsPurrTime] = useState(false)
  const [shakeScreen, setShakeScreen] = useState(false)
  const [missFlash, setMissFlash] = useState(false)
  const [events, setEvents] = useState<ComboEvent[]>([])
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [highScore, setHighScore] = useState(0)

  // Time attack state
  const [taWords, setTaWords] = useState<string[]>([])
  const [taWordIndex, setTaWordIndex] = useState(0)
  const [taElapsed, setTaElapsed] = useState(0)

  // Stats tracking
  const maxComboRef = useRef(0)
  const totalKeysRef = useRef(0)
  const missCountRef = useRef(0)
  const startTimeRef = useRef(0)
  const [stats, setStats] = useState<GameStats | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pawIdCounter = useRef(0)
  const eventIdCounter = useRef(0)
  const purrTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Callbacks for sound effects (set by App)
  const onCorrectRef = useRef<(() => void) | null>(null)
  const onMissRef = useRef<(() => void) | null>(null)
  const onPurrRef = useRef<(() => void) | null>(null)

  const setOnCorrect = useCallback((fn: () => void) => {
    onCorrectRef.current = fn
  }, [])
  const setOnMiss = useCallback((fn: () => void) => {
    onMissRef.current = fn
  }, [])
  const setOnPurr = useCallback((fn: () => void) => {
    onPurrRef.current = fn
  }, [])

  const addEvent = useCallback(
    (type: ComboEvent['type'], message: string) => {
      const id = eventIdCounter.current++
      setEvents((prev) => [...prev, { id, type, message }])
      setTimeout(() => {
        setEvents((prev) => prev.filter((e) => e.id !== id))
      }, 1500)
    },
    [],
  )

  const addPawStrike = useCallback((key: string) => {
    const id = pawIdCounter.current++
    setPaws((prev) => [...prev, { id, key }])
    setTimeout(() => {
      setPaws((prev) => prev.filter((p) => p.id !== id))
    }, 150)
  }, [])

  // ゴロゴロタイム: ランダムに発動、数秒間スコア2倍
  const triggerPurrTime = useCallback(() => {
    setIsPurrTime(true)
    onPurrRef.current?.()
    addEvent('purr-time', 'ゴロゴロタイム！スコア2倍！')
    if (purrTimeoutRef.current) clearTimeout(purrTimeoutRef.current)
    purrTimeoutRef.current = setTimeout(() => {
      setIsPurrTime(false)
    }, 5000)
  }, [addEvent])

  const scoreRef = useRef(0)

  // Keep scoreRef in sync
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const finishGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const accuracy =
      totalKeysRef.current + missCountRef.current > 0
        ? totalKeysRef.current /
          (totalKeysRef.current + missCountRef.current)
        : 0
    setStats({
      maxCombo: maxComboRef.current,
      totalKeys: totalKeysRef.current,
      missCount: missCountRef.current,
      accuracy,
      keysPerSecond: elapsed > 0 ? totalKeysRef.current / elapsed : 0,
    })
    // High score check
    const isNew = saveHighScore(scoreRef.current)
    setIsNewHighScore(isNew)
    setHighScore(getHighScore())
    setScreen('result')
  }, [])

  const startGame = useCallback(
    (mode: GameMode = 'normal', diff: Difficulty = difficulty) => {
      setDifficulty(diff)
      setGameMode(mode)
      setScore(0)
      setCombo(0)
      setTypedChars('')
      setPaws([])
      setIsPurrTime(false)
      setShakeScreen(false)
      setMissFlash(false)
      setEvents([])
      setStats(null)
      setIsNewHighScore(false)
      setHighScore(getHighScore())

      maxComboRef.current = 0
      totalKeysRef.current = 0
      missCountRef.current = 0
      startTimeRef.current = Date.now()

      if (mode === 'timeattack') {
        const words = Array.from({ length: TIMEATTACK_WORD_COUNT }, () =>
          generateCatString(diff),
        )
        setTaWords(words)
        setTaWordIndex(0)
        setTargetWord(words[0])
        setTaElapsed(0)
        setTimeLeft(0) // Not used in TA mode, but show elapsed
        setScreen('playing')

        timerRef.current = setInterval(() => {
          setTaElapsed((prev) => prev + 1)
        }, 1000)
      } else if (mode === 'daily') {
        const words = generateDailyChallenge(TIMEATTACK_WORD_COUNT, diff)
        setTaWords(words)
        setTaWordIndex(0)
        setTargetWord(words[0])
        setTaElapsed(0)
        setTimeLeft(0)
        setScreen('playing')

        timerRef.current = setInterval(() => {
          setTaElapsed((prev) => prev + 1)
        }, 1000)
      } else {
        const time = DIFFICULTY_TIME[diff]
        setTimeLeft(time)
        setTargetWord(generateCatString(diff))
        setScreen('playing')

        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // finishGame will be called by effect
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    },
    [difficulty],
  )

  // Watch timeLeft for normal mode end
  useEffect(() => {
    if (screen === 'playing' && gameMode === 'normal' && timeLeft === 0) {
      finishGame()
    }
  }, [screen, gameMode, timeLeft, finishGame])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') return
      if (e.key.length > 1) return

      const key = e.key.toLowerCase()
      const expectedChar = targetWord[typedChars.length]

      if (key === expectedChar) {
        onCorrectRef.current?.()
        addPawStrike(key)
        const newTyped = typedChars + key
        setTypedChars(newTyped)
        const newCombo = combo + 1
        setCombo(newCombo)
        totalKeysRef.current++
        if (newCombo > maxComboRef.current) maxComboRef.current = newCombo

        // スコア計算: 基本10点 + コンボボーナス、ゴロゴロタイム中は2倍
        const baseScore = 10 + Math.floor(combo / 10) * 10
        const multiplier = isPurrTime ? 2 : 1
        setScore((prev) => prev + baseScore * multiplier)

        // コンボマイルストーン
        if (newCombo === 10) addEvent('combo-milestone', '10 COMBO!')
        if (newCombo === 20) addEvent('combo-milestone', '20 COMBO!!')
        if (newCombo === 50) {
          addEvent('combo-milestone', '50 COMBO!!!')
          setShakeScreen(true)
          setTimeout(() => setShakeScreen(false), 500)
        }
        if (newCombo === 100) {
          addEvent('combo-milestone', '100 COMBO!!!!')
          setShakeScreen(true)
          setTimeout(() => setShakeScreen(false), 800)
        }

        // 毛玉ボーナス: コンボ30ごとに発動
        if (newCombo > 0 && newCombo % 30 === 0) {
          addEvent('kedama', '毛玉ボーナス！+100点！')
          setScore((prev) => prev + 100)
        }

        // ゴロゴロタイムのランダム発動 (2%の確率)
        if (!isPurrTime && Math.random() < 0.02) {
          triggerPurrTime()
        }

        if (newTyped === targetWord) {
          // 寝落ちイベント完走チェック (20文字以上 = 寝落ちイベントあり)
          if (targetWord.length >= 20) {
            addEvent('sleep-clear', '寝落ち完走！猫パンチラッシュ！')
            setShakeScreen(true)
            setTimeout(() => setShakeScreen(false), 600)
          }

          if (gameMode === 'normal') {
            setTargetWord(generateCatString(difficulty))
            setTypedChars('')
          } else {
            // Time attack / Daily mode
            const nextIndex = taWordIndex + 1
            if (nextIndex >= taWords.length) {
              finishGame()
              return
            }
            setTaWordIndex(nextIndex)
            setTargetWord(taWords[nextIndex])
            setTypedChars('')
          }
        }
      } else {
        onMissRef.current?.()
        setCombo(0)
        missCountRef.current++
        setMissFlash(true)
        setTimeout(() => setMissFlash(false), 200)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    screen,
    targetWord,
    typedChars,
    combo,
    isPurrTime,
    difficulty,
    gameMode,
    taWords,
    taWordIndex,
    addPawStrike,
    addEvent,
    triggerPurrTime,
    finishGame,
  ])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (purrTimeoutRef.current) clearTimeout(purrTimeoutRef.current)
    }
  }, [])

  const goToTitle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (purrTimeoutRef.current) clearTimeout(purrTimeoutRef.current)
    setScreen('title')
    setHighScore(getHighScore())
  }, [])

  return {
    screen,
    difficulty,
    gameMode,
    targetWord,
    typedChars,
    score,
    combo,
    timeLeft,
    paws,
    isPurrTime,
    shakeScreen,
    missFlash,
    events,
    stats,
    isNewHighScore,
    highScore,
    taWordIndex,
    taWordCount: taWords.length,
    taElapsed,
    startGame,
    goToTitle,
    setOnCorrect,
    setOnMiss,
    setOnPurr,
  }
}

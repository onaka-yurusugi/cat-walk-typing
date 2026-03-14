import { useReducer, useEffect, useRef, useCallback } from 'react'
import { type WorkTask, selectTasks, TASK_COUNT, GAME_DURATION } from '../lib/workTasks'
import { saveHighScore, getHighScore } from '../lib/highscore'
import type { useSound } from './useSound'

// --------------- Types ---------------

export type GameScreen = 'title' | 'playing' | 'result'
export type GameOverReason = 'clear' | 'timeout' | 'cat-shutdown'
export type CatMood = 'happy' | 'wanting' | 'annoyed' | 'furious'

export interface GameStats {
  tasksCompleted: number
  totalTasks: number
  correctChars: number
  missCount: number
  totalTime: number
  avgSatisfaction: number
  gameOverReason: GameOverReason
  score: number
}

interface GameState {
  screen: GameScreen
  timeLeft: number
  tasks: WorkTask[]
  currentTaskIndex: number
  typedChars: string
  correctChars: number
  missCount: number
  catSatisfaction: number
  isPetting: boolean
  speechBubble: string | null
  speechBubbleTimer: number
  gameOverReason: GameOverReason | null
  stats: GameStats | null
  isNewRecord: boolean
  highScore: number
  shutdownPhase: boolean
  startTime: number
  lastTickTime: number
  satisfactionSum: number
  satisfactionTicks: number
  lastTypeTime: number
  missFlash: boolean
  catOnKeyboard: boolean
}

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'TICK'; now: number }
  | { type: 'KEY_PRESS'; key: string; now: number }
  | { type: 'PET_START' }
  | { type: 'PET_MOVE'; now: number }
  | { type: 'PET_END' }
  | { type: 'SHUTDOWN_COMPLETE' }
  | { type: 'GO_TO_TITLE' }
  | { type: 'CLEAR_MISS_FLASH' }

// --------------- Constants ---------------

const INITIAL_SATISFACTION = 75
const PET_CLICK_GAIN = 6
const PET_STROKE_GAIN = 3
const PET_STROKE_THROTTLE_MS = 150

const CAT_SPEECHES_WANTING = ['にゃ〜ん', 'かまって〜', 'ねぇねぇ', 'にゃっ']
const CAT_SPEECHES_ANNOYED = ['にゃっ！', 'シャッ', 'ムカッ', 'プンプン']
const CAT_SPEECHES_FURIOUS = ['シャーッ！！', '...（怒）', 'もう知らない！']
const CAT_SPEECHES_PETTING = ['ゴロゴロ...', 'にゃ〜♪', 'えへへ...']

// --------------- Helpers ---------------

export function getCatMood(satisfaction: number): CatMood {
  if (satisfaction >= 65) return 'happy'
  if (satisfaction >= 35) return 'wanting'
  if (satisfaction >= 10) return 'annoyed'
  return 'furious'
}

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function calculateScore(
  tasksCompleted: number,
  correctChars: number,
  missCount: number,
  timeLeft: number,
  avgSatisfaction: number,
  reason: GameOverReason,
): number {
  const baseScore = tasksCompleted * 500
  const total = correctChars + missCount
  const accuracyBonus = total > 0 ? Math.floor((correctChars / total) * 1000) : 0
  const speedBonus = reason === 'clear' ? Math.floor(timeLeft * 30) : 0
  const catBonus = Math.floor(avgSatisfaction * 30)
  return baseScore + accuracyBonus + speedBonus + catBonus
}

function buildFinishState(state: GameState, reason: GameOverReason, now: number): GameState {
  const elapsed = (now - state.startTime) / 1000
  const avgSat = state.satisfactionTicks > 0
    ? state.satisfactionSum / state.satisfactionTicks
    : 0
  const timeLeft = Math.max(0, GAME_DURATION - elapsed)
  const score = calculateScore(
    state.currentTaskIndex,
    state.correctChars,
    state.missCount,
    timeLeft,
    avgSat,
    reason,
  )
  const isNewRecord = saveHighScore(score)
  return {
    ...state,
    screen: 'result',
    timeLeft,
    gameOverReason: reason,
    isNewRecord,
    highScore: getHighScore(),
    stats: {
      tasksCompleted: state.currentTaskIndex,
      totalTasks: TASK_COUNT,
      correctChars: state.correctChars,
      missCount: state.missCount,
      totalTime: elapsed,
      avgSatisfaction: avgSat,
      gameOverReason: reason,
      score,
    },
  }
}

// --------------- Reducer ---------------

function createInitialState(): GameState {
  return {
    screen: 'title',
    timeLeft: GAME_DURATION,
    tasks: [],
    currentTaskIndex: 0,
    typedChars: '',
    correctChars: 0,
    missCount: 0,
    catSatisfaction: INITIAL_SATISFACTION,
    isPetting: false,
    speechBubble: null,
    speechBubbleTimer: 0,
    gameOverReason: null,
    stats: null,
    isNewRecord: false,
    highScore: getHighScore(),
    shutdownPhase: false,
    startTime: 0,
    lastTickTime: 0,
    satisfactionSum: 0,
    satisfactionTicks: 0,
    lastTypeTime: 0,
    missFlash: false,
    catOnKeyboard: false,
  }
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const tasks = selectTasks(TASK_COUNT)
      const now = Date.now()
      return {
        ...createInitialState(),
        screen: 'playing',
        tasks,
        timeLeft: GAME_DURATION,
        catSatisfaction: INITIAL_SATISFACTION,
        startTime: now,
        lastTickTime: now,
        highScore: getHighScore(),
      }
    }

    case 'TICK': {
      if (state.screen !== 'playing' || state.shutdownPhase) return state

      const dt = Math.min((action.now - state.lastTickTime) / 1000, 0.2)
      if (dt <= 0) return state

      const elapsed = (action.now - state.startTime) / 1000
      const newTimeLeft = Math.max(0, GAME_DURATION - elapsed)

      // Cat satisfaction decay — accelerates over time
      const progress = elapsed / GAME_DURATION
      const baseDecay = 1.0 + progress * 1.5
      const typingActive = (action.now - state.lastTypeTime) < 2000
      const typingExtra = typingActive ? 0.5 : 0
      const pettingRecovery = state.isPetting ? 18 : 0
      const netDecay = (baseDecay + typingExtra - pettingRecovery) * dt
      const newSatisfaction = Math.max(0, Math.min(100, state.catSatisfaction - netDecay))

      const newSatSum = state.satisfactionSum + newSatisfaction * dt
      const newSatTicks = state.satisfactionTicks + dt

      // Speech bubble
      let speechBubble = state.speechBubble
      let speechBubbleTimer = state.speechBubbleTimer - dt
      if (speechBubbleTimer <= 0) {
        speechBubble = null
        speechBubbleTimer = 0
      }

      const mood = getCatMood(newSatisfaction)
      if (!speechBubble && !state.isPetting) {
        const roll = Math.random()
        if (mood === 'wanting' && roll < 0.008 * dt * 20) {
          speechBubble = randomFrom(CAT_SPEECHES_WANTING)
          speechBubbleTimer = 2.5
        } else if (mood === 'annoyed' && roll < 0.015 * dt * 20) {
          speechBubble = randomFrom(CAT_SPEECHES_ANNOYED)
          speechBubbleTimer = 2
        } else if (mood === 'furious' && roll < 0.025 * dt * 20) {
          speechBubble = randomFrom(CAT_SPEECHES_FURIOUS)
          speechBubbleTimer = 1.5
        }
      }
      if (state.isPetting && !speechBubble && Math.random() < 0.02 * dt * 20) {
        speechBubble = randomFrom(CAT_SPEECHES_PETTING)
        speechBubbleTimer = 1.5
      }

      const catOnKeyboard = mood === 'annoyed' || mood === 'furious'

      // Time up
      if (newTimeLeft <= 0) {
        return buildFinishState(
          { ...state, satisfactionSum: newSatSum, satisfactionTicks: newSatTicks },
          'timeout',
          action.now,
        )
      }

      // Cat shutdown
      if (newSatisfaction <= 0) {
        return {
          ...state,
          catSatisfaction: 0,
          shutdownPhase: true,
          lastTickTime: action.now,
          satisfactionSum: newSatSum,
          satisfactionTicks: newSatTicks,
          speechBubble: 'ブチッ！！',
          speechBubbleTimer: 5,
          catOnKeyboard: true,
        }
      }

      return {
        ...state,
        timeLeft: newTimeLeft,
        catSatisfaction: newSatisfaction,
        speechBubble,
        speechBubbleTimer,
        lastTickTime: action.now,
        satisfactionSum: newSatSum,
        satisfactionTicks: newSatTicks,
        catOnKeyboard,
      }
    }

    case 'KEY_PRESS': {
      if (state.screen !== 'playing' || state.shutdownPhase) return state

      const currentTask = state.tasks[state.currentTaskIndex]
      if (!currentTask) return state

      const expectedChar = currentTask.text[state.typedChars.length]
      if (action.key === expectedChar) {
        const newTypedChars = state.typedChars + action.key
        const newCorrectChars = state.correctChars + 1

        if (newTypedChars.length >= currentTask.text.length) {
          const newTaskIndex = state.currentTaskIndex + 1

          if (newTaskIndex >= state.tasks.length) {
            return buildFinishState(
              { ...state, currentTaskIndex: newTaskIndex, correctChars: newCorrectChars },
              'clear',
              action.now,
            )
          }

          return {
            ...state,
            currentTaskIndex: newTaskIndex,
            typedChars: '',
            correctChars: newCorrectChars,
            lastTypeTime: action.now,
          }
        }

        return {
          ...state,
          typedChars: newTypedChars,
          correctChars: newCorrectChars,
          lastTypeTime: action.now,
        }
      }

      return {
        ...state,
        missCount: state.missCount + 1,
        lastTypeTime: action.now,
        missFlash: true,
      }
    }

    case 'PET_START':
      return {
        ...state,
        isPetting: true,
        catSatisfaction: Math.min(100, state.catSatisfaction + PET_CLICK_GAIN),
      }

    case 'PET_MOVE': {
      if (!state.isPetting) return state
      return {
        ...state,
        catSatisfaction: Math.min(100, state.catSatisfaction + PET_STROKE_GAIN),
      }
    }

    case 'PET_END':
      return { ...state, isPetting: false }

    case 'SHUTDOWN_COMPLETE':
      return buildFinishState(state, 'cat-shutdown', Date.now())

    case 'GO_TO_TITLE':
      return createInitialState()

    case 'CLEAR_MISS_FLASH':
      return { ...state, missFlash: false }

    default:
      return state
  }
}

// --------------- Hook ---------------

export function useGame(sound: ReturnType<typeof useSound>) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  })

  const lastPetMoveRef = useRef(0)

  // Game loop
  useEffect(() => {
    if (state.screen !== 'playing') return
    const interval = setInterval(() => dispatch({ type: 'TICK', now: Date.now() }), 50)
    return () => clearInterval(interval)
  }, [state.screen])

  // Shutdown animation
  useEffect(() => {
    if (!state.shutdownPhase) return
    sound.playShutdown()
    const timeout = setTimeout(() => dispatch({ type: 'SHUTDOWN_COMPLETE' }), 2000)
    return () => clearTimeout(timeout)
  }, [state.shutdownPhase, sound])

  // Miss flash clear
  useEffect(() => {
    if (!state.missFlash) return
    const t = setTimeout(() => dispatch({ type: 'CLEAR_MISS_FLASH' }), 200)
    return () => clearTimeout(t)
  }, [state.missFlash])

  // Keydown handler
  useEffect(() => {
    if (state.screen !== 'playing') return

    function handleKeydown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length !== 1) return
      e.preventDefault()

      const s = stateRef.current
      if (s.shutdownPhase) return

      const currentTask = s.tasks[s.currentTaskIndex]
      if (!currentTask) return

      const expectedChar = currentTask.text[s.typedChars.length]
      if (e.key === expectedChar) {
        sound.playType()
      } else {
        sound.playMiss()
      }

      dispatch({ type: 'KEY_PRESS', key: e.key, now: Date.now() })
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [state.screen, sound])

  // Periodic meow
  const catMood = getCatMood(state.catSatisfaction)

  useEffect(() => {
    if (state.screen !== 'playing' || catMood === 'happy') return
    const ms = catMood === 'furious' ? 2000 : catMood === 'annoyed' ? 3500 : 5000
    const interval = setInterval(() => {
      if (Math.random() < 0.4) sound.playMeow()
    }, ms)
    return () => clearInterval(interval)
  }, [state.screen, catMood, sound])

  // Purr while petting
  useEffect(() => {
    if (!state.isPetting || state.screen !== 'playing') return
    sound.playPurr()
    const interval = setInterval(() => sound.playPurr(), 1200)
    return () => clearInterval(interval)
  }, [state.isPetting, state.screen, sound])

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), [])
  const goToTitle = useCallback(() => dispatch({ type: 'GO_TO_TITLE' }), [])

  const handlePetStart = useCallback(() => {
    dispatch({ type: 'PET_START' })
  }, [])

  const handlePetMove = useCallback(() => {
    const now = Date.now()
    if (now - lastPetMoveRef.current < PET_STROKE_THROTTLE_MS) return
    lastPetMoveRef.current = now
    dispatch({ type: 'PET_MOVE', now })
  }, [])

  const handlePetEnd = useCallback(() => {
    dispatch({ type: 'PET_END' })
  }, [])

  return {
    ...state,
    catMood,
    startGame,
    goToTitle,
    handlePetStart,
    handlePetMove,
    handlePetEnd,
  }
}

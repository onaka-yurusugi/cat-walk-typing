import { useEffect, useRef, useState } from 'react'
import type { CatMood } from '../hooks/useGame'

interface CatProps {
  mood: CatMood
  satisfaction: number
  isPetting: boolean
  speechBubble: string | null
  shutdownPhase: boolean
  onPetStart: () => void
  onPetMove: () => void
  onPetEnd: () => void
}

const MOOD_EMOJI: Record<CatMood, string> = {
  happy: '😸',
  wanting: '🐱',
  annoyed: '😾',
  furious: '🙀',
}

const PETTING_EMOJI = '😻'

interface FloatingHeart {
  id: number
  x: number
  y: number
}

export function Cat({
  mood,
  satisfaction,
  isPetting,
  speechBubble,
  shutdownPhase,
  onPetStart,
  onPetMove,
  onPetEnd,
}: CatProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([])
  const heartIdRef = useRef(0)

  // Global mouseup/touchend for ending pet
  useEffect(() => {
    if (!isPetting) return
    const handleUp = () => onPetEnd()
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isPetting, onPetEnd])

  // Spawn hearts while petting
  useEffect(() => {
    if (!isPetting) return
    const interval = setInterval(() => {
      const id = heartIdRef.current++
      setHearts((prev) => [
        ...prev.slice(-5),
        { id, x: Math.random() * 60 - 30, y: 0 },
      ])
    }, 300)
    return () => clearInterval(interval)
  }, [isPetting])

  // Clean hearts
  useEffect(() => {
    if (hearts.length === 0) return
    const t = setTimeout(() => setHearts((prev) => prev.slice(1)), 1000)
    return () => clearTimeout(t)
  }, [hearts.length])

  const emoji = isPetting ? PETTING_EMOJI : MOOD_EMOJI[mood]

  // Position: moves from bottom-right to center as mood worsens
  const catStyle: Record<CatMood, React.CSSProperties> = {
    happy: { bottom: '8%', right: '5%', fontSize: '4rem' },
    wanting: { bottom: '15%', right: '15%', fontSize: '5rem' },
    annoyed: { bottom: '25%', right: '25%', fontSize: '6rem' },
    furious: { bottom: '30%', right: '30%', fontSize: '7rem' },
  }

  const baseStyle = shutdownPhase
    ? { bottom: '35%', right: '35%', fontSize: '8rem' }
    : catStyle[mood]

  const animationClass =
    mood === 'furious' || shutdownPhase
      ? 'animate-pulse'
      : mood === 'annoyed'
        ? 'animate-bounce-slow'
        : mood === 'wanting'
          ? 'animate-sway'
          : ''

  return (
    <div
      className={`absolute z-20 select-none transition-all duration-1000 ease-in-out ${
        shutdownPhase ? 'pointer-events-none' : 'cursor-pointer'
      }`}
      style={{ ...baseStyle, transition: 'all 1s ease-in-out' }}
      onMouseDown={(e) => {
        e.preventDefault()
        onPetStart()
      }}
      onMouseMove={() => {
        if (isPetting) onPetMove()
      }}
      onTouchStart={(e) => {
        e.preventDefault()
        onPetStart()
      }}
      onTouchMove={() => onPetMove()}
      role="button"
      tabIndex={-1}
      aria-label={`猫をなでる（満足度: ${Math.round(satisfaction)}%）`}
    >
      {/* Cat emoji */}
      <div className={`${animationClass} drop-shadow-lg`}>
        <span className="block">{emoji}</span>

        {/* Tail animation for happy cat */}
        {mood === 'happy' && !isPetting && (
          <span
            className="absolute -bottom-2 -right-4 text-2xl animate-wag origin-left"
            aria-hidden
          >
            〰️
          </span>
        )}
      </div>

      {/* Speech bubble */}
      {speechBubble && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 text-sm font-bold text-neutral-700 whitespace-nowrap shadow-lg border border-neutral-200 animate-pop">
          {speechBubble}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-neutral-200 rotate-45" />
        </div>
      )}

      {/* Floating hearts */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute text-lg pointer-events-none animate-heart-float"
          style={{ left: `calc(50% + ${h.x}px)`, top: '-10px' }}
        >
          ❤️
        </span>
      ))}

      {/* Furious red aura */}
      {(mood === 'furious' || shutdownPhase) && !isPetting && (
        <div className="absolute inset-[-20px] rounded-full bg-red-500/15 animate-pulse pointer-events-none" />
      )}
    </div>
  )
}

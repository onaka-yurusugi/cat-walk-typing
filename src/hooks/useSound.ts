import { useRef, useCallback } from 'react'

// Web Audio APIで猫の鳴き声風のSEを合成生成する
// 外部音声ファイル不要

function createMeowSound(
  ctx: AudioContext,
  frequency: number,
  duration: number,
): void {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(
    frequency * 1.3,
    ctx.currentTime + duration * 0.3,
  )
  oscillator.frequency.exponentialRampToValueAtTime(
    frequency * 0.7,
    ctx.currentTime + duration,
  )

  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + duration * 0.1)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

function createHissSound(ctx: AudioContext): void {
  const bufferSize = ctx.sampleRate * 0.15
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const source = ctx.createBufferSource()
  const gainNode = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  source.buffer = buffer
  filter.type = 'highpass'
  filter.frequency.value = 3000

  gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start()
}

function createPurrSound(ctx: AudioContext): void {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()

  oscillator.type = 'sawtooth'
  oscillator.frequency.value = 25

  lfo.type = 'sine'
  lfo.frequency.value = 20
  lfoGain.gain.value = 15

  lfo.connect(lfoGain)
  lfoGain.connect(oscillator.frequency)

  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.2)
  gainNode.gain.setValueAtTime(0.08, ctx.currentTime + 0.8)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 1.2)
  lfo.start(ctx.currentTime)
  lfo.stop(ctx.currentTime + 1.2)
}

const MEOW_FREQUENCIES = [600, 700, 800, 900, 1000, 1100]

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playMeow = useCallback(() => {
    const ctx = getContext()
    const freq =
      MEOW_FREQUENCIES[Math.floor(Math.random() * MEOW_FREQUENCIES.length)]
    const duration = 0.06 + Math.random() * 0.06
    createMeowSound(ctx, freq, duration)
  }, [getContext])

  const playHiss = useCallback(() => {
    const ctx = getContext()
    createHissSound(ctx)
  }, [getContext])

  const playPurr = useCallback(() => {
    const ctx = getContext()
    createPurrSound(ctx)
  }, [getContext])

  return { playMeow, playHiss, playPurr }
}

import { useRef, useCallback } from 'react'

function createMeowSound(ctx: AudioContext, frequency: number, duration: number): void {
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

function createTypeClick(ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.value = 600 + Math.random() * 400
  gain.gain.setValueAtTime(0.03, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.04)
}

function createMissSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.15)
}

function createShutdownSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.5)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.8)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 1.5)
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

  const playType = useCallback(() => {
    createTypeClick(getContext())
  }, [getContext])

  const playMiss = useCallback(() => {
    createMissSound(getContext())
  }, [getContext])

  const playMeow = useCallback(() => {
    const ctx = getContext()
    const freq = MEOW_FREQUENCIES[Math.floor(Math.random() * MEOW_FREQUENCIES.length)]
    const duration = 0.06 + Math.random() * 0.06
    createMeowSound(ctx, freq, duration)
  }, [getContext])

  const playHiss = useCallback(() => {
    createHissSound(getContext())
  }, [getContext])

  const playPurr = useCallback(() => {
    createPurrSound(getContext())
  }, [getContext])

  const playShutdown = useCallback(() => {
    createShutdownSound(getContext())
  }, [getContext])

  return { playType, playMiss, playMeow, playHiss, playPurr, playShutdown }
}

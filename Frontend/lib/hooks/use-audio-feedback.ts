"use client"

import { useCallback, useRef, useEffect } from "react"

// Frecuencias de sonido para diferentes estados
const FREQUENCIES = {
  success: { freq: 1200, duration: 100, type: "sine" as OscillatorType },
  error: { freq: 300, duration: 300, type: "square" as OscillatorType },
  warning: { freq: 600, duration: 150, type: "triangle" as OscillatorType },
  scan: { freq: 1800, duration: 50, type: "sine" as OscillatorType },
} as const

type SoundType = keyof typeof FREQUENCIES

export function useAudioFeedback() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(true)

  // Inicializar AudioContext solo en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  const playSound = useCallback((type: SoundType) => {
    if (!enabledRef.current || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const { freq, duration, type: oscType } = FREQUENCIES[type]

    // Crear oscilador
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = oscType
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime)

    // Fade out para evitar clicks
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration / 1000)
  }, [])

  const playSuccess = useCallback(() => playSound("success"), [playSound])
  const playError = useCallback(() => playSound("error"), [playSound])
  const playWarning = useCallback(() => playSound("warning"), [playSound])
  const playScan = useCallback(() => playSound("scan"), [playSound])

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled
  }, [])

  return {
    playSuccess,
    playError,
    playWarning,
    playScan,
    setEnabled,
  }
}

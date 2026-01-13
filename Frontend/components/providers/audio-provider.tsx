"use client"

import type React from "react"
import { createContext, useContext, useCallback, useRef, useEffect } from "react"
import { useUIStore } from "@/lib/stores/ui-store"

// Tipos de sonido disponibles
type SoundType = "success" | "error" | "warning" | "scan" | "notification" | "click"

interface AudioContextType {
  playSound: (type: SoundType) => void
  playSuccess: () => void
  playError: () => void
  playWarning: () => void
  playScan: () => void
  playNotification: () => void
  playClick: () => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error("useAudio must be used within AudioProvider")
  return ctx
}

// Configuración de sonidos usando Web Audio API
const SOUND_CONFIG: Record<
  SoundType,
  { frequencies: number[]; durations: number[]; type: OscillatorType; gain: number }
> = {
  success: { frequencies: [523, 659, 784], durations: [80, 80, 120], type: "sine", gain: 0.2 },
  error: { frequencies: [200, 150], durations: [150, 200], type: "square", gain: 0.15 },
  warning: { frequencies: [440, 440], durations: [100, 100], type: "triangle", gain: 0.2 },
  scan: { frequencies: [1800], durations: [50], type: "sine", gain: 0.15 },
  notification: { frequencies: [880, 1100], durations: [100, 150], type: "sine", gain: 0.15 },
  click: { frequencies: [1000], durations: [20], type: "sine", gain: 0.1 },
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const { audioEnabled } = useUIStore()

  // Inicializar AudioContext
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
    }
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  const playSound = useCallback(
    (type: SoundType) => {
      if (!audioEnabled || !audioContextRef.current) return

      const ctx = audioContextRef.current
      const config = SOUND_CONFIG[type]

      // Reanudar contexto si está suspendido
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      let startTime = ctx.currentTime

      config.frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = config.type
        oscillator.frequency.setValueAtTime(freq, startTime)

        const duration = config.durations[index] / 1000
        gainNode.gain.setValueAtTime(config.gain, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)

        startTime += duration
      })
    },
    [audioEnabled],
  )

  const playSuccess = useCallback(() => playSound("success"), [playSound])
  const playError = useCallback(() => playSound("error"), [playSound])
  const playWarning = useCallback(() => playSound("warning"), [playSound])
  const playScan = useCallback(() => playSound("scan"), [playSound])
  const playNotification = useCallback(() => playSound("notification"), [playSound])
  const playClick = useCallback(() => playSound("click"), [playSound])

  return (
    <AudioContext.Provider
      value={{
        playSound,
        playSuccess,
        playError,
        playWarning,
        playScan,
        playNotification,
        playClick,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

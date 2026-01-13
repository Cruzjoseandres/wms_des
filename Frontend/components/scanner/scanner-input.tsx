"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, ScanLine } from "lucide-react"

export type ScanStatus = "idle" | "success" | "error" | "scanning"

interface ScannerInputProps {
  label: string
  value: string
  expectedValue?: string
  onScan: (value: string) => void
  onValidation?: (isValid: boolean) => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  showStatus?: boolean
  readOnly?: boolean
}

// Audio context for beeps
let audioContext: AudioContext | null = null

const playSound = (type: "success" | "error") => {
  try {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (type === "success") {
      // High pitch beep for success
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } else {
      // Low buzzer for error
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      oscillator.type = "square"
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    }
  } catch {
    // Audio not supported
  }
}

export function ScannerInput({
  label,
  value,
  expectedValue,
  onScan,
  onValidation,
  placeholder = "Escanear código...",
  disabled = false,
  autoFocus = false,
  className,
  showStatus = true,
  readOnly = true,
}: ScannerInputProps) {
  const [status, setStatus] = useState<ScanStatus>("idle")
  const [internalValue, setInternalValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const validateAndSubmit = useCallback(
    (scannedValue: string) => {
      if (!scannedValue.trim()) return

      setStatus("scanning")

      // Simulate scan processing delay
      setTimeout(() => {
        if (expectedValue) {
          const isValid = scannedValue.toUpperCase() === expectedValue.toUpperCase()
          setStatus(isValid ? "success" : "error")
          playSound(isValid ? "success" : "error")
          onValidation?.(isValid)

          if (isValid) {
            onScan(scannedValue)
          }
        } else {
          // No expected value, just accept the scan
          setStatus("success")
          playSound("success")
          onScan(scannedValue)
          onValidation?.(true)
        }

        // Reset status after animation
        timeoutRef.current = setTimeout(() => {
          setStatus("idle")
        }, 1500)
      }, 200)
    },
    [expectedValue, onScan, onValidation],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && internalValue) {
      e.preventDefault()
      validateAndSubmit(internalValue)
      setInternalValue("")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly) {
      setInternalValue(e.target.value)
    } else {
      // In read-only mode, still allow input but only through scanner (rapid input)
      setInternalValue(e.target.value)
    }
  }

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getStatusStyles = () => {
    switch (status) {
      case "success":
        return "border-green-500 bg-green-500/10 ring-2 ring-green-500/50 animate-pulse"
      case "error":
        return "border-red-500 bg-red-500/10 ring-2 ring-red-500/50 animate-shake"
      case "scanning":
        return "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50"
      default:
        return "border-border"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "scanning":
        return <ScanLine className="h-5 w-5 text-blue-500 animate-pulse" />
      default:
        return <ScanLine className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-base font-semibold text-foreground flex items-center gap-2">
        {label}
        {expectedValue && (
          <span className="text-xs font-normal text-muted-foreground">(Esperado: {expectedValue})</span>
        )}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value || internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={false}
          className={cn(
            "h-14 text-lg font-mono pr-12 transition-all duration-200",
            getStatusStyles(),
            readOnly && "cursor-default caret-transparent selection:bg-transparent",
          )}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {showStatus && <div className="absolute right-3 top-1/2 -translate-y-1/2">{getStatusIcon()}</div>}
      </div>
      {status === "error" && (
        <p className="text-sm text-red-500 font-medium animate-in fade-in">Código no coincide. Escanee nuevamente.</p>
      )}
    </div>
  )
}

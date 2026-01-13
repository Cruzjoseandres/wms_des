"use client"

import { useEffect, useRef } from "react"

type HotkeyCallback = (event: KeyboardEvent) => void

interface HotkeyConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  callback: HotkeyCallback
  preventDefault?: boolean
  enableOnInputs?: boolean
}

export function useHotkeys(hotkeys: HotkeyConfig[]) {
  const hotkeyMapRef = useRef(hotkeys)
  hotkeyMapRef.current = hotkeys

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable

      for (const hotkey of hotkeyMapRef.current) {
        // Skip si estamos en un input y no está habilitado
        if (isInput && !hotkey.enableOnInputs) continue

        const keyMatch =
          event.key.toLowerCase() === hotkey.key.toLowerCase() || event.code.toLowerCase() === hotkey.key.toLowerCase()
        const ctrlMatch = hotkey.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = hotkey.shift ? event.shiftKey : !event.shiftKey
        const altMatch = hotkey.alt ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (hotkey.preventDefault !== false) {
            event.preventDefault()
          }
          hotkey.callback(event)
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
}

// Hook simplificado para un solo hotkey
export function useHotkey(key: string, callback: HotkeyCallback, options?: Omit<HotkeyConfig, "key" | "callback">) {
  useHotkeys([{ key, callback, ...options }])
}

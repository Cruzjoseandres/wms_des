"use client";

import { useEffect, useCallback, useRef } from "react";

interface UseScanDetectionOptions {
    /**
     * Callback when a complete scan is detected
     */
    onComplete: (code: string) => void;
    /**
     * Callback on each character (optional)
     */
    onInput?: (char: string) => void;
    /**
     * Callback on scan error (optional)
     */
    onError?: (error: string) => void;
    /**
     * Minimum length of valid barcode (default: 4)
     */
    minLength?: number;
    /**
     * Maximum time between keystrokes in ms (default: 50)
     * Zebra scanners typically input at 20-50ms between chars
     */
    avgTimeByChar?: number;
    /**
     * Key that ends the scan (default: "Enter")
     */
    endChar?: string[];
    /**
     * Characters to ignore during scanning
     */
    ignoreIfFocusOn?: string[];
    /**
     * Whether scan detection is enabled (default: true)
     */
    enabled?: boolean;
    /**
     * Prevent default on detected scan keys
     */
    preventDefault?: boolean;
    /**
     * Stop propagation on detected scan keys
     */
    stopPropagation?: boolean;
}

/**
 * Custom hook for detecting barcode scanner input (Zebra, Honeywell, etc.)
 * Barcode scanners act as keyboard input devices and type very fast
 */
export function useScanDetection({
    onComplete,
    onInput,
    onError,
    minLength = 4,
    avgTimeByChar = 50,
    endChar = ["Enter"],
    ignoreIfFocusOn = [],
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
}: UseScanDetectionOptions) {
    const bufferRef = useRef<string>("");
    const lastKeyTimeRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetBuffer = useCallback(() => {
        bufferRef.current = "";
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Check if we should ignore based on focused element
            const activeElement = document.activeElement;
            if (activeElement) {
                const tagName = activeElement.tagName.toLowerCase();
                if (ignoreIfFocusOn.includes(tagName)) {
                    return;
                }
                // Also check for contenteditable
                if (activeElement.getAttribute("contenteditable") === "true") {
                    return;
                }
            }

            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTimeRef.current;
            lastKeyTimeRef.current = currentTime;

            // Check if this is an end character
            if (endChar.includes(event.key)) {
                if (preventDefault) event.preventDefault();
                if (stopPropagation) event.stopPropagation();

                const scannedCode = bufferRef.current;

                if (scannedCode.length >= minLength) {
                    // Valid scan detected
                    console.log("[ScanDetection] Scan complete:", scannedCode);
                    onComplete(scannedCode);
                } else if (scannedCode.length > 0) {
                    // Too short, might be manual input
                    console.log("[ScanDetection] Scan too short:", scannedCode);
                    onError?.(`Código muy corto: ${scannedCode}`);
                }

                resetBuffer();
                return;
            }

            // Only process printable characters
            if (event.key.length !== 1) {
                return;
            }

            // If too much time passed, reset buffer (likely manual typing)
            if (timeDiff > avgTimeByChar * 3 && bufferRef.current.length > 0) {
                console.log("[ScanDetection] Timeout, resetting buffer");
                resetBuffer();
            }

            // Add character to buffer
            bufferRef.current += event.key;
            onInput?.(event.key);

            if (preventDefault) event.preventDefault();
            if (stopPropagation) event.stopPropagation();

            // Set a timeout to clear buffer if no more input
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                if (bufferRef.current.length > 0) {
                    console.log("[ScanDetection] Timeout, buffer not complete:", bufferRef.current);
                    resetBuffer();
                }
            }, avgTimeByChar * 10);
        },
        [
            enabled,
            onComplete,
            onInput,
            onError,
            minLength,
            avgTimeByChar,
            endChar,
            ignoreIfFocusOn,
            preventDefault,
            stopPropagation,
            resetBuffer,
        ]
    );

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener("keydown", handleKeyDown);
        console.log("[ScanDetection] Scanner detection enabled");

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            resetBuffer();
            console.log("[ScanDetection] Scanner detection disabled");
        };
    }, [enabled, handleKeyDown, resetBuffer]);

    return {
        /**
         * Manually reset the scan buffer
         */
        reset: resetBuffer,
        /**
         * Get current buffer content
         */
        getBuffer: () => bufferRef.current,
    };
}

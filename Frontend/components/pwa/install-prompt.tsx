"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            return;
        }

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Listen for beforeinstallprompt event (Android/Desktop)
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after a delay
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);

        // On iOS, show manual instruction after delay
        if (iOS) {
            const dismissed = localStorage.getItem("pwa-ios-dismissed");
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 5000);
            }
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("[PWA] User accepted install");
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        if (isIOS) {
            localStorage.setItem("pwa-ios-dismissed", "true");
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Download className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm">Instalar SGLA WMS</h3>
                        {isIOS ? (
                            <p className="text-slate-400 text-xs mt-1">
                                Toca <span className="text-white">Compartir</span> y luego{" "}
                                <span className="text-white">Agregar a Inicio</span>
                            </p>
                        ) : (
                            <p className="text-slate-400 text-xs mt-1">
                                Instala la app para acceso rápido y uso offline
                            </p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 text-slate-400 hover:text-white"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                {!isIOS && (
                    <Button
                        className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white"
                        size="sm"
                        onClick={handleInstall}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Instalar Aplicación
                    </Button>
                )}
            </div>
        </div>
    );
}

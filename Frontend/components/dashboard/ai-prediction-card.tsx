"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AIPredictionCard() {
  return (
    <Card className="h-full bg-card border border-purple-500/20 hover:border-purple-500/40 transition-colors">
      <CardContent className="p-4 sm:p-5 h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px] sm:text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Predicción
          </Badge>
        </div>

        <div className="mt-3 sm:mt-4 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Predicción Salidas (IA)</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">1,200</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Unidades estimadas próximos 7 días</p>
          </div>

          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confianza del modelo</span>
              <span className="text-purple-400 font-medium">94.2%</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[94%] bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, AlertTriangle, TrendingUp, Package, RefreshCw, ChevronRight } from "lucide-react"

type Insight = {
  id: string
  type: "anomaly" | "optimization" | "prediction" | "alert"
  title: string
  description: string
  action?: string
  actionLabel?: string
  priority: "high" | "medium" | "low"
}

const mockInsights: Insight[] = [
  {
    id: "1",
    type: "anomaly",
    title: "Anomalía",
    description: 'El Cliente "FarmaCorp" ha reducido sus ingresos un 40% esta semana respecto al promedio histórico.',
    priority: "high",
  },
  {
    id: "2",
    type: "optimization",
    title: "Optimización",
    description: "3 Racks en la Zona B están al 15% de capacidad. Sugiero consolidar para liberar espacio.",
    action: "/almacen/reubicacion",
    actionLabel: "Aplicar sugerencia",
    priority: "medium",
  },
  {
    id: "3",
    type: "prediction",
    title: "Predicción de Demanda",
    description: "Se espera un aumento del 25% en pedidos de productos electrónicos la próxima semana.",
    priority: "medium",
  },
  {
    id: "4",
    type: "alert",
    title: "Stock Crítico",
    description: "5 productos alcanzarán stock mínimo en los próximos 3 días según tendencia actual.",
    action: "/almacen/stock",
    actionLabel: "Ver productos",
    priority: "high",
  },
]

export function AIInsights() {
  const [insights] = useState<Insight[]>(mockInsights)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const getTypeStyles = (type: Insight["type"]) => {
    switch (type) {
      case "anomaly":
        return "bg-red-500/5 border-red-500/20"
      case "optimization":
        return "bg-blue-500/5 border-blue-500/20"
      case "prediction":
        return "bg-purple-500/5 border-purple-500/20"
      case "alert":
        return "bg-amber-500/5 border-amber-500/20"
      default:
        return "bg-muted border-border"
    }
  }

  const getTitleColor = (type: Insight["type"]) => {
    switch (type) {
      case "anomaly":
        return "text-red-400"
      case "optimization":
        return "text-blue-400"
      case "prediction":
        return "text-purple-400"
      case "alert":
        return "text-amber-400"
      default:
        return "text-foreground"
    }
  }

  const getTypeIcon = (type: Insight["type"]) => {
    switch (type) {
      case "anomaly":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case "optimization":
        return <Package className="w-4 h-4 text-blue-400" />
      case "prediction":
        return <TrendingUp className="w-4 h-4 text-purple-400" />
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  return (
    <Card className="h-full border-purple-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>SGLA AI Insights</span>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Insights List */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {insights.map((insight) => (
            <div key={insight.id} className={`p-3 rounded-lg border ${getTypeStyles(insight.type)}`}>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0">{getTypeIcon(insight.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${getTitleColor(insight.type)}`}>
                    {insight.title}:<span className="font-normal text-foreground ml-1">{insight.description}</span>
                  </p>
                  {insight.actionLabel && (
                    <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs text-primary">
                      {insight.actionLabel}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

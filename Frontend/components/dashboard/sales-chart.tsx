"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { month: "Ene", "2023": 100, "2024": 120, "2025": 200 },
  { month: "Feb", "2023": 150, "2024": 200, "2025": 499 },
  { month: "Mar", "2023": 180, "2024": 220, "2025": 497 },
  { month: "Abr", "2023": 200, "2024": 280, "2025": 468 },
  { month: "May", "2023": 250, "2024": 350, "2025": 519 },
  { month: "Jun", "2023": 280, "2024": 380, "2025": 417 },
  { month: "Jul", "2023": 200, "2024": 300, "2025": 322 },
  { month: "Ago", "2023": 150, "2024": 250, "2025": 659 },
  { month: "Sep", "2023": 180, "2024": 220, "2025": 0 },
  { month: "Oct", "2023": 220, "2024": 280, "2025": 0 },
  { month: "Nov", "2023": 280, "2024": 350, "2025": 425 },
  { month: "Dic", "2023": 320, "2024": 400, "2025": 0 },
]

export function SalesChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-foreground">
          Histórico de Salidas Últimas 3 Años
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[200px] sm:h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9CA3AF", fontSize: 9 }}
                tickLine={{ stroke: "#374151" }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 9 }} tickLine={{ stroke: "#374151" }} width={35} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                  fontSize: "11px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} />
              <Line
                type="monotone"
                dataKey="2025"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", strokeWidth: 1, r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="2024"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", strokeWidth: 1, r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="2023"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ fill: "#F97316", strokeWidth: 1, r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

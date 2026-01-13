import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

const statusItems = [
  {
    label: "Ingresos Pendientes por Validar",
    value: 9,
    color: "bg-blue-700",
    textColor: "text-white",
  },
  {
    label: "Ingresos Pendientes por Almacenar",
    value: 2,
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    label: "Salidas Pendientes",
    value: 7,
    color: "bg-red-700",
    textColor: "text-white",
  },
  {
    label: "Inventarios Aperturados",
    value: 0,
    color: "bg-orange-500",
    textColor: "text-white",
  },
]

export function StatusCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statusItems.map((item) => (
        <div key={item.label} className={cn("rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4", item.color)}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <FileText className={cn("w-5 h-5 sm:w-6 sm:h-6", item.textColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-2xl sm:text-3xl lg:text-4xl font-bold", item.textColor)}>{item.value}</p>
            <p className={cn("text-[10px] sm:text-xs opacity-90 leading-tight", item.textColor)}>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

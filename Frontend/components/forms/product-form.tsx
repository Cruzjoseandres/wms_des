"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, type ProductFormData } from "@/lib/schemas/product.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHotkeys } from "@/lib/hooks/use-hotkeys"
import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes"
import { useAudio } from "@/components/providers/audio-provider"
import { cn } from "@/lib/utils"
import { Loader2, Save, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const UNITS = [
  { value: "UND", label: "Unidad" },
  { value: "KG", label: "Kilogramo" },
  { value: "LT", label: "Litro" },
  { value: "MT", label: "Metro" },
  { value: "CJ", label: "Caja" },
  { value: "PQ", label: "Paquete" },
]

const CATEGORIES = [
  { value: "cat1", label: "Electrónicos" },
  { value: "cat2", label: "Alimentos" },
  { value: "cat3", label: "Textiles" },
  { value: "cat4", label: "Químicos" },
]

export function ProductForm({ initialData, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const { playSuccess, playError } = useAudio()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      categoryId: "",
      unit: "UND",
      minStock: 0,
      isActive: true,
      requiresLot: false,
      requiresExpiration: false,
      hazardous: false,
      temperatureControlled: false,
      ...initialData,
    },
  })

  // Proteger cambios sin guardar
  const { showPrompt, confirmNavigation, cancelNavigation } = useUnsavedChanges(isDirty)

  // Hotkeys para el formulario
  useHotkeys([
    {
      key: "F2",
      callback: () => {
        if (!isLoading && !isSubmitting) {
          handleSubmit(handleFormSubmit)()
        }
      },
    },
    {
      key: "Escape",
      callback: onCancel,
    },
    {
      key: "s",
      ctrl: true,
      callback: () => {
        if (!isLoading && !isSubmitting) {
          handleSubmit(handleFormSubmit)()
        }
      },
    },
  ])

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data)
      playSuccess()
    } catch (error) {
      playError()
      throw error
    }
  }

  const watchTemperatureControlled = watch("temperatureControlled")

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku" className={cn(errors.sku && "text-destructive")}>
              SKU *
            </Label>
            <Input
              id="sku"
              {...register("sku")}
              placeholder="PRD-001"
              className={cn(errors.sku && "border-destructive")}
            />
            {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className={cn(errors.name && "text-destructive")}>
              Nombre *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nombre del producto"
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" {...register("description")} placeholder="Descripción del producto..." rows={3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId" className={cn(errors.categoryId && "text-destructive")}>
              Categoría *
            </Label>
            <Select onValueChange={(v) => setValue("categoryId", v)} defaultValue={initialData?.categoryId}>
              <SelectTrigger className={cn(errors.categoryId && "border-destructive")}>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unidad *</Label>
            <Select onValueChange={(v) => setValue("unit", v as ProductFormData["unit"])} defaultValue="UND">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input id="barcode" {...register("barcode")} placeholder="7501234567890" />
            {errors.barcode && <p className="text-xs text-destructive">{errors.barcode.message}</p>}
          </div>
        </div>

        {/* Stock y precios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minStock">Stock Mínimo</Label>
            <Input id="minStock" type="number" {...register("minStock")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStock">Stock Máximo</Label>
            <Input id="maxStock" type="number" {...register("maxStock")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Costo</Label>
            <Input id="cost" type="number" step="0.01" {...register("cost")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input id="price" type="number" step="0.01" {...register("price")} />
          </div>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <Label htmlFor="isActive" className="cursor-pointer">
              Activo
            </Label>
            <Switch id="isActive" checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <Label htmlFor="requiresLot" className="cursor-pointer">
              Requiere Lote
            </Label>
            <Switch
              id="requiresLot"
              checked={watch("requiresLot")}
              onCheckedChange={(v) => setValue("requiresLot", v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <Label htmlFor="requiresExpiration" className="cursor-pointer">
              Req. Vencimiento
            </Label>
            <Switch
              id="requiresExpiration"
              checked={watch("requiresExpiration")}
              onCheckedChange={(v) => setValue("requiresExpiration", v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <Label htmlFor="temperatureControlled" className="cursor-pointer">
              Temp. Controlada
            </Label>
            <Switch
              id="temperatureControlled"
              checked={watchTemperatureControlled}
              onCheckedChange={(v) => setValue("temperatureControlled", v)}
            />
          </div>
        </div>

        {/* Temperatura si aplica */}
        {watchTemperatureControlled && (
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="space-y-2">
              <Label htmlFor="minTemperature">Temperatura Mínima (°C)</Label>
              <Input id="minTemperature" type="number" {...register("minTemperature")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTemperature">Temperatura Máxima (°C)</Label>
              <Input id="maxTemperature" type="number" {...register("maxTemperature")} />
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mr-auto">
            <kbd className="px-1 py-0.5 bg-muted rounded">F2</kbd> o{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+S</kbd> para guardar,{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> para cancelar
          </p>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {(isLoading || isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </form>

      {/* Diálogo de cambios sin guardar */}
      <AlertDialog open={showPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Los cambios se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation} className="bg-destructive text-destructive-foreground">
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

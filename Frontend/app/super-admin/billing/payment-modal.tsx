"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Send, Banknote, CheckCircle, AlertCircle, Loader } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onProcessPayment: (method: string) => Promise<void>
  invoice: {
    id: string
    org: string
    plan: string
    amount: string
    date: string
    status: string
  } | null
}

export function PaymentModal({ isOpen, onClose, onProcessPayment, invoice }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"card" | "transfer" | "cash" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    transactionId?: string
    message?: string
  } | null>(null)

  if (!invoice) return null

  const paymentMethods = [
    {
      id: "card",
      name: "Tarjeta de Crédito",
      icon: CreditCard,
      description: "Visa, Mastercard, Amex",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      id: "transfer",
      name: "Transferencia Bancaria",
      icon: Send,
      description: "Depósito directo a cuenta",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    {
      id: "cash",
      name: "Efectivo",
      icon: Banknote,
      description: "Pago en caja",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
    },
  ]

  const handleProcessPayment = async () => {
    if (!selectedMethod) return

    setIsProcessing(true)
    try {
      await onProcessPayment(selectedMethod)

      // Simulate payment success
      setPaymentResult({
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        message: "Pago procesado exitosamente",
      })

      // Auto-close modal after 3 seconds
      setTimeout(() => {
        handleClose()
      }, 3000)
    } catch (error) {
      setPaymentResult({
        success: false,
        message: "Error al procesar el pago. Intente de nuevo.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setSelectedMethod(null)
    setIsProcessing(false)
    setPaymentResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
          <DialogDescription>Seleccione un método de pago para la factura {invoice.id}</DialogDescription>
        </DialogHeader>

        {!paymentResult ? (
          <div className="space-y-4">
            {/* Invoice Summary */}
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Empresa</p>
                  <p className="font-semibold">{invoice.org}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <Badge className="bg-orange-500/20 text-orange-400">{invoice.plan}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Monto a Pagar</p>
                  <p className="text-2xl font-bold text-green-400">{invoice.amount}</p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Seleccione método de pago:</p>
              <div className="grid gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id as "card" | "transfer" | "cash")}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedMethod === method.id
                          ? `${method.color} border-current`
                          : "border-border bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-xs opacity-75">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleProcessPayment}
                disabled={!selectedMethod || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Procesar Pago"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            {paymentResult.success ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                <p className="text-green-400 font-semibold">{paymentResult.message}</p>
                <p className="text-sm text-muted-foreground">
                  ID: <span className="font-mono">{paymentResult.transactionId}</span>
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <p className="text-red-400 font-semibold">{paymentResult.message}</p>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

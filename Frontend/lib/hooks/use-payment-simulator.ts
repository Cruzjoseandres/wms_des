import { usePaymentSimulatorStore, type Payment } from "@/lib/stores/payment-simulator-store"
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback"

interface ProcessPaymentParams {
  invoiceId: string
  organizationId: string
  amount: number
  method: "card" | "transfer" | "cash"
}

export function usePaymentSimulator() {
  const { processPayment: storeProcessPayment, getPaymentHistory, payments, clearPayments } = usePaymentSimulatorStore()
  const { playSound } = useAudioFeedback()

  const processPayment = async (params: ProcessPaymentParams): Promise<Payment | null> => {
    try {
      playSound("loading")
      const result = await storeProcessPayment(params)

      if (result.status === "completed") {
        playSound("success")
      } else {
        playSound("error")
      }

      return result
    } catch (error) {
      playSound("error")
      console.error("[v0] Payment processing error:", error)
      return null
    }
  }

  return {
    processPayment,
    getPaymentHistory,
    payments,
    clearPayments,
  }
}

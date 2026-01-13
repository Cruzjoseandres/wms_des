import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Payment {
  id: string
  invoiceId: string
  organizationId: string
  amount: number
  method: "card" | "transfer" | "cash"
  status: "pending" | "processing" | "completed" | "failed"
  timestamp: Date
  transactionId: string
}

interface PaymentSimulatorState {
  payments: Payment[]
  processPayment: (payment: Omit<Payment, "id" | "status" | "timestamp" | "transactionId">) => Promise<Payment>
  getPaymentHistory: (invoiceId?: string) => Payment[]
  clearPayments: () => void
}

export const usePaymentSimulatorStore = create<PaymentSimulatorState>()(
  persist(
    (set, get) => ({
      payments: [],
      processPayment: async (paymentData) => {
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate 95% success rate
        const isSuccess = Math.random() > 0.05

        const newPayment: Payment = {
          id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...paymentData,
          status: isSuccess ? "completed" : "failed",
          timestamp: new Date(),
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        }

        set((state) => ({
          payments: [newPayment, ...state.payments],
        }))

        return newPayment
      },
      getPaymentHistory: (invoiceId?: string) => {
        const { payments } = get()
        return invoiceId ? payments.filter((p) => p.invoiceId === invoiceId) : payments
      },
      clearPayments: () => set({ payments: [] }),
    }),
    {
      name: "payment-simulator-storage",
    },
  ),
)

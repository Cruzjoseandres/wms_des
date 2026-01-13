"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminStore } from "@/lib/stores/admin-store"
import { CreditCard, DollarSign, TrendingUp, Calendar, Download, FileText, CheckCircle, Clock } from "lucide-react"
import { useState } from "react"
import { usePaymentSimulator } from "@/lib/hooks/use-payment-simulator"
import { PaymentModal } from "./payment-modal"

const invoices = [
  {
    id: "INV-001",
    org: "Distribuidora Central",
    plan: "Enterprise",
    amount: "$499.00",
    date: "2025-01-01",
    status: "paid",
  },
  {
    id: "INV-002",
    org: "Logística Express",
    plan: "Pro",
    amount: "$99.00",
    date: "2025-01-01",
    status: "paid",
  },
  {
    id: "INV-003",
    org: "Almacenes del Sur",
    plan: "Pro",
    amount: "$99.00",
    date: "2025-01-01",
    status: "pending",
  },
  {
    id: "INV-004",
    org: "Importadora Global",
    plan: "Enterprise",
    amount: "$499.00",
    date: "2025-01-01",
    status: "paid",
  },
]

export default function BillingPage() {
  const { organizations } = useAdminStore()
  const { processPayment, payments } = usePaymentSimulator()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[0] | null>(null)

  const handlePaymentClick = (invoice: (typeof invoices)[0]) => {
    setSelectedInvoice(invoice)
    setIsPaymentModalOpen(true)
  }

  const handleProcessPayment = async (method: string) => {
    if (!selectedInvoice) return
    await processPayment({
      invoiceId: selectedInvoice.id,
      amount: Number.parseFloat(selectedInvoice.amount.replace("$", "")),
      method,
      organizationId: selectedInvoice.org,
    })
    setIsPaymentModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planes y Facturación</h1>
          <p className="text-muted-foreground mt-1">Gestión de suscripciones y pagos (Simulador Local)</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-600 to-green-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">MRR</p>
                <p className="text-3xl font-bold text-white">
                  ${payments.reduce((acc, payment) => acc + payment.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">ARR</p>
                <p className="text-3xl font-bold text-white">
                  ${payments.reduce((acc, payment) => acc + payment.amount * 12, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Crecimiento</p>
                <p className="text-3xl font-bold text-white">
                  +
                  {(payments.length > 0
                    ? (payments.reduce((acc, payment) => acc + payment.amount, 0) / payments[0].amount - 1) * 100
                    : 0
                  ).toFixed(2)}
                  %
                </p>
              </div>
              <Calendar className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pendientes</p>
                <p className="text-3xl font-bold text-white">
                  {invoices.filter((invoice) => invoice.status === "pending").length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              Enterprise
            </CardTitle>
            <CardDescription>$499/mes por empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-500">
              {organizations.filter((o) => o.plan === "enterprise").length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">empresas activas</p>
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
              <p className="text-sm font-medium">
                Revenue: ${(organizations.filter((o) => o.plan === "enterprise").length * 499).toLocaleString()}
                /mes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Pro
            </CardTitle>
            <CardDescription>$99/mes por empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-500">{organizations.filter((o) => o.plan === "pro").length}</p>
            <p className="text-sm text-muted-foreground mt-1">empresas activas</p>
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
              <p className="text-sm font-medium">
                Revenue: ${(organizations.filter((o) => o.plan === "pro").length * 99).toLocaleString()}/mes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              Free
            </CardTitle>
            <CardDescription>Plan gratuito limitado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-400">{organizations.filter((o) => o.plan === "free").length}</p>
            <p className="text-sm text-muted-foreground mt-1">empresas activas</p>
            <div className="mt-4 p-3 bg-gray-500/10 rounded-lg">
              <p className="text-sm font-medium">
                Potencial conversión: ${organizations.filter((o) => o.plan === "free").length * 99}/mes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Facturas Recientes
          </CardTitle>
          <CardDescription>Historial de facturación del mes actual</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                  <TableCell>{invoice.org}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        invoice.plan === "Enterprise"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                      }
                    >
                      {invoice.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{invoice.amount}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    {invoice.status === "paid" ? (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Pagado
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-400 border-blue-400/50 hover:bg-blue-500/10 bg-transparent"
                        onClick={() => handlePaymentClick(invoice)}
                      >
                        Pagar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Simulator Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onProcessPayment={handleProcessPayment}
        invoice={selectedInvoice}
      />
    </div>
  )
}

'use client'

import { ArrowLeft, Download, Printer } from 'lucide-react'

import type { Invoice } from '@/lib/invoices-context'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InvoiceDetailProps {
  invoice: Invoice
  onBack: () => void
}

export function InvoiceDetail({ invoice, onBack }: InvoiceDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Invoices</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Header */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">INVOICE</CardTitle>
              <p className="mt-1 text-lg text-gray-600">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(invoice.status)} size="lg">
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.clientName}</p>
                <p>{invoice.projectName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Issue Date: </span>
                  <span className="font-medium">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Due Date: </span>
                  <span className="font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Time Entries</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-2 py-3 text-left">Date</th>
                    <th className="px-2 py-3 text-left">Description</th>
                    <th className="px-2 py-3 text-right">Duration</th>
                    <th className="px-2 py-3 text-right">Rate</th>
                    <th className="px-2 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-2 py-3">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-2 py-3">{item.description}</td>
                      <td className="px-2 py-3 text-right">{formatDuration(item.duration)}</td>
                      <td className="px-2 py-3 text-right">${item.hourlyRate}/hr</td>
                      <td className="px-2 py-3 text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-gray-200 py-3">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Notes</h3>
              <p className="whitespace-pre-wrap text-gray-700">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { CheckCircle, Edit, Eye, MoreHorizontal, Printer, Send, Trash2 } from 'lucide-react'

import { useInvoices, type Invoice } from '@/lib/invoices-context'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface InvoiceCardProps {
  invoice: Invoice
  onView: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
}

export function InvoiceCard({ invoice, onView, onEdit }: InvoiceCardProps) {
  const { updateInvoice, deleteInvoice } = useInvoices()

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

  const handleStatusChange = (newStatus: Invoice['status']) => {
    updateInvoice(invoice.id, { status: newStatus })
  }

  const isOverdue = () => {
    const today = new Date()
    const dueDate = new Date(invoice.dueDate)
    return invoice.status === 'sent' && dueDate < today
  }

  // Auto-update overdue status
  if (isOverdue() && invoice.status !== 'overdue') {
    updateInvoice(invoice.id, { status: 'overdue' })
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
            <p className="text-sm text-gray-600">{invoice.clientName}</p>
            <p className="text-xs text-gray-500">{invoice.projectName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(invoice)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(invoice)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {invoice.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('sent')}>
                    <Send className="mr-2 h-4 w-4" />
                    Mark as Sent
                  </DropdownMenuItem>
                )}
                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                  <DropdownMenuItem onClick={() => handleStatusChange('paid')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteInvoice(invoice.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Issue Date</p>
            <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Due Date</p>
            <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Line Items</p>
            <p className="font-medium">{invoice.lineItems.length} entries</p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="text-lg font-medium">{formatCurrency(invoice.total)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

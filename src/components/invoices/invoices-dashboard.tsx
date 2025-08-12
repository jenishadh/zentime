'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { useInvoices } from '@/lib/invoices-context'
import type { Invoice } from '@/lib/invoices-context'

import { Button } from '@/components/ui/button'

import { InvoiceCard } from './invoice-card'
import { InvoiceDetail } from './invoice-detail'
import { InvoiceGenerator } from './invoice-generator'

export function InvoicesDashboard() {
  const { invoices } = useInvoices()
  const [showGenerator, setShowGenerator] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | undefined>()

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice)
  }

  const handleEdit = (invoice: Invoice) => {
    setShowGenerator(true)
  }

  const handleCloseGenerator = () => {
    setShowGenerator(false)
  }

  const handleBackToInvoices = () => {
    setViewingInvoice(undefined)
  }

  const draftInvoices = invoices.filter((i) => i.status === 'draft')
  const sentInvoices = invoices.filter((i) => i.status === 'sent')
  const paidInvoices = invoices.filter((i) => i.status === 'paid')
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue')

  // Show invoice details view
  if (viewingInvoice) {
    return <InvoiceDetail invoice={viewingInvoice} onBack={handleBackToInvoices} />
  }

  // Show invoice generator
  if (showGenerator) {
    return (
      <div className="flex justify-center">
        <InvoiceGenerator onClose={handleCloseGenerator} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600">Generate and manage invoices from your time entries</p>
        </div>
        <Button onClick={() => setShowGenerator(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Generate Invoice</span>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="py-12 text-center">
          <div className="rounded-lg bg-white p-8 shadow">
            <h3 className="mb-2 text-lg font-medium text-gray-900">No invoices yet</h3>
            <p className="mb-4 text-gray-600">
              Generate your first invoice from tracked time entries.
            </p>
            <Button onClick={() => setShowGenerator(true)}>Generate Your First Invoice</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {overdueInvoices.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-red-700">Overdue Invoices</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {overdueInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )}

          {draftInvoices.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Draft Invoices</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {draftInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )}

          {sentInvoices.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Sent Invoices</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sentInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )}

          {paidInvoices.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Paid Invoices</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paidInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

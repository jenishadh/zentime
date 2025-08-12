'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export interface InvoiceLineItem {
  id: string
  timeEntryId: string
  description: string
  date: string
  duration: number // in minutes
  hourlyRate: number
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  projectId: string
  clientName: string
  projectName: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  issueDate: string
  dueDate: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  createdAt: string
  sentAt?: string
  paidAt?: string
}

interface InvoicesContextType {
  invoices: Invoice[]
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => void
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  getInvoice: (id: string) => Invoice | undefined
  getInvoicesByProject: (projectId: string) => Invoice[]
  generateInvoiceNumber: () => string
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined)

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    // Load invoices from localStorage on mount
    const storedInvoices = localStorage.getItem('zentime-invoices')
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices))
    }
  }, [])

  useEffect(() => {
    // Save invoices to localStorage whenever they change
    localStorage.setItem('zentime-invoices', JSON.stringify(invoices))
  }, [invoices])

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const count = invoices.length + 1
    return `INV-${year}${month}-${count.toString().padStart(3, '0')}`
  }

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString()
    }
    setInvoices((prev) => [...prev, newInvoice])
  }

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((invoice) => {
        if (invoice.id === id) {
          const updatedInvoice = { ...invoice, ...updates }

          // Set timestamps based on status changes
          if (updates.status === 'sent' && invoice.status !== 'sent') {
            updatedInvoice.sentAt = new Date().toISOString()
          }
          if (updates.status === 'paid' && invoice.status !== 'paid') {
            updatedInvoice.paidAt = new Date().toISOString()
          }

          return updatedInvoice
        }
        return invoice
      })
    )
  }

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
  }

  const getInvoice = (id: string) => {
    return invoices.find((invoice) => invoice.id === id)
  }

  const getInvoicesByProject = (projectId: string) => {
    return invoices.filter((invoice) => invoice.projectId === projectId)
  }

  return (
    <InvoicesContext.Provider
      value={{
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        getInvoicesByProject,
        generateInvoiceNumber
      }}
    >
      {children}
    </InvoicesContext.Provider>
  )
}

export function useInvoices() {
  const context = useContext(InvoicesContext)
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider')
  }
  return context
}

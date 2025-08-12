'use client'

import { useState } from 'react'
import type React from 'react'

import { useInvoices, type InvoiceLineItem } from '@/lib/invoices-context'
import { useProjects } from '@/lib/projects-context'
import { useTimeTracking } from '@/lib/time-tracking-context'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface InvoiceGeneratorProps {
  onClose: () => void
}

export function InvoiceGenerator({ onClose }: InvoiceGeneratorProps) {
  const { addInvoice } = useInvoices()
  const { projects } = useProjects()
  const { timeEntries } = useTimeTracking()

  const [formData, setFormData] = useState({
    projectId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    taxRate: 0,
    notes: ''
  })

  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())

  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'completed')

  // Get time entries for selected project and date range
  const getAvailableEntries = () => {
    if (!formData.projectId) return []

    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.startTime).toISOString().split('T')[0]
      return (
        entry.projectId === formData.projectId &&
        entryDate >= formData.startDate &&
        entryDate <= formData.endDate &&
        !entry.isRunning
      )
    })
  }

  const availableEntries = getAvailableEntries()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.projectId || selectedEntries.size === 0) {
      return
    }

    const project = projects.find((p) => p.id === formData.projectId)
    if (!project) return

    const lineItems: InvoiceLineItem[] = Array.from(selectedEntries).map((entryId) => {
      const entry = timeEntries.find((e) => e.id === entryId)!
      return {
        id: Math.random().toString(36).substr(2, 9),
        timeEntryId: entry.id,
        description: entry.description,
        date: new Date(entry.startTime).toISOString().split('T')[0],
        duration: entry.duration,
        hourlyRate: entry.hourlyRate,
        amount: entry.earnings
      }
    })

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (formData.taxRate / 100)
    const total = subtotal + taxAmount

    const invoiceData = {
      projectId: formData.projectId,
      clientName: project.client,
      projectName: project.name,
      status: 'draft' as const,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      lineItems,
      subtotal,
      taxRate: formData.taxRate,
      taxAmount,
      total,
      notes: formData.notes || undefined
    }

    addInvoice(invoiceData)
    onClose()
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear selected entries when project changes
    if (field === 'projectId') {
      setSelectedEntries(new Set())
    }
  }

  const toggleEntry = (entryId: string) => {
    setSelectedEntries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  const selectAllEntries = () => {
    setSelectedEntries(new Set(availableEntries.map((e) => e.id)))
  }

  const clearAllEntries = () => {
    setSelectedEntries(new Set())
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const selectedTotal = Array.from(selectedEntries)
    .map((id) => timeEntries.find((e) => e.id === id)?.earnings || 0)
    .reduce((sum, amount) => sum + amount, 0)

  const taxAmount = selectedTotal * (formData.taxRate / 100)
  const finalTotal = selectedTotal + taxAmount

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Generate Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project and Date Selection */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleChange('projectId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.client})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Time Entries Selection */}
          {formData.projectId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Time Entries</h3>
                <div className="space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAllEntries}>
                    Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearAllEntries}>
                    Clear All
                  </Button>
                </div>
              </div>

              {availableEntries.length === 0 ? (
                <p className="text-gray-600">
                  No time entries found for the selected project and date range.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-lg border">
                  {availableEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center space-x-3 border-b p-3 last:border-b-0"
                    >
                      <Checkbox
                        checked={selectedEntries.has(entry.id)}
                        onCheckedChange={() => toggleEntry(entry.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.startTime).toLocaleDateString()} •{' '}
                          {formatDuration(entry.duration)} • ${entry.hourlyRate}/hr
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(entry.earnings)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoice Details */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or payment terms..."
              rows={3}
            />
          </div>

          {/* Invoice Summary */}
          {selectedEntries.size > 0 && (
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold">Invoice Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({selectedEntries.size} entries):</span>
                  <span>{formatCurrency(selectedTotal)}</span>
                </div>
                {formData.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({formData.taxRate}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={selectedEntries.size === 0} className="flex-1">
              Generate Invoice
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

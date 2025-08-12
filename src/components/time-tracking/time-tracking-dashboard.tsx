'use client'

import { useState } from 'react'

import { List, Plus, Timer } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { ManualTimeForm } from './manual-time-form'
import { TimeEntriesList } from './time-entries-list'
import { TimerWidget } from './timer-widget'

export function TimeTrackingDashboard() {
  const [showManualForm, setShowManualForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'timer' | 'entries'>('timer')

  if (showManualForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Manual Time Entry</h2>
          <Button variant="outline" onClick={() => setShowManualForm(false)}>
            Cancel
          </Button>
        </div>
        <div className="flex justify-center">
          <ManualTimeForm onClose={() => setShowManualForm(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
          <p className="text-gray-600">Track your time with automatic timers or manual entries</p>
        </div>
        <Button onClick={() => setShowManualForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Manual Entry</span>
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex w-fit space-x-1 rounded-lg bg-gray-100 p-1">
        <Button
          variant={activeTab === 'timer' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('timer')}
          className="flex items-center space-x-2"
        >
          <Timer className="h-4 w-4" />
          <span>Timer</span>
        </Button>
        <Button
          variant={activeTab === 'entries' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('entries')}
          className="flex items-center space-x-2"
        >
          <List className="h-4 w-4" />
          <span>Time Entries</span>
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'timer' ? (
        <div className="flex justify-center">
          <TimerWidget />
        </div>
      ) : (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Time Entries</h3>
          <TimeEntriesList limit={10} />
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'

import { Calendar, Clock, Edit, MoreHorizontal, Trash2 } from 'lucide-react'

import { useProjects } from '@/lib/projects-context'
import { useTasks } from '@/lib/tasks-context'
import { useTimeTracking, type TimeEntry } from '@/lib/time-tracking-context'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { ManualTimeForm } from './manual-time-form'

interface TimeEntriesListProps {
  projectId?: string
  taskId?: string
  limit?: number
}

export function TimeEntriesList({ projectId, taskId, limit }: TimeEntriesListProps) {
  const { timeEntries, deleteTimeEntry } = useTimeTracking()
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const [editingEntry, setEditingEntry] = useState<TimeEntry | undefined>()

  let filteredEntries = timeEntries
  if (taskId) {
    filteredEntries = timeEntries.filter((entry) => entry.taskId === taskId)
  } else if (projectId) {
    filteredEntries = timeEntries.filter((entry) => entry.projectId === projectId)
  }

  // Sort by start time (most recent first)
  filteredEntries = filteredEntries.sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )

  if (limit) {
    filteredEntries = filteredEntries.slice(0, limit)
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project ? `${project.name} (${project.client})` : 'Unknown Project'
  }

  const getTaskName = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    return task?.name || 'Unknown Task'
  }

  if (editingEntry) {
    return (
      <div className="flex justify-center">
        <ManualTimeForm timeEntry={editingEntry} onClose={() => setEditingEntry(undefined)} />
      </div>
    )
  }

  if (filteredEntries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No time entries yet</h3>
          <p className="text-gray-600">
            Start tracking time or add manual entries to see them here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredEntries.map((entry) => {
        const startDateTime = formatDateTime(entry.startTime)
        const endDateTime = entry.endTime ? formatDateTime(entry.endTime) : null

        return (
          <Card key={entry.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{entry.description}</h4>
                    {entry.isRunning && (
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {!projectId && <p>{getProjectName(entry.projectId)}</p>}
                    {entry.taskId && !taskId && <p>Task: {getTaskName(entry.taskId)}</p>}

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{startDateTime.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {startDateTime.time}
                          {endDateTime && ` - ${endDateTime.time}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <p className="font-medium">{formatDuration(entry.duration)}</p>
                    <p className="text-gray-600">{formatCurrency(entry.earnings)}</p>
                    <p className="text-xs text-gray-500">${entry.hourlyRate}/hr</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingEntry(entry)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteTimeEntry(entry.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

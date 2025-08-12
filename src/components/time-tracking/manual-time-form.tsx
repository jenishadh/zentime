'use client'

import { useState } from 'react'
import type React from 'react'

import { useProjects } from '@/lib/projects-context'
import { useTasks } from '@/lib/tasks-context'
import { useTimeTracking, type TimeEntry } from '@/lib/time-tracking-context'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface ManualTimeFormProps {
  timeEntry?: TimeEntry
  onClose: () => void
}

export function ManualTimeForm({ timeEntry, onClose }: ManualTimeFormProps) {
  const { addTimeEntry, updateTimeEntry } = useTimeTracking()
  const { projects } = useProjects()
  const { tasks } = useTasks()

  const [formData, setFormData] = useState({
    projectId: timeEntry?.projectId || 'defaultProjectId',
    taskId: timeEntry?.taskId || '',
    description: timeEntry?.description || '',
    date: timeEntry
      ? new Date(timeEntry.startTime).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    startTime: timeEntry
      ? new Date(timeEntry.startTime).toTimeString().slice(0, 5)
      : new Date().toTimeString().slice(0, 5),
    duration: timeEntry ? timeEntry.duration : 60,
    hourlyRate: timeEntry?.hourlyRate || 0
  })

  const activeProjects = projects.filter((p) => p.status === 'active')
  const availableTasks = formData.projectId
    ? tasks.filter((t) => t.projectId === formData.projectId)
    : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.projectId || !formData.description.trim() || !formData.duration) {
      return
    }

    const project = projects.find((p) => p.id === formData.projectId)
    const task = formData.taskId ? tasks.find((t) => t.id === formData.taskId) : undefined

    // Use custom rate if provided, otherwise task rate, otherwise project rate
    const effectiveRate = formData.hourlyRate || task?.hourlyRate || project?.hourlyRate || 0

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000)

    const entryData = {
      projectId: formData.projectId,
      taskId: formData.taskId || undefined,
      description: formData.description.trim(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: formData.duration,
      hourlyRate: effectiveRate,
      isRunning: false
    }

    if (timeEntry) {
      updateTimeEntry(timeEntry.id, entryData)
    } else {
      addTimeEntry(entryData)
    }

    onClose()
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-update hourly rate when project or task changes
      if (field === 'projectId' || field === 'taskId') {
        const project = projects.find((p) => p.id === updated.projectId)
        const task = updated.taskId ? tasks.find((t) => t.id === updated.taskId) : undefined
        updated.hourlyRate = task?.hourlyRate || project?.hourlyRate || 0
        // Clear task if project changed
        if (field === 'projectId') {
          updated.taskId = ''
        }
      }

      return updated
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const estimatedEarnings = (formData.duration / 60) * formData.hourlyRate

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{timeEntry ? 'Edit Time Entry' : 'Add Manual Time Entry'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {formData.projectId && availableTasks.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="task">Task (Optional)</Label>
              <Select
                value={formData.taskId}
                onValueChange={(value) => handleChange('taskId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific task</SelectItem>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What did you work on?"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => handleChange('hourlyRate', Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {formData.duration > 0 && formData.hourlyRate > 0 && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                Estimated earnings:{' '}
                <span className="font-medium">{formatCurrency(estimatedEarnings)}</span>
              </p>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              {timeEntry ? 'Update Entry' : 'Add Entry'}
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

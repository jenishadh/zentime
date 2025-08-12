'use client'

import type React from 'react'
import { useState } from 'react'

import { useProjects } from '@/lib/projects-context'
import { useTasks, type Task } from '@/lib/tasks-context'

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

interface TaskFormProps {
  projectId: string
  task?: Task
  onClose: () => void
}

export function TaskForm({ projectId, task, onClose }: TaskFormProps) {
  const { addTask, updateTask } = useTasks()
  const { getProject } = useProjects()
  const project = getProject(projectId)

  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    hourlyRate: task?.hourlyRate || undefined,
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    useCustomRate: !!task?.hourlyRate
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      return
    }

    const taskData = {
      projectId,
      name: formData.name,
      description: formData.description,
      hourlyRate: formData.useCustomRate ? formData.hourlyRate : undefined,
      status: formData.status as Task['status'],
      priority: formData.priority as Task['priority']
    }

    if (task) {
      updateTask(task.id, taskData)
    } else {
      addTask(taskData)
    }

    onClose()
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{task ? 'Edit Task' : 'New Task'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Design homepage mockup"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Task details and requirements..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCustomRate"
                checked={formData.useCustomRate}
                onCheckedChange={(checked) => handleChange('useCustomRate', checked)}
              />
              <Label htmlFor="useCustomRate" className="text-sm">
                Use custom hourly rate (default: {project?.hourlyRate} {project?.currency})
              </Label>
            </div>

            {formData.useCustomRate && (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Custom Hourly Rate</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => handleChange('hourlyRate', Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder={`Default: ${project?.hourlyRate}`}
                />
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              {task ? 'Update Task' : 'Create Task'}
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

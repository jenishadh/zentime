'use client'

import { useState } from 'react'

import { ArrowLeft, Plus } from 'lucide-react'

import type { Project } from '@/lib/projects-context'
import { useTasks, type Task } from '@/lib/tasks-context'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskForm } from '@/components/tasks/task-form'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const { getTasksByProject } = useTasks()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  const tasks = getTasksByProject(project.id)
  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCloseTaskForm = () => {
    setShowTaskForm(false)
    setEditingTask(undefined)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (showTaskForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleCloseTaskForm}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tasks</span>
          </Button>
        </div>
        <div className="flex justify-center">
          <TaskForm projectId={project.id} task={editingTask} onClose={handleCloseTaskForm} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Button>
      </div>

      {/* Project Header */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.client}</p>
            {project.description && (
              <p className="mt-2 text-sm text-gray-500">{project.description}</p>
            )}
          </div>
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-gray-500">Hourly Rate</p>
            <p className="font-medium">{formatCurrency(project.hourlyRate, project.currency)}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Hours</p>
            <p className="font-medium">{project.totalHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-gray-500">Total Earnings</p>
            <p className="font-medium">{formatCurrency(project.totalEarnings, project.currency)}</p>
          </div>
          <div>
            <p className="text-gray-500">Tasks</p>
            <p className="font-medium">{tasks.length} total</p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
            <p className="text-gray-600">Manage project tasks and track progress</p>
          </div>
          <Button onClick={() => setShowTaskForm(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="py-12 text-center">
            <div className="rounded-lg bg-white p-8 shadow">
              <h3 className="mb-2 text-lg font-medium text-gray-900">No tasks yet</h3>
              <p className="mb-4 text-gray-600">Break down your project into manageable tasks.</p>
              <Button onClick={() => setShowTaskForm(true)}>Create Your First Task</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {inProgressTasks.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">In Progress</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                  ))}
                </div>
              </div>
            )}

            {todoTasks.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">To Do</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {todoTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Completed</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

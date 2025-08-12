'use client'

import { CheckCircle, Edit, MoreHorizontal, Pause, Play, Trash2 } from 'lucide-react'

import { useProjects } from '@/lib/projects-context'
import { useTasks, type Task } from '@/lib/tasks-context'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks()
  const { getProject } = useProjects()
  const project = getProject(task.projectId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEffectiveRate = () => {
    return task.hourlyRate || project?.hourlyRate || 0
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleStatusChange = (newStatus: Task['status']) => {
    updateTask(task.id, { status: newStatus })
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{task.name}</CardTitle>
            {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {task.status === 'todo' && (
                <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </DropdownMenuItem>
              )}
              {task.status === 'in-progress' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete
                  </DropdownMenuItem>
                </>
              )}
              {task.status === 'completed' && (
                <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
                  <Play className="mr-2 h-4 w-4" />
                  Reopen
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(task.status)}>{task.status.replace('-', ' ')}</Badge>
            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Rate</p>
            <p className="font-medium">
              {formatCurrency(getEffectiveRate(), project?.currency)}
              {task.hourlyRate && <span className="ml-1 text-xs text-blue-600">(custom)</span>}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Hours</p>
            <p className="font-medium">{task.totalHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-gray-500">Earnings</p>
            <p className="font-medium">{formatCurrency(task.totalEarnings, project?.currency)}</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium">{new Date(task.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

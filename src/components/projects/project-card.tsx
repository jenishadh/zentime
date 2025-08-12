'use client'

import { Edit, Eye, MoreHorizontal, Pause, Play, Trash2 } from 'lucide-react'

import { useProjects, type Project } from '@/lib/projects-context'
import { useTasks } from '@/lib/tasks-context'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onViewDetails: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onViewDetails }: ProjectCardProps) {
  const { updateProject, deleteProject } = useProjects()
  const { getTasksByProject } = useTasks()

  const tasks = getTasksByProject(project.id)
  const completedTasks = tasks.filter((t) => t.status === 'completed')

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

  const toggleStatus = () => {
    const newStatus = project.status === 'active' ? 'paused' : 'active'
    updateProject(project.id, { status: newStatus })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <p className="text-sm text-gray-600">{project.client}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(project)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleStatus}>
                  {project.status === 'active' ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteProject(project.id)}
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
        {project.description && <p className="mb-3 text-sm text-gray-600">{project.description}</p>}
        <div className="grid grid-cols-2 gap-4 text-sm">
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
            <p className="font-medium">
              {completedTasks.length}/{tasks.length} done
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

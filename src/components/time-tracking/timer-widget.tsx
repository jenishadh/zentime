'use client'

import { useEffect, useState } from 'react'

import { Clock, Pause, Play, Square } from 'lucide-react'

import { useProjects } from '@/lib/projects-context'
import { useTasks } from '@/lib/tasks-context'
import { useTimeTracking } from '@/lib/time-tracking-context'

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

export function TimerWidget() {
  const { activeTimer, startTimer, stopTimer, pauseTimer, getTimerDuration } = useTimeTracking()
  const { projects } = useProjects()
  const { tasks } = useTasks()

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [description, setDescription] = useState('')
  const [currentDuration, setCurrentDuration] = useState(0)

  // Update duration every second when timer is active
  useEffect(() => {
    if (activeTimer) {
      const interval = setInterval(() => {
        setCurrentDuration(getTimerDuration())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [activeTimer, getTimerDuration])

  const activeProjects = projects.filter((p) => p.status === 'active')
  const availableTasks = selectedProjectId
    ? tasks.filter((t) => t.projectId === selectedProjectId)
    : []

  const handleStart = () => {
    if (!selectedProjectId || !description.trim()) return

    const project = projects.find((p) => p.id === selectedProjectId)
    const task = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : undefined

    // Use task rate if available, otherwise project rate
    const hourlyRate = task?.hourlyRate || project?.hourlyRate || 0

    startTimer(selectedProjectId, selectedTaskId || undefined, description.trim(), hourlyRate)
  }

  const handleStop = () => {
    stopTimer()
    setSelectedProjectId('')
    setSelectedTaskId('')
    setDescription('')
    setCurrentDuration(0)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const getCurrentProject = () => {
    return activeTimer ? projects.find((p) => p.id === activeTimer.projectId) : null
  }

  const getCurrentTask = () => {
    return activeTimer && activeTimer.taskId ? tasks.find((t) => t.id === activeTimer.taskId) : null
  }

  if (activeTimer) {
    const currentProject = getCurrentProject()
    const currentTask = getCurrentTask()

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span>Timer Running</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-green-600">
              {formatDuration(currentDuration)}
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {currentProject?.name} {currentTask && `• ${currentTask.name}`}
            </p>
            <p className="text-xs text-gray-500">{activeTimer.description}</p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={pauseTimer} variant="outline" className="flex-1 bg-transparent">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            <Button onClick={handleStop} variant="destructive" className="flex-1">
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            Rate: ${activeTimer.hourlyRate}/hr • Earnings: $
            {((currentDuration / 60) * activeTimer.hourlyRate).toFixed(2)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Start Timer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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

        {selectedProjectId && availableTasks.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="task">Task (Optional)</Label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific task</SelectItem>
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
          <Label htmlFor="description">What are you working on?</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your work..."
          />
        </div>

        <Button
          onClick={handleStart}
          disabled={!selectedProjectId || !description.trim()}
          className="w-full"
          size="lg"
        >
          <Play className="mr-2 h-4 w-4" />
          Start Timer
        </Button>
      </CardContent>
    </Card>
  )
}

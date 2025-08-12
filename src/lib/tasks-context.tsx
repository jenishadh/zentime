'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export interface Task {
  id: string
  projectId: string
  name: string
  description: string
  hourlyRate?: number // Optional override of project rate
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  completedAt?: string
  totalHours: number
  totalEarnings: number
}

interface TasksContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'totalHours' | 'totalEarnings'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTask: (id: string) => Task | undefined
  getTasksByProject: (projectId: string) => Task[]
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Load tasks from localStorage on mount
    const storedTasks = localStorage.getItem('zentime-tasks')
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
  }, [])

  useEffect(() => {
    // Save tasks to localStorage whenever tasks change
    localStorage.setItem('zentime-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'totalHours' | 'totalEarnings'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      totalHours: 0,
      totalEarnings: 0
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...updates }
          // Set completedAt when status changes to completed
          if (updates.status === 'completed' && task.status !== 'completed') {
            updatedTask.completedAt = new Date().toISOString()
          }
          // Clear completedAt when status changes from completed
          if (updates.status !== 'completed' && task.status === 'completed') {
            updatedTask.completedAt = undefined
          }
          return updatedTask
        }
        return task
      })
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const getTask = (id: string) => {
    return tasks.find((task) => task.id === id)
  }

  const getTasksByProject = (projectId: string) => {
    return tasks.filter((task) => task.projectId === projectId)
  }

  return (
    <TasksContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, getTask, getTasksByProject }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider')
  }
  return context
}

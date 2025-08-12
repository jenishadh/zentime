'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export interface TimeEntry {
  id: string
  projectId: string
  taskId?: string
  description: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  hourlyRate: number
  earnings: number
  isRunning: boolean
  createdAt: string
}

interface ActiveTimer {
  projectId: string
  taskId?: string
  description: string
  startTime: string
  hourlyRate: number
}

interface TimeTrackingContextType {
  timeEntries: TimeEntry[]
  activeTimer: ActiveTimer | null
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'earnings'>) => void
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteTimeEntry: (id: string) => void
  getTimeEntry: (id: string) => TimeEntry | undefined
  getTimeEntriesByProject: (projectId: string) => TimeEntry[]
  getTimeEntriesByTask: (taskId: string) => TimeEntry[]
  startTimer: (
    projectId: string,
    taskId: string | undefined,
    description: string,
    hourlyRate: number
  ) => void
  stopTimer: () => TimeEntry | null
  pauseTimer: () => void
  resumeTimer: () => void
  getTimerDuration: () => number
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined)

export function TimeTrackingProvider({ children }: { children: React.ReactNode }) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load time entries from localStorage on mount
    const storedEntries = localStorage.getItem('zentime-entries')
    if (storedEntries) {
      setTimeEntries(JSON.parse(storedEntries))
    }

    // Load active timer from localStorage
    const storedTimer = localStorage.getItem('zentime-active-timer')
    if (storedTimer) {
      setActiveTimer(JSON.parse(storedTimer))
    }
  }, [])

  useEffect(() => {
    // Save time entries to localStorage whenever they change
    localStorage.setItem('zentime-entries', JSON.stringify(timeEntries))
  }, [timeEntries])

  useEffect(() => {
    // Save active timer to localStorage whenever it changes
    if (activeTimer) {
      localStorage.setItem('zentime-active-timer', JSON.stringify(activeTimer))
    } else {
      localStorage.removeItem('zentime-active-timer')
    }
  }, [activeTimer])

  const addTimeEntry = (entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'earnings'>) => {
    const earnings = (entryData.duration / 60) * entryData.hourlyRate
    const newEntry: TimeEntry = {
      ...entryData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      earnings
    }
    setTimeEntries((prev) => [...prev, newEntry])
  }

  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, ...updates }
          // Recalculate earnings if duration or rate changed
          if (updates.duration !== undefined || updates.hourlyRate !== undefined) {
            updatedEntry.earnings = (updatedEntry.duration / 60) * updatedEntry.hourlyRate
          }
          return updatedEntry
        }
        return entry
      })
    )
  }

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const getTimeEntry = (id: string) => {
    return timeEntries.find((entry) => entry.id === id)
  }

  const getTimeEntriesByProject = (projectId: string) => {
    return timeEntries.filter((entry) => entry.projectId === projectId)
  }

  const getTimeEntriesByTask = (taskId: string) => {
    return timeEntries.filter((entry) => entry.taskId === taskId)
  }

  const startTimer = (
    projectId: string,
    taskId: string | undefined,
    description: string,
    hourlyRate: number
  ) => {
    // Stop any existing timer first
    if (activeTimer) {
      stopTimer()
    }

    const newTimer: ActiveTimer = {
      projectId,
      taskId,
      description,
      startTime: new Date().toISOString(),
      hourlyRate
    }

    setActiveTimer(newTimer)

    // Start the interval to update the timer
    const interval = setInterval(() => {
      // This will trigger re-renders to update the timer display
    }, 1000)
    setTimerInterval(interval)
  }

  const stopTimer = (): TimeEntry | null => {
    if (!activeTimer) return null

    const endTime = new Date().toISOString()
    const duration = Math.round(
      (new Date(endTime).getTime() - new Date(activeTimer.startTime).getTime()) / 1000 / 60
    )

    const timeEntry: TimeEntry = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: activeTimer.projectId,
      taskId: activeTimer.taskId,
      description: activeTimer.description,
      startTime: activeTimer.startTime,
      endTime,
      duration,
      hourlyRate: activeTimer.hourlyRate,
      earnings: (duration / 60) * activeTimer.hourlyRate,
      isRunning: false,
      createdAt: new Date().toISOString()
    }

    setTimeEntries((prev) => [...prev, timeEntry])
    setActiveTimer(null)

    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    return timeEntry
  }

  const pauseTimer = () => {
    if (activeTimer && timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }

  const resumeTimer = () => {
    if (activeTimer && !timerInterval) {
      const interval = setInterval(() => {
        // This will trigger re-renders to update the timer display
      }, 1000)
      setTimerInterval(interval)
    }
  }

  const getTimerDuration = (): number => {
    if (!activeTimer) return 0
    return Math.round(
      (new Date().getTime() - new Date(activeTimer.startTime).getTime()) / 1000 / 60
    )
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [timerInterval])

  return (
    <TimeTrackingContext.Provider
      value={{
        timeEntries,
        activeTimer,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        getTimeEntry,
        getTimeEntriesByProject,
        getTimeEntriesByTask,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer,
        getTimerDuration
      }}
    >
      {children}
    </TimeTrackingContext.Provider>
  )
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext)
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider')
  }
  return context
}

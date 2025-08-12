'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export interface Project {
  id: string
  name: string
  client: string
  description: string
  hourlyRate: number
  currency: string
  status: 'active' | 'paused' | 'completed'
  createdAt: string
  totalHours: number
  totalEarnings: number
}

interface ProjectsContextType {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'totalHours' | 'totalEarnings'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    // Load projects from localStorage on mount
    const storedProjects = localStorage.getItem('zentime-projects')
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    }
  }, [])

  useEffect(() => {
    // Save projects to localStorage whenever projects change
    localStorage.setItem('zentime-projects', JSON.stringify(projects))
  }, [projects])

  const addProject = (
    projectData: Omit<Project, 'id' | 'createdAt' | 'totalHours' | 'totalEarnings'>
  ) => {
    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      totalHours: 0,
      totalEarnings: 0
    }
    setProjects((prev) => [...prev, newProject])
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === id ? { ...project, ...updates } : project))
    )
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
  }

  const getProject = (id: string) => {
    return projects.find((project) => project.id === id)
  }

  return (
    <ProjectsContext.Provider
      value={{ projects, addProject, updateProject, deleteProject, getProject }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}

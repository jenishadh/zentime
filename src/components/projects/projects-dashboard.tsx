'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { useProjects } from '@/lib/projects-context'
import type { Project } from '@/lib/projects-context'

import { Button } from '@/components/ui/button'

import { ProjectCard } from './project-card'
import { ProjectDetail } from './project-detail'
import { ProjectForm } from './project-form'

export function ProjectsDashboard() {
  const { projects } = useProjects()
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [viewingProject, setViewingProject] = useState<Project | undefined>()

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleViewDetails = (project: Project) => {
    setViewingProject(project)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProject(undefined)
  }

  const handleBackToProjects = () => {
    setViewingProject(undefined)
  }

  const activeProjects = projects.filter((p) => p.status === 'active')
  const pausedProjects = projects.filter((p) => p.status === 'paused')
  const completedProjects = projects.filter((p) => p.status === 'completed')

  // Show project details view
  if (viewingProject) {
    return <ProjectDetail project={viewingProject} onBack={handleBackToProjects} />
  }

  // Show project form
  if (showForm) {
    return (
      <div className="flex justify-center">
        <ProjectForm project={editingProject} onClose={handleCloseForm} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">Manage your client projects and rates</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="py-12 text-center">
          <div className="rounded-lg bg-white p-8 shadow">
            <h3 className="mb-2 text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="mb-4 text-gray-600">
              Create your first project to start tracking time and managing rates.
            </p>
            <Button onClick={() => setShowForm(true)}>Create Your First Project</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeProjects.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Active Projects</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEdit}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {pausedProjects.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Paused Projects</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pausedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEdit}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {completedProjects.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Completed Projects</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEdit}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

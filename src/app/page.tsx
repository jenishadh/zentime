'use client'

import { useState } from 'react'

import { BarChart3, Clock, FileText, FolderOpen, LogOut, Timer, User } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'

import { Button } from '@/components/ui/button'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { InvoicesDashboard } from '@/components/invoices/invoices-dashboard'
import { ProjectsDashboard } from '@/components/projects/projects-dashboard'
import { TimeTrackingDashboard } from '@/components/time-tracking/time-tracking-dashboard'

export default function HomePage() {
  const { user, logout } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [activeView, setActiveView] = useState<'projects' | 'time' | 'invoices' | 'analytics'>(
    'projects'
  )

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Zentime</h1>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-1">
                <Button
                  variant={activeView === 'projects' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('projects')}
                  className="flex items-center space-x-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Projects</span>
                </Button>
                <Button
                  variant={activeView === 'time' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('time')}
                  className="flex items-center space-x-2"
                >
                  <Timer className="h-4 w-4" />
                  <span>Time Tracking</span>
                </Button>
                <Button
                  variant={activeView === 'invoices' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('invoices')}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Invoices</span>
                </Button>
                {/* added analytics navigation button */}
                <Button
                  variant={activeView === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('analytics')}
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1 bg-transparent"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {activeView === 'projects' && <ProjectsDashboard />}
          {activeView === 'time' && <TimeTrackingDashboard />}
          {activeView === 'invoices' && <InvoicesDashboard />}
          {/* added analytics dashboard view */}
          {activeView === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <Clock className="h-12 w-12 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Zentime</h1>
          </div>
          <p className="text-gray-600">Simple, fast, and freelancer-friendly time tracking</p>
        </div>

        {/* Auth Forms */}
        {isLoginMode ? (
          <LoginForm onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLoginMode(true)} />
        )}
      </div>
    </div>
  )
}

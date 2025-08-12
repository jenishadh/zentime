'use client'

import { useMemo } from 'react'

import { Clock, DollarSign, Target, TrendingUp } from 'lucide-react'

import { useInvoices } from '@/lib/invoices-context'
import { useProjects } from '@/lib/projects-context'
import { useTasks } from '@/lib/tasks-context'
import { useTimeTracking } from '@/lib/time-tracking-context'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { ProductivityChart } from './productivity-chart'
import { ProjectPerformanceChart } from './project-performance-chart'
import { RevenueChart } from './revenue-chart'
import { TimeDistributionChart } from './time-distribution-chart'

export function AnalyticsDashboard() {
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const { timeEntries } = useTimeTracking()
  const { invoices } = useInvoices()

  const analytics = useMemo(() => {
    // Time analytics
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60
    const totalEarnings = timeEntries.reduce((sum, entry) => sum + entry.earnings, 0)
    const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0

    // This week's data
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const thisWeekEntries = timeEntries.filter((entry) => new Date(entry.startTime) >= oneWeekAgo)
    const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60
    const thisWeekEarnings = thisWeekEntries.reduce((sum, entry) => sum + entry.earnings, 0)

    // This month's data
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const thisMonthEntries = timeEntries.filter((entry) => new Date(entry.startTime) >= oneMonthAgo)
    const thisMonthHours = thisMonthEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60
    const thisMonthEarnings = thisMonthEntries.reduce((sum, entry) => sum + entry.earnings, 0)

    // Project analytics
    const activeProjects = projects.filter((p) => p.status === 'active').length
    const completedProjects = projects.filter((p) => p.status === 'completed').length

    // Task analytics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Invoice analytics
    const totalInvoices = invoices.length
    const paidInvoices = invoices.filter((i) => i.status === 'paid')
    const pendingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue')
    const totalInvoiceValue = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const paidInvoiceValue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const pendingInvoiceValue = pendingInvoices.reduce((sum, invoice) => sum + invoice.total, 0)

    // Productivity metrics
    const averageDailyHours =
      totalHours /
      Math.max(
        1,
        Math.ceil(
          (Date.now() - new Date(timeEntries[0]?.startTime || Date.now()).getTime()) /
            (24 * 60 * 60 * 1000)
        )
      )

    return {
      totalHours,
      totalEarnings,
      averageHourlyRate,
      thisWeekHours,
      thisWeekEarnings,
      thisMonthHours,
      thisMonthEarnings,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      taskCompletionRate,
      totalInvoices,
      paidInvoices: paidInvoices.length,
      pendingInvoices: pendingInvoices.length,
      totalInvoiceValue,
      paidInvoiceValue,
      pendingInvoiceValue,
      averageDailyHours
    }
  }, [projects, tasks, timeEntries, invoices])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Track your productivity, earnings, and project performance</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(analytics.totalHours)}</div>
            <p className="text-muted-foreground text-xs">
              {formatHours(analytics.thisWeekHours)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalEarnings)}</div>
            <p className="text-muted-foreground text-xs">
              {formatCurrency(analytics.thisWeekEarnings)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.averageHourlyRate)}/hr
            </div>
            <p className="text-muted-foreground text-xs">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeProjects}</div>
            <p className="text-muted-foreground text-xs">{analytics.completedProjects} completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <Badge variant="secondary">{analytics.completedTasks}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <Badge variant="outline">{analytics.inProgressTasks}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-sm font-medium">
                {analytics.taskCompletionRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Paid</span>
              <div className="text-right">
                <Badge className="bg-green-100 text-green-800">{analytics.paidInvoices}</Badge>
                <p className="text-xs text-gray-500">
                  {formatCurrency(analytics.paidInvoiceValue)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <div className="text-right">
                <Badge className="bg-yellow-100 text-yellow-800">{analytics.pendingInvoices}</Badge>
                <p className="text-xs text-gray-500">
                  {formatCurrency(analytics.pendingInvoiceValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hours Logged</span>
              <span className="text-sm font-medium">{formatHours(analytics.thisMonthHours)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Earnings</span>
              <span className="text-sm font-medium">
                {formatCurrency(analytics.thisMonthEarnings)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Average</span>
              <span className="text-sm font-medium">
                {formatHours(analytics.averageDailyHours)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TimeDistributionChart />
        <RevenueChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectPerformanceChart />
        <ProductivityChart />
      </div>
    </div>
  )
}

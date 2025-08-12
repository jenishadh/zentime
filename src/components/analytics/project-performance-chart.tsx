'use client'

import { useMemo } from 'react'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useProjects } from '@/lib/projects-context'
import { useTimeTracking } from '@/lib/time-tracking-context'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProjectPerformanceChart() {
  const { projects } = useProjects()
  const { timeEntries } = useTimeTracking()

  const chartData = useMemo(() => {
    const projectStats = new Map<string, { hours: number; earnings: number }>()

    timeEntries.forEach((entry) => {
      const project = projects.find((p) => p.id === entry.projectId)
      const projectName = project ? project.name : 'Unknown'
      const hours = entry.duration / 60
      const earnings = entry.earnings

      const current = projectStats.get(projectName) || { hours: 0, earnings: 0 }
      projectStats.set(projectName, {
        hours: current.hours + hours,
        earnings: current.earnings + earnings
      })
    })

    return Array.from(projectStats.entries())
      .map(([name, stats]) => ({
        name,
        hours: Number(stats.hours.toFixed(1)),
        earnings: Number(stats.earnings.toFixed(2))
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 6) // Top 6 projects
  }, [projects, timeEntries])

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean
    payload?: Array<{ value: number }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">Hours: {payload[0].value}h</p>
          <p className="text-sm text-gray-600">Earnings: ${payload[1].value}</p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-gray-500">No project data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="hours" orientation="left" tickFormatter={(value) => `${value}h`} />
              <YAxis
                yAxisId="earnings"
                orientation="right"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="hours" dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="earnings" dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

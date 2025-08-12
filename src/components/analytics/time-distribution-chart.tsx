'use client'

import { useMemo } from 'react'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useProjects } from '@/lib/projects-context'
import { useTimeTracking } from '@/lib/time-tracking-context'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TimeDistributionChart() {
  const { projects } = useProjects()
  const { timeEntries } = useTimeTracking()

  const chartData = useMemo(() => {
    const projectHours = new Map<string, number>()

    timeEntries.forEach((entry) => {
      const project = projects.find((p) => p.id === entry.projectId)
      const projectName = project ? `${project.name} (${project.client})` : 'Unknown Project'
      const hours = entry.duration / 60

      projectHours.set(projectName, (projectHours.get(projectName) || 0) + hours)
    })

    return Array.from(projectHours.entries())
      .map(([name, hours]) => ({
        name,
        hours: Number(hours.toFixed(1)),
        percentage: 0 // Will be calculated below
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8) // Top 8 projects
  }, [projects, timeEntries])

  // Calculate percentages
  const totalHours = chartData.reduce((sum, item) => sum + item.hours, 0)
  chartData.forEach((item) => {
    item.percentage = totalHours > 0 ? Number(((item.hours / totalHours) * 100).toFixed(1)) : 0
  })

  const COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316' // orange
  ]

  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean
    payload?: Array<{ payload: { name: string; hours: number; percentage: number } }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-white p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.hours}h ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Distribution by Project</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-gray-500">No time entries to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Distribution by Project</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="hours"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {chartData.slice(0, 4).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="max-w-32 truncate">{item.name}</span>
              </div>
              <span className="font-medium">{item.hours}h</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

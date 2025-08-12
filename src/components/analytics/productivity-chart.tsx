'use client'

import { useMemo } from 'react'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { useTimeTracking } from '@/lib/time-tracking-context'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProductivityChart() {
  const { timeEntries } = useTimeTracking()

  const chartData = useMemo(() => {
    const dailyHours = new Map<string, number>()

    timeEntries.forEach((entry) => {
      const date = new Date(entry.startTime).toISOString().split('T')[0]
      const hours = entry.duration / 60
      dailyHours.set(date, (dailyHours.get(date) || 0) + hours)
    })

    // Get last 14 days
    const result = []
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      const dayName = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })

      result.push({
        date: dayName,
        hours: Number((dailyHours.get(dateKey) || 0).toFixed(1))
      })
    }

    return result
  }, [timeEntries])

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
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Productivity (Last 14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value}h`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

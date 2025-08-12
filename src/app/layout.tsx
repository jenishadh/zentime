import type React from 'react'
import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'

import './globals.css'

import { AuthProvider } from '@/lib/auth-context'
import { InvoicesProvider } from '@/lib/invoices-context'
import { ProjectsProvider } from '@/lib/projects-context'
import { TasksProvider } from '@/lib/tasks-context'
import { TimeTrackingProvider } from '@/lib/time-tracking-context'

const manrope = Manrope({
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Zentime',
  description:
    'Zentime – Effortless time tracking and invoicing for freelancers who value focus and flow.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.className} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          <ProjectsProvider>
            <TasksProvider>
              <TimeTrackingProvider>
                <InvoicesProvider>{children}</InvoicesProvider>
              </TimeTrackingProvider>
            </TasksProvider>
          </ProjectsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

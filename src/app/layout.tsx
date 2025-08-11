import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'

import './globals.css'

const manrope = Manrope({
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Zentime',
  description:
    'Zentime – Effortless time tracking and invoicing for freelancers who value focus and flow.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>{children}</body>
    </html>
  )
}

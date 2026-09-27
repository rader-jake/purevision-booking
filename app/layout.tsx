import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

const display = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Pure Vision Tints — Book Your Appointment',
  description: 'Book your ceramic window tinting appointment at Pure Vision Tints in Hockley, TX. Premium HITEK Ceramic Black film, machine-cut precision, lifetime warranty.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
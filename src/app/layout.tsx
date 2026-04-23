import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Danifit',
  description: 'Tu entrenador personal — rutinas, seguimiento y comunidad',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Danifit',
  },
}

export const viewport: Viewport = {
  themeColor: '#E8185A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} font-sans antialiased bg-background text-white`}>
        {children}
      </body>
    </html>
  )
}

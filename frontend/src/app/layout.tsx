import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  // Preload only the weight used above-the-fold
  preload: true,
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],   // Removed 300 & 900 — rarely used, saves ~48 KiB
  variable: '--font-merriweather',
  display: 'swap',
  preload: false,            // Not used above-the-fold; load after Inter
})

export const metadata: Metadata = {
  title: 'HEALTH-AI · ML Learning Tool | Erasmus+ KA220-HED',
  description:
    'An interactive machine learning education platform for healthcare professionals. Build, train, and evaluate clinical AI models across 20 medical specialties.',
  keywords: [
    'healthcare AI',
    'machine learning',
    'medical education',
    'clinical decision support',
    'Erasmus+',
    'KA220-HED',
  ],
  authors: [{ name: 'HEALTH-AI Erasmus+ Consortium' }],
  openGraph: {
    title: 'HEALTH-AI · ML Learning Tool',
    description:
      'Interactive ML education for healthcare professionals — 20 clinical specialties, 6 ML algorithms, full explainability and ethics toolkit.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to Google Fonts origin to reduce latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased bg-surface min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

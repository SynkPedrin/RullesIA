import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { DynamicIslandNav } from '@/components/dynamic-island-nav'
import { CursorParticles } from '@/components/cursor-particles'
import { FloatingTechIcons } from '@/components/floating-tech-icons'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'RullesIA - Engenharia Jurídica Inteligente',
  description: 'Sistema de IA para análise de contratos, gestão de operações legais e CRM jurídico',
  icons: {
    icon: '/images/RULLESlogo.png',
    apple: '/images/RULLESlogo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans antialiased bg-[#070707] text-white selection:bg-amber-500 selection:text-black min-h-screen relative">
        <CursorParticles />
        <FloatingTechIcons />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] fixed"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10 flex flex-col min-h-screen">
          <DynamicIslandNav />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  )
}

"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentContracts } from "@/components/dashboard/recent-contracts"
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines"
import { RiskOverview } from "@/components/dashboard/risk-overview"
import { useContractStore, getDashboardStats } from "@/lib/contracts-store"
import { Reveal } from "@/components/reveal-animation"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const stats = getDashboardStats()
  const mockContracts = useContractStore(state => state.contracts)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden pt-20">
      <main className="relative">
          <div className="relative p-6 lg:p-8 pt-6 space-y-8 max-w-screen-2xl mx-auto">
            {/* Header section */}
            <Reveal delay={0.1}>
              <div className="flex items-end justify-between border-b border-white/5 pb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-black mb-2 px-1">PAINEL DE CONTROLE</p>
                  <h1 className="text-5xl font-black tracking-tighter text-white">Dashboard</h1>
                  <p className="text-sm text-white/35 mt-2 font-medium">
                    Gestão inteligente de riscos e contratos
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
                    {mounted 
                      ? new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
                      : "Carregando..."}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Stats */}
            <Reveal delay={0.2}>
              <StatsCards stats={stats} />
            </Reveal>

            {/* Main grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Contracts table - 2/3 */}
              <Reveal delay={0.3} className="xl:col-span-2">
                <RecentContracts contracts={mockContracts} />
              </Reveal>

              {/* Right column - 1/3 */}
              <Reveal delay={0.4} className="space-y-8">
                <UpcomingDeadlines contracts={mockContracts} />
                <RiskOverview contracts={mockContracts} />
              </Reveal>
            </div>
          </div>
      </main>
    </div>
  )
}

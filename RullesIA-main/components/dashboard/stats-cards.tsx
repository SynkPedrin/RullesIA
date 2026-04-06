"use client"

import { FileText, Clock, AlertTriangle, Calendar } from "lucide-react"
import { DashboardStats } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  stats: DashboardStats
}

const cards = [
  {
    key: "totalContratos" as const,
    title: "Contratos",
    sub: "Total cadastrado",
    icon: FileText,
    accent: "text-amber-500",
    bar: "bg-amber-500",
  },
  {
    key: "contratosEmAnalise" as const,
    title: "Em Análise",
    sub: "Aguardando revisão",
    icon: Clock,
    accent: "text-amber-300",
    bar: "bg-amber-300",
  },
  {
    key: "alertasRisco" as const,
    title: "Alertas",
    sub: "Riscos identificados",
    icon: AlertTriangle,
    accent: "text-red-500",
    bar: "bg-red-500",
  },
  {
    key: "prazoProximo" as const,
    title: "Prazos",
    sub: "Próximos 7 dias",
    icon: Calendar,
    accent: "text-amber-600",
    bar: "bg-amber-600",
  },
]

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-3xl p-5 group transition-all duration-500 hover:scale-[1.02]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          )}
        >
          {/* Subtle glow on hover */}
          <div className={cn("absolute -inset-24 opacity-0 group-hover:opacity-20 blur-[60px] rounded-full transition-opacity", card.bar)} />
          
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">{card.title}</p>
              <p className="text-4xl font-black tracking-tighter text-white leading-none mt-2">
                {stats[card.key]}
              </p>
            </div>
            <div className={cn("p-2.5 rounded-xl bg-white/[0.05] border border-white/10 transition-transform group-hover:rotate-12", card.accent)}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-white/30 relative z-10">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}

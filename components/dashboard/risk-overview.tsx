"use client"

import { ShieldAlert, ShieldCheck, Shield } from "lucide-react"
import { ContractAnalysis } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RiskOverviewProps {
  contracts: ContractAnalysis[]
}

export function RiskOverview({ contracts }: RiskOverviewProps) {
  const allRisks = contracts.flatMap(c => c.riscos)
  const high = allRisks.filter(r => r.nivel === 'alto').length
  const medium = allRisks.filter(r => r.nivel === 'medio').length
  const low = allRisks.filter(r => r.nivel === 'baixo').length
  const total = allRisks.length || 1

  const levels = [
    { label: 'Alto', count: high, pct: (high / total) * 100, icon: ShieldAlert, color: 'text-red-500', bar: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' },
    { label: 'Médio', count: medium, pct: (medium / total) * 100, icon: Shield, color: 'text-amber-500', bar: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' },
    { label: 'Baixo', count: low, pct: (low / total) * 100, icon: ShieldCheck, color: 'text-white/60', bar: 'bg-white/40' },
  ]

  const topRisks = contracts
    .flatMap(c => c.riscos.filter(r => r.nivel === 'alto').map(r => ({
      ...r, contratoNome: c.metadados.objeto
    })))
    .slice(0, 3)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Visão de Riscos</h2>
        <p className="text-sm font-bold text-white mt-1">{total} riscos identificados</p>
      </div>

      <div className="p-5 space-y-4">
        {levels.map((l) => (
          <div key={l.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <l.icon className={cn("w-3.5 h-3.5", l.color)} />
                <span className="text-xs text-white/50">{l.label}</span>
              </div>
              <span className={cn("text-sm font-bold", l.color)}>{l.count}</span>
            </div>
            {/* Custom progress bar */}
            <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", l.bar)}
                style={{ width: `${l.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {topRisks.length > 0 && (
        <div className="px-5 pb-5 space-y-2">
          <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3">Alertas Críticos</p>
          {topRisks.map((risk, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/[0.03] border border-red-500/10 hover:bg-red-500/[0.06] transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-red-400/90 truncate">Cláusula {risk.clausula}</p>
                <p className="text-xs text-white/30 truncate mt-0.5">{risk.motivo}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

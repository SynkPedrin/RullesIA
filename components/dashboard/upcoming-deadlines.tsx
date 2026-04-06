"use client"

import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react"
import { ContractAnalysis } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface UpcomingDeadlinesProps {
  contracts: ContractAnalysis[]
}

function getDaysUntil(dateString: string, now: Date): number {
  const date = new Date(dateString)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateString: string): string {
  try {
    // Handle YYYY-MM-DD format
    if (dateString.includes('-')) {
      const parts = dateString.split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`
      }
    }
    // Try to parse as a date
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      return `${day}/${month}`
    }
    return dateString
  } catch {
    return dateString
  }
}

export function UpcomingDeadlines({ contracts }: UpcomingDeadlinesProps) {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => { 
    setMounted(true)
    setNow(new Date())
  }, [])

  const allDeadlines = contracts
    .flatMap(contract =>
      contract.prazos.map(prazo => ({
        ...prazo,
        contratoId: contract.id,
        contratoNome: contract.metadados.objeto,
        clienteNome: contract.metadados.contratante,
      }))
    )
    .filter(d => !d.concluido)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 5)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div>
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Próximos Prazos</h2>
          <p className="text-sm font-bold text-white mt-1">{allDeadlines.length} pendentes</p>
        </div>
        <Calendar className="w-4 h-4 text-white/20" />
      </div>

      <div className="p-4 space-y-2">
        {allDeadlines.length === 0 ? (
          <div className="flex items-center justify-center py-6 gap-2 text-white/25 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Nenhum prazo pendente
          </div>
        ) : (
          allDeadlines.map((deadline, index) => {
            const daysUntil = now ? getDaysUntil(deadline.data, now) : 999
            const isUrgent = mounted && now && daysUntil <= 3
            const isNear = mounted && now && daysUntil <= 7

            return (
              <div
                key={`${deadline.contratoId}-${index}`}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-white/[0.03] group/item cursor-pointer",
                  isUrgent
                    ? "border-red-500/20 bg-red-500/[0.05]"
                    : isNear
                    ? "border-amber-500/20 bg-amber-500/[0.04]"
                    : "border-white/10 bg-white/[0.02]"
                )}
              >
                <div className={cn(
                  "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-colors",
                  isUrgent ? "bg-red-500/10 border-red-500/20" : isNear ? "bg-amber-500/10 border-amber-500/20" : "bg-white/[0.04] border-white/10"
                )}>
                  {isUrgent
                    ? <AlertCircle className="w-4 h-4 text-red-400" />
                    : <Calendar className={cn("w-4 h-4", isNear ? "text-amber-500" : "text-white/30")} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/70 truncate">{deadline.descricao}</p>
                  <p className="text-[11px] text-white/30 truncate">{deadline.clienteNome}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className={cn(
                    "text-xs font-semibold",
                    isUrgent ? "text-red-400" : isNear ? "text-amber-400" : "text-white/40"
                  )}>
                    {formatDate(deadline.data)}
                  </p>
                  <p className="text-[11px] text-white/25 mt-0.5">
                    {!mounted
                      ? "..."
                      : daysUntil === 0
                      ? "Hoje"
                      : daysUntil === 1
                      ? "Amanhã"
                      : daysUntil < 0
                      ? "Atrasado"
                      : `${daysUntil}d`}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

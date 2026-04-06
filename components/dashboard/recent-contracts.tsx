"use client"

import Link from "next/link"
import { FileText, ArrowRight, ArrowUpRight } from "lucide-react"
import { ContractAnalysis, StatusTag } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RecentContractsProps {
  contracts: ContractAnalysis[]
}

function getTagStyle(tag?: StatusTag) {
  switch (tag) {
    case 'URGENTE':
      return 'bg-red-500/10 text-red-400 border-red-500/15'
    case 'REVISÃO NECESSÁRIA':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/15'
    case 'CONCORDANTE':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/15'
    default:
      return 'bg-white/[0.05] text-white/40 border-white/[0.07]'
  }
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    triagem: 'Triagem',
    analise: 'Em Análise',
    revisao: 'Revisão',
    pronto: 'Pronto',
    arquivado: 'Arquivado'
  }
  return map[status] || status
}

export function RecentContracts({ contracts }: RecentContractsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Contratos Recentes</h2>
          <p className="text-sm font-bold text-white mt-1">{contracts.length} contratos ativos</p>
        </div>
        <Link
          href="/contratos"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors group"
        >
          Ver todos
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 border-b border-white/[0.04] bg-white/[0.02]">
        <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Contrato</span>
        <span className="text-[10px] uppercase font-black tracking-widest text-white/20 text-center">Status</span>
        <span className="text-[10px] uppercase font-black tracking-widest text-white/20 text-right">Data</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {contracts.slice(0, 6).map((contract) => (
          <Link
            key={contract.id}
            href={`/contratos/${contract.id}`}
            className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/[0.03] transition-all group"
          >
            {/* Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:border-amber-500/30 transition-colors">
                <FileText className="w-4 h-4 text-white/40 group-hover:text-amber-500 transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">
                  {contract.metadados.objeto}
                </p>
                <p className="text-xs text-white/30 truncate">{contract.metadados.contratante}</p>
              </div>
            </div>

            {/* Status + tag */}
            <div className="flex items-center gap-2 shrink-0">
              {contract.statusTag && (
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                  getTagStyle(contract.statusTag)
                )}>
                  {contract.statusTag}
                </span>
              )}
              <span className="text-[10px] text-white/30 border border-white/[0.08] px-2 py-0.5 rounded-md">
                {getStatusLabel(contract.status)}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-white/30">{contract.dataUpload}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

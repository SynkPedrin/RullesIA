"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Upload,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  DollarSign,
  FileSignature,
  Shield,
  Scale
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const menuGroups = [
  {
    label: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Upload, label: "Upload", href: "/upload" },
    ]
  },
  {
    label: "Jurídico",
    items: [
      { icon: FileText, label: "Contratos", href: "/contratos" },
      { icon: Scale, label: "Processos", href: "/processos" },
      { icon: FileSignature, label: "Templates", href: "/templates" },
    ]
  },
  {
    label: "CRM",
    items: [
      { icon: UserCircle, label: "Clientes", href: "/clientes" },
      { icon: Users, label: "Produção", href: "/crm" },
      { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
    ]
  },
  {
    label: "Sistema",
    items: [
      { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
      { icon: Shield, label: "Auditoria", href: "/auditoria" },
      { icon: MessageSquare, label: "Assistente IA", href: "/assistente" },
      { icon: Settings, label: "Configurações", href: "/configuracoes" },
    ]
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "flex flex-col h-screen border-r border-white/10 transition-all duration-300 ease-in-out relative z-30",
          "bg-[#0a0a0a]/40 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]",
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 border-b border-white/[0.06] shrink-0",
          collapsed ? "justify-center px-0" : "px-5 gap-3"
        )}>
          <div className="shrink-0 w-7 h-7 relative">
            <Image
              src="/images/RULLESlogo.png"
              alt="Orvyn"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm tracking-tight text-white">RullesIA</span>
              <span className="text-[10px] text-white/30 font-normal">Assistente Jurídico</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5 px-2">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  const link = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group",
                        "text-white/40 hover:text-white/80 hover:bg-white/[0.05]",
                        isActive && "text-white bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]",
                        collapsed && "justify-center px-0 py-3"
                      )}
                    >
                      <Icon className={cn(
                        "shrink-0 transition-all duration-300",
                        collapsed ? "w-[18px] h-[18px]" : "w-4 h-4",
                        isActive ? "text-amber-500" : "text-white/40 group-hover:text-white/70"
                      )} />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#111] border-white/10 text-white text-xs">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return link
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="shrink-0 p-2 border-t border-white/[0.06]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all text-sm",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}

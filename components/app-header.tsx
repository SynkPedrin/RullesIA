"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, User, LogOut, Settings, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSettingsStore } from "@/lib/settings-store"
import { useNotificationStore } from "@/lib/notification-store"

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/upload": "Upload de Contrato",
  "/contratos": "Contratos",
  "/clientes": "Clientes",
  "/processos": "Processos",
  "/financeiro": "Financeiro",
  "/crm": "CRM / Produção",
  "/templates": "Templates",
  "/relatorios": "Relatórios",
  "/auditoria": "Auditoria",
  "/assistente": "Assistente IA",
  "/configuracoes": "Configurações",
}

export function AppHeader() {
  const pathname = usePathname()
  const base = "/" + pathname.split("/")[1]
  const pageTitle = breadcrumbMap[base] ?? "RullesIA"

  const profile = useSettingsStore(state => state.profile)
  const notifications = useNotificationStore(state => state.notifications)
  const unreadCount = useNotificationStore(state => state.unreadCount())
  const markAsRead = useNotificationStore(state => state.markAsRead)

  return (
    <div className="flex items-center justify-center pt-4 pb-2 px-4 sticky top-0 z-[40]">
      <header className={cn(
        "flex items-center justify-between h-14 w-full max-w-5xl px-6 rounded-full transition-all duration-300",
        "bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      )}>
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/25 font-medium">RullesIA</span>
          <span className="text-white/15">/</span>
          <span className="text-white/80 font-semibold">{pageTitle}</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xs mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input
            placeholder="Buscar..."
            className="h-8 pl-8 text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06] rounded-lg transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-[#070707]" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-[#0d0d0d] border-white/[0.08] text-white shadow-2xl shadow-black/50"
          >
            <DropdownMenuLabel className="text-white/60 text-xs uppercase tracking-widest font-semibold py-3 flex justify-between items-center">
              Notificações
              {unreadCount > 0 && (
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                  {unreadCount} novas
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-white/20 text-xs">
                Nenhuma notificação por enquanto
              </div>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem 
                  key={n.id} 
                  className={cn(
                    "flex flex-col items-start gap-1.5 py-3 px-4 focus:bg-white/[0.04] cursor-pointer",
                    !n.read && "bg-white/[0.02]"
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-[10px] px-1.5 py-0.5 border font-semibold", n.badgeClass)}>{n.badge}</Badge>
                    <span className={cn("text-sm font-medium", n.read ? "text-white/50" : "text-white/80")}>{n.title}</span>
                  </div>
                  <span className="text-xs text-white/35 leading-relaxed">{n.desc}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.07] mx-1" />

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all group">
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white/60" />
                )}
              </div>
              <span className="text-sm text-white/60 group-hover:text-white/80 hidden sm:block truncate max-w-[120px]">
                {profile.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/25" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 bg-[#0d0d0d] border-white/[0.08] text-white shadow-2xl shadow-black/50"
          >
            <DropdownMenuLabel className="py-3">
              <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
              <p className="text-xs text-white/35 mt-0.5 truncate">{profile.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem asChild className="focus:bg-white/[0.04] cursor-pointer text-white/60 hover:text-white/90">
              <Link href="/configuracoes" className="flex items-center gap-2.5">
                <Settings className="w-3.5 h-3.5" />
                <span className="text-sm">Configurações</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem asChild className="focus:bg-white/[0.04] cursor-pointer text-red-400/80 hover:text-red-400">
              <Link href="/login" className="flex items-center gap-2.5">
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-sm">Sair</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </header>
    </div>
  )
}

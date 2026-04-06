"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Upload,
  MessageSquare,
  Settings,
  Scale,
  DollarSign,
  FileSignature,
  Shield,
  UserCircle,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Navigation Items ───
const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Contratos", href: "/contratos" },
  { icon: Scale, label: "Processos", href: "/processos" },
  { icon: UserCircle, label: "Clientes", href: "/clientes" },
  { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
  { icon: MessageSquare, label: "Assistente IA", href: "/assistente" },
]

const secondaryNavItems = [
  { icon: Upload, label: "Upload", href: "/upload" },
  { icon: FileSignature, label: "Templates", href: "/templates" },
  { icon: Users, label: "CRM", href: "/crm" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: Shield, label: "Auditoria", href: "/auditoria" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

const publicNavItems = [
  { label: "Recursos", href: "#recursos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Preços", href: "#precos" },
]

// ─── Dynamic Island Navigation ───
export function DynamicIslandNav() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/cadastro"
  const isLoginPage = pathname === "/login" || pathname === "/cadastro"
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
        setIsMobileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close on route change
  useEffect(() => {
    setIsExpanded(false)
    setIsMobileOpen(false)
  }, [pathname])

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false)
      if (!isExpanded) setIsExpanded(false)
    }, 300)
  }, [isExpanded])

  // Don't show on login/register pages
  if (isLoginPage) return null

  // ─── Public Page Nav (Landing) ───
  if (isPublicPage) {
    return (
      <motion.div
        ref={navRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
      >
        <motion.nav
          layout
          animate={{
            width: isScrolled ? "auto" : "auto",
            backgroundColor: isScrolled ? "rgba(10,10,10,0.85)" : "rgba(10,10,10,0.5)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 rounded-full",
            "border border-white/[0.08] backdrop-blur-xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-2 pr-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Image src="/images/RULLESlogo.png" alt="Orvyn" width={28} height={28} className="rounded-full" />
            </motion.div>
            <AnimatePresence>
              {(!isScrolled || isHovered) && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-black tracking-tight text-white overflow-hidden whitespace-nowrap"
                >
                  RullesIA
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10" />

          {/* Public nav links */}
          <div className="hidden md:flex items-center gap-0.5 px-1">
            {publicNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-3.5 py-1.5 text-sm text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/[0.06] group"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 hidden md:block" />

          {/* CTA Buttons */}
          <div className="flex items-center gap-1.5 pl-1">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
            >
              Entrar
            </Link>
            <Link href="/cadastro">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 bg-white text-black text-sm font-bold rounded-full flex items-center gap-1.5"
              >
                Começar
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white/50 hover:text-white"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </motion.nav>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl"
            >
              {publicNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // ─── Internal Pages Nav (Dynamic Island) ───
  return (
    <motion.div
      ref={navRef}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.nav
        layout
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          borderRadius: isExpanded ? 24 : 50,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={cn(
          "relative flex flex-col overflow-hidden",
          "bg-[#0a0a0a]/90 backdrop-blur-2xl",
          "border border-white/[0.08]",
          "shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)]"
        )}
      >
        {/* ── Main Bar (Always visible) ── */}
        <div className="flex items-center gap-1 px-2 py-1.5">
          {/* Logo pill */}
          <Link href="/dashboard" className="flex items-center gap-2 pl-2 pr-1 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Image src="/images/RULLESlogo.png" alt="Orvyn" width={26} height={26} className="rounded-full" />
            </motion.div>
          </Link>

          {/* Active indicator dot */}
          <div className="w-px h-4 bg-white/10 mx-0.5" />

          {/* Main nav items */}
          <div className="flex items-center gap-0.5">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
                      isActive
                        ? "bg-white text-black"
                        : "text-white/45 hover:text-white hover:bg-white/[0.07]"
                    )}
                  >
                    <item.icon className={cn("w-3.5 h-3.5", isActive && "text-black")} />
                    <AnimatePresence>
                      {(isActive || isHovered) && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "text-xs font-semibold overflow-hidden whitespace-nowrap",
                            isActive ? "text-black" : "text-white/70"
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right section divider */}
          <div className="w-px h-4 bg-white/10 mx-1" />

          {/* Expand/Menu toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isExpanded ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/[0.06]"
            )}
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-3.5 h-3.5" />
                </motion.div>
              ) : (
                <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-3.5 h-3.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notification dot */}
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-full text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </motion.div>
          </Link>

          {/* User avatar */}
          <Link href="/configuracoes">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center ml-0.5 mr-1"
            >
              <span className="text-[10px] font-bold text-white/70">RI</span>
            </motion.div>
          </Link>
        </div>

        {/* ── Expanded Panel ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1">
                {/* Separator */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3" />

                {/* Secondary nav grid */}
                <div className="grid grid-cols-3 gap-1">
                  {secondaryNavItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.06)" }}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors",
                            isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                          )}
                        >
                          <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-white/40")} />
                          <span className={cn("text-[10px] font-medium", isActive ? "text-white" : "text-white/40")}>
                            {item.label}
                          </span>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white/60">RI</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white/70">Meu Escritório</p>
                      <p className="text-[9px] text-white/30">contato@escritorio.com</p>
                    </div>
                  </div>
                  <Link href="/login">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.div>
  )
}

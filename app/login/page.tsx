"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Scale, Shield, Zap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], [0, 80])

  const springCfg = { stiffness: 40, damping: 18 }
  const mouseX = useSpring(0, springCfg)
  const mouseY = useSpring(0, springCfg)

  useEffect(() => {
    setMounted(true)
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const { left, top, width, height } = containerRef.current.getBoundingClientRect()
      mouseX.set(((e.clientX - left - width / 2) / width) * 24)
      mouseY.set(((e.clientY - top - height / 2) / height) * 24)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [mouseX, mouseY])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    router.push("/dashboard")
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#060606] overflow-hidden relative flex">

      {/* ── Background Image ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 scale-110">
        <Image
          src="/images/justice-bg.png"
          alt=""
          fill
          className="object-cover object-center"
          style={{ opacity: 0.18 }}
          priority
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_20%,#060606_85%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-[#060606]/40 to-[#060606]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-[#060606]/70" />
      </motion.div>

      {/* Grain */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      {/* ── Left: Brand Panel ── */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-16 relative z-10">
        {/* Top badge */}
        <div className="flex items-center gap-3">
          <div className="w-px h-6 bg-white/20" />
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/30 font-medium">Sistema Jurídico Inteligente</span>
        </div>

        {/* Center logo + copy */}
        <div className="flex flex-col items-start">
          <motion.div
            style={{ x: mouseX, y: mouseY }}
            className="relative mb-12"
          >
            {/* Glow */}
            <div className="absolute -inset-24 bg-white/[0.03] blur-[80px] rounded-full pointer-events-none" />
            <motion.div
              initial={{ opacity: 0, scale: 0.7, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <Image
                src="/images/RULLESlogo.png"
                alt="Orvyn"
                width={160}
                height={160}
                className="drop-shadow-[0_0_60px_rgba(255,255,255,0.15)]"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
            <h1 className="text-[86px] font-black tracking-[-0.05em] text-white leading-none">
              Rulles<span className="text-white/30">IA</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <p className="text-lg text-white/35 font-light tracking-wide mt-3 max-w-sm leading-relaxed">
              Engenharia jurídica inteligente para escritórios de alta performance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col gap-2 mt-8"
          >
            <span className="text-2xl font-black text-white/60 tracking-tight">Assistente Jurídico</span>
            <span className="text-xs text-amber-500/60 tracking-[0.2em] uppercase">Powered by Orvyn</span>
          </motion.div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="grid grid-cols-3 gap-12"
        >
          {[
            { v: "50K+", l: "Contratos" },
            { v: "99.9%", l: "Precisão IA" },
            { v: "500+", l: "Escritórios" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.08 }}
            >
              <p className="text-4xl font-black text-white tracking-tight">{s.v}</p>
              <p className="text-xs text-white/25 uppercase tracking-widest mt-1">{s.l}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Vertical divider */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent self-stretch origin-top z-10"
      />

      {/* ── Right: Login Form ── */}
      <motion.div
        initial={{ opacity: 0, x: 60, filter: "blur(20px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-10 lg:px-14 py-16 relative z-10"
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-12">
          <Image src="/images/RULLESlogo.png" alt="Orvyn" width={80} height={80} className="mb-4" priority />
          <h1 className="text-4xl font-black text-white tracking-tight">RullesIA</h1>
          <p className="text-sm text-white/30 mt-1">Criado por Orvyn</p>
        </div>

        {/* Form header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-10"
        >
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/25 mb-3">Bem-vindo de volta</p>
          <h2 className="text-4xl font-black tracking-tight text-white">Acessar</h2>
          <p className="text-sm text-white/35 mt-2">Entre com suas credenciais para continuar</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="space-y-4"
        >
          {/* Email */}
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Email</label>
            <div className={`relative transition-all duration-200 rounded-xl ${focusedInput === 'email' ? 'ring-1 ring-white/20' : ''}`}>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                className="w-full h-13 px-4 py-3.5 bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 rounded-xl text-sm outline-none focus:border-amber-500/25 focus:bg-white/[0.06] transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/40 uppercase tracking-widest">Senha</label>
              <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">Esqueceu?</a>
            </div>
            <div className={`relative transition-all duration-200 rounded-xl ${focusedInput === 'password' ? 'ring-1 ring-white/20' : ''}`}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className="w-full h-13 px-4 py-3.5 bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 rounded-xl text-sm outline-none focus:border-amber-500/25 focus:bg-white/[0.06] transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full h-13 mt-2 bg-amber-500 text-black text-sm font-bold rounded-xl overflow-hidden group disabled:opacity-70 transition-all hover:bg-amber-600 shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                  Entrando...
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                  Entrar
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.07]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-[11px] text-white/20 bg-[#060606] uppercase tracking-widest">ou continue com</span>
          </div>
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Google", icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity=".7"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".7"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" opacity=".7"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity=".7"/>
              </svg>
            )},
            { label: "GitHub", icon: (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" opacity=".7"/>
              </svg>
            )},
          ].map(btn => (
            <button
              key={btn.label}
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm hover:bg-white/[0.07] hover:text-white/70 transition-all"
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

        {/* Register link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm text-white/25 text-center mt-10"
        >
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-white/60 hover:text-white font-medium transition-colors">
            Criar conta
          </Link>
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex items-center justify-center gap-3 mt-8"
        >
          {[
            { icon: Scale, text: "Jurídico" },
            { icon: Shield, text: "LGPD" },
            { icon: Zap, text: "IA" },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02]">
              <f.icon className="w-3 h-3 text-white/25" />
              <span className="text-[10px] text-white/25 font-medium">{f.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

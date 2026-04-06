"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion"
import { Reveal, LandoSection } from "@/components/reveal-animation"
import { 
  ArrowRight, 
  FileText, 
  Users, 
  DollarSign, 
  Scale,
  Shield,
  Zap,
  CheckCircle,
  Play,
  Sparkles,
  TrendingUp,
  Clock,
  Lock,
  BarChart3,
  Brain,
  ChevronRight,
  ArrowUpRight,
  MessageSquare,
  Cpu,
  Globe,
  Database,
  Code2,
  Terminal,
  Activity,
} from "lucide-react"

// ─── UTILS ───
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ')




// ─── MAGNETIC BUTTON ───
function MagneticButton({ children, className, href }: { children: React.ReactNode; className?: string; href?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (clientX - left - width / 2) * 0.2
    const y = (clientY - top - height / 2) * 0.2
    setPosition({ x, y })
  }

  const reset = () => setPosition({ x: 0, y: 0 })
  const Component = href ? Link : 'div'

  return (
    // @ts-ignore
    <Component href={href || '#'}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 350, damping: 15 }}
        className={className}
      >
        {children}
      </motion.div>
    </Component>
  )
}

// ─── ANIMATED COUNTER ───
function AnimatedCounter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    const inc = end / (duration * 60)
    const timer = setInterval(() => {
      start += inc
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, value, duration])

  const isDecimal = value % 1 !== 0;
  return <span ref={ref}>{isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}</span>;
}

// ─── FEATURE CARD ───
function FeatureCard({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) {
  return (
    <Reveal delay={index * 0.1} y={40}>
      <div className="group h-full p-8 rounded-[32px] bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-sm text-white/30 leading-relaxed">{description}</p>
      </div>
    </Reveal>
  )
}

// ─── MAIN PAGE ───
export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const stats = [
    { value: 1000, suffix: "+", label: "Contratos Analisados" },
    { value: 99.9, suffix: "%", label: "Precisão da IA" },
    { value: 50, suffix: "+", label: "Escritórios" },
    { value: 24, suffix: "/7", label: "Suporte" }
  ]

  const features = [
    { icon: Brain, title: "Assistente IA Jurídico", description: "Chat inteligente com Vade Mecum integrado. Lê PDFs, imagens e gera resumos detalhados." },
    { icon: FileText, title: "Análise de Contratos", description: "Extraia dados e identifique riscos automaticamente em segundos com precisão total." },
    { icon: Users, title: "Gestão de Clientes", description: "CRM jurídico de alta performance com lead scoring e histórico completo de interações." },
    { icon: DollarSign, title: "Dashboards Financeiros", description: "Controle absoluto de honorários, custas e fluxo de caixa do seu escritório." },
    { icon: Scale, title: "Monitoramento Processual", description: "Acompanhe movimentações e nunca mais perca um prazo com notificações inteligentes." },
    { icon: Shield, title: "Segurança & LGPD", description: "Dados criptografados e conformidade total com a LGPD para sua tranquilidade." }
  ]

  return (
    <div ref={containerRef} className="min-h-screen text-white overflow-x-hidden">
      
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-amber-500 origin-left z-[110]" style={{ scaleX }} />

      {/* Hero Section */}
      <section className="relative min-h-[110vh] flex items-center justify-center pt-24 overflow-hidden bg-[url('/images/justice-bg.png')] bg-cover bg-fixed bg-center">
        <div className="absolute inset-0 bg-black/80 z-0" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#070707]/50 to-[#070707]" />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 group hover:bg-white/5 transition-all cursor-pointer">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span className="text-[10px] font-black tracking-widest uppercase text-white/50">Advocacia 4.0 // AGORA INTEGRADO</span>
            </div>
          </Reveal>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-[140px] font-extrabold tracking-[-0.06em] leading-[0.85] mb-12 mix-blend-exclusion"
          >
            Rulles<br/><span className="text-white/10 uppercase italic">IA</span>
          </motion.h1>
          
          <Reveal delay={0.4}>
            <p className="text-lg md:text-2xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
              A nova fronteira da engenharia jurídica.<br/>
              <span className="text-amber-500/80 font-black tracking-tighter">O PODER DA IA NO SEU ESCRITÓRIO.</span>
            </p>
          </Reveal>
          
          <Reveal delay={0.6}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <MagneticButton href="/cadastro">
                <div className="px-12 py-6 bg-white text-black text-xl font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                  EXPLORAR SISTEMA
                </div>
              </MagneticButton>
            </div>
          </Reveal>
        </div>

        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/10"
        >
          <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Lando Body Container */}
      <div className="flex flex-col gap-32 pb-40">
        
        {/* Stats Section with Scroll Reveal */}
        <LandoSection className="py-24 border-y border-white/5 bg-[#070707]/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center group">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter block mb-2 group-hover:text-amber-500 transition-colors">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </LandoSection>

        {/* Features Grids with Scroll Reveal */}
        <LandoSection id="recursos" className="px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal className="mb-24 text-center">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-8">
                Tecnologia de<br/><span className="text-white/10 uppercase italic">Elite Digital</span>
              </h2>
              <p className="text-white/30 text-lg max-w-2xl mx-auto font-medium leading-relaxed">Arquitetado para performance extrema, segurança e escala global.</p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
            </div>
          </div>
        </LandoSection>

        {/* Showcase / About with Scroll Reveal */}
        <LandoSection id="sobre" className="px-6 py-20 bg-amber-500/[0.02]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
            <div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] uppercase italic font-serif">
                A IA que<br/><span className="text-amber-500">entende de leis.</span>
              </h2>
              <div className="space-y-12 mt-16">
                {[
                  { icon: Clock, title: "EFICIÊNCIA ABSOLUTA", desc: "Redução de até 80% no tempo de triagem e análise de documentos complexos." },
                  { icon: TrendingUp, title: "INTELIGÊNCIA DE MERCADO", desc: "Dados consolidados sobre tendências e precedentes em tempo real." },
                  { icon: Shield, title: "PROTEÇÃO DE DADOS", desc: "Infraestrutura militar com criptografia de ponta a ponta e redundância." }
                ].map((item, i) => (
                  <div key={item.title} className="flex gap-8 items-start group">
                    <div className="w-14 h-14 rounded-[20px] bg-white/[0.02] border border-white/[0.08] flex items-center justify-center shrink-0 text-white/30 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-white/50 tracking-[0.2em] mb-2 uppercase">{item.title}</h4>
                      <p className="text-lg text-white/80 font-medium leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-[60px] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent border border-white/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/images/justice-bg.png')] opacity-10 grayscale group-hover:scale-110 transition-transform duration-1000" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full" />
                
                <motion.div 
                  whileHover={{ scale: 1.1, rotateY: 180 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Image src="/images/RULLESlogo.png" alt="RullesIA" width={300} height={300} className="relative grayscale opacity-80 brightness-150" />
                </motion.div>
                
                <div className="absolute bottom-16 left-0 right-0 text-center">
                  <span className="text-xs font-black tracking-[1em] text-white/20 uppercase">Autonomous Intelligence</span>
                </div>
              </div>
            </div>
          </div>
        </LandoSection>

        {/* Pricing with Scroll Reveal */}
        <LandoSection id="planos" className="px-6 py-20 bg-[#070707] relative">
          <div className="max-w-7xl mx-auto">
            <Reveal className="text-center mb-32">
              <h2 className="text-5xl md:text-[100px] font-black tracking-[-0.08em] leading-[0.8] mb-10 uppercase">TRANSFORME<br/><span className="text-white/10 uppercase">HOJE MESMO.</span></h2>
              <div className="w-32 h-[3px] bg-amber-500 mx-auto" />
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "ESSENCIAL",
                  price: "197",
                  desc: "Ideal para profissionais liberais que precisam de agilidade e precisão inicial.",
                  features: ["10 análises/mês", "Vade Mecum 2025", "Suporte VIP", "Análise de Riscos"],
                  color: "amber"
                },
                {
                  name: "PROFISSIONAL",
                  price: "497",
                  desc: "A solução completa para escritórios que buscam dominar o mercado jurídico digital.",
                  features: ["Análises ILIMITADAS", "CRM Jurídico Pro", "Gestão Financeira", "Dashboard de Performance", "Suporte 24/7 Reduzido"],
                  popular: true,
                  color: "white"
                },
                {
                  name: "ENTERPRISE",
                  price: "SC",
                  desc: "Infraestrutura dedicada e integrações customizadas para grandes corporações.",
                  features: ["API White-label", "Tokens Dedicados", "Suporte On-site", "Treinamento de Equipe", "Security Guard Plus"],
                  color: "amber"
                }
              ].map((plan, i) => (
                <div key={plan.name} className={cn(
                  "relative p-12 rounded-[50px] border h-full flex flex-col group transition-all duration-700 overflow-hidden",
                  plan.popular ? "bg-white border-white text-black shadow-[0_50px_100px_rgba(255,255,255,0.1)] scale-105 z-20" : "bg-white/[0.02] border-white/10 hover:border-white/20"
                )}>
                  {plan.popular && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-amber-500 text-black text-[9px] font-black rounded-full tracking-[0.4em] uppercase">
                      TRENDING
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className={cn("text-[10px] font-black tracking-[0.5em] uppercase mb-16", plan.popular ? "text-black/40" : "text-white/20")}>{plan.name}</h3>
                    <div className="mb-12">
                      <span className="text-6xl font-black tracking-tighter">
                        {plan.price === "SC" ? "PRICE" : `R$ ${plan.price}`}
                      </span>
                      {plan.price !== "SC" && <span className="text-xs font-black opacity-40 ml-2">/MONTH</span>}
                    </div>
                    <p className={cn("text-sm font-medium mb-16 leading-relaxed", plan.popular ? "text-black/60" : "text-white/30")}>{plan.desc}</p>
                    
                    <div className="space-y-6">
                      {plan.features.map(f => (
                        <div key={f} className="flex gap-4 items-center">
                          <CheckCircle className={cn("w-5 h-5", plan.popular ? "text-amber-600" : "text-amber-500")} />
                          <span className="text-[11px] font-black tracking-wider uppercase opacity-80">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href="/cadastro" className="mt-16 block w-full group/btn">
                    <div className={cn(
                      "w-full py-5 rounded-full text-[10px] font-black tracking-[0.3em] uppercase transition-all duration-500 text-center",
                      plan.popular ? "bg-black text-white group-hover/btn:bg-amber-600" : "bg-white text-black group-hover/btn:bg-amber-500"
                    )}>
                      {plan.price === "SC" ? "Talk to Expert" : "Get Started Now"}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </LandoSection>

        {/* CTA with Scroll Reveal */}
        <LandoSection className="py-40 px-6 relative overflow-hidden bg-white text-black rounded-[60px] mx-6">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-[120px] font-black tracking-[-0.08em] leading-[0.75] mb-12 uppercase italic">
              CONSTRUA O<br/><span className="text-black/10">AMANHÃ.</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <MagneticButton href="/cadastro">
                <div className="px-16 py-8 bg-black text-white text-2xl font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl">
                  START NOW
                </div>
              </MagneticButton>
              <span className="text-[10px] font-black tracking-[0.5em] text-black/20 uppercase">Available Worldwide</span>
            </div>
          </div>
        </LandoSection>

      </div>

      {/* Footer */}
      <footer className="py-32 px-6 bg-[#070707] relative z-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-20">
          <div className="col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <Image src="/images/RULLESlogo.png" alt="RullesIA" width={40} height={40} />
              <span className="text-3xl font-black tracking-tighter">RullesIA</span>
            </div>
            <p className="text-white/20 text-lg max-w-sm font-medium leading-relaxed">
              Liderando a revolução da inteligência artificial aplicada ao direito. Eficiência, escala e precisão absoluta.
            </p>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Legal</h5>
            <div className="flex flex-col gap-4 text-sm font-bold text-white/40">
              <a href="#" className="hover:text-amber-500 transition-colors">Integrity</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Enterprise</h5>
            <div className="flex flex-col gap-4 text-sm font-bold text-white/40">
              <a href="#" className="hover:text-amber-500 transition-colors">Solutions</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Security</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
            © 2026 ORVYN ENTERPRISE. ARCHITECTURE BY NEXT GEN.
          </p>
          <div className="flex gap-12 items-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Network Status: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

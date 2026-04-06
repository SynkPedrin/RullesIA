"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, Building2, User, Sparkles, Mail, Lock, Phone, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

type AccountType = "pessoa_fisica" | "pessoa_juridica"

export default function CadastroPage() {
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<AccountType>("pessoa_fisica")
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    documento: "",
    telefone: "",
    empresa: "",
    oab: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }
    
    setIsLoading(true)
    
    // Envia email de confirmacao
    try {
      await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.nome
        })
      })
    } catch (error) {
      console.error('Erro ao enviar email de confirmacao:', error)
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push("/login")
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const passwordRequirements = [
    { check: formData.password.length >= 8, text: "Minimo 8 caracteres" },
    { check: /[A-Z]/.test(formData.password), text: "Uma letra maiuscula" },
    { check: /[0-9]/.test(formData.password), text: "Um numero" },
    { check: formData.password === formData.confirmPassword && formData.confirmPassword !== "", text: "Senhas coincidem" },
  ]

  const allRequirementsMet = passwordRequirements.every(req => req.check)

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#0a0a0a] overflow-hidden relative"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/justice-bg.png"
          alt="Justice Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50" />
      </div>

      {/* Animated Grain */}
      <div className="absolute inset-0 z-[1] opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
      </div>

      {/* Floating Orbs */}
      {mounted && (
        <>
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[100px] pointer-events-none"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ top: '10%', right: '20%' }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full bg-white/[0.03] blur-[80px] pointer-events-none"
            animate={{
              x: [0, -80, 0],
              y: [0, 80, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ bottom: '20%', left: '10%' }}
          />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-8 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-lg"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <Image
                src="/images/RULLESlogo.png"
                alt="Orvyn Logo"
                width={100}
                height={100}
                className="drop-shadow-2xl"
                priority
              />
              <h1 className="text-2xl font-black tracking-tight text-white mt-4">
                RullesIA
              </h1>
            </div>

            {/* Progress Steps - Modern Design */}
            <div className="flex items-center justify-between mb-12 px-4">
              {[
                { num: 1, label: "Tipo" },
                { num: 2, label: "Dados" },
                { num: 3, label: "Senha" },
              ].map((s, index) => (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all relative overflow-hidden",
                        step >= s.num 
                          ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]" 
                          : "bg-white/10 text-white/40 border border-white/10"
                      )}
                      animate={step >= s.num ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {step > s.num ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        s.num
                      )}
                      {step === s.num && (
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          animate={{ opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    <span className={cn(
                      "text-xs mt-2 transition-colors",
                      step >= s.num ? "text-white" : "text-white/30"
                    )}>
                      {s.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={cn(
                      "w-16 lg:w-24 h-0.5 mx-2 transition-colors rounded-full",
                      step > s.num ? "bg-amber-500" : "bg-white/10"
                    )} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10" />
              
              <div className="relative p-8 lg:p-10">
                {/* Step Header */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-bold text-white">
                      {step === 1 && "Tipo de Conta"}
                      {step === 2 && "Seus Dados"}
                      {step === 3 && "Seguranca"}
                    </h2>
                    <p className="text-white/40 mt-2">
                      {step === 1 && "Como voce vai utilizar o RullesIA?"}
                      {step === 2 && "Preencha suas informacoes profissionais"}
                      {step === 3 && "Crie uma senha segura para sua conta"}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {/* Step 1: Account Type */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-4"
                      >
                        <button
                          type="button"
                          onClick={() => setAccountType("pessoa_fisica")}
                          className={cn(
                            "w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-5 group",
                            accountType === "pessoa_fisica" 
                              ? "border-amber-500 bg-amber-500/10" 
                              : "border-white/10 hover:border-white/30 bg-white/5"
                          )}
                        >
                          <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                            accountType === "pessoa_fisica" 
                              ? "bg-amber-500 text-black" 
                              : "bg-white/10 text-white/60 group-hover:bg-white/20"
                          )}>
                            <User className="w-7 h-7" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold text-white text-lg">Pessoa Fisica</p>
                            <p className="text-sm text-white/40 mt-1">Advogado autonomo ou profissional liberal</p>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            accountType === "pessoa_fisica" 
                              ? "border-white bg-white" 
                              : "border-white/20"
                          )}>
                            {accountType === "pessoa_fisica" && <Check className="w-4 h-4 text-black" />}
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setAccountType("pessoa_juridica")}
                          className={cn(
                            "w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-5 group",
                            accountType === "pessoa_juridica" 
                              ? "border-amber-500 bg-amber-500/10" 
                              : "border-white/10 hover:border-white/30 bg-white/5"
                          )}
                        >
                          <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                            accountType === "pessoa_juridica" 
                              ? "bg-amber-500 text-black" 
                              : "bg-white/10 text-white/60 group-hover:bg-white/20"
                          )}>
                            <Building2 className="w-7 h-7" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold text-white text-lg">Pessoa Juridica</p>
                            <p className="text-sm text-white/40 mt-1">Escritorio de advocacia ou empresa</p>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            accountType === "pessoa_juridica" 
                              ? "border-white bg-white" 
                              : "border-white/20"
                          )}>
                            {accountType === "pessoa_juridica" && <Check className="w-4 h-4 text-black" />}
                          </div>
                        </button>
                      </motion.div>
                    )}

                    {/* Step 2: Personal Data */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                            <User className="w-4 h-4" /> Nome completo
                          </label>
                          <Input
                            placeholder="Seu nome completo"
                            value={formData.nome}
                            onChange={(e) => updateFormData("nome", e.target.value)}
                            onFocus={() => setFocusedInput('nome')}
                            onBlur={() => setFocusedInput(null)}
                            className={cn(
                              "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all",
                              focusedInput === 'nome' && "ring-2 ring-amber-500/20 border-amber-500/30"
                            )}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email
                          </label>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                            className={cn(
                              "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all",
                              focusedInput === 'email' && "ring-2 ring-amber-500/20 border-amber-500/30"
                            )}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                              <FileText className="w-4 h-4" /> {accountType === "pessoa_fisica" ? "CPF" : "CNPJ"}
                            </label>
                            <Input
                              placeholder={accountType === "pessoa_fisica" ? "000.000.000-00" : "00.000.000/0000-00"}
                              value={formData.documento}
                              onChange={(e) => updateFormData("documento", e.target.value)}
                              onFocus={() => setFocusedInput('documento')}
                              onBlur={() => setFocusedInput(null)}
                              className={cn(
                                "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all",
                                focusedInput === 'documento' && "ring-2 ring-amber-500/20 border-amber-500/30"
                              )}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                              <Phone className="w-4 h-4" /> Telefone
                            </label>
                            <Input
                              placeholder="(00) 00000-0000"
                              value={formData.telefone}
                              onChange={(e) => updateFormData("telefone", e.target.value)}
                              onFocus={() => setFocusedInput('telefone')}
                              onBlur={() => setFocusedInput(null)}
                              className={cn(
                                "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all",
                                focusedInput === 'telefone' && "ring-2 ring-white/20 border-white/30"
                              )}
                              required
                            />
                          </div>
                        </div>

                        {accountType === "pessoa_juridica" && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                              <Building2 className="w-4 h-4" /> Nome do Escritorio
                            </label>
                            <Input
                              placeholder="Nome do escritorio ou empresa"
                              value={formData.empresa}
                              onChange={(e) => updateFormData("empresa", e.target.value)}
                              onFocus={() => setFocusedInput('empresa')}
                              onBlur={() => setFocusedInput(null)}
                              className={cn(
                                "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all",
                                focusedInput === 'empresa' && "ring-2 ring-white/20 border-white/30"
                              )}
                              required
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/60">Numero OAB (opcional)</label>
                          <Input
                            placeholder="UF 000000"
                            value={formData.oab}
                            onChange={(e) => updateFormData("oab", e.target.value)}
                            onFocus={() => setFocusedInput('oab')}
                            onBlur={() => setFocusedInput(null)}
                            className={cn(
                              "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all",
                              focusedInput === 'oab' && "ring-2 ring-white/20 border-white/30"
                            )}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Password */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Senha
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimo 8 caracteres"
                              value={formData.password}
                              onChange={(e) => updateFormData("password", e.target.value)}
                              onFocus={() => setFocusedInput('password')}
                              onBlur={() => setFocusedInput(null)}
                              className={cn(
                                "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl pr-12 transition-all",
                                focusedInput === 'password' && "ring-2 ring-white/20 border-white/30"
                              )}
                              required
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Confirmar Senha
                          </label>
                          <Input
                            type="password"
                            placeholder="Repita a senha"
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                            onFocus={() => setFocusedInput('confirmPassword')}
                            onBlur={() => setFocusedInput(null)}
                            className={cn(
                              "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all",
                              focusedInput === 'confirmPassword' && "ring-2 ring-white/20 border-white/30"
                            )}
                            required
                          />
                        </div>

                        {/* Password Requirements */}
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                          <p className="text-sm font-semibold text-white">Requisitos da senha:</p>
                          <div className="grid grid-cols-2 gap-3">
                            {passwordRequirements.map((req, i) => (
                              <motion.div 
                                key={i} 
                                className="flex items-center gap-2"
                                animate={req.check ? { scale: [1, 1.05, 1] } : {}}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                  req.check ? "bg-amber-500" : "bg-white/10"
                                )}>
                                  {req.check && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className={cn(
                                  "text-sm transition-colors",
                                  req.check ? "text-white" : "text-white/40"
                                )}>
                                  {req.text}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="w-5 h-5 mt-0.5 rounded border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                            <input type="checkbox" className="sr-only peer" required />
                            <div className="w-3 h-3 rounded-sm bg-white scale-0 peer-checked:scale-100 transition-transform" />
                          </div>
                          <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                            Li e aceito os{" "}
                            <Link href="#" className="text-white hover:underline underline-offset-4">Termos de Uso</Link>
                            {" "}e a{" "}
                            <Link href="#" className="text-white hover:underline underline-offset-4">Politica de Privacidade</Link>
                          </span>
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="flex-1 h-14 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading || (step === 3 && !allRequirementsMet)}
                      className={cn(
                        "flex-1 h-14 text-base font-semibold rounded-xl transition-all",
                        step === 3 && allRequirementsMet
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
                          : "bg-white text-black hover:bg-white/90"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            <span>Criando conta...</span>
                          </motion.div>
                        ) : (
                          <motion.span
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            {step < 3 ? "Continuar" : "Criar minha conta"}
                            <ArrowRight className="w-4 h-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                </form>

                {/* Login Link */}
                <p className="text-center mt-8 text-white/40">
                  Ja tem uma conta?{" "}
                  <Link href="/login" className="text-white font-semibold hover:underline underline-offset-4">
                    Fazer login
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Branding */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden lg:flex lg:w-[45%] flex-col justify-center items-center p-16 relative"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 60, delay: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-20 bg-white/5 blur-[100px] rounded-full" />
            <div className="absolute -inset-10 bg-white/10 blur-[50px] rounded-full animate-pulse" />
            
            <Image
              src="/images/RULLESlogo.png"
              alt="Orvyn Logo"
              width={350}
              height={350}
              className="relative z-10 drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]"
              priority
            />
          </motion.div>

          {/* Brand Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <h1 className="text-6xl font-black tracking-[-0.05em] text-white">
              RullesIA
            </h1>
            <p className="text-xl text-white/50 mt-4 font-light tracking-[0.2em] uppercase">
              Engenharia Juridica Inteligente
            </p>
            
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/30" />
              <span className="text-sm text-white/40 tracking-widest">CRIADO POR</span>
              <span className="text-sm font-bold text-white tracking-widest">ORVYN</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/30" />
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16 space-y-4"
          >
            {[
              "Analise inteligente de contratos",
              "Gestao completa de processos",
              "CRM juridico integrado",
              "Conformidade LGPD garantida",
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/60">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-12"
          >
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-white/40">Powered by Orvyn</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Custom Cursor */}
      {mounted && (
        <motion.div
          className="fixed w-4 h-4 rounded-full border border-white/30 pointer-events-none z-50 hidden lg:block mix-blend-difference"
          animate={{
            x: mousePosition.x - 8,
            y: mousePosition.y - 8,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        />
      )}
    </div>
  )
}

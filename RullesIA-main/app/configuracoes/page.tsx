"use client"

import { useState } from "react"
import { useSettingsStore } from "@/lib/settings-store"
import { useNotificationStore } from "@/lib/notification-store"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  User, 
  Bell, 
  Settings, 
  Shield, 
  Check, 
  Save, 
  Palette,
  Clock
} from "lucide-react"
import { toast } from "sonner"

export default function ConfiguracoesPage() {
  const { profile, notifications, ai, updateProfile, updateNotifications, updateAI } = useSettingsStore()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    toast.success("Configurações salvas com sucesso!")
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex h-screen bg-[#060606]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">Configurações</h1>
                <p className="text-white/40 mt-1">
                  Gerencie as preferências do sistema e perfil profissional
                </p>
              </div>
              <Button 
                onClick={handleSave}
                className="bg-white text-black hover:bg-white/90 font-bold"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Salvo
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="perfil" className="space-y-4">
              <TabsList className="bg-white/5 border border-white/10 p-1">
                <TabsTrigger value="perfil" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  <User className="w-4 h-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="notificacoes" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  <Bell className="w-4 h-4" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="ia" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  <Settings className="w-4 h-4" />
                  IA
                </TabsTrigger>
                <TabsTrigger value="seguranca" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  <Shield className="w-4 h-4" />
                  Segurança
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="perfil">
                <Card className="bg-white/[0.02] border-white/[0.05]">
                  <CardHeader>
                    <CardTitle className="text-white font-black">Informações do Perfil</CardTitle>
                    <CardDescription className="text-white/40">
                      Atualize suas informações pessoais e de escritório para documentos e análises
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/20">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-white/20" />
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 bg-white text-black p-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <Palette className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{profile.name}</h4>
                        <p className="text-white/40 text-sm">{profile.officeName}</p>
                        <Button variant="outline" size="sm" className="mt-2 text-[10px] h-7 border-white/10 hover:bg-white/5">Alterar Foto</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-white/60">Nome Completo</Label>
                        <Input 
                          id="nome" 
                          value={profile.name}
                          onChange={(e) => updateProfile({ name: e.target.value })}
                          className="bg-white/5 border-white/10 text-white focus:border-white/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="oab" className="text-white/60">Número OAB</Label>
                        <Input 
                          id="oab" 
                          value={profile.oab}
                          onChange={(e) => updateProfile({ oab: e.target.value })}
                          className="bg-white/5 border-white/10 text-white focus:border-white/20" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/60">E-mail Profissional</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={profile.email}
                          onChange={(e) => updateProfile({ email: e.target.value })}
                          className="bg-white/5 border-white/10 text-white focus:border-white/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-white/60">Telefone para Contato</Label>
                        <Input 
                          id="telefone" 
                          value={profile.phone}
                          onChange={(e) => updateProfile({ phone: e.target.value })}
                          className="bg-white/5 border-white/10 text-white focus:border-white/20" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="escritorio" className="text-white/60">Nome do Escritório</Label>
                      <Input 
                        id="escritorio" 
                        value={profile.officeName}
                        onChange={(e) => updateProfile({ officeName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus:border-white/20" 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notificacoes">
                <Card className="bg-white/[0.02] border-white/[0.05]">
                  <CardHeader>
                    <CardTitle className="text-white font-black">Preferências de Notificação</CardTitle>
                    <CardDescription className="text-white/40">
                      Configure como e quando deseja receber alertas críticos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Alertas de Prazo</p>
                        <p className="text-sm text-white/40">
                          Receber notificações quando prazos processuais estiverem próximos
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.prazos}
                        onCheckedChange={(v) => updateNotifications({ prazos: v })}
                      />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Alertas de Risco Alto</p>
                        <p className="text-sm text-white/40">
                          Notificar imediatamente quando cláusulas de perigo forem detectadas
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.riscosAltos}
                        onCheckedChange={(v) => updateNotifications({ riscosAltos: v })}
                      />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Resumo Diário</p>
                        <p className="text-sm text-white/40">
                          Receber um compilado diário das principais movimentações
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.resumoDiario}
                        onCheckedChange={(v) => updateNotifications({ resumoDiario: v })}
                      />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">E-mail de Notificações</p>
                        <p className="text-sm text-white/40">
                          Receber cópias dos alertas importantes por e-mail
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.emailNotifications}
                        onCheckedChange={(v) => updateNotifications({ emailNotifications: v })}
                      />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="space-y-3">
                      <Label className="text-white/60 font-bold">Antecedência de Alerta de Prazo</Label>
                      <Select 
                        value={notifications.antecedenciaPrazos}
                        onValueChange={(v) => updateNotifications({ antecedenciaPrazos: v })}
                      >
                        <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0d0d] border-white/10 text-white">
                          <SelectItem value="1">1 dia antes</SelectItem>
                          <SelectItem value="3">3 dias antes</SelectItem>
                          <SelectItem value="7">7 dias antes</SelectItem>
                          <SelectItem value="14">14 dias antes</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-white/20 italic">Recomendado: 3 dias para garantir tempo de resposta.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Tab */}
              <TabsContent value="ia">
                <Card className="bg-white/[0.02] border-white/[0.05]">
                  <CardHeader>
                    <CardTitle className="text-white font-black">Configurações da IA (Orvyn Engine)</CardTitle>
                    <CardDescription className="text-white/40">
                      Ajuste a profundidade e os algoritmos de análise automática
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-white/60 font-bold">Modelo de Inteligência</Label>
                      <Select 
                        value={ai.model}
                        onValueChange={(v) => updateAI({ model: v as any })}
                      >
                        <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0d0d] border-white/10 text-white">
                          <SelectItem value="gpt-4o">GPT-4o (Alta Precisão)</SelectItem>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini (Velocidade)</SelectItem>
                          <SelectItem value="o3-mini">O3 Mini (Raciocínio Lógico)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-white/20">
                        O modelo GPT-4o é o padrão para análises complexas de contratos e Vade Mecum.
                      </p>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Análise Automática Instantânea</p>
                        <p className="text-sm text-white/40">
                          Processar documentos imediatamente após o upload concluir
                        </p>
                      </div>
                      <Switch 
                        checked={ai.autoAnalyze}
                        onCheckedChange={(v) => updateAI({ autoAnalyze: v })}
                      />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Varredura de Cláusulas Ocultas</p>
                        <p className="text-sm text-white/40">
                          Algoritmo avançado para detectar 'letras miúdas' e termos desvantajosos
                        </p>
                      </div>
                      <Switch 
                        checked={ai.detectHiddenClauses}
                        onCheckedChange={(v) => updateAI({ detectHiddenClauses: v })}
                      />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Benchmarking de Mercado</p>
                        <p className="text-sm text-white/40">
                          Comparar honorários e cláusulas com a média praticada no setor
                        </p>
                      </div>
                      <Switch 
                        checked={ai.marketComparison}
                        onCheckedChange={(v) => updateAI({ marketComparison: v })}
                      />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="space-y-3">
                      <Label className="text-white/60 font-bold">Profundidade da Resposta</Label>
                      <Select 
                        value={ai.detailLevel}
                        onValueChange={(v) => updateAI({ detailLevel: v as any })}
                      >
                        <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0d0d] border-white/10 text-white">
                          <SelectItem value="resumido">Resumido (Focado em metadados)</SelectItem>
                          <SelectItem value="padrao">Padrão (Melhor equilíbrio)</SelectItem>
                          <SelectItem value="detalhado">Extenso (Parecer jurídico completo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="seguranca">
                <Card className="bg-white/[0.02] border-white/[0.05]">
                  <CardHeader>
                    <CardTitle className="text-white font-black">Segurança Digital</CardTitle>
                    <CardDescription className="text-white/40">
                      Proteção de conta e parâmetros de criptografia de dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="senha-atual" className="text-white/60">Senha Atual</Label>
                      <Input id="senha-atual" type="password" className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nova-senha" className="text-white/60">Nova Senha</Label>
                        <Input id="nova-senha" type="password" className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmar-senha" className="text-white/60">Confirmar Nova Senha</Label>
                        <Input id="confirmar-senha" type="password" className="bg-white/5 border-white/10 text-white" />
                      </div>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Autenticação de Dois Fatores (2FA)</p>
                        <p className="text-sm text-white/40">
                          Exigir código via app de autenticação no login
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Criptografia em Repouso</p>
                        <p className="text-sm text-white/40">
                          Garantir que documentos salvos usem AES-256
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="space-y-3">
                      <Label className="text-white/60 font-bold">Sessão Ativa</Label>
                      <Select defaultValue="8h">
                        <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0d0d] border-white/10 text-white">
                          <SelectItem value="1h">1 hora</SelectItem>
                          <SelectItem value="8h">8 horas</SelectItem>
                          <SelectItem value="24h">24 horas</SelectItem>
                          <SelectItem value="30d">30 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

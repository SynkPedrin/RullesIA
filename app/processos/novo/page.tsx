"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Scale, 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  Calendar,
  DollarSign
} from "lucide-react"
import { mockClients } from "@/lib/crm-store"
import type { ProcessType, ProcessSide, ProcessParty } from "@/lib/types"
import Link from "next/link"

const typeLabels: Record<ProcessType, string> = {
  civel: "Cível",
  trabalhista: "Trabalhista",
  tributario: "Tributário",
  criminal: "Criminal",
  administrativo: "Administrativo"
}

const sideLabels: Record<ProcessSide, string> = {
  autor: "Autor",
  reu: "Réu",
  terceiro: "Terceiro Interessado"
}

export default function NovoProcessoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    numeroProcesso: "",
    clienteId: "",
    tipo: "civel" as ProcessType,
    vara: "",
    comarca: "",
    tribunal: "",
    lado: "autor" as ProcessSide,
    valorCausa: "",
    dataDistribuicao: "",
    honorariosContratados: "",
    honorariosExito: "",
    observacoes: ""
  })
  
  const [partes, setPartes] = useState<ProcessParty[]>([])
  const [novaParte, setNovaParte] = useState({
    nome: "",
    documento: "",
    tipo: "reu" as ProcessParty['tipo']
  })

  const addParte = () => {
    if (novaParte.nome && novaParte.documento) {
      setPartes([...partes, { ...novaParte }])
      setNovaParte({ nome: "", documento: "", tipo: "reu" })
    }
  }

  const removeParte = (index: number) => {
    setPartes(partes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real app, would save to database
    router.push('/processos')
  }

  const formatCNJ = (value: string) => {
    // Format as CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 7) return numbers
    if (numbers.length <= 9) return `${numbers.slice(0, 7)}-${numbers.slice(7)}`
    if (numbers.length <= 13) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9)}`
    if (numbers.length <= 14) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13)}`
    if (numbers.length <= 16) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14)}`
    return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14, 16)}.${numbers.slice(16, 20)}`
  }

  return (
    <div className="flex h-screen bg-[#060606]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/processos">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Novo Processo</h1>
              <p className="text-white/40">Cadastre um novo processo judicial</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Básicos */}
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Dados do Processo
                </CardTitle>
                <CardDescription className="text-white/40">
                  Informações principais do processo judicial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Número do Processo (CNJ)</Label>
                    <Input
                      value={formData.numeroProcesso}
                      onChange={(e) => setFormData({...formData, numeroProcesso: formatCNJ(e.target.value)})}
                      placeholder="0000000-00.0000.0.00.0000"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      maxLength={25}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Cliente</Label>
                    <Select value={formData.clienteId} onValueChange={(v) => setFormData({...formData, clienteId: v})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {client.nome}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v as ProcessType})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Lado</Label>
                    <Select value={formData.lado} onValueChange={(v) => setFormData({...formData, lado: v as ProcessSide})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(sideLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Data de Distribuição</Label>
                    <Input
                      type="date"
                      value={formData.dataDistribuicao}
                      onChange={(e) => setFormData({...formData, dataDistribuicao: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Vara</Label>
                    <Input
                      value={formData.vara}
                      onChange={(e) => setFormData({...formData, vara: e.target.value})}
                      placeholder="Ex: 1ª Vara Cível"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Comarca</Label>
                    <Input
                      value={formData.comarca}
                      onChange={(e) => setFormData({...formData, comarca: e.target.value})}
                      placeholder="Ex: São Paulo"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Tribunal</Label>
                    <Input
                      value={formData.tribunal}
                      onChange={(e) => setFormData({...formData, tribunal: e.target.value})}
                      placeholder="Ex: TJSP"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partes */}
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Partes do Processo
                </CardTitle>
                <CardDescription className="text-white/40">
                  Adicione as partes envolvidas (réu, testemunhas, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de partes */}
                {partes.length > 0 && (
                  <div className="space-y-2">
                    {partes.map((parte, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium">{parte.nome}</p>
                          <p className="text-sm text-white/40">{parte.documento} - {parte.tipo === 'reu' ? 'Réu' : parte.tipo === 'autor' ? 'Autor' : parte.tipo}</p>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeParte(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Adicionar nova parte */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-white/5 rounded-lg">
                  <Input
                    value={novaParte.nome}
                    onChange={(e) => setNovaParte({...novaParte, nome: e.target.value})}
                    placeholder="Nome completo"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                  <Input
                    value={novaParte.documento}
                    onChange={(e) => setNovaParte({...novaParte, documento: e.target.value})}
                    placeholder="CPF/CNPJ"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                  <Select value={novaParte.tipo} onValueChange={(v) => setNovaParte({...novaParte, tipo: v as ProcessParty['tipo']})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autor">Autor</SelectItem>
                      <SelectItem value="reu">Réu</SelectItem>
                      <SelectItem value="testemunha">Testemunha</SelectItem>
                      <SelectItem value="perito">Perito</SelectItem>
                      <SelectItem value="advogado_contrario">Advogado Contrário</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button"
                    onClick={addParte}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valores e Honorários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Valor da Causa</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                      <Input
                        type="number"
                        value={formData.valorCausa}
                        onChange={(e) => setFormData({...formData, valorCausa: e.target.value})}
                        placeholder="0,00"
                        className="bg-white/5 border-white/10 text-white pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Honorários Contratados</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                      <Input
                        type="number"
                        value={formData.honorariosContratados}
                        onChange={(e) => setFormData({...formData, honorariosContratados: e.target.value})}
                        placeholder="0,00"
                        className="bg-white/5 border-white/10 text-white pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Honorários de Êxito (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.honorariosExito}
                        onChange={(e) => setFormData({...formData, honorariosExito: e.target.value})}
                        placeholder="0"
                        max={100}
                        className="bg-white/5 border-white/10 text-white pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardHeader>
                <CardTitle className="text-white">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Anotações sobre o processo..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[120px]"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link href="/processos">
                <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/5">
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-white text-black hover:bg-white/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cadastrar Processo
                  </>
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

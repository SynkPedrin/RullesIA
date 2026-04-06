"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft,
  Building2,
  User,
  Save,
  Plus,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const areasJuridicas = [
  { id: 'trabalhista', label: 'Trabalhista' },
  { id: 'civil', label: 'Civil' },
  { id: 'tributario', label: 'Tributário' },
  { id: 'empresarial', label: 'Empresarial' },
  { id: 'familia', label: 'Família' },
  { id: 'criminal', label: 'Criminal' },
  { id: 'consumidor', label: 'Consumidor' },
  { id: 'ambiental', label: 'Ambiental' },
]

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

interface Contact {
  tipo: string
  valor: string
  principal: boolean
}

export default function NovoClientePage() {
  const router = useRouter()
  const [tipo, setTipo] = useState<string>("pessoa_fisica")
  const [contatos, setContatos] = useState<Contact[]>([
    { tipo: 'email', valor: '', principal: true }
  ])
  const [areas, setAreas] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addContact = () => {
    setContatos([...contatos, { tipo: 'telefone', valor: '', principal: false }])
  }

  const removeContact = (index: number) => {
    setContatos(contatos.filter((_, i) => i !== index))
  }

  const updateContact = (index: number, field: keyof Contact, value: string | boolean) => {
    const updated = [...contatos]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'principal' && value === true) {
      updated.forEach((c, i) => {
        if (i !== index) c.principal = false
      })
    }
    setContatos(updated)
  }

  const toggleArea = (areaId: string) => {
    setAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(a => a !== areaId)
        : [...prev, areaId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    router.push('/clientes')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/clientes">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Novo Cliente</h1>
                <p className="text-muted-foreground">Cadastre um novo cliente ou lead</p>
              </div>
            </div>

            {/* Tipo de Cliente */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Tipo de Cliente</CardTitle>
                <CardDescription>Selecione se é pessoa física ou jurídica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTipo('pessoa_fisica')}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      tipo === 'pessoa_fisica' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      tipo === 'pessoa_fisica' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <User className={`h-5 w-5 ${tipo === 'pessoa_fisica' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${tipo === 'pessoa_fisica' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Pessoa Física
                      </p>
                      <p className="text-xs text-muted-foreground">CPF</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('pessoa_juridica')}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      tipo === 'pessoa_juridica' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      tipo === 'pessoa_juridica' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Building2 className={`h-5 w-5 ${tipo === 'pessoa_juridica' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${tipo === 'pessoa_juridica' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Pessoa Jurídica
                      </p>
                      <p className="text-xs text-muted-foreground">CNPJ</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Dados Básicos */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Dados Básicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">{tipo === 'pessoa_juridica' ? 'Nome Fantasia' : 'Nome Completo'} *</Label>
                    <Input id="nome" placeholder={tipo === 'pessoa_juridica' ? 'Nome da empresa' : 'Nome do cliente'} required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documento">{tipo === 'pessoa_juridica' ? 'CNPJ' : 'CPF'} *</Label>
                    <Input 
                      id="documento" 
                      placeholder={tipo === 'pessoa_juridica' ? '00.000.000/0001-00' : '000.000.000-00'} 
                      required 
                      className="bg-background"
                    />
                  </div>
                </div>
                {tipo === 'pessoa_juridica' && (
                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input id="razaoSocial" placeholder="Razão social da empresa" className="bg-background" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select defaultValue="lead">
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospecto">Prospecto</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Advogado Responsável *</Label>
                    <Select defaultValue="carlos">
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carlos">Dr. Carlos Silva</SelectItem>
                        <SelectItem value="ana">Dra. Ana Beatriz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contatos */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Contatos</CardTitle>
                    <CardDescription>Adicione os meios de contato do cliente</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addContact}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contatos.map((contato, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Select 
                      value={contato.tipo} 
                      onValueChange={(value) => updateContact(index, 'tipo', value)}
                    >
                      <SelectTrigger className="w-32 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      value={contato.valor}
                      onChange={(e) => updateContact(index, 'valor', e.target.value)}
                      placeholder={
                        contato.tipo === 'email' ? 'email@exemplo.com' :
                        contato.tipo === 'linkedin' ? 'linkedin.com/in/usuario' :
                        '(00) 00000-0000'
                      }
                      className="flex-1 bg-background"
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={contato.principal}
                        onCheckedChange={(checked) => updateContact(index, 'principal', checked as boolean)}
                      />
                      <Label className="text-xs text-muted-foreground">Principal</Label>
                    </div>
                    {contatos.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeContact(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input id="logradouro" placeholder="Rua, Avenida, etc." className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" placeholder="Nº" className="bg-background" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" placeholder="Sala, Andar, Bloco" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" placeholder="Bairro" className="bg-background" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" placeholder="Cidade" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map(uf => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" className="bg-background" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Áreas Jurídicas */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Áreas Jurídicas de Interesse</CardTitle>
                <CardDescription>Selecione as áreas relacionadas ao cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {areasJuridicas.map(area => (
                    <div 
                      key={area.id}
                      onClick={() => toggleArea(area.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        areas.includes(area.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <Checkbox checked={areas.includes(area.id)} />
                      <span className={`text-sm ${areas.includes(area.id) ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {area.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Informações adicionais sobre o cliente..."
                  className="bg-background min-h-24"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link href="/clientes">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
              </Button>
            </div>
          </form>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

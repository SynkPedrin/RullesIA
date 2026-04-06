"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  FileSignature, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Stamp,
  ScrollText,
  Gavel,
  FileCheck,
  AlertCircle,
  Sparkles,
  User,
  Save,
  Loader2
} from "lucide-react"
import { mockTemplates as initialTemplates, mockClients } from "@/lib/crm-store"
import type { DocumentType, JuridicalArea, DocumentTemplate } from "@/lib/types"

const typeLabels: Record<DocumentType, string> = {
  procuracao: "Procuração",
  contrato: "Contrato",
  peticao_inicial: "Petição Inicial",
  contestacao: "Contestação",
  recurso: "Recurso",
  acordo: "Acordo",
  parecer: "Parecer",
  notificacao: "Notificação"
}

const typeIcons: Record<DocumentType, React.ElementType> = {
  procuracao: Stamp,
  contrato: FileSignature,
  peticao_inicial: ScrollText,
  contestacao: Gavel,
  recurso: FileCheck,
  acordo: FileText,
  parecer: FileText,
  notificacao: AlertCircle
}

const areaLabels: Record<JuridicalArea, string> = {
  trabalhista: "Trabalhista",
  civil: "Civil",
  tributario: "Tributário",
  empresarial: "Empresarial",
  familia: "Família",
  criminal: "Criminal",
  consumidor: "Consumidor",
  ambiental: "Ambiental"
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(initialTemplates)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("todos")
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "contrato" as DocumentType,
    areaJuridica: "civil" as JuridicalArea,
    descricao: "",
    conteudo: "",
    variaveis: ""
  })

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "todos" || template.tipo === typeFilter
    return matchesSearch && matchesType
  })

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.tipo]) {
      acc[template.tipo] = []
    }
    acc[template.tipo].push(template)
    return acc
  }, {} as Record<string, DocumentTemplate[]>)

  // Extract variables from content
  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g
    const matches = content.match(regex) || []
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))]
  }

  // Handle create template
  const handleCreate = () => {
    const newTemplate: DocumentTemplate = {
      id: crypto.randomUUID(),
      nome: formData.nome,
      tipo: formData.tipo,
      areaJuridica: formData.areaJuridica,
      descricao: formData.descricao,
      conteudo: formData.conteudo,
      variaveis: extractVariables(formData.conteudo),
      dataCriacao: new Date().toISOString().split('T')[0],
      dataAtualizacao: new Date().toISOString().split('T')[0],
      autor: "RullesIA"
    }
    setTemplates([...templates, newTemplate])
    setShowCreate(false)
    resetForm()
  }

  // Handle edit template
  const handleEdit = () => {
    if (!selectedTemplate) return
    const updated = templates.map(t => 
      t.id === selectedTemplate.id ? {
        ...t,
        nome: formData.nome,
        tipo: formData.tipo,
        areaJuridica: formData.areaJuridica,
        descricao: formData.descricao,
        conteudo: formData.conteudo,
        variaveis: extractVariables(formData.conteudo),
        dataAtualizacao: new Date().toISOString().split('T')[0]
      } : t
    )
    setTemplates(updated)
    setShowEdit(false)
    resetForm()
  }

  // Handle delete template
  const handleDelete = () => {
    if (!selectedTemplate) return
    setTemplates(templates.filter(t => t.id !== selectedTemplate.id))
    setShowDelete(false)
    setSelectedTemplate(null)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "contrato",
      areaJuridica: "civil",
      descricao: "",
      conteudo: "",
      variaveis: ""
    })
  }

  // Open edit modal
  const openEdit = (template: DocumentTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      nome: template.nome,
      tipo: template.tipo,
      areaJuridica: template.areaJuridica,
      descricao: template.descricao,
      conteudo: template.conteudo,
      variaveis: template.variaveis.join(", ")
    })
    setShowEdit(true)
  }

  // Generate document with variables replaced
  const generateDocument = async () => {
    if (!selectedTemplate) return
    setIsGenerating(true)
    
    let content = selectedTemplate.conteudo
    
    // Replace variables with values
    Object.entries(variableValues).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `[${key}]`)
    })
    
    // If client is selected, auto-fill client data
    if (selectedClient) {
      const client = mockClients.find(c => c.id === selectedClient)
      if (client) {
        content = content.replace(/\{\{nome_cliente\}\}/g, client.nome)
        content = content.replace(/\{\{documento_cliente\}\}/g, client.documento)
        content = content.replace(/\{\{endereco_cliente\}\}/g, 
          `${client.endereco.logradouro}, ${client.endereco.numero}, ${client.endereco.bairro}, ${client.endereco.cidade}-${client.endereco.estado}`)
      }
    }
    
    setGeneratedContent(content)
    setIsGenerating(false)
  }

  // Download as PDF
  const downloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedContent.replace(/\n/g, '</p><p>'),
          filename: `${selectedTemplate?.nome || 'documento'}.pdf`,
          type: selectedTemplate ? typeLabels[selectedTemplate.tipo] : 'DOCUMENTO'
        })
      })
      
      const data = await response.json()
      
      if (data.html) {
        // Open print dialog with the HTML content
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(data.html)
          printWindow.document.close()
          printWindow.print()
        }
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
    }
  }

  // Auto-fill when client changes
  useEffect(() => {
    if (selectedClient && selectedTemplate) {
      const client = mockClients.find(c => c.id === selectedClient)
      if (client) {
        setVariableValues(prev => ({
          ...prev,
          nome_cliente: client.nome,
          documento_cliente: client.documento,
          endereco_cliente: `${client.endereco.logradouro}, ${client.endereco.numero}`,
          cidade_cliente: client.endereco.cidade,
          estado_cliente: client.endereco.estado
        }))
      }
    }
  }, [selectedClient, selectedTemplate])

  return (
    <div className="flex h-screen bg-[#060606]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Templates de Documentos</h1>
              <p className="text-white/40">Crie, edite e gere documentos jurídicos automaticamente</p>
            </div>
            <Button 
              className="gap-2 bg-white text-black hover:bg-white/90"
              onClick={() => {
                resetForm()
                setShowCreate(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">Total de Templates</p>
                    <p className="text-2xl font-black text-white">{templates.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <FileSignature className="h-5 w-5 text-white/60" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">Procurações</p>
                    <p className="text-2xl font-black text-white">{templates.filter(t => t.tipo === 'procuracao').length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Stamp className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">Contratos</p>
                    <p className="text-2xl font-black text-white">{templates.filter(t => t.tipo === 'contrato').length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <FileSignature className="h-5 w-5 text-sky-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">Petições</p>
                    <p className="text-2xl font-black text-white">{templates.filter(t => t.tipo === 'peticao_inicial').length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <ScrollText className="h-5 w-5 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/[0.02] border-white/[0.05]">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([tipo, templateList]) => {
              const IconComponent = typeIcons[tipo as DocumentType] || FileText
              return (
                <div key={tipo} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-white/60" />
                    <h2 className="text-lg font-bold text-white">{typeLabels[tipo as DocumentType]}</h2>
                    <Badge variant="secondary" className="bg-white/10 text-white/60">{templateList.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templateList.map(template => (
                      <Card key={template.id} className="bg-white/[0.02] border-white/[0.05] hover:border-white/20 transition-colors group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <IconComponent className="h-5 w-5 text-white/60" />
                              </div>
                              <div>
                                <CardTitle className="text-base text-white">{template.nome}</CardTitle>
                                <Badge variant="secondary" className="bg-white/10 text-white/50 text-xs mt-1">
                                  {areaLabels[template.areaJuridica]}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-white/40 line-clamp-2">
                            {template.descricao}
                          </p>
                          <div className="flex items-center justify-between text-xs text-white/30">
                            <span>{template.variaveis.length} variáveis</span>
                            <span>Atualizado: {formatDate(template.dataAtualizacao)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 gap-1 bg-white text-black hover:bg-white/90"
                              onClick={() => {
                                setSelectedTemplate(template)
                                setVariableValues({})
                                setGeneratedContent("")
                                setShowGenerate(true)
                              }}
                            >
                              <Sparkles className="h-3 w-3" />
                              Gerar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-white/10 text-white hover:bg-white/5"
                              onClick={() => {
                                setSelectedTemplate(template)
                                setShowPreview(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-white/10 text-white hover:bg-white/5"
                              onClick={() => openEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => {
                                setSelectedTemplate(template)
                                setShowDelete(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="flex flex-col items-center justify-center py-12 text-white/40">
                <FileSignature className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum template encontrado</p>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Create Template Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-3xl bg-[#0a0a0a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Novo Template</DialogTitle>
              <DialogDescription className="text-white/50">
                Crie um novo modelo de documento jurídico
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Nome do Template</Label>
                  <Input 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Ex: Procuração Ad Judicia"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v as DocumentType})}>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Área Jurídica</Label>
                  <Select value={formData.areaJuridica} onValueChange={(v) => setFormData({...formData, areaJuridica: v as JuridicalArea})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(areaLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Descrição</Label>
                  <Input 
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Breve descrição do template"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Conteúdo do Template</Label>
                <p className="text-xs text-white/30">Use {"{{variavel}}"} para criar campos dinâmicos. Ex: {"{{nome_cliente}}"}, {"{{cpf}}"}</p>
                <Textarea 
                  value={formData.conteudo}
                  onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                  className="bg-white/5 border-white/10 text-white min-h-[300px] font-mono text-sm"
                  placeholder="Digite o conteúdo do template aqui..."
                />
              </div>
              {formData.conteudo && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/50 mb-2">Variáveis detectadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {extractVariables(formData.conteudo).map(v => (
                      <Badge key={v} variant="secondary" className="bg-white/10 text-white/70 text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)} className="border-white/10 text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="bg-white text-black hover:bg-white/90">
                <Save className="h-4 w-4 mr-2" />
                Salvar Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Template Dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-3xl bg-[#0a0a0a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Editar Template</DialogTitle>
              <DialogDescription className="text-white/50">
                Modifique o modelo de documento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Nome do Template</Label>
                  <Input 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v as DocumentType})}>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Área Jurídica</Label>
                  <Select value={formData.areaJuridica} onValueChange={(v) => setFormData({...formData, areaJuridica: v as JuridicalArea})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(areaLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Descrição</Label>
                  <Input 
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Conteúdo do Template</Label>
                <Textarea 
                  value={formData.conteudo}
                  onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                  className="bg-white/5 border-white/10 text-white min-h-[300px] font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdit(false)} className="border-white/10 text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button onClick={handleEdit} className="bg-white text-black hover:bg-white/90">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.nome}</DialogTitle>
              <DialogDescription className="text-white/50">{selectedTemplate?.descricao}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/10 text-white/70">
                  {selectedTemplate && typeLabels[selectedTemplate.tipo]}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white/60">
                  {selectedTemplate && areaLabels[selectedTemplate.areaJuridica]}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-white/70">Variáveis ({selectedTemplate?.variaveis.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate?.variaveis.map(v => (
                    <Badge key={v} variant="secondary" className="bg-white/10 text-white/60 text-xs">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-white/70">Conteúdo do Template</h4>
                <div className="bg-white/5 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto text-white/80">
                  {selectedTemplate?.conteudo}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)} className="border-white/10 text-white hover:bg-white/5">
                Fechar
              </Button>
              <Button onClick={() => {
                setShowPreview(false)
                setVariableValues({})
                setGeneratedContent("")
                setShowGenerate(true)
              }} className="bg-white text-black hover:bg-white/90">
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Documento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generate Dialog */}
        <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Gerar Documento</DialogTitle>
              <DialogDescription className="text-white/50">
                Preencha as informações para gerar: {selectedTemplate?.nome}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Selecionar Cliente (opcional)</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Escolha um cliente para preencher automaticamente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
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

                <div className="bg-white/5 rounded-lg p-4 space-y-3 max-h-[400px] overflow-y-auto">
                  <h4 className="text-sm font-medium text-white/70">Preencher Variáveis</h4>
                  {selectedTemplate?.variaveis.map(v => (
                    <div key={v} className="space-y-1">
                      <Label className="text-xs text-white/50">{v.replace(/_/g, ' ')}</Label>
                      <Input 
                        value={variableValues[v] || ''}
                        onChange={(e) => setVariableValues({...variableValues, [v]: e.target.value})}
                        placeholder={`{{${v}}}`}
                        className="bg-white/5 border-white/10 text-white h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={generateDocument} 
                  className="w-full bg-white text-black hover:bg-white/90"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Documento
                    </>
                  )}
                </Button>
              </div>

              {/* Right: Preview */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white/70">Pré-visualização</h4>
                <div className="bg-white rounded-lg p-6 text-black font-serif text-sm whitespace-pre-wrap min-h-[400px] max-h-[500px] overflow-y-auto">
                  {generatedContent || (
                    <p className="text-gray-400 italic">Clique em "Gerar Documento" para visualizar</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerate(false)} className="border-white/10 text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button 
                onClick={downloadPDF} 
                disabled={!generatedContent}
                className="gap-2 bg-white text-black hover:bg-white/90"
              >
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent className="bg-[#0a0a0a] border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Template</AlertDialogTitle>
              <AlertDialogDescription className="text-white/50">
                Tem certeza que deseja excluir o template "{selectedTemplate?.nome}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/10 text-white hover:bg-white/5">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

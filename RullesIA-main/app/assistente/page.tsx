"use client"

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { Send, Bot, User, Loader2, Scale, Paperclip, FileText, X, Upload, BookOpen, Trash2, Image as ImageIcon, FileSearch, Sparkles } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCRMStore } from "@/lib/crm-store"
import { useContractStore } from "@/lib/contracts-store"
import { useSettingsStore } from "@/lib/settings-store"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { executeAutoOnboarding } from "@/lib/onboarding-utils"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  fileName?: string
  fileType?: string
}

const suggestedQuestions = [
  { text: "Resuma as principais mudanças da Reforma Trabalhista na CLT", icon: BookOpen },
  { text: "Quais os prazos processuais para apelação no CPC?", icon: Scale },
  { text: "Quais cláusulas são consideradas abusivas pelo CDC?", icon: FileSearch },
  { text: "Como calcular verbas rescisórias de demissão sem justa causa?", icon: Sparkles },
  { text: "Quais são os requisitos da tutela de urgência no Art. 300 CPC?", icon: Scale },
  { text: "Explique a responsabilidade civil objetiva do fornecedor no CDC", icon: BookOpen },
]

const vadeMecumTopics = [
  { name: "Constituição Federal", articles: "Arts. 1-232" },
  { name: "Código Civil", articles: "Art. 104, 186, 421, 422, 927" },
  { name: "CPC", articles: "Art. 218-224, 300, 994, 1003" },
  { name: "Código Penal", articles: "Art. 1, 13-25, 121-359" },
  { name: "CDC", articles: "Art. 6°, 14, 18-19, 49, 51" },
  { name: "CLT", articles: "Art. 442, 468, 477-483, 487" },
  { name: "LGPD", articles: "Art. 6°, 7°, 10, 18" },
  { name: "Lei de Locações", articles: "Art. 4°, 37, 46-47" },
]

// Simple markdown renderer for AI responses
function renderMarkdown(text: string) {
  // Split by lines and process
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let listKey = 0
  
  function flushList() {
    if (listItems.length > 0 && listType) {
      const Tag = listType
      elements.push(
        <Tag key={`list-${listKey++}`} className={cn("my-2 space-y-1", listType === 'ul' ? "list-disc pl-5" : "list-decimal pl-5")}>
          {listItems.map((item, i) => (
            <li key={i} className="text-sm text-white/80 leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </Tag>
      )
      listItems = []
      listType = null
    }
  }
  
  function formatInline(line: string): string {
    // Bold: **text** or __text__
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    line = line.replace(/__(.*?)__/g, '<strong class="text-white font-semibold">$1</strong>')
    // Italic: *text* or _text_
    line = line.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Code: `text`
    line = line.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300 text-xs font-mono">$1</code>')
    // Links
    line = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-emerald-400 hover:underline" target="_blank">$1</a>')
    return line
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Headers
    if (line.startsWith('### ')) {
      flushList()
      elements.push(
        <h4 key={i} className="text-sm font-bold text-white mt-4 mb-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(4)) }} />
        </h4>
      )
      continue
    }
    if (line.startsWith('## ')) {
      flushList()
      elements.push(
        <h3 key={i} className="text-base font-bold text-white mt-4 mb-2">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(3)) }} />
        </h3>
      )
      continue
    }
    if (line.startsWith('# ')) {
      flushList()
      elements.push(
        <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </h2>
      )
      continue
    }
    
    // Unordered list
    if (line.match(/^\s*[-*•]\s+/)) {
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listItems.push(line.replace(/^\s*[-*•]\s+/, ''))
      continue
    }
    
    // Ordered list
    if (line.match(/^\s*\d+[.)]\s+/)) {
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listItems.push(line.replace(/^\s*\d+[.)]\s+/, ''))
      continue
    }
    
    // Horizontal rule
    if (line.match(/^---+$/)) {
      flushList()
      elements.push(<hr key={i} className="border-white/10 my-3" />)
      continue
    }
    
    // Empty line
    if (line.trim() === '') {
      flushList()
      elements.push(<div key={i} className="h-2" />)
      continue
    }
    
    // Regular paragraph
    flushList()
    elements.push(
      <p key={i} className="text-sm text-white/80 leading-relaxed">
        <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      </p>
    )
  }
  
  flushList()
  
  return <div className="space-y-0.5">{elements}</div>
}

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith('image/')) return ImageIcon
  return FileText
}

function getFileTypeLabel(fileName: string, mimeType?: string): string {
  if (mimeType?.startsWith('image/')) return '🖼️ Imagem'
  const ext = fileName?.toLowerCase().split('.').pop()
  if (ext === 'pdf') return '📄 PDF'
  if (ext === 'txt' || ext === 'md') return '📝 Texto'
  if (ext === 'doc' || ext === 'docx') return '📄 Word'
  return '📎 Arquivo'
}

export default function AssistentePage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [inputValue, setInputValue] = useState("")
  
  // Conversão
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [conversionData, setConversionData] = useState({
    nome: '',
    documento: '',
    objeto: '',
    valorContrato: '0',
    valorHonorarios: '0',
    prazo: '',
    responsavel: 'Dr. Rulles'
  })

  const { addClient, addProcess, addPayment } = useCRMStore()
  const { addProductionCard } = useContractStore()
  const aiSettings = useSettingsStore(state => state.ai)

  const handleConversionSubmit = () => {
    const clientId = crypto.randomUUID()
    const processId = crypto.randomUUID()

    // 1. Adicionar Cliente
    addClient({
      id: clientId,
      tipo: conversionData.documento.length > 11 ? 'pessoa_juridica' : 'pessoa_fisica',
      status: 'ativo',
      nome: conversionData.nome,
      documento: conversionData.documento,
      endereco: { logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' },
      contatos: [],
      areaJuridica: ['civil'],
      responsavel: conversionData.responsavel,
      dataCadastro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      leadScore: 100,
      valorTotalContratos: parseFloat(conversionData.valorContrato),
      processosAtivos: 1
    })

    // 2. Adicionar Processo/Contrato
    addProcess({
      id: processId,
      numeroProcesso: 'PENDENTE-' + Math.floor(Math.random() * 1000),
      clienteId: clientId,
      clienteNome: conversionData.nome,
      tipo: 'civel',
      vara: 'Análise Automática',
      comarca: 'São Paulo',
      tribunal: 'TJSP',
      status: 'ativo',
      lado: 'autor',
      valorCausa: parseFloat(conversionData.valorContrato),
      dataDistribuicao: new Date().toISOString(),
      dataUltimaMovimentacao: new Date().toISOString(),
      partes: [],
      movimentacoes: [],
      honorariosContratados: parseFloat(conversionData.valorHonorarios),
      responsavel: conversionData.responsavel
    })

    // 3. Adicionar Pagamento Inicial
    addPayment({
      id: crypto.randomUUID(),
      clienteId: clientId,
      processoId: processId,
      tipo: 'honorario',
      descricao: 'Entrada de Honorários (Convertido via IA)',
      valor: parseFloat(conversionData.valorHonorarios),
      dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pendente'
    })

    // 4. Adicionar à Produção (Kanban)
    addProductionCard({
      id: crypto.randomUUID(),
      clienteNome: conversionData.nome,
      contratoTitulo: conversionData.objeto,
      status: 'triagem',
      prioridade: 'media',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      proximaAcao: 'Validar documentos iniciais',
      prazos: conversionData.prazo ? [{ descricao: 'Prazo Contratual', data: conversionData.prazo, pagina: 0, concluido: false }] : []
    })

    setIsModalOpen(false)
    toast.success("Cliente e contrato adicionados com sucesso ao sistema!")
    
    // Feedback no chat
    const systemConfirmedMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `✅ Ótimo! Acabei de registrar **${conversionData.nome}** como cliente e criei o card de produção para o objeto **"${conversionData.objeto}"**. O financeiro também já foi alimentado com os honorários de R$ ${conversionData.valorHonorarios}.`
    }
    setMessages(prev => [...prev, systemConfirmedMessage])
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      fileName: attachedFile?.name,
      fileType: attachedFile?.type,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)

    // Capture the file to process after sending the message
    const fileToProcess = attachedFile

    try {
      let response: Response

      if (fileToProcess) {
        // AUTOMATION: Start background analysis for onboarding
        // We don't await this here to keep the chat responsive
        const analyzeFile = async () => {
          try {
            const formData = new FormData()
            formData.append('file', fileToProcess)
            const analysisResp = await fetch('/api/analyze', { method: 'POST', body: formData })
            if (analysisResp.ok) {
              const analysisData = await analysisResp.json()
              const result = executeAutoOnboarding(analysisData.analysis)
              toast.success(`Cliente "${result.clientName}" e financeiro criados automaticamente da análise!`)
            }
          } catch (err) {
            console.error("Erro no onboarding automático via Chat:", err)
          }
        }
        analyzeFile()

        // Send with file attachment for natural conversation
        const formData = new FormData()
        formData.append('messages', JSON.stringify(newMessages.map(m => ({ role: m.role, content: m.content }))))
        formData.append('aiSettings', JSON.stringify(aiSettings))
        formData.append('file', fileToProcess)

        response = await fetch('/api/chat', {
          method: 'POST',
          body: formData,
        })

        // Clear attachment after sending
        setAttachedFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        // Send without file
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            aiSettings
          }),
        })
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message.content
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ Desculpe, ocorreu um erro ao processar sua mensagem. ${error instanceof Error ? error.message : 'Tente novamente.'}`
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, attachedFile, aiSettings])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return
    setIsProcessingFile(true)
    setAttachedFile(file)
    
    // Create image preview if it's an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
    
    setIsProcessingFile(false)
    
    // Auto analysis if enabled
    if (useSettingsStore.getState().ai.autoAnalyze) {
      sendMessage(`Analise este documento ${file.name} detalhadamente.`)
    }
  }, [sendMessage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeAttachment = () => {
    setAttachedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = inputValue.trim()
    if (input) {
      sendMessage(input)
      setInputValue("")
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  const handleQuickSummarize = () => {
    if (attachedFile) {
      sendMessage("Por favor, faça um resumo completo e estruturado deste documento, destacando os pontos mais importantes para análise jurídica.")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="flex h-screen bg-[#070707]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full max-w-5xl mx-auto flex gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="shrink-0 mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Assistente Jurídico IA</h1>
                  <p className="text-white/40 mt-1">
                    Análise de documentos, consulta ao Vade Mecum e resumos com IA
                  </p>
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    className="bg-white/[0.02] border-white/[0.1] hover:bg-white/[0.05] text-white/60"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>

              {/* Chat Card */}
              <Card className="bg-white/[0.02] border-white/[0.07] flex-1 flex flex-col overflow-hidden">
                <CardHeader className="shrink-0 pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <Scale className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">RullesIA Assistant</CardTitle>
                        <CardDescription className="text-white/40">
                          PDF • Imagens • Vade Mecum • Resumos
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                        Vade Mecum 2025
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                        PDF & Imagens
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 px-6" ref={scrollRef}>
                    {messages.length === 0 ? (
                      <div 
                        className="flex flex-col items-center justify-center h-full py-12"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                          <Bot className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-white">Olá! Sou o RullesIA</h3>
                        <p className="text-white/40 text-center max-w-md mb-6">
                          Seu assistente jurídico com acesso ao Vade Mecum completo.
                          Envie <strong className="text-white/60">PDFs</strong>, <strong className="text-white/60">imagens de documentos</strong> ou faça perguntas sobre legislação.
                        </p>
                        
                        {/* Drop Zone */}
                        <div className="w-full max-w-md mb-6 p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-emerald-500/30 transition-colors text-center">
                          <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                          <p className="text-sm text-white/40">
                            Arraste um documento aqui ou{' '}
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="text-emerald-400 hover:underline"
                            >
                              clique para anexar
                            </button>
                          </p>
                          <p className="text-xs text-white/20 mt-1">PDF, Imagens (JPG, PNG, WebP), TXT, DOC</p>
                        </div>
                        
                        {/* Suggested Questions */}
                        <div className="w-full max-w-lg space-y-2">
                          <p className="text-xs text-white/30 text-center mb-3">
                            Ou experimente perguntar:
                          </p>
                          {suggestedQuestions.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestedQuestion(item.text)}
                              className="w-full text-left p-3 rounded-xl border border-white/[0.07] hover:border-emerald-500/30 hover:bg-white/[0.02] transition-colors text-sm flex items-center gap-3 group"
                            >
                              <item.icon className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors shrink-0" />
                              <span className="text-white/60 group-hover:text-white/80 transition-colors">{item.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-3 mb-4",
                              message.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                              message.role === 'assistant' 
                                ? "bg-emerald-500/10 border-emerald-500/20" 
                                : "bg-white/10 border-white/20"
                            )}>
                              {message.role === 'assistant' ? <Bot className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4 text-white/70" />}
                            </div>
                            <div
                              className={cn(
                                "max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-lg transition-all",
                                message.role === 'user' 
                                  ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-white border border-emerald-500/20 rounded-tr-none" 
                                  : "bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-white/90 rounded-tl-none"
                              )}
                            >
                              {/* File badge for user messages */}
                              {message.role === 'user' && message.fileName && (
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                                  <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                    {message.fileType?.startsWith('image/') ? (
                                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                                    ) : (
                                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                    )}
                                  </div>
                                  <span className="text-xs font-medium text-white/50 truncate">
                                    {getFileTypeLabel(message.fileName, message.fileType)} • {message.fileName}
                                  </span>
                                </div>
                              )}
                              
                              {/* Render markdown for assistant, plain text for user */}
                              {message.role === 'assistant' ? (
                                renderMarkdown(message.content)
                              ) : (
                                <div className="text-sm whitespace-pre-wrap text-white/80 leading-relaxed">
                                {message.content}
                                </div>
                              )}

                              {message.role === 'assistant' && message.content.includes("Sim, adicionar ao sistema") && (
                                <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      // Tentar extrair dados básicos da mensagem pra pré-preencher
                                      const lines = message.content.split('\n')
                                      const nome = lines.find(l => l.toLowerCase().includes('cliente') || l.toLowerCase().includes('contratante'))?.split(':')?.pop()?.trim() || ''
                                      const objeto = lines.find(l => l.toLowerCase().includes('objeto'))?.split(':')?.pop()?.trim() || ''
                                      const valor = lines.find(l => l.toLowerCase().includes('valor'))?.replace(/\D/g, '') || '0'
                                      
                                      setConversionData(prev => ({
                                        ...prev,
                                        nome: nome.replace(/[#*]/g, ''),
                                        objeto: objeto.replace(/[#*]/g, ''),
                                        valorContrato: valor
                                      }))
                                      setIsModalOpen(true)
                                    }}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                    Adicionar ao Sistema
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                <span className="text-sm text-white/40">Analisando...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Attachment Preview */}
                  {attachedFile && (
                    <div className="px-6 pb-2">
                      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        {/* Image thumbnail */}
                        {imagePreview ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white/70 truncate block">{attachedFile.name}</span>
                          <span className="text-xs text-white/40">
                            {getFileTypeLabel(attachedFile.name, attachedFile.type)} • {(attachedFile.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        
                        {/* Quick summarize button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleQuickSummarize}
                          className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          disabled={isLoading}
                        >
                          <FileSearch className="w-3.5 h-3.5 mr-1" />
                          Resumir
                        </Button>
                        
                        {isProcessingFile ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                        ) : (
                          <button 
                            onClick={removeAttachment}
                            className="p-1 hover:bg-white/10 rounded shrink-0"
                          >
                            <X className="w-4 h-4 text-white/40" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="shrink-0 p-4 border-t border-white/[0.06]">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.doc,.docx,.md,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-11 w-11 bg-white/[0.02] border-white/[0.1] hover:bg-white/[0.05] hover:border-emerald-500/30"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Paperclip className="w-4 h-4 text-white/60" />
                      </Button>
                      <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={attachedFile 
                          ? "Descreva o que gostaria de saber sobre o documento..." 
                          : "Pergunte sobre legislação, envie documentos para análise..."
                        }
                        className="min-h-[44px] max-h-32 resize-none bg-white/[0.02] border-white/[0.1] text-white placeholder:text-white/30 focus:border-emerald-500/30"
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="shrink-0 h-11 w-11 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                    <p className="text-xs text-white/20 text-center mt-2">
                      Aceita PDFs, imagens (JPG, PNG, WebP) e documentos de texto • Vade Mecum integrado
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Vade Mecum Reference */}
            <div className="hidden xl:block w-64 shrink-0">
              <Card className="bg-white/[0.02] border-white/[0.07] h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Vade Mecum Integrado
                  </CardTitle>
                  <CardDescription className="text-xs text-white/40">
                    Edição Senado Federal 2025
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {vadeMecumTopics.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(`Explique os principais artigos sobre ${topic.name} (${topic.articles})`)}
                      className="w-full text-left p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/20 transition-colors"
                    >
                      <p className="text-xs font-semibold text-white/70">{topic.name}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{topic.articles}</p>
                    </button>
                  ))}
                  
                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Leitura de Documentos</span>
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed">
                      Envie PDFs ou fotos de documentos jurídicos para análise automática. 
                      A IA extrai texto, identifica cláusulas e gera resumos estruturados.
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-white/[0.06]">
                    <p className="text-[10px] text-white/30 leading-relaxed">
                      O assistente possui conhecimento integrado das principais legislações brasileiras 
                      e acesso ao PDF completo do Vade Mecum para consultas detalhadas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        {/* Conversion Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Conversão Inteligente de Cliente
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Confirme os dados extraídos do documento para automatizar o cadastro no CRM, Financeiro e Produção.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-white/60">Nome do Cliente</Label>
              <Input 
                value={conversionData.nome} 
                onChange={e => setConversionData({...conversionData, nome: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60">CPF / CNPJ</Label>
              <Input 
                value={conversionData.documento} 
                onChange={e => setConversionData({...conversionData, documento: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-white/60">Objeto do Contrato</Label>
              <Input 
                value={conversionData.objeto} 
                onChange={e => setConversionData({...conversionData, objeto: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60">Valor do Contrato (R$)</Label>
              <Input 
                type="number"
                value={conversionData.valorContrato} 
                onChange={e => setConversionData({...conversionData, valorContrato: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60">Valor de Honorários (R$)</Label>
              <Input 
                type="number"
                value={conversionData.valorHonorarios} 
                onChange={e => setConversionData({...conversionData, valorHonorarios: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60">Data Final / Prazo</Label>
              <Input 
                type="date"
                value={conversionData.prazo} 
                onChange={e => setConversionData({...conversionData, prazo: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60">Responsável</Label>
              <Input 
                value={conversionData.responsavel} 
                onChange={e => setConversionData({...conversionData, responsavel: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleConversionSubmit}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
            >
              Finalizar Cadastro Completo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, FileSearch, BookOpen } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { executeAutoOnboarding } from "@/lib/onboarding-utils"
import { toast } from "sonner"

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error'
type AnalysisMode = 'contract' | 'summary'

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'image/bmp', 'image/tiff'
]

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff'

function isImageType(type: string): boolean {
  return type.startsWith('image/')
}

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.some(t => file.type === t)) return true
  const ext = file.name.toLowerCase().split('.').pop()
  return ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'].includes(ext || '')
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('contract')
  const [summaryResult, setSummaryResult] = useState<any>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const processFile = (selectedFile: File) => {
    if (isAcceptedFile(selectedFile)) {
      setFile(selectedFile)
      setError(null)
      
      // Create image preview
      if (isImageType(selectedFile.type)) {
        const reader = new FileReader()
        reader.onload = (e) => setImagePreview(e.target?.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setImagePreview(null)
      }
    } else {
      setError('Formato não suportado. Aceitos: PDF, JPG, PNG, WebP, GIF')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }, [])

  const handleAnalyze = async () => {
    if (!file) return

    setStatus('uploading')
    setProgress(20)
    setSummaryResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      setStatus('analyzing')
      setProgress(50)

      const endpoint = analysisMode === 'summary' ? '/api/summarize' : '/api/analyze'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      setProgress(80)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao analisar o documento')
      }

      const data = await response.json()
      
      setProgress(100)
      setStatus('success')

      if (analysisMode === 'summary') {
        // Show summary inline
        setSummaryResult(data.summary)
      } else {
        // AUTOMATION: Execute onboarding
        try {
          const result = executeAutoOnboarding(data.analysis)
          toast.success(`Sistema alimentado! Cliente "${result.clientName}", contrato e financeiro criados.`, {
            duration: 5000,
            description: "Os dados foram extraídos e salvos nos módulos correspondentes.",
          })
          
          // Clear current file to show success state clearly
          setSummaryResult({ _autoOnboarded: true, clientName: result.clientName })
        } catch (autoErr) {
          console.error("Erro no onboarding automático:", autoErr)
          toast.error("Análise concluída, mas houve um erro ao criar registros automaticamente.")
        }

        // Store the analysis in sessionStorage for demo purposes
        sessionStorage.setItem('lastAnalysis', JSON.stringify(data.analysis))

        // Redirect to the contract detail page after a slightly longer delay to let the user see the success
        setTimeout(() => {
          router.push(`/contratos/${data.analysis.id}`)
        }, 3000)
      }

    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  const resetUpload = () => {
    setFile(null)
    setImagePreview(null)
    setStatus('idle')
    setProgress(0)
    setError(null)
    setSummaryResult(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex h-screen bg-[#070707]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-white">Upload de Documento</h1>
              <p className="text-white/40 mt-1">
                Envie PDFs ou imagens de documentos jurídicos para análise com IA
              </p>
            </div>

            {/* Analysis Mode Selector */}
            <div className="flex gap-3">
              <button
                onClick={() => setAnalysisMode('contract')}
                className={cn(
                  "flex-1 p-4 rounded-xl border transition-all",
                  analysisMode === 'contract' 
                    ? "border-amber-500/30 bg-amber-500/10" 
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15]"
                )}
              >
                <FileText className={cn("w-6 h-6 mb-2", analysisMode === 'contract' ? "text-amber-400" : "text-white/40")} />
                <p className={cn("font-semibold text-sm", analysisMode === 'contract' ? "text-amber-400" : "text-white/60")}>
                  Análise Contratual
                </p>
                <p className="text-xs text-white/30 mt-1">Extrai cláusulas, riscos, prazos e metadados</p>
              </button>
              <button
                onClick={() => setAnalysisMode('summary')}
                className={cn(
                  "flex-1 p-4 rounded-xl border transition-all",
                  analysisMode === 'summary' 
                    ? "border-blue-500/30 bg-blue-500/10" 
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15]"
                )}
              >
                <FileSearch className={cn("w-6 h-6 mb-2", analysisMode === 'summary' ? "text-blue-400" : "text-white/40")} />
                <p className={cn("font-semibold text-sm", analysisMode === 'summary' ? "text-blue-400" : "text-white/60")}>
                  Resumo Rápido
                </p>
                <p className="text-xs text-white/30 mt-1">Gera resumo estruturado com pontos-chave</p>
              </button>
            </div>

            {/* Upload Card */}
            <Card className="bg-white/[0.02] border-white/[0.07]">
              <CardHeader>
                <CardTitle className="text-white">Selecione o arquivo</CardTitle>
                <CardDescription className="text-white/40">
                  Formatos aceitos: PDF, JPG, PNG, WebP (máx. 25MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dropzone */}
                {!file && status === 'idle' && (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
                      dragActive ? "border-amber-500/50 bg-amber-500/5" : "border-white/[0.1] hover:border-amber-500/30 hover:bg-white/[0.02]"
                    )}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept={ACCEPTED_EXTENSIONS}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto text-white/20 mb-4" />
                    <p className="text-lg font-medium text-white/70">
                      Arraste e solte seu arquivo aqui
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      ou clique para selecionar
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <Badge variant="outline" className="text-white/30 border-white/[0.1] text-xs">📄 PDF</Badge>
                      <Badge variant="outline" className="text-white/30 border-white/[0.1] text-xs">🖼️ JPG</Badge>
                      <Badge variant="outline" className="text-white/30 border-white/[0.1] text-xs">🖼️ PNG</Badge>
                      <Badge variant="outline" className="text-white/30 border-white/[0.1] text-xs">🖼️ WebP</Badge>
                    </div>
                  </div>
                )}

                {/* File Preview */}
                {file && status === 'idle' && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    {imagePreview ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-500/10">
                        <FileText className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{file.name}</p>
                      <p className="text-sm text-white/40">{formatFileSize(file.size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={resetUpload} className="hover:bg-white/[0.05]">
                      <X className="w-4 h-4 text-white/40" />
                    </Button>
                  </div>
                )}

                {/* Progress */}
                {(status === 'uploading' || status === 'analyzing') && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <div className="p-3 rounded-lg bg-amber-500/10">
                        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {status === 'uploading' ? 'Enviando arquivo...' : 'Analisando documento com IA...'}
                        </p>
                        <p className="text-sm text-white/40">
                          {status === 'analyzing' && 'Isso pode levar alguns segundos'}
                        </p>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {status === 'success' && !summaryResult && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="p-3 rounded-lg bg-amber-500/20">
                      <CheckCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-amber-400">Análise concluída!</p>
                      <p className="text-sm text-white/40">
                        O sistema foi alimentado com sucesso. Redirecionando...
                      </p>
                    </div>
                  </div>
                )}

                {/* Automation Feedback */}
                {status === 'success' && summaryResult?._autoOnboarded && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
                      <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Plataforma Atualizada!</h3>
                        <p className="text-white/60 mt-1">
                          Cliente <b>{summaryResult.clientName}</b>, Contrato e Lançamentos Financeiros foram criados automaticamente.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">CRM</Badge>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Financeiro</Badge>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Contratos</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Result */}
                {status === 'success' && summaryResult && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
                      <p className="font-medium text-amber-400 text-sm">Resumo gerado com sucesso!</p>
                    </div>
                    
                    {/* Document Type */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Tipo de Documento</p>
                      <p className="text-white font-semibold">{summaryResult.tipoDocumento || 'Documento'}</p>
                    </div>
                    
                    {/* Executive Summary */}
                    {summaryResult.resumoExecutivo && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Resumo Executivo</p>
                        <p className="text-sm text-white/80 leading-relaxed">{summaryResult.resumoExecutivo}</p>
                      </div>
                    )}
                    
                    {/* Key Points */}
                    {summaryResult.pontosChave?.length > 0 && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Pontos-Chave</p>
                        <ul className="space-y-1.5">
                          {summaryResult.pontosChave.map((point: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                              <span className="text-amber-400 mt-0.5">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Risks */}
                    {summaryResult.riscos?.length > 0 && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-2">⚠️ Riscos Identificados</p>
                        <div className="space-y-2">
                          {summaryResult.riscos.map((risk: any, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs shrink-0 mt-0.5",
                                  risk.nivel === 'alto' ? "border-red-500/30 text-red-400 bg-red-500/10" :
                                  risk.nivel === 'medio' ? "border-amber-500/30 text-amber-400 bg-amber-500/10" :
                                  "border-amber-500/30 text-amber-400 bg-amber-500/10"
                                )}
                              >
                                {risk.nivel}
                              </Badge>
                              <div>
                                <p className="text-sm text-white/70">{risk.descricao}</p>
                                {risk.recomendacao && (
                                  <p className="text-xs text-white/40 mt-0.5">💡 {risk.recomendacao}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Relevant Articles */}
                    {summaryResult.artigosRelevantes?.length > 0 && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-2">📚 Artigos Relevantes</p>
                        <div className="space-y-2">
                          {summaryResult.artigosRelevantes.map((art: any, i: number) => (
                            <div key={i} className="text-sm">
                              <p className="text-amber-400 font-medium">{art.artigo}</p>
                              <p className="text-white/50 text-xs">{art.relevancia}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    {summaryResult.recomendacoes?.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <p className="text-xs text-amber-400/60 uppercase tracking-wider mb-2">✅ Recomendações</p>
                        <ul className="space-y-1.5">
                          {summaryResult.recomendacoes.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-amber-400">→</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <Button onClick={resetUpload} variant="outline" className="w-full bg-white/[0.02] border-white/[0.1] hover:bg-white/[0.05] text-white/60">
                      Analisar outro documento
                    </Button>
                  </div>
                )}

                {/* Error */}
                {(status === 'error' || error) && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <div className="p-3 rounded-lg bg-red-500/20">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-red-400">Erro</p>
                      <p className="text-sm text-white/40">{error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetUpload} className="border-white/[0.1] hover:bg-white/[0.05] text-white/60">
                      Tentar novamente
                    </Button>
                  </div>
                )}

                {/* Action Button */}
                {file && status === 'idle' && (
                  <Button 
                    onClick={handleAnalyze} 
                    className={cn(
                      "w-full",
                      analysisMode === 'summary' 
                        ? "bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400" 
                        : "bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-400"
                    )} 
                    size="lg"
                  >
                    {analysisMode === 'summary' ? (
                      <>
                        <FileSearch className="w-4 h-4 mr-2" />
                        Gerar Resumo
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Analisar Contrato
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/[0.02] border-white/[0.07]">
              <CardHeader>
                <CardTitle className="text-base text-white">Como funciona?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-semibold shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-white/80">Upload</p>
                      <p className="text-sm text-white/40">
                        Envie PDF ou imagem do documento
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-semibold shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-white/80">Análise IA</p>
                      <p className="text-sm text-white/40">
                        IA lê o documento e extrai informações
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-semibold shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-white/80">Resultado</p>
                      <p className="text-sm text-white/40">
                        Receba resumo, riscos e recomendações
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDFs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Fotos de documentos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Vade Mecum integrado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

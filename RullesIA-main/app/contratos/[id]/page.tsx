"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Building2,
  User,
  MapPin,
  DollarSign,
  Clock,
  Eye
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { mockContracts } from "@/lib/contracts-store"
import { ContractAnalysis, RiskLevel, StatusTag } from "@/lib/types"
import { cn } from "@/lib/utils"

function getStatusTagStyle(tag?: StatusTag) {
  switch (tag) {
    case 'URGENTE':
      return 'bg-destructive/15 text-destructive border-destructive/30'
    case 'REVISÃO NECESSÁRIA':
      return 'bg-warning/15 text-warning border-warning/30'
    case 'CONCORDANTE':
      return 'bg-success/15 text-success border-success/30'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getRiskIcon(nivel: RiskLevel) {
  switch (nivel) {
    case 'alto':
      return <ShieldAlert className="w-4 h-4 text-destructive" />
    case 'medio':
      return <Shield className="w-4 h-4 text-warning" />
    case 'baixo':
      return <ShieldCheck className="w-4 h-4 text-success" />
  }
}

function getRiskBadgeStyle(nivel: RiskLevel) {
  switch (nivel) {
    case 'alto':
      return 'bg-destructive/15 text-destructive border-destructive/30'
    case 'medio':
      return 'bg-warning/15 text-warning border-warning/30'
    case 'baixo':
      return 'bg-success/15 text-success border-success/30'
  }
}

export default function ContractDetailPage() {
  const params = useParams()
  const [contract, setContract] = useState<ContractAnalysis | null>(null)

  useEffect(() => {
    // First check sessionStorage for recently analyzed contracts
    const lastAnalysis = sessionStorage.getItem('lastAnalysis')
    if (lastAnalysis) {
      const parsed = JSON.parse(lastAnalysis)
      if (parsed.id === params.id) {
        setContract(parsed)
        return
      }
    }

    // Then check mock data
    const found = mockContracts.find(c => c.id === params.id)
    if (found) {
      setContract(found)
    }
  }, [params.id])

  if (!contract) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">Contrato não encontrado</h2>
              <p className="text-muted-foreground mt-2">O contrato solicitado não existe.</p>
              <Link href="/contratos">
                <Button className="mt-4">Voltar aos contratos</Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/contratos">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {contract.metadados.objeto}
                  </h1>
                  {contract.statusTag && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-sm", getStatusTagStyle(contract.statusTag))}
                    >
                      {contract.statusTag}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-1">{contract.nomeArquivo}</p>
              </div>
            </div>

            {/* Executive Summary */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Resumo Executivo (TL;DR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{contract.resumoExecutivo}</p>
                {contract.proximaAcao && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium text-primary">Próxima Ação Recomendada:</p>
                    <p className="text-sm text-foreground mt-1">{contract.proximaAcao}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs">Contratante</span>
                  </div>
                  <p className="font-medium text-sm truncate">{contract.metadados.contratante}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Contratado</span>
                  </div>
                  <p className="font-medium text-sm truncate">{contract.metadados.contratado}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Valor</span>
                  </div>
                  <p className="font-medium text-sm truncate">{contract.metadados.valor}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Data de Assinatura</span>
                  </div>
                  <p className="font-medium text-sm truncate">{contract.metadados.dataAssinatura}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">Foro</span>
                  </div>
                  <p className="font-medium text-sm truncate">{contract.metadados.foro}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Upload</span>
                  </div>
                  <p className="font-medium text-sm truncate">{contract.dataUpload}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="riscos" className="space-y-4">
              <TabsList className="bg-muted">
                <TabsTrigger value="riscos" className="gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Análise de Riscos
                </TabsTrigger>
                <TabsTrigger value="clausulas" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Cláusulas
                </TabsTrigger>
                <TabsTrigger value="prazos" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Prazos
                </TabsTrigger>
              </TabsList>

              {/* Risks Tab */}
              <TabsContent value="riscos" className="space-y-4">
                {/* Risk Summary */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Tabela de Riscos</CardTitle>
                    <CardDescription>Cláusulas identificadas com potencial risco</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contract.riscos.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-success" />
                        Nenhum risco identificado neste contrato
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contract.riscos.map((risco, index) => (
                          <div 
                            key={index}
                            className={cn(
                              "flex items-start gap-4 p-4 rounded-lg border",
                              risco.nivel === 'alto' && "border-destructive/30 bg-destructive/5",
                              risco.nivel === 'medio' && "border-warning/30 bg-warning/5",
                              risco.nivel === 'baixo' && "border-success/30 bg-success/5"
                            )}
                          >
                            <div className="shrink-0 mt-1">
                              {getRiskIcon(risco.nivel)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">Cláusula {risco.clausula}</span>
                                <Badge variant="outline" className={cn("text-xs", getRiskBadgeStyle(risco.nivel))}>
                                  Risco {risco.nivel === 'alto' ? 'Alto' : risco.nivel === 'medio' ? 'Médio' : 'Baixo'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{risco.motivo}</p>
                              <p className="text-xs text-muted-foreground mt-2">Página {risco.pagina}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Hidden Clauses */}
                {contract.clausulasOcultas.length > 0 && (
                  <Card className="bg-card border-border border-warning/30">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        Cláusulas Ocultas
                      </CardTitle>
                      <CardDescription>Termos técnicos que podem prejudicar o cliente</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {contract.clausulasOcultas.map((clausula, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <span className="text-warning mt-1">•</span>
                            <span>{clausula}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Clauses Tab */}
              <TabsContent value="clausulas">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Cláusulas do Contrato</CardTitle>
                    <CardDescription>Estrutura e análise das cláusulas principais</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contract.clausulas.map((clausula, index) => (
                        <div key={index} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Cláusula {clausula.numero}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-muted-foreground">{clausula.titulo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getRiskIcon(clausula.risco)}
                              <Badge variant="outline" className={cn("text-xs", getRiskBadgeStyle(clausula.risco))}>
                                {clausula.risco === 'alto' ? 'Alto' : clausula.risco === 'medio' ? 'Médio' : 'Baixo'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">{clausula.conteudo}</p>
                          {clausula.observacao && (
                            <div className="mt-3 p-2 rounded bg-warning/10 border border-warning/20">
                              <p className="text-xs text-warning font-medium">Observação:</p>
                              <p className="text-sm text-foreground mt-1">{clausula.observacao}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">Página {clausula.pagina}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Deadlines Tab */}
              <TabsContent value="prazos">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Cronograma de Prazos</CardTitle>
                    <CardDescription>Datas e prazos importantes do contrato</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contract.prazos.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Calendar className="w-5 h-5 mr-2" />
                        Nenhum prazo identificado neste contrato
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contract.prazos.map((prazo, index) => (
                          <div 
                            key={index}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-lg border",
                              prazo.concluido ? "border-success/30 bg-success/5" : "border-border"
                            )}
                          >
                            <div className={cn(
                              "w-3 h-3 rounded-full shrink-0",
                              prazo.concluido ? "bg-success" : "bg-warning"
                            )} />
                            <div className="flex-1">
                              <p className="font-medium">{prazo.descricao}</p>
                              <p className="text-xs text-muted-foreground">Página {prazo.pagina}</p>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "font-medium",
                                prazo.concluido ? "text-success" : "text-foreground"
                              )}>
                                {new Date(prazo.data).toLocaleDateString('pt-BR')}
                              </p>
                              {prazo.concluido && (
                                <Badge variant="outline" className="text-xs bg-success/15 text-success border-success/30 mt-1">
                                  Concluído
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

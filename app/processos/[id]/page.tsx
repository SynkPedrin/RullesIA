"use client"

import { use } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  ArrowLeft,
  Scale,
  User,
  Calendar,
  MapPin,
  Edit,
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Bell,
  Plus,
  Users
} from "lucide-react"
import { getProcessById, getPaymentsByProcess } from "@/lib/crm-store"
import type { ProcessStatus, ProcessType, PaymentStatus } from "@/lib/types"
import Link from "next/link"
import { notFound } from "next/navigation"

const statusLabels: Record<ProcessStatus, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  arquivado: "Arquivado",
  encerrado: "Encerrado",
  aguardando_sentenca: "Aguard. Sentença"
}

const statusColors: Record<ProcessStatus, string> = {
  ativo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  suspenso: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  arquivado: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  encerrado: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  aguardando_sentenca: "bg-violet-500/20 text-violet-400 border-violet-500/30"
}

const typeLabels: Record<ProcessType, string> = {
  civel: "Cível",
  trabalhista: "Trabalhista",
  tributario: "Tributário",
  criminal: "Criminal",
  administrativo: "Administrativo"
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
  parcial: "Parcial"
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  pendente: "bg-amber-500/20 text-amber-400",
  pago: "bg-emerald-500/20 text-emerald-400",
  atrasado: "bg-red-500/20 text-red-400",
  cancelado: "bg-zinc-500/20 text-zinc-400",
  parcial: "bg-sky-500/20 text-sky-400"
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('pt-BR')
}

function getDaysUntil(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function ProcessoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const process = getProcessById(id)

  if (!process) {
    notFound()
  }

  const payments = getPaymentsByProcess(id)

  const movementIcons: Record<string, React.ElementType> = {
    publicacao: Bell,
    despacho: FileText,
    sentenca: Scale,
    audiencia: Users,
    peticao: FileText,
    outro: Clock
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/processos">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">{process.numeroProcesso}</h1>
                  <Badge variant="outline" className={statusColors[process.status]}>
                    {statusLabels[process.status]}
                  </Badge>
                  <Badge variant="secondary" className="bg-muted">
                    {typeLabels[process.tipo]}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{process.vara} - {process.tribunal}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Nova Petição
              </Button>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {process.proximoPrazo && getDaysUntil(process.proximoPrazo) <= 7 && getDaysUntil(process.proximoPrazo) >= 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-medium text-red-400">Prazo Urgente!</p>
                  <p className="text-sm text-red-400/80">
                    Prazo vence em {formatDate(process.proximoPrazo)} 
                    ({getDaysUntil(process.proximoPrazo) === 0 ? 'Hoje' : `${getDaysUntil(process.proximoPrazo)} dias`})
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="space-y-6">
              {/* Client Info */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Link href={`/clientes/${process.clienteId}`} className="font-medium text-foreground hover:text-primary">
                        {process.clienteNome}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Lado: {process.lado === 'autor' ? 'Autor' : process.lado === 'reu' ? 'Réu' : 'Terceiro Interessado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Process Info */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Informações do Processo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{process.comarca}</p>
                      <p className="text-xs text-muted-foreground">Comarca</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{formatDate(process.dataDistribuicao)}</p>
                      <p className="text-xs text-muted-foreground">Data de Distribuição</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{formatCurrency(process.valorCausa)}</p>
                      <p className="text-xs text-muted-foreground">Valor da Causa</p>
                    </div>
                  </div>
                  {process.valorCondenacao && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-sm text-emerald-400">{formatCurrency(process.valorCondenacao)}</p>
                        <p className="text-xs text-muted-foreground">Valor da Condenação</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Honorarios */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Honorários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contratados</span>
                    <span className="font-medium text-foreground">{formatCurrency(process.honorariosContratados)}</span>
                  </div>
                  {process.honorariosExito && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Êxito</span>
                      <span className="font-medium text-foreground">{process.honorariosExito}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Próximos Eventos */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {process.proximoPrazo && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <div>
                        <p className="text-sm text-foreground">Prazo</p>
                        <p className="text-xs text-amber-400">{formatDate(process.proximoPrazo)}</p>
                      </div>
                    </div>
                  )}
                  {process.proximaAudiencia && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                      <Users className="h-4 w-4 text-sky-400" />
                      <div>
                        <p className="text-sm text-foreground">Audiência</p>
                        <p className="text-xs text-sky-400">{formatDate(process.proximaAudiencia)}</p>
                      </div>
                    </div>
                  )}
                  {!process.proximoPrazo && !process.proximaAudiencia && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento agendado</p>
                  )}
                </CardContent>
              </Card>

              {/* Responsável */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Responsável</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{process.responsavel}</p>
                      <p className="text-xs text-muted-foreground">Advogado responsável</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="movimentacoes" className="space-y-4">
                <TabsList className="bg-muted">
                  <TabsTrigger value="movimentacoes" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Movimentações ({process.movimentacoes.length})
                  </TabsTrigger>
                  <TabsTrigger value="partes" className="gap-2">
                    <Users className="h-4 w-4" />
                    Partes ({process.partes.length})
                  </TabsTrigger>
                  <TabsTrigger value="financeiro" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financeiro
                  </TabsTrigger>
                </TabsList>

                {/* Movimentações Tab */}
                <TabsContent value="movimentacoes" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground">Histórico de Movimentações</h3>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nova Movimentação
                    </Button>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                        
                        <div className="space-y-6">
                          {process.movimentacoes.map((mov, index) => {
                            const IconComponent = movementIcons[mov.tipo] || Clock
                            return (
                              <div key={mov.id} className="relative flex gap-4 pl-10">
                                {/* Timeline dot */}
                                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  mov.concluido ? 'bg-emerald-500/20' : 'bg-muted'
                                }`}>
                                  {mov.concluido ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                
                                <div className="flex-1 pb-6">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-medium text-foreground">{mov.descricao}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {formatDateTime(mov.data)} - {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                                      </p>
                                    </div>
                                    {mov.prazoResposta && !mov.concluido && (
                                      <Badge className="bg-amber-500/20 text-amber-400">
                                        Prazo: {formatDate(mov.prazoResposta)}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Partes Tab */}
                <TabsContent value="partes" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground">Partes do Processo</h3>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Nome</TableHead>
                            <TableHead className="text-muted-foreground">Documento</TableHead>
                            <TableHead className="text-muted-foreground">Tipo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {process.partes.map((parte, index) => (
                            <TableRow key={index} className="border-border hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <span className="font-medium text-foreground">{parte.nome}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {parte.documento || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-muted capitalize">
                                  {parte.tipo.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Financeiro Tab */}
                <TabsContent value="financeiro" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground">Lançamentos Financeiros</h3>
                    <Button size="sm" variant="outline">Novo Lançamento</Button>
                  </div>
                  {payments.length > 0 ? (
                    <Card className="bg-card border-border">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                              <TableHead className="text-muted-foreground">Descrição</TableHead>
                              <TableHead className="text-muted-foreground">Vencimento</TableHead>
                              <TableHead className="text-muted-foreground">Valor</TableHead>
                              <TableHead className="text-muted-foreground">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.map(payment => (
                              <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                                <TableCell>
                                  <p className="font-medium text-foreground">{payment.descricao}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{payment.tipo}</p>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {formatDate(payment.dataVencimento)}
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                  {formatCurrency(payment.valor)}
                                </TableCell>
                                <TableCell>
                                  <Badge className={paymentStatusColors[payment.status]}>
                                    {paymentStatusLabels[payment.status]}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <DollarSign className="h-12 w-12 mb-4 opacity-50" />
                        <p>Nenhum lançamento financeiro</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Observations */}
          {process.observacoes && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{process.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

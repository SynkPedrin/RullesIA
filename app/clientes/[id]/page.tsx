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
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  FileText,
  Scale,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react"
import { getClientById, getProcessesByClient, getPaymentsByClient } from "@/lib/crm-store"
import type { ClientStatus, PaymentStatus, ProcessStatus } from "@/lib/types"
import Link from "next/link"
import { notFound } from "next/navigation"

const statusLabels: Record<ClientStatus, string> = {
  lead: "Lead",
  prospecto: "Prospecto",
  ativo: "Ativo",
  inativo: "Inativo"
}

const statusColors: Record<ClientStatus, string> = {
  lead: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  prospecto: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ativo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inativo: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
}

const processStatusLabels: Record<ProcessStatus, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  arquivado: "Arquivado",
  encerrado: "Encerrado",
  aguardando_sentenca: "Aguard. Sentença"
}

const processStatusColors: Record<ProcessStatus, string> = {
  ativo: "bg-emerald-500/20 text-emerald-400",
  suspenso: "bg-amber-500/20 text-amber-400",
  arquivado: "bg-zinc-500/20 text-zinc-400",
  encerrado: "bg-sky-500/20 text-sky-400",
  aguardando_sentenca: "bg-violet-500/20 text-violet-400"
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

const areaLabels: Record<string, string> = {
  trabalhista: "Trabalhista",
  civil: "Civil",
  tributario: "Tributário",
  empresarial: "Empresarial",
  familia: "Família",
  criminal: "Criminal",
  consumidor: "Consumidor",
  ambiental: "Ambiental"
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

function LeadScoreCircle({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 70) return "text-emerald-500"
    if (score >= 40) return "text-amber-500"
    return "text-red-500"
  }

  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-28 h-28">
      <svg className="w-28 h-28 -rotate-90">
        <circle
          cx="56"
          cy="56"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="56"
          cy="56"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={getColor()}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${getColor()}`}>{score}</span>
      </div>
    </div>
  )
}

export default function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const client = getClientById(id)

  if (!client) {
    notFound()
  }

  const processes = getProcessesByClient(id)
  const payments = getPaymentsByClient(id)

  const financialStats = {
    totalPago: payments.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0),
    pendente: payments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + p.valor, 0),
    atrasado: payments.filter(p => p.status === 'atrasado').reduce((sum, p) => sum + p.valor, 0)
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
              <Link href="/clientes">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  client.tipo === 'pessoa_juridica' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {client.tipo === 'pessoa_juridica' ? (
                    <Building2 className="h-6 w-6 text-primary" />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold text-foreground">{client.nome}</h1>
                    <Badge variant="outline" className={statusColors[client.status]}>
                      {statusLabels[client.status]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{client.documento}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="space-y-6">
              {/* Lead Score */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Lead Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <LeadScoreCircle score={client.leadScore} />
                  <p className="text-sm text-muted-foreground mt-4">
                    {client.leadScore >= 70 ? "Cliente de alto valor" : 
                     client.leadScore >= 40 ? "Cliente em desenvolvimento" : 
                     "Requer atenção"}
                  </p>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.contatos.map((contato, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {contato.tipo === 'email' ? (
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm text-foreground">{contato.valor}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {contato.tipo} {contato.principal && "(Principal)"}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 pt-2 border-t border-border">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-foreground">
                      <p>{client.endereco.logradouro}, {client.endereco.numero}</p>
                      {client.endereco.complemento && <p>{client.endereco.complemento}</p>}
                      <p>{client.endereco.bairro}</p>
                      <p>{client.endereco.cidade}/{client.endereco.estado}</p>
                      <p className="text-muted-foreground">{client.endereco.cep}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Areas */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Áreas de Atuação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {client.areaJuridica.map(area => (
                      <Badge key={area} variant="secondary" className="bg-muted">
                        {areaLabels[area]}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Responsible */}
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
                      <p className="font-medium text-foreground">{client.responsavel}</p>
                      <p className="text-xs text-muted-foreground">Advogado responsável</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="processos" className="space-y-4">
                <TabsList className="bg-muted">
                  <TabsTrigger value="processos" className="gap-2">
                    <Scale className="h-4 w-4" />
                    Processos ({processes.length})
                  </TabsTrigger>
                  <TabsTrigger value="financeiro" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financeiro
                  </TabsTrigger>
                  <TabsTrigger value="documentos" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Documentos
                  </TabsTrigger>
                </TabsList>

                {/* Processos Tab */}
                <TabsContent value="processos" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground">Processos Judiciais</h3>
                    <Link href="/processos/novo">
                      <Button size="sm">Novo Processo</Button>
                    </Link>
                  </div>
                  {processes.length > 0 ? (
                    <div className="space-y-3">
                      {processes.map(process => (
                        <Card key={process.id} className="bg-card border-border">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Link href={`/processos/${process.id}`} className="font-medium text-foreground hover:text-primary">
                                    {process.numeroProcesso}
                                  </Link>
                                  <Badge className={processStatusColors[process.status]}>
                                    {processStatusLabels[process.status]}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {process.vara} - {process.comarca}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Distribuído: {formatDate(process.dataDistribuicao)}
                                  </span>
                                  {process.proximoPrazo && (
                                    <span className="flex items-center gap-1 text-amber-400">
                                      <AlertCircle className="h-3 w-3" />
                                      Prazo: {formatDate(process.proximoPrazo)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Valor da causa</p>
                                <p className="font-medium text-foreground">{formatCurrency(process.valorCausa)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Scale className="h-12 w-12 mb-4 opacity-50" />
                        <p>Nenhum processo cadastrado</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Financeiro Tab */}
                <TabsContent value="financeiro" className="space-y-4">
                  {/* Financial Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-card border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm text-muted-foreground">Pago</span>
                        </div>
                        <p className="text-xl font-semibold text-emerald-500 mt-1">
                          {formatCurrency(financialStats.totalPago)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-muted-foreground">Pendente</span>
                        </div>
                        <p className="text-xl font-semibold text-amber-500 mt-1">
                          {formatCurrency(financialStats.pendente)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-muted-foreground">Atrasado</span>
                        </div>
                        <p className="text-xl font-semibold text-red-500 mt-1">
                          {formatCurrency(financialStats.atrasado)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payments Table */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Histórico de Pagamentos</CardTitle>
                        <Button size="sm" variant="outline">Novo Lançamento</Button>
                      </div>
                    </CardHeader>
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
                </TabsContent>

                {/* Documentos Tab */}
                <TabsContent value="documentos" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground">Documentos</h3>
                    <Button size="sm">Gerar Documento</Button>
                  </div>
                  <Card className="bg-card border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mb-4 opacity-50" />
                      <p>Nenhum documento gerado</p>
                      <p className="text-sm">Use os templates para gerar documentos automaticamente</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Notes */}
          {client.observacoes && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{client.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

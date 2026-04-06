"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Scale, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye,
  Edit,
  Calendar,
  AlertCircle,
  Clock,
  Gavel,
  FileText,
  DollarSign
} from "lucide-react"
import { useCRMStore } from "@/lib/crm-store"
import type { ProcessStatus, ProcessType } from "@/lib/types"
import Link from "next/link"

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function getDaysUntil(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function ProcessosPage() {
  const processes = useCRMStore(state => state.processes)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [typeFilter, setTypeFilter] = useState<string>("todos")

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.numeroProcesso.includes(searchTerm) ||
                          process.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || process.status === statusFilter
    const matchesType = typeFilter === "todos" || process.tipo === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: processes.length,
    ativos: processes.filter(p => p.status === 'ativo').length,
    comPrazo: processes.filter(p => p.proximoPrazo && getDaysUntil(p.proximoPrazo) <= 7 && getDaysUntil(p.proximoPrazo) >= 0).length,
    valorTotal: processes.reduce((sum, p) => sum + p.valorCausa, 0)
  }


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Processos Judiciais</h1>
              <p className="text-muted-foreground">Acompanhamento de processos e movimentações</p>
            </div>
            <Link href="/processos/novo">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Processo
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Processos</p>
                    <p className="text-2xl font-semibold">{stats.total}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Processos Ativos</p>
                    <p className="text-2xl font-semibold">{stats.ativos}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Gavel className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Prazos Urgentes</p>
                    <p className="text-2xl font-semibold">{stats.comPrazo}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-semibold">{formatCurrency(stats.valorTotal)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                    <SelectItem value="aguardando_sentenca">Aguard. Sentença</SelectItem>
                    <SelectItem value="encerrado">Encerrado</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40 bg-background">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="civel">Cível</SelectItem>
                    <SelectItem value="trabalhista">Trabalhista</SelectItem>
                    <SelectItem value="tributario">Tributário</SelectItem>
                    <SelectItem value="criminal">Criminal</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Processo</TableHead>
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Vara/Tribunal</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Próximo Prazo</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcesses.map((process) => {
                    const daysUntil = process.proximoPrazo ? getDaysUntil(process.proximoPrazo) : null
                    const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0

                    return (
                      <TableRow key={process.id} className="border-border hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Scale className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <Link href={`/processos/${process.id}`} className="font-medium text-foreground hover:text-primary">
                                {process.numeroProcesso.substring(0, 20)}...
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                Lado: {process.lado === 'autor' ? 'Autor' : process.lado === 'reu' ? 'Réu' : 'Terceiro'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/clientes/${process.clienteId}`} className="text-foreground hover:text-primary">
                            {process.clienteNome}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted">
                            {typeLabels[process.tipo]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-foreground">{process.vara}</p>
                            <p className="text-xs text-muted-foreground">{process.tribunal}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[process.status]}>
                            {statusLabels[process.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {process.proximoPrazo ? (
                            <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-400' : 'text-muted-foreground'}`}>
                              {isUrgent ? (
                                <AlertCircle className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                              <div>
                                <p className="text-sm">{formatDate(process.proximoPrazo)}</p>
                                {isUrgent && (
                                  <p className="text-xs">{daysUntil === 0 ? 'Hoje!' : `${daysUntil} dias`}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground">
                            {formatCurrency(process.valorCausa)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/processos/${process.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Nova Petição
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Registrar Movimentação
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredProcesses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Scale className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum processo encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

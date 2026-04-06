"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye,
  Edit,
  Trash2,
  Building2,
  User,
  TrendingUp,
  FileText,
  Phone
} from "lucide-react"
import { useCRMStore } from "@/lib/crm-store"
import type { Client, ClientStatus, ClientType } from "@/lib/types"
import Link from "next/link"

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

function LeadScoreBar({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 70) return "bg-emerald-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{score}</span>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export default function ClientesPage() {
  const clients = useCRMStore(state => state.clients)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [typeFilter, setTypeFilter] = useState<string>("todos")

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.documento.includes(searchTerm)
    const matchesStatus = statusFilter === "todos" || client.status === statusFilter
    const matchesType = typeFilter === "todos" || client.tipo === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: clients.length,
    ativos: clients.filter(c => c.status === 'ativo').length,
    leads: clients.filter(c => c.status === 'lead').length,
    valorTotal: clients.reduce((sum, c) => sum + (c.valorTotalContratos || 0), 0)
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
              <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
              <p className="text-muted-foreground">Gestão completa de clientes e leads</p>
            </div>
            <Link href="/clientes/novo">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Clientes</p>
                    <p className="text-2xl font-semibold">{stats.total}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                    <p className="text-2xl font-semibold">{stats.ativos}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-2xl font-semibold">{stats.leads}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-sky-500" />
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
                    <FileText className="h-5 w-5 text-amber-500" />
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
                    placeholder="Buscar por nome ou documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40 bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40 bg-background">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                    <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
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
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Áreas</TableHead>
                    <TableHead className="text-muted-foreground">Lead Score</TableHead>
                    <TableHead className="text-muted-foreground">Processos</TableHead>
                    <TableHead className="text-muted-foreground">Valor Total</TableHead>
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                            client.tipo === 'pessoa_juridica' ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            {client.tipo === 'pessoa_juridica' ? (
                              <Building2 className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.nome}</p>
                            <p className="text-xs text-muted-foreground">{client.documento}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {client.tipo === 'pessoa_juridica' ? 'PJ' : 'PF'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[client.status]}>
                          {statusLabels[client.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.areaJuridica.slice(0, 2).map(area => (
                            <Badge key={area} variant="secondary" className="text-xs bg-muted">
                              {areaLabels[area]}
                            </Badge>
                          ))}
                          {client.areaJuridica.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-muted">
                              +{client.areaJuridica.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <LeadScoreBar score={client.leadScore} />
                      </TableCell>
                      <TableCell>
                        <span className="text-foreground">{client.processosAtivos}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-foreground font-medium">
                          {formatCurrency(client.valorTotalContratos)}
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
                            <Link href={`/clientes/${client.id}`}>
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
                              <Phone className="h-4 w-4 mr-2" />
                              Contatar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredClients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

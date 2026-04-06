"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Search, Filter, Eye, Download, MoreHorizontal } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useContractStore } from "@/lib/contracts-store"
import { Status, StatusTag } from "@/lib/types"
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

function getStatusLabel(status: Status) {
  const labels: Record<Status, string> = {
    triagem: 'Triagem',
    analise: 'Em Análise',
    revisao: 'Revisão',
    pronto: 'Pronto',
    arquivado: 'Arquivado'
  }
  return labels[status]
}

function getRiskBadge(riscos: { nivel: string }[]) {
  const highRisks = riscos.filter(r => r.nivel === 'alto').length
  const mediumRisks = riscos.filter(r => r.nivel === 'medio').length

  if (highRisks > 0) {
    return (
      <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">
        {highRisks} alto{highRisks > 1 ? 's' : ''}
      </Badge>
    )
  }
  if (mediumRisks > 0) {
    return (
      <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">
        {mediumRisks} médio{mediumRisks > 1 ? 's' : ''}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-success/15 text-success border-success/30">
      Nenhum
    </Badge>
  )
}

export default function ContratosPage() {
  const contracts = useContractStore(state => state.contracts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.metadados.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.metadados.contratante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.nomeArquivo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Contratos</h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie e visualize todos os contratos analisados
                </p>
              </div>
              <Link href="/upload">
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Novo Contrato
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, cliente ou arquivo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="triagem">Triagem</SelectItem>
                      <SelectItem value="analise">Em Análise</SelectItem>
                      <SelectItem value="revisao">Revisão</SelectItem>
                      <SelectItem value="pronto">Pronto</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Contracts Table */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">
                  {filteredContracts.length} contrato{filteredContracts.length !== 1 ? 's' : ''} encontrado{filteredContracts.length !== 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Contrato</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Riscos</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{contract.metadados.objeto}</p>
                              <p className="text-xs text-muted-foreground">{contract.nomeArquivo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{contract.metadados.contratante}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getStatusLabel(contract.status)}</Badge>
                            {contract.statusTag && (
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getStatusTagStyle(contract.statusTag))}
                              >
                                {contract.statusTag}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(contract.riscos)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{contract.dataUpload}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/contratos/${contract.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Baixar relatório
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredContracts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <p className="text-muted-foreground">Nenhum contrato encontrado</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

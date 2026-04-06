"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Archive,
  MoreHorizontal,
  Calendar,
  ArrowRight,
  FileText
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useContractStore } from "@/lib/contracts-store"
import { Status, StatusTag, ProductionCard } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusColumns: { status: Status; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'triagem', label: 'Triagem', icon: Clock, color: 'text-info' },
  { status: 'analise', label: 'Em Análise', icon: AlertTriangle, color: 'text-warning' },
  { status: 'revisao', label: 'Revisão', icon: FileText, color: 'text-primary' },
  { status: 'pronto', label: 'Pronto', icon: CheckCircle, color: 'text-success' },
  { status: 'arquivado', label: 'Arquivado', icon: Archive, color: 'text-muted-foreground' },
]

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

function getPriorityStyle(priority: 'baixa' | 'media' | 'alta') {
  switch (priority) {
    case 'alta':
      return 'bg-destructive'
    case 'media':
      return 'bg-warning'
    case 'baixa':
      return 'bg-success'
  }
}

function ProductionCardItem({ card }: { card: ProductionCard }) {
  const nextDeadline = card.prazos.find(p => !p.concluido)
  
  return (
    <Card className="bg-muted/50 border-border hover:border-primary/30 transition-colors cursor-pointer">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full shrink-0", getPriorityStyle(card.prioridade))} />
            {card.statusTag && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", getStatusTagStyle(card.statusTag))}
              >
                {card.statusTag}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
              <DropdownMenuItem>Mover para...</DropdownMenuItem>
              <DropdownMenuItem>Arquivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div>
          <p className="font-medium text-sm line-clamp-2">{card.contratoTitulo}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.clienteNome}</p>
        </div>

        {/* Next Deadline */}
        {nextDeadline && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{new Date(nextDeadline.data).toLocaleDateString('pt-BR')}</span>
            <span className="truncate">{nextDeadline.descricao}</span>
          </div>
        )}

        {/* Next Action */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground line-clamp-2">
            <span className="font-medium text-primary">Próxima ação:</span> {card.proximaAcao}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {new Date(card.dataAtualizacao).toLocaleDateString('pt-BR')}
          </span>
          <Link href={`/contratos/${card.id}`}>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              Ver <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanColumn({ 
  status, 
  label, 
  icon: Icon, 
  color, 
  cards 
}: { 
  status: Status
  label: string
  icon: React.ElementType
  color: string
  cards: ProductionCard[] 
}) {
  const columnCards = cards.filter(c => c.status === status)
  
  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="font-medium">{label}</span>
        <Badge variant="secondary" className="ml-auto">
          {columnCards.length}
        </Badge>
      </div>
      <div className="flex-1 space-y-3 min-h-[200px]">
        {columnCards.map(card => (
          <ProductionCardItem key={card.id} card={card} />
        ))}
        {columnCards.length === 0 && (
          <div className="flex items-center justify-center h-32 border border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Nenhum item</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CRMPage() {
  const cards = useContractStore(state => state.productionCards)

  // Stats
  const stats = {
    total: cards.length,
    emAndamento: cards.filter(c => ['triagem', 'analise', 'revisao'].includes(c.status)).length,
    prontos: cards.filter(c => c.status === 'pronto').length,
    urgentes: cards.filter(c => c.statusTag === 'URGENTE').length,
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-foreground">CRM / Controle de Produção</h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie o fluxo de trabalho dos contratos
                </p>
              </div>
              <Link href="/upload">
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Novo Contrato
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Em Andamento</p>
                      <p className="text-2xl font-bold">{stats.emAndamento}</p>
                    </div>
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Prontos</p>
                      <p className="text-2xl font-bold">{stats.prontos}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Urgentes</p>
                      <p className="text-2xl font-bold">{stats.urgentes}</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kanban Board */}
            <Card className="bg-card border-border flex-1 overflow-hidden">
              <CardHeader className="pb-0 shrink-0">
                <CardTitle className="text-lg">Quadro Kanban</CardTitle>
              </CardHeader>
              <CardContent className="p-4 overflow-x-auto">
                <div className="flex gap-4 pb-4">
                  {statusColumns.map(column => (
                    <KanbanColumn
                      key={column.status}
                      status={column.status}
                      label={column.label}
                      icon={column.icon}
                      color={column.color}
                      cards={cards}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

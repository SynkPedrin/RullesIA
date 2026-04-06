"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
  DollarSign, 
  Plus, 
  Search, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2,
  Receipt,
  CreditCard,
  Wallet,
  PiggyBank,
  FileText,
  Save
} from "lucide-react"
import { useCRMStore, getFinancialSummary } from "@/lib/crm-store"
import type { PaymentStatus, PaymentType, Payment } from "@/lib/types"
import Link from "next/link"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts"

const statusLabels: Record<PaymentStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
  parcial: "Parcial"
}

const statusColors: Record<PaymentStatus, string> = {
  pendente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  pago: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  atrasado: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelado: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  parcial: "bg-sky-500/20 text-sky-400 border-sky-500/30"
}

const typeLabels: Record<PaymentType, string> = {
  honorario: "Honorário",
  custas: "Custas",
  pericia: "Perícia",
  diligencia: "Diligência",
  acordo: "Acordo",
  exito: "Êxito"
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

// Mock data for charts
const monthlyData = [
  { month: 'Out', receita: 45000, despesa: 12000 },
  { month: 'Nov', receita: 52000, despesa: 15000 },
  { month: 'Dez', receita: 38000, despesa: 10000 },
  { month: 'Jan', receita: 61000, despesa: 18000 },
  { month: 'Fev', receita: 55000, despesa: 14000 },
  { month: 'Mar', receita: 48000, despesa: 16000 },
]

const revenueData = [
  { month: 'Out', valor: 45000 },
  { month: 'Nov', valor: 52000 },
  { month: 'Dez', valor: 38000 },
  { month: 'Jan', valor: 61000 },
  { month: 'Fev', valor: 55000 },
  { month: 'Mar', valor: 48000 },
]

const typeDistribution = [
  { name: 'Honorários', value: 65, color: '#10b981' },
  { name: 'Custas', value: 15, color: '#f59e0b' },
  { name: 'Perícias', value: 12, color: '#3b82f6' },
  { name: 'Outros', value: 8, color: '#6366f1' },
]

export default function FinanceiroPage() {
  const payments = useCRMStore(state => state.payments)
  const clients = useCRMStore(state => state.clients)
  const { addPayment, updatePayment, deletePayment } = useCRMStore()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [typeFilter, setTypeFilter] = useState<string>("todos")
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [transactionType, setTransactionType] = useState<'entrada' | 'saida'>('entrada')

  const [formData, setFormData] = useState({
    clienteId: "",
    tipo: "honorario" as PaymentType,
    descricao: "",
    valor: "",
    dataVencimento: "",
    observacoes: ""
  })

  const summary = getFinancialSummary()

  const filteredPayments = payments.filter(payment => {
    const client = clients.find(c => c.id === payment.clienteId)
    const matchesSearch = payment.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (client?.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "todos" || payment.status === statusFilter
    const matchesType = typeFilter === "todos" || payment.tipo === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getClientName = (clienteId: string) => {
    return clients.find(c => c.id === clienteId)?.nome || 'Cliente não encontrado'
  }

  const handleCreate = () => {
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      clienteId: formData.clienteId,
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor) || 0,
      dataVencimento: formData.dataVencimento,
      status: 'pendente',
      observacoes: formData.observacoes
    }
    addPayment(newPayment)
    setShowCreate(false)
    resetForm()
  }

  const handleMarkAsPaid = (paymentId: string) => {
    updatePayment(paymentId, { 
      status: 'pago', 
      dataPagamento: new Date().toISOString().split('T')[0] 
    })
  }

  const handleDelete = (paymentId: string) => {
    deletePayment(paymentId)
  }

  const resetForm = () => {
    setFormData({
      clienteId: "",
      tipo: "honorario",
      descricao: "",
      valor: "",
      dataVencimento: "",
      observacoes: ""
    })
  }

  const exportToCSV = () => {
    const headers = ['Descrição', 'Cliente', 'Tipo', 'Valor', 'Vencimento', 'Status']
    const rows = filteredPayments.map(p => [
      p.descricao,
      getClientName(p.clienteId),
      typeLabels[p.tipo],
      p.valor.toString(),
      p.dataVencimento,
      statusLabels[p.status]
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="flex h-screen bg-[#060606]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Financeiro</h1>
              <p className="text-white/40">Gestão de honorários, custas e receitas</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="gap-2 border-white/10 text-white hover:bg-white/5"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button 
                className="gap-2 bg-white text-black hover:bg-white/90"
                onClick={() => {
                  resetForm()
                  setShowCreate(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Novo Lançamento
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">Receita Total</p>
                    <p className="text-2xl font-black text-emerald-400">{formatCurrency(summary.receitaTotal)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">+12% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">A Receber</p>
                    <p className="text-2xl font-black text-amber-400">{formatCurrency(summary.receitaPendente)}</p>
                    <p className="text-xs text-white/30 mt-1">Pagamentos pendentes</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">Em Atraso</p>
                    <p className="text-2xl font-black text-red-400">{formatCurrency(summary.receitaAtrasada)}</p>
                    <p className="text-xs text-white/30 mt-1">{summary.inadimplencia.toFixed(1)}% inadimplência</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">Despesas</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(summary.despesasTotal)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowDownRight className="h-3 w-3 text-red-400" />
                      <span className="text-xs text-red-400">+5% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/40">Ticket Médio</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(summary.ticketMedio)}</p>
                    <p className="text-xs text-white/30 mt-1">Por cliente</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white/60" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="bg-white/[0.02] border-white/[0.05] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base text-white">Receitas x Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    receita: { label: "Receita", color: "#10b981" },
                    despesa: { label: "Despesa", color: "#ef4444" },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `${value/1000}k`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Type Distribution */}
            <Card className="bg-white/[0.02] border-white/[0.05]">
              <CardHeader>
                <CardTitle className="text-base text-white">Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {typeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {typeDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-white/50">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="todos" className="space-y-4">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="todos" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Todos
              </TabsTrigger>
              <TabsTrigger value="a-receber" className="data-[state=active]:bg-white data-[state=active]:text-black">
                A Receber
              </TabsTrigger>
              <TabsTrigger value="atrasados" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Atrasados
              </TabsTrigger>
              <TabsTrigger value="pagos" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Pagos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-4">
              {/* Filters */}
              <Card className="bg-white/[0.02] border-white/[0.05]">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <Input
                        placeholder="Buscar por descrição ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="bg-white/[0.02] border-white/[0.05]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/[0.05] hover:bg-transparent">
                        <TableHead className="text-white/40">Descrição</TableHead>
                        <TableHead className="text-white/40">Cliente</TableHead>
                        <TableHead className="text-white/40">Tipo</TableHead>
                        <TableHead className="text-white/40">Vencimento</TableHead>
                        <TableHead className="text-white/40">Valor</TableHead>
                        <TableHead className="text-white/40">Status</TableHead>
                        <TableHead className="text-white/40 w-20">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id} className="border-white/[0.05] hover:bg-white/[0.02]">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                                payment.status === 'pago' ? 'bg-emerald-500/10' :
                                payment.status === 'atrasado' ? 'bg-red-500/10' :
                                'bg-amber-500/10'
                              }`}>
                                {payment.status === 'pago' ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                ) : payment.status === 'atrasado' ? (
                                  <AlertCircle className="h-4 w-4 text-red-400" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white">{payment.descricao}</p>
                                {payment.numeroNF && (
                                  <p className="text-xs text-white/40">{payment.numeroNF}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-white/70">{getClientName(payment.clienteId)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-white/10 text-white/60">
                              {typeLabels[payment.tipo]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/50">
                            {formatDate(payment.dataVencimento)}
                          </TableCell>
                          <TableCell>
                            <span className="font-black text-white">
                              {formatCurrency(payment.valor)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[payment.status]}>
                              {statusLabels[payment.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {payment.status !== 'pago' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  onClick={() => handleMarkAsPaid(payment.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => handleDelete(payment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredPayments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-white/40">
                      <DollarSign className="h-12 w-12 mb-4 opacity-50" />
                      <p>Nenhum lançamento encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="a-receber" className="space-y-4">
              <Card className="bg-white/[0.02] border-white/[0.05]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/[0.05] hover:bg-transparent">
                        <TableHead className="text-white/40">Descrição</TableHead>
                        <TableHead className="text-white/40">Cliente</TableHead>
                        <TableHead className="text-white/40">Vencimento</TableHead>
                        <TableHead className="text-white/40">Valor</TableHead>
                        <TableHead className="text-white/40">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.filter(p => p.status === 'pendente').map((payment) => (
                        <TableRow key={payment.id} className="border-white/[0.05] hover:bg-white/[0.02]">
                          <TableCell>
                            <p className="font-medium text-white">{payment.descricao}</p>
                          </TableCell>
                          <TableCell className="text-white/70">
                            {getClientName(payment.clienteId)}
                          </TableCell>
                          <TableCell className="text-white/50">
                            {formatDate(payment.dataVencimento)}
                          </TableCell>
                          <TableCell className="font-black text-white">
                            {formatCurrency(payment.valor)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              className="bg-emerald-500 text-white hover:bg-emerald-600"
                              onClick={() => handleMarkAsPaid(payment.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="atrasados" className="space-y-4">
              <Card className="bg-white/[0.02] border-white/[0.05]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/[0.05] hover:bg-transparent">
                        <TableHead className="text-white/40">Descrição</TableHead>
                        <TableHead className="text-white/40">Cliente</TableHead>
                        <TableHead className="text-white/40">Vencimento</TableHead>
                        <TableHead className="text-white/40">Dias em Atraso</TableHead>
                        <TableHead className="text-white/40">Valor</TableHead>
                        <TableHead className="text-white/40">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.filter(p => p.status === 'atrasado').map((payment) => {
                        const daysOverdue = Math.floor((new Date().getTime() - new Date(payment.dataVencimento).getTime()) / (1000 * 60 * 60 * 24))
                        return (
                          <TableRow key={payment.id} className="border-white/[0.05] hover:bg-white/[0.02]">
                            <TableCell>
                              <p className="font-medium text-white">{payment.descricao}</p>
                            </TableCell>
                            <TableCell className="text-white/70">
                              {getClientName(payment.clienteId)}
                            </TableCell>
                            <TableCell className="text-red-400">
                              {formatDate(payment.dataVencimento)}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                {daysOverdue} dias
                              </Badge>
                            </TableCell>
                            <TableCell className="font-black text-white">
                              {formatCurrency(payment.valor)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/10 text-white hover:bg-white/5"
                                >
                                  Cobrar
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                                  onClick={() => handleMarkAsPaid(payment.id)}
                                >
                                  Recebido
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pagos" className="space-y-4">
              <Card className="bg-white/[0.02] border-white/[0.05]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/[0.05] hover:bg-transparent">
                        <TableHead className="text-white/40">Descrição</TableHead>
                        <TableHead className="text-white/40">Cliente</TableHead>
                        <TableHead className="text-white/40">Data Pagamento</TableHead>
                        <TableHead className="text-white/40">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.filter(p => p.status === 'pago').map((payment) => (
                        <TableRow key={payment.id} className="border-white/[0.05] hover:bg-white/[0.02]">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              </div>
                              <p className="font-medium text-white">{payment.descricao}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-white/70">
                            {getClientName(payment.clienteId)}
                          </TableCell>
                          <TableCell className="text-emerald-400">
                            {payment.dataPagamento ? formatDate(payment.dataPagamento) : '-'}
                          </TableCell>
                          <TableCell className="font-black text-white">
                            {formatCurrency(payment.valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-lg bg-[#0a0a0a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Novo Lançamento</DialogTitle>
              <DialogDescription className="text-white/50">
                Registre uma nova entrada ou saída financeira
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Transaction Type Toggle */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                <button
                  onClick={() => setTransactionType('entrada')}
                  className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
                    transactionType === 'entrada' 
                      ? 'bg-emerald-500 text-white' 
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Entrada
                </button>
                <button
                  onClick={() => setTransactionType('saida')}
                  className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
                    transactionType === 'saida' 
                      ? 'bg-red-500 text-white' 
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="h-4 w-4" />
                  Saída
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Cliente</Label>
                <Select value={formData.clienteId} onValueChange={(v) => setFormData({...formData, clienteId: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v as PaymentType})}>
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
                <div className="space-y-2">
                  <Label className="text-white/70">Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Descrição</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Ex: Honorários - Processo 0000000-00.2024"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                  <Input
                    type="number"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                    className="bg-white/5 border-white/10 text-white pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Observações (opcional)</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Anotações adicionais..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)} className="border-white/10 text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="bg-white text-black hover:bg-white/90">
                <Save className="h-4 w-4 mr-2" />
                Salvar Lançamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

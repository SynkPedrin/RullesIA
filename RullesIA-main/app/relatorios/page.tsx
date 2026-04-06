"use client"

import { 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Shield,
  CheckCircle,
  Clock
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useContractStore } from "@/lib/contracts-store"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts"

export default function RelatoriosPage() {
  const mockContracts = useContractStore(state => state.contracts)
  
  // Calculate statistics
  const totalContratos = mockContracts.length
  const contratosAnalisados = mockContracts.filter(c => c.status !== 'triagem').length
  const contratosAprovados = mockContracts.filter(c => c.statusTag === 'CONCORDANTE').length
  const contratosComRisco = mockContracts.filter(c => c.riscos.some(r => r.nivel === 'alto')).length

  // Risk distribution data
  const allRisks = mockContracts.flatMap(c => c.riscos)
  const riskDistribution = [
    { name: 'Alto', value: allRisks.filter(r => r.nivel === 'alto').length, color: 'hsl(var(--destructive))' },
    { name: 'Médio', value: allRisks.filter(r => r.nivel === 'medio').length, color: 'hsl(var(--warning))' },
    { name: 'Baixo', value: allRisks.filter(r => r.nivel === 'baixo').length, color: 'hsl(var(--success))' },
  ]

  // Status distribution data
  const statusDistribution = [
    { name: 'Triagem', value: mockContracts.filter(c => c.status === 'triagem').length },
    { name: 'Em Análise', value: mockContracts.filter(c => c.status === 'analise').length },
    { name: 'Revisão', value: mockContracts.filter(c => c.status === 'revisao').length },
    { name: 'Pronto', value: mockContracts.filter(c => c.status === 'pronto').length },
  ]

  // Monthly trend data (mock)
  const monthlyTrend = [
    { month: 'Jan', contratos: 12, riscos: 4 },
    { month: 'Fev', contratos: 19, riscos: 7 },
    { month: 'Mar', contratos: 15, riscos: 5 },
    { month: 'Abr', contratos: 22, riscos: 8 },
    { month: 'Mai', contratos: 18, riscos: 3 },
    { month: 'Jun', contratos: 25, riscos: 6 },
  ]

  // Top risk clauses
  const topRiskClauses = [
    { clausula: 'Multa por atraso', ocorrencias: 8, nivel: 'alto' },
    { clausula: 'Prazo indeterminado', ocorrencias: 5, nivel: 'alto' },
    { clausula: 'Renovação automática', ocorrencias: 12, nivel: 'medio' },
    { clausula: 'Definição ampla de confidencial', ocorrencias: 7, nivel: 'medio' },
    { clausula: 'Foro distante', ocorrencias: 4, nivel: 'baixo' },
  ]

  const taxaAprovacao = totalContratos > 0 ? (contratosAprovados / totalContratos * 100) : 0
  const taxaRisco = totalContratos > 0 ? (contratosComRisco / totalContratos * 100) : 0

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Relatórios e Inteligência</h1>
              <p className="text-muted-foreground mt-1">
                Análise agregada e insights sobre contratos
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Contratos</p>
                      <p className="text-3xl font-bold mt-1">{totalContratos}</p>
                      <p className="text-xs text-success mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12% este mês
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                      <p className="text-3xl font-bold mt-1">{taxaAprovacao.toFixed(0)}%</p>
                      <Progress value={taxaAprovacao} className="h-1 mt-2 w-24" />
                    </div>
                    <div className="p-3 rounded-lg bg-success/10">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Contratos com Risco</p>
                      <p className="text-3xl font-bold mt-1">{contratosComRisco}</p>
                      <p className="text-xs text-destructive mt-2">
                        {taxaRisco.toFixed(0)}% do total
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo Médio Análise</p>
                      <p className="text-3xl font-bold mt-1">2.4h</p>
                      <p className="text-xs text-success mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        -18% vs média
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-info/10">
                      <Clock className="w-6 h-6 text-info" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição por Status</CardTitle>
                  <CardDescription>Contratos por etapa do fluxo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="hsl(var(--muted-foreground))"
                          width={100}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="hsl(var(--primary))" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição de Riscos</CardTitle>
                  <CardDescription>Classificação por nível de risco</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Tendência Mensal</CardTitle>
                <CardDescription>Evolução de contratos e riscos identificados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="contratos" 
                        name="Contratos"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="riscos" 
                        name="Riscos Altos"
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--destructive))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Risk Clauses */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-warning" />
                  Cláusulas de Risco Mais Frequentes
                </CardTitle>
                <CardDescription>Padrões identificados nos contratos analisados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRiskClauses.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{item.clausula}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.ocorrencias} ocorrências
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          item.nivel === 'alto' 
                            ? 'bg-destructive/15 text-destructive border-destructive/30'
                            : item.nivel === 'medio'
                            ? 'bg-warning/15 text-warning border-warning/30'
                            : 'bg-success/15 text-success border-success/30'
                        }
                      >
                        Risco {item.nivel === 'alto' ? 'Alto' : item.nivel === 'medio' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
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

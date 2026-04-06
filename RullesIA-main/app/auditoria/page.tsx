"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Shield, 
  Search, 
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  FileText,
  User,
  Users,
  Lock,
  Key,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { mockAuditLogs, mockUsers, mockRoles } from "@/lib/crm-store"
import type { AuditAction } from "@/lib/types"

const actionLabels: Record<AuditAction, string> = {
  create: "Criação",
  read: "Leitura",
  update: "Atualização",
  delete: "Exclusão",
  export: "Exportação",
  login: "Login",
  logout: "Logout"
}

const actionColors: Record<AuditAction, string> = {
  create: "bg-emerald-500/20 text-emerald-400",
  read: "bg-sky-500/20 text-sky-400",
  update: "bg-amber-500/20 text-amber-400",
  delete: "bg-red-500/20 text-red-400",
  export: "bg-violet-500/20 text-violet-400",
  login: "bg-emerald-500/20 text-emerald-400",
  logout: "bg-zinc-500/20 text-zinc-400"
}

const actionIcons: Record<AuditAction, React.ElementType> = {
  create: Plus,
  read: Eye,
  update: Edit,
  delete: Trash2,
  export: Download,
  login: LogIn,
  logout: LogOut
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('pt-BR')
}

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("todos")
  const [userFilter, setUserFilter] = useState<string>("todos")

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === "todos" || log.action === actionFilter
    const matchesUser = userFilter === "todos" || log.userId === userFilter
    return matchesSearch && matchesAction && matchesUser
  })

  const stats = {
    totalLogs: mockAuditLogs.length,
    logins: mockAuditLogs.filter(l => l.action === 'login').length,
    updates: mockAuditLogs.filter(l => l.action === 'update').length,
    exports: mockAuditLogs.filter(l => l.action === 'export').length
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
              <h1 className="text-2xl font-semibold text-foreground">Auditoria e Compliance</h1>
              <p className="text-muted-foreground">Logs de atividades, controle de acesso e conformidade LGPD</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Registros</p>
                    <p className="text-2xl font-semibold">{stats.totalLogs}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Logins Hoje</p>
                    <p className="text-2xl font-semibold">{stats.logins}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alterações</p>
                    <p className="text-2xl font-semibold">{stats.updates}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Edit className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Exportações</p>
                    <p className="text-2xl font-semibold">{stats.exports}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="logs" className="gap-2">
                <Activity className="h-4 w-4" />
                Logs de Atividade
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="permissoes" className="gap-2">
                <Key className="h-4 w-4" />
                Permissões
              </TabsTrigger>
              <TabsTrigger value="lgpd" className="gap-2">
                <Shield className="h-4 w-4" />
                LGPD
              </TabsTrigger>
            </TabsList>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              {/* Filters */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por entidade ou usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-background"
                      />
                    </div>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger className="w-full md:w-40 bg-background">
                        <SelectValue placeholder="Ação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as Ações</SelectItem>
                        <SelectItem value="create">Criação</SelectItem>
                        <SelectItem value="read">Leitura</SelectItem>
                        <SelectItem value="update">Atualização</SelectItem>
                        <SelectItem value="delete">Exclusão</SelectItem>
                        <SelectItem value="export">Exportação</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="logout">Logout</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger className="w-full md:w-48 bg-background">
                        <SelectValue placeholder="Usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Usuários</SelectItem>
                        {mockUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>{user.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Logs Table */}
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                        <TableHead className="text-muted-foreground">Usuário</TableHead>
                        <TableHead className="text-muted-foreground">Ação</TableHead>
                        <TableHead className="text-muted-foreground">Entidade</TableHead>
                        <TableHead className="text-muted-foreground">Detalhes</TableHead>
                        <TableHead className="text-muted-foreground">IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const IconComponent = actionIcons[log.action]
                        return (
                          <TableRow key={log.id} className="border-border hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{formatDateTime(log.timestamp)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium text-foreground">{log.userName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={actionColors[log.action]}>
                                <IconComponent className="h-3 w-3 mr-1" />
                                {actionLabels[log.action]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{log.entityName}</p>
                                <p className="text-xs text-muted-foreground">{log.entity}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {log.details || '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm font-mono">
                              {log.ipAddress || '-'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Usuarios Tab */}
            <TabsContent value="usuarios" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-foreground">Usuários do Sistema</h3>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              </div>
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Usuário</TableHead>
                        <TableHead className="text-muted-foreground">E-mail</TableHead>
                        <TableHead className="text-muted-foreground">Perfil</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Último Acesso</TableHead>
                        <TableHead className="text-muted-foreground w-24">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map((user) => (
                        <TableRow key={user.id} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium text-foreground">{user.nome}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-muted">
                              {user.roleName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.ativo ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {user.ultimoAcesso ? formatDateTime(user.ultimoAcesso) : 'Nunca'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Key className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Permissoes Tab */}
            <TabsContent value="permissoes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-foreground">Perfis de Acesso</h3>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Perfil
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockRoles.map(role => (
                  <Card key={role.id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-base">{role.nome}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Permissões:</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissoes.map(perm => (
                            <Badge key={perm} variant="secondary" className="bg-muted text-xs">
                              {perm === 'all' ? 'Acesso Total' : perm}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {mockUsers.filter(u => u.roleId === role.id).length} usuário(s)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* LGPD Tab */}
            <TabsContent value="lgpd" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compliance Status */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      Status de Conformidade
                    </CardTitle>
                    <CardDescription>Verificação de conformidade com a LGPD</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium text-foreground">Criptografia de Dados</p>
                          <p className="text-xs text-muted-foreground">Dados sensíveis criptografados em repouso</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium text-foreground">Logs de Auditoria</p>
                          <p className="text-xs text-muted-foreground">Todas as ações são registradas</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium text-foreground">Controle de Acesso</p>
                          <p className="text-xs text-muted-foreground">Permissões baseadas em perfis</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-foreground">Backup Automático</p>
                          <p className="text-xs text-muted-foreground">Configurar backup diário</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400">Pendente</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Protection */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Proteção de Dados
                    </CardTitle>
                    <CardDescription>Ferramentas de gestão de dados pessoais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" />
                      Gerar Relatório de Dados (DSAR)
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Download className="h-4 w-4" />
                      Exportar Dados de Cliente
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-red-400 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                      Solicitar Exclusão de Dados
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Eye className="h-4 w-4" />
                      Visualizar Consentimentos
                    </Button>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <Card className="bg-card border-border md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Resumo de Atividades - Últimos 30 dias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-semibold text-foreground">156</p>
                        <p className="text-xs text-muted-foreground">Acessos ao Sistema</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-semibold text-foreground">89</p>
                        <p className="text-xs text-muted-foreground">Documentos Gerados</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-semibold text-foreground">234</p>
                        <p className="text-xs text-muted-foreground">Consultas a Dados</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-semibold text-foreground">12</p>
                        <p className="text-xs text-muted-foreground">Exportações</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-semibold text-foreground">0</p>
                        <p className="text-xs text-muted-foreground">Incidentes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

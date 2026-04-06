export type RiskLevel = 'baixo' | 'medio' | 'alto'
export type Status = 'triagem' | 'analise' | 'revisao' | 'pronto' | 'arquivado'
export type StatusTag = 'URGENTE' | 'REVISÃO NECESSÁRIA' | 'CONCORDANTE'

export interface ContractMetadata {
  contratante: string
  contratado: string
  objeto: string
  valor: string
  dataAssinatura: string
  foro: string
  documento?: string
  endereco?: string
  tipoCliente?: 'pessoa_fisica' | 'pessoa_juridica'
}

export interface ContractClause {
  numero: string
  titulo: string
  conteudo: string
  pagina: number
  risco: RiskLevel
  observacao?: string
}

export interface ContractDeadline {
  descricao: string
  data: string
  pagina: number
  concluido: boolean
}

export interface RiskItem {
  clausula: string
  nivel: RiskLevel
  motivo: string
  pagina: number
}

export interface ContractAnalysis {
  id: string
  nomeArquivo: string
  dataUpload: string
  status: Status
  statusTag?: StatusTag
  metadados: ContractMetadata
  clausulas: ContractClause[]
  prazos: ContractDeadline[]
  riscos: RiskItem[]
  resumoExecutivo: string
  clausulasOcultas: string[]
  proximaAcao: string
}

export interface ProductionCard {
  id: string
  clienteNome: string
  contratoTitulo: string
  status: Status
  statusTag?: StatusTag
  prioridade: 'baixa' | 'media' | 'alta'
  dataCriacao: string
  dataAtualizacao: string
  proximaAcao: string
  responsavel?: string
  prazos: ContractDeadline[]
}

export interface DashboardStats {
  totalContratos: number
  contratosEmAnalise: number
  alertasRisco: number
  prazoProximo: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ===========================================
// MÓDULO DE CLIENTES (CRM)
// ===========================================

export type ClientType = 'pessoa_fisica' | 'pessoa_juridica'
export type ClientStatus = 'lead' | 'ativo' | 'inativo' | 'prospecto'
export type JuridicalArea = 'trabalhista' | 'civil' | 'tributario' | 'empresarial' | 'familia' | 'criminal' | 'consumidor' | 'ambiental'

export interface ClientAddress {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface ClientContact {
  tipo: 'email' | 'telefone' | 'whatsapp' | 'linkedin'
  valor: string
  principal: boolean
}

export interface Client {
  id: string
  tipo: ClientType
  status: ClientStatus
  nome: string
  documento: string // CPF ou CNPJ
  razaoSocial?: string
  endereco: ClientAddress
  contatos: ClientContact[]
  areaJuridica: JuridicalArea[]
  responsavel: string
  observacoes?: string
  dataCadastro: string
  dataAtualizacao: string
  leadScore: number // 0-100
  valorTotalContratos: number
  processosAtivos: number
}

// ===========================================
// MÓDULO DE PROCESSOS JUDICIAIS
// ===========================================

export type ProcessStatus = 'ativo' | 'suspenso' | 'arquivado' | 'encerrado' | 'aguardando_sentenca'
export type ProcessType = 'civel' | 'trabalhista' | 'tributario' | 'criminal' | 'administrativo'
export type ProcessSide = 'autor' | 'reu' | 'terceiro'

export interface ProcessMovement {
  id: string
  data: string
  descricao: string
  tipo: 'publicacao' | 'despacho' | 'sentenca' | 'audiencia' | 'peticao' | 'outro'
  prazoResposta?: string
  concluido: boolean
}

export interface ProcessParty {
  nome: string
  documento: string
  tipo: 'autor' | 'reu' | 'testemunha' | 'perito' | 'advogado_contrario'
}

export interface JudicialProcess {
  id: string
  numeroProcesso: string
  clienteId: string
  clienteNome: string
  tipo: ProcessType
  vara: string
  comarca: string
  tribunal: string
  status: ProcessStatus
  lado: ProcessSide
  valorCausa: number
  valorCondenacao?: number
  dataDistribuicao: string
  dataUltimaMovimentacao: string
  partes: ProcessParty[]
  movimentacoes: ProcessMovement[]
  proximoPrazo?: string
  proximaAudiencia?: string
  honorariosContratados: number
  honorariosExito?: number // percentual
  observacoes?: string
  responsavel: string
}

// ===========================================
// MÓDULO FINANCEIRO
// ===========================================

export type PaymentStatus = 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'parcial'
export type PaymentType = 'honorario' | 'custas' | 'pericia' | 'diligencia' | 'acordo' | 'exito'

export interface Payment {
  id: string
  processoId?: string
  clienteId: string
  tipo: PaymentType
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento?: string
  status: PaymentStatus
  formaPagamento?: string
  numeroNF?: string
  observacoes?: string
}

export interface FinancialSummary {
  receitaTotal: number
  receitaPendente: number
  receitaAtrasada: number
  despesasTotal: number
  saldoMes: number
  ticketMedio: number
  inadimplencia: number // percentual
}

// ===========================================
// MÓDULO DE DOCUMENTOS/TEMPLATES
// ===========================================

export type DocumentType = 'procuracao' | 'contrato' | 'peticao_inicial' | 'contestacao' | 'recurso' | 'acordo' | 'parecer' | 'notificacao'

export interface DocumentTemplate {
  id: string
  tipo: DocumentType
  nome: string
  descricao: string
  conteudo: string
  variaveis: string[]
  areaJuridica: JuridicalArea
  dataCriacao: string
  dataAtualizacao: string
  autor: string
}

export interface GeneratedDocument {
  id: string
  templateId: string
  clienteId: string
  processoId?: string
  nome: string
  conteudoGerado: string
  dataCriacao: string
  criadoPor: string
}

// ===========================================
// MÓDULO DE AUDITORIA (LGPD)
// ===========================================

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'logout'

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: AuditAction
  entity: string
  entityId: string
  entityName: string
  details?: string
  ipAddress?: string
  userAgent?: string
}

export interface UserRole {
  id: string
  nome: string
  permissoes: string[]
}

export interface User {
  id: string
  nome: string
  email: string
  roleId: string
  roleName: string
  ativo: boolean
  ultimoAcesso?: string
}

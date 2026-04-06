import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Client, 
  JudicialProcess, 
  Payment, 
  DocumentTemplate, 
  AuditLog,
  FinancialSummary,
  User,
  UserRole
} from './types'

interface CRMState {
  clients: Client[]
  processes: JudicialProcess[]
  payments: Payment[]
  templates: DocumentTemplate[]
  auditLogs: AuditLog[]
  users: User[]
  roles: UserRole[]
  
  // Actions
  addClient: (client: Client) => void
  addProcess: (process: JudicialProcess) => void
  addPayment: (payment: Payment) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      clients: [],
      processes: [],
      payments: [],
      templates: [],
      auditLogs: [],
      users: [],
      roles: [
        {
          id: 'role-1',
          nome: 'Administrador',
          permissoes: ['all']
        },
        {
          id: 'role-2',
          nome: 'Advogado',
          permissoes: ['clientes.read', 'clientes.write', 'processos.read', 'processos.write', 'documentos.read', 'documentos.write', 'financeiro.read']
        },
        {
          id: 'role-3',
          nome: 'Assistente',
          permissoes: ['clientes.read', 'processos.read', 'documentos.read']
        }
      ],

      addClient: (client) => set((state) => ({ 
        clients: [...state.clients, client] 
      })),
      
      addProcess: (process) => set((state) => ({ 
        processes: [...state.processes, process] 
      })),
      
      addPayment: (payment) => set((state) => ({ 
        payments: [...state.payments, payment] 
      })),
      
      updateClient: (id, updates) => set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c))
      })),
      
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id)
      })),
    }),
    {
      name: 'rullesia-crm-storage',
    }
  )
)

// Helper para manter compatibilidade com código antigo enquanto migramos
export const mockClients: Client[] = []
export const mockProcesses: JudicialProcess[] = []
export const mockPayments: Payment[] = []
export const mockTemplates: DocumentTemplate[] = []
export const mockAuditLogs: AuditLog[] = []
export const mockUsers: User[] = []
export const mockRoles: UserRole[] = []

export function getFinancialSummary(): FinancialSummary {
  const state = useCRMStore.getState()
  const pagos = state.payments.filter(p => p.status === 'pago')
  const pendentes = state.payments.filter(p => p.status === 'pendente')
  const atrasados = state.payments.filter(p => p.status === 'atrasado')
  
  const receitaTotal = pagos.reduce((sum, p) => sum + p.valor, 0)
  const receitaPendente = pendentes.reduce((sum, p) => sum + p.valor, 0)
  const receitaAtrasada = atrasados.reduce((sum, p) => sum + p.valor, 0)
  
  return {
    receitaTotal,
    receitaPendente,
    receitaAtrasada,
    despesasTotal: 15000, 
    saldoMes: receitaTotal - 15000,
    ticketMedio: pagos.length > 0 ? receitaTotal / pagos.length : 0,
    inadimplencia: ((receitaAtrasada) / (receitaTotal + receitaPendente + receitaAtrasada + 0.001)) * 100
  }
}

export function getClientById(id: string): Client | undefined {
  return useCRMStore.getState().clients.find(c => c.id === id)
}

export function getProcessById(id: string): JudicialProcess | undefined {
  return useCRMStore.getState().processes.find(p => p.id === id)
}

export function getProcessesByClient(clientId: string): JudicialProcess[] {
  return useCRMStore.getState().processes.filter(p => p.clienteId === clientId)
}

export function getPaymentsByClient(clientId: string): Payment[] {
  return useCRMStore.getState().payments.filter(p => p.clienteId === clientId)
}

export function getPaymentsByProcess(processId: string): Payment[] {
  return useCRMStore.getState().payments.filter(p => p.processoId === processId)
}

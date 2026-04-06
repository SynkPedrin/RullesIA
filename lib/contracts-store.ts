import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  ContractAnalysis, 
  ProductionCard,
  DashboardStats
} from './types'

interface ContractState {
  contracts: ContractAnalysis[]
  productionCards: ProductionCard[]
  
  // Actions
  addContract: (contract: ContractAnalysis) => void
  updateContract: (id: string, updates: Partial<ContractAnalysis>) => void
  deleteContract: (id: string) => void
  
  // Production actions
  addProductionCard: (card: ProductionCard) => void
  updateProductionCard: (id: string, updates: Partial<ProductionCard>) => void
}

export const useContractStore = create<ContractState>()(
  persist(
    (set) => ({
      contracts: [],
      productionCards: [],

      addContract: (contract) => set((state) => ({
        contracts: [...state.contracts, contract]
      })),

      updateContract: (id, updates) => set((state) => ({
        contracts: state.contracts.map((c) => (c.id === id ? { ...c, ...updates } : c))
      })),

      deleteContract: (id) => set((state) => ({
        contracts: state.contracts.filter((c) => c.id !== id)
      })),

      addProductionCard: (card) => set((state) => ({
        productionCards: [...state.productionCards, card]
      })),

      updateProductionCard: (id, updates) => set((state) => ({
        productionCards: state.productionCards.map((c) => (c.id === id ? { ...c, ...updates } : c))
      })),
    }),
    {
      name: 'rullesia-contract-storage',
    }
  )
)

// Helpers para compatibilidade
export const mockContracts: ContractAnalysis[] = []

export function getDashboardStats(): DashboardStats {
  const state = useContractStore.getState()
  const contracts = state.contracts
  
  return {
    totalContratos: contracts.length,
    contratosEmAnalise: contracts.filter(c => c.status === 'analise').length,
    alertasRisco: contracts.filter(c => c.riscos.some(r => r.nivel === 'alto')).length,
    prazoProximo: contracts.filter(c => c.prazos.some(p => {
      const pDate = new Date(p.data)
      const diff = pDate.getTime() - new Date().getTime()
      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000 // 7 dias
    })).length
  }
}

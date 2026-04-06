import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  name: string
  email: string
  oab: string
  officeName: string
  phone: string
  avatar?: string
}

export interface NotificationSettings {
  prazos: boolean
  riscosAltos: boolean
  resumoDiario: boolean
  emailNotifications: boolean
  antecedenciaPrazos: string // '1', '3', '7', '14'
}

export interface AISettings {
  model: 'gpt-4o' | 'gpt-4o-mini' | 'o3-mini'
  autoAnalyze: boolean
  detectHiddenClauses: boolean
  marketComparison: boolean
  detailLevel: 'resumido' | 'padrao' | 'detalhado'
}

interface SettingsState {
  profile: UserProfile
  notifications: NotificationSettings
  ai: AISettings
  
  // Actions
  updateProfile: (profile: Partial<UserProfile>) => void
  updateNotifications: (notifications: Partial<NotificationSettings>) => void
  updateAI: (ai: Partial<AISettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: {
        name: 'Dr. Advogado',
        email: 'advogado@escritorio.com',
        oab: 'SP 123.456',
        officeName: 'Rulles Associados',
        phone: '(11) 99999-9999',
      },
      notifications: {
        prazos: true,
        riscosAltos: true,
        resumoDiario: false,
        emailNotifications: true,
        antecedenciaPrazos: '3',
      },
      ai: {
        model: 'gpt-4o',
        autoAnalyze: true,
        detectHiddenClauses: true,
        marketComparison: true,
        detailLevel: 'detalhado',
      },
      
      updateProfile: (profile) => set((state) => ({
        profile: { ...state.profile, ...profile }
      })),
      
      updateNotifications: (notifications) => set((state) => ({
        notifications: { ...state.notifications, ...notifications }
      })),
      
      updateAI: (ai) => set((state) => ({
        ai: { ...state.ai, ...ai }
      })),
    }),
    {
      name: 'rullesia-settings-storage',
    }
  )
)

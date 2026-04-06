import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  title: string
  desc: string
  badge: string
  badgeClass: string
  read: boolean
  timestamp: string
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  clearAll: () => void
  unreadCount: () => number
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        { 
          id: '1', 
          badge: "URGENTE", 
          badgeClass: "bg-red-500/20 text-red-400 border-red-500/20", 
          title: "Prazo em 2 dias", 
          desc: "NDA - Startup Innovation: Assinatura até 10/03",
          read: false,
          timestamp: new Date().toISOString()
        },
        { 
          id: '2', 
          badge: "Atenção", 
          badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/20", 
          title: "Cláusula de risco", 
          desc: "Contrato ABC: Multa de 10% identificada",
          read: false,
          timestamp: new Date().toISOString()
        },
      ],
      
      addNotification: (n) => set((state) => ({
        notifications: [
          {
            ...n,
            id: crypto.randomUUID(),
            read: false,
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ]
      })),
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      
      clearAll: () => set({ notifications: [] }),
      
      unreadCount: () => get().notifications.filter(n => !n.read).length
    }),
    {
      name: 'rullesia-notifications-storage',
    }
  )
)

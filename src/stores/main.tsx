import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { getChats } from '@/services/chats'
import { getTasks, updateTaskStatus as pbUpdateTaskStatus } from '@/services/tasks'
import {
  getUserSettings,
  createUserSettings,
  updateUserSettings as pbUpdateUserSettings,
} from '@/services/settings'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

export type ChatCategory = 'Trabalho' | 'Família' | 'Financeiro' | 'Vendas' | 'Outros'
export type TaskStatus = 'Detectada' | 'Em Progresso' | 'Concluída'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  deadline?: string
  chatId: string
  contactName: string
  snippet: string
}

export interface Chat {
  id: string
  contactName: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  category: string
  priority: 'Alta' | 'Média' | 'Baixa'
  summary: string[]
  actionItems: string[]
  suggestedReplies: string[]
  isVip?: boolean
  isGroup?: boolean
  interactionScore?: number
}

interface AppState {
  chats: Chat[]
  tasks: Task[]
  activeChatId: string | null
  setActiveChatId: (id: string | null) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  markChatRead: (id: string) => void
  globalSearch: string
  setGlobalSearch: (query: string) => void
  categoryFilter: ChatCategory | null
  setCategoryFilter: (category: ChatCategory | null) => void
  waConnected: boolean
  setWaConnected: (status: boolean) => void
  waPhoneNumber: string | null
  setWaPhoneNumber: (number: string | null) => void
  lastSync: string | null
  setLastSync: (time: string | null) => void
  aiAggressiveness: number
  setAiAggressiveness: (val: number) => void
  categories: string[]
  setCategories: (val: string[]) => void
  saveSettings: () => Promise<void>
}

export const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [globalSearch, setGlobalSearch] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<ChatCategory | null>(null)

  const [waConnected, setWaConnected] = useState<boolean>(false)
  const [waPhoneNumber, setWaPhoneNumber] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [aiAggressiveness, setAiAggressiveness] = useState<number>(50)
  const [categories, setCategories] = useState<string[]>([
    'Trabalho',
    'Família',
    'Financeiro',
    'Vendas',
  ])
  const [settingsId, setSettingsId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [pbChats, pbTasks, pbSettings] = await Promise.all([
        getChats(),
        getTasks(),
        getUserSettings(user.id),
      ])

      const mappedChats = pbChats.map((c: any) => ({
        id: c.id,
        contactName: c.name,
        avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${c.id}`,
        lastMessage: c.last_message || '',
        timestamp: new Date(c.updated).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        unread: 0,
        category: 'Outros',
        priority: c.priority === 'high' ? 'Alta' : c.priority === 'medium' ? 'Média' : 'Baixa',
        summary: c.summary ? c.summary.split('\n') : [],
        actionItems: [],
        suggestedReplies: [],
      })) as Chat[]
      setChats(mappedChats)
      if (mappedChats.length > 0 && !activeChatId) {
        setActiveChatId(mappedChats[0].id)
      }

      const mappedTasks = pbTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        status:
          t.status === 'detected'
            ? 'Detectada'
            : t.status === 'in_progress'
              ? 'Em Progresso'
              : 'Concluída',
        deadline: t.deadline
          ? new Date(t.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
          : undefined,
        chatId: t.chat,
        contactName: t.expand?.chat?.name || 'Desconhecido',
        snippet: t.description || '',
      })) as Task[]
      setTasks(mappedTasks)

      if (pbSettings) {
        setSettingsId(pbSettings.id)
        setWaConnected(pbSettings.whatsapp_connected)
        setAiAggressiveness(pbSettings.ai_aggressiveness)
        setCategories(pbSettings.categories || ['Trabalho', 'Família', 'Financeiro', 'Vendas'])
      } else {
        const newSettings = await createUserSettings({
          user: user.id,
          whatsapp_connected: false,
          ai_aggressiveness: 50,
          categories: ['Trabalho', 'Família', 'Financeiro', 'Vendas'],
        })
        setSettingsId(newSettings.id)
      }
    } catch (e) {
      console.error('Failed to load data', e)
    }
  }, [user, activeChatId])

  useEffect(() => {
    if (user) loadData()
    else {
      setChats([])
      setTasks([])
      setSettingsId(null)
    }
  }, [user, loadData])

  useRealtime(
    'chats',
    () => {
      loadData()
    },
    !!user,
  )
  useRealtime(
    'tasks',
    () => {
      loadData()
    },
    !!user,
  )
  useRealtime(
    'user_settings',
    () => {
      loadData()
    },
    !!user,
  )

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    const pbStatus =
      status === 'Detectada' ? 'detected' : status === 'Em Progresso' ? 'in_progress' : 'completed'
    try {
      await pbUpdateTaskStatus(id, pbStatus)
    } catch (e) {
      loadData()
    }
  }

  const markChatRead = (id: string) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  const saveSettings = async () => {
    if (settingsId) {
      await pbUpdateUserSettings(settingsId, {
        whatsapp_connected: waConnected,
        ai_aggressiveness: aiAggressiveness,
        categories: categories,
      })
    }
  }

  return (
    <AppContext.Provider
      value={{
        chats,
        tasks,
        activeChatId,
        setActiveChatId,
        updateTaskStatus,
        markChatRead,
        globalSearch,
        setGlobalSearch,
        categoryFilter,
        setCategoryFilter,
        waConnected,
        setWaConnected,
        waPhoneNumber,
        setWaPhoneNumber,
        lastSync,
        setLastSync,
        aiAggressiveness,
        setAiAggressiveness,
        categories,
        setCategories,
        saveSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppStore = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return ctx
}

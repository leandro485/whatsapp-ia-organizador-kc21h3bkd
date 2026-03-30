import React, { createContext, useContext, useState, ReactNode } from 'react'

export type ChatCategory = 'Trabalho' | 'Família' | 'Financeiro' | 'Vendas' | 'Outros'
export type TaskStatus = 'Detectada' | 'Em Progresso' | 'Agendada' | 'Concluída'

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
  category: ChatCategory
  priority: 'Alta' | 'Média' | 'Baixa'
  summary: string[]
  actionItems: string[]
  suggestedReplies: string[]
  isVip?: boolean
  isGroup?: boolean
  interactionScore?: number
}

const MOCK_CHATS: Chat[] = [
  {
    id: 'c1',
    contactName: 'Carlos (Tech Lead)',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=15',
    lastMessage: 'A API de pagamentos está falhando em produção, preciso de um hotfix urgente.',
    timestamp: '10:42 AM',
    unread: 2,
    category: 'Trabalho',
    priority: 'Alta',
    summary: ['Falha crítica na API de pagamentos', 'Necessário deploy de hotfix urgente'],
    actionItems: [
      'Investigar logs do gateway de pagamento',
      'Avisar equipe de CS sobre instabilidade',
    ],
    suggestedReplies: [
      'Estou verificando os logs agora.',
      'Hotfix em andamento, aviso quando subir.',
    ],
    isVip: true,
    interactionScore: 95,
  },
  {
    id: 'c2',
    contactName: 'Cliente XPTO',
    avatar: 'https://img.usecurling.com/i?q=company+logo&shape=outline&color=blue',
    lastMessage: 'Podemos agendar a reunião de kickoff para amanhã às 14h?',
    timestamp: 'Ontem',
    unread: 1,
    category: 'Vendas',
    priority: 'Média',
    summary: ['Cliente solicitou reunião de kickoff', 'Sugerido amanhã às 14h'],
    actionItems: ['Enviar invite do Zoom para kickoff'],
    suggestedReplies: ['Claro, vou enviar o convite.', 'As 14h não consigo, pode ser às 15h?'],
    isGroup: false,
    interactionScore: 80,
  },
  {
    id: 'c3',
    contactName: 'Família Silva',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=8',
    lastMessage: 'Não esqueçam de confirmar quem vai no churrasco domingo.',
    timestamp: 'Ontem',
    unread: 14,
    category: 'Família',
    priority: 'Baixa',
    summary: ['Churrasco no domingo', 'Tia Maria vai levar a sobremesa'],
    actionItems: ['Confirmar presença no churrasco'],
    suggestedReplies: ['Confirmado!', 'Infelizmente não poderei ir.'],
    isGroup: true,
    interactionScore: 40,
  },
  {
    id: 'c4',
    contactName: 'Gerente do Banco',
    avatar: 'https://img.usecurling.com/i?q=bank&shape=fill&color=gray',
    lastMessage: 'A taxa de juros do financiamento foi aprovada, preciso da sua assinatura.',
    timestamp: 'Segunda',
    unread: 0,
    category: 'Financeiro',
    priority: 'Alta',
    summary: [
      'Taxa de juros do financiamento aprovada',
      'Necessário assinar contrato presencialmente',
    ],
    actionItems: ['Ir à agência para assinar contrato'],
    suggestedReplies: ['Perfeito, passo aí amanhã.', 'Qual o horário de funcionamento?'],
    isVip: true,
    isGroup: false,
    interactionScore: 88,
  },
]

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Investigar falha na API',
    status: 'Em Progresso',
    deadline: 'Hoje, 12:00',
    chatId: 'c1',
    contactName: 'Carlos (Tech Lead)',
    snippet: 'A API de pagamentos está falhando...',
  },
  {
    id: 't2',
    title: 'Enviar invite de Kickoff',
    status: 'Detectada',
    deadline: 'Amanhã, 14:00',
    chatId: 'c2',
    contactName: 'Cliente XPTO',
    snippet: 'Podemos agendar a reunião...',
  },
  {
    id: 't3',
    title: 'Assinar contrato financiamento',
    status: 'Agendada',
    deadline: 'Sexta, 10:00',
    chatId: 'c4',
    contactName: 'Gerente do Banco',
    snippet: 'A taxa de juros do financiamento foi aprovada...',
  },
]

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
}

export const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS)
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [activeChatId, setActiveChatId] = useState<string | null>(MOCK_CHATS[0].id)
  const [globalSearch, setGlobalSearch] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<ChatCategory | null>(null)
  const [waConnected, setWaConnected] = useState<boolean>(false)
  const [waPhoneNumber, setWaPhoneNumber] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  const markChatRead = (id: string) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
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

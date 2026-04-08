import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useRealtime } from '@/hooks/use-realtime'
import { getTasks } from '@/services/tasks'
import { getChats } from '@/services/chats'
import { ensureUserSettings } from '@/services/settings'
import { useAuth } from '@/hooks/use-auth'
import {
  MessageSquare,
  Clock,
  ListTodo,
  Search,
  CalendarIcon,
  PieChart,
  Filter,
  Pin,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { updateChatPinned } from '@/services/chats'

export default function Index() {
  const [tasks, setTasks] = useState<any[]>([])
  const [chats, setChats] = useState<any[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const { toast } = useToast()
  const { user } = useAuth()

  const loadData = async () => {
    try {
      if (user?.id) {
        try {
          await ensureUserSettings(user.id)
        } catch (settingsErr) {
          console.error('Failed to initialize settings:', settingsErr)
          toast({
            variant: 'destructive',
            title: 'Aviso',
            description:
              'Não foi possível carregar as configurações. Algumas funcionalidades podem estar indisponíveis.',
          })
        }
      }

      const [fetchedTasks, fetchedChats] = await Promise.all([getTasks(), getChats()])
      setTasks(fetchedTasks)
      setChats(fetchedChats)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
      toast({
        variant: 'destructive',
        title: 'Erro de Conexão',
        description: 'Ocorreu um problema ao carregar os dados do painel.',
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('tasks', () => loadData())
  useRealtime('chats', () => loadData())

  const handleTogglePin = async (chat: any) => {
    try {
      await updateChatPinned(chat.id, !chat.pinned)
      toast({
        title: chat.pinned ? 'Chat desfixado' : 'Chat fixado',
        description: `A conversa com ${chat.name} foi ${chat.pinned ? 'removida' : 'adicionada'} ao topo.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível alterar o status do chat.',
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return 'N/A'
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (
      searchTerm &&
      !t.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    if (dateRange?.from) {
      if (!t.deadline) return false
      const d = new Date(t.deadline)
      if (d < dateRange.from) return false
      if (dateRange.to && d > new Date(dateRange.to.setHours(23, 59, 59))) return false
    }
    return true
  })

  const detectedCount = tasks.filter((t) => t.status === 'detected').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const totalTasks = tasks.length || 1

  const highCount = tasks.filter((t) => t.priority === 'high').length
  const medCount = tasks.filter((t) => t.priority === 'medium').length
  const lowCount = tasks.filter((t) => t.priority === 'low').length
  const noneCount = tasks.length - (highCount + medCount + lowCount)

  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)

  const recentTasks = tasks.filter((t) => t.created && new Date(t.created) >= last7Days).slice(0, 5)
  const recentChatsWithSummary = chats
    .filter((c) => c.updated && new Date(c.updated) >= last7Days && c.summary)
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Painel Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize sua produtividade e o volume de mensagens gerenciados pela IA.
          </p>
        </div>
      </div>

      <Card className="col-span-1 md:col-span-3 shadow-sm border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            Resumo da Semana
          </CardTitle>
          <CardDescription>
            Um resumo rápido (TL;DR) das suas atividades nos últimos 7 dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-muted-foreground" /> Principais Tarefas
              </h3>
              {recentTasks.length > 0 ? (
                <ul className="space-y-2">
                  {recentTasks.map((t) => (
                    <li key={t.id} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span className="line-clamp-2">{t.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground/70">Nenhuma tarefa recente.</p>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" /> Destaques de Conversas
              </h3>
              {recentChatsWithSummary.length > 0 ? (
                <ul className="space-y-2">
                  {recentChatsWithSummary.map((c) => (
                    <li key={c.id} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span className="line-clamp-2">
                        <strong className="font-medium text-foreground">{c.name}:</strong>{' '}
                        {c.summary}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground/70">
                  Nenhum resumo de conversa recente.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-3 shadow-sm border-muted">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Insights de Produtividade
          </CardTitle>
          <CardDescription>Distribuição global das tarefas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Por Status</span>
                <span className="text-muted-foreground">{tasks.length} total</span>
              </div>
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-secondary">
                <div
                  className="bg-green-500"
                  style={{ width: `${(completedCount / totalTasks) * 100}%` }}
                  title="Concluídas"
                />
                <div
                  className="bg-yellow-500"
                  style={{ width: `${(inProgressCount / totalTasks) * 100}%` }}
                  title="Em Andamento"
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${(detectedCount / totalTasks) * 100}%` }}
                  title="Detectadas"
                />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Concluídas (
                  {completedCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" /> Em Andamento (
                  {inProgressCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Detectadas ({detectedCount})
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Por Prioridade</span>
              </div>
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-secondary">
                <div
                  className="bg-red-500"
                  style={{ width: `${(highCount / totalTasks) * 100}%` }}
                />
                <div
                  className="bg-yellow-500"
                  style={{ width: `${(medCount / totalTasks) * 100}%` }}
                />
                <div
                  className="bg-green-500"
                  style={{ width: `${(lowCount / totalTasks) * 100}%` }}
                />
                <div
                  className="bg-slate-300 dark:bg-slate-600"
                  style={{ width: `${(noneCount / totalTasks) * 100}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Alta ({highCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" /> Média ({medCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Baixa ({lowCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Sem
                  Prioridade ({noneCount})
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5" /> Tarefas Filtradas
              </CardTitle>
              <Badge variant="secondary">{filteredTasks.length} resultados</Badge>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-8 justify-start text-left font-normal flex-1 sm:flex-none',
                        !dateRange && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, 'dd/MM/yy')} - ${format(dateRange.to, 'dd/MM/yy')}`
                        ) : (
                          format(dateRange.from, 'dd/MM/yy')
                        )
                      ) : (
                        <span>Filtrar Data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="detected">Detectada</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-8 w-[130px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {filteredTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Filter className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Nenhuma tarefa encontrada com os filtros atuais.</p>
                  </div>
                )}
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col border rounded-lg p-3 hover:bg-muted/50 transition-colors gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm pr-4 line-clamp-1">{task.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.priority && (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${getPriorityColor(task.priority)}`}
                          >
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {task.status === 'in_progress'
                            ? 'Em Andamento'
                            : task.status === 'completed'
                              ? 'Concluída'
                              : 'Detectada'}
                        </Badge>
                      </div>
                    </div>
                    {task.deadline && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(task.deadline), 'dd/MM/yyyy HH:mm')}
                      </p>
                    )}
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Chats Recentes
            </CardTitle>
            <CardDescription>Últimas conversas sincronizadas do Gateway.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {chats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum chat encontrado.
                  </p>
                )}
                {chats.slice(0, 10).map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      'flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 rounded-md p-2 -mx-2 transition-colors',
                      chat.pinned && 'bg-muted/50',
                    )}
                  >
                    <div className="flex-1 space-y-1 overflow-hidden pr-4">
                      <p className="font-medium text-sm truncate flex items-center gap-2">
                        {chat.name}
                        {chat.pinned && (
                          <Pin className="w-3 h-3 text-primary fill-current shrink-0" />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {chat.last_message || 'Nenhuma mensagem'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {chat.priority && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${getPriorityColor(chat.priority)}`}
                        >
                          {getPriorityLabel(chat.priority)}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTogglePin(chat)}
                        title={chat.pinned ? 'Desfixar' : 'Fixar no topo'}
                      >
                        <Pin
                          className={cn(
                            'w-4 h-4',
                            chat.pinned ? 'fill-primary text-primary' : 'text-muted-foreground',
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

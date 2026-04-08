import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRealtime } from '@/hooks/use-realtime'
import { getTasks } from '@/services/tasks'
import { getChats } from '@/services/chats'
import { MessageSquare, CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react'

export default function Index() {
  const [tasks, setTasks] = useState<any[]>([])
  const [chats, setChats] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [fetchedTasks, fetchedChats] = await Promise.all([getTasks(), getChats()])
      setTasks(fetchedTasks)
      setChats(fetchedChats)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('tasks', () => loadData())
  useRealtime('chats', () => loadData())

  const detectedCount = tasks.filter((t) => t.status === 'detected').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Detectadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detectedCount}</div>
            <p className="text-xs text-muted-foreground">Aguardando ação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Sendo resolvidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Total finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Chats Recentes
            </CardTitle>
            <CardDescription>Últimas conversas sincronizadas.</CardDescription>
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
                    className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1 overflow-hidden pr-4">
                      <p className="font-medium text-sm truncate">{chat.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {chat.last_message || 'Nenhuma mensagem'}
                      </p>
                    </div>
                    {chat.priority && (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] shrink-0 ${getPriorityColor(chat.priority)}`}
                      >
                        {getPriorityLabel(chat.priority)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5" /> Tarefas Ativas
            </CardTitle>
            <CardDescription>Resumo de tarefas detectadas pela IA.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {tasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma tarefa encontrada.
                  </p>
                )}
                {tasks
                  .filter((t) => t.status !== 'completed')
                  .slice(0, 10)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col border-b pb-4 last:border-0 last:pb-0 gap-2"
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm pr-4">{task.title}</p>
                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                          {task.status === 'in_progress' ? 'Em Andamento' : 'Detectada'}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
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

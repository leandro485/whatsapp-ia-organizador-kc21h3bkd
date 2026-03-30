import { MessageSquare, CheckSquare, Clock, Wifi } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/main'

export default function MetricsOverview() {
  const { chats, tasks, waConnected } = useAppStore()

  const completedTasks = tasks.filter((t) => t.status === 'Concluída').length
  const savedTime = (tasks.length * 0.25).toFixed(1) // 15 mins per task

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{chats.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Sincronizadas com o banco</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas Criadas</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasks.length}</div>
          <p className="text-xs text-muted-foreground mt-1">{completedTasks} concluídas no total</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{savedTime}h</div>
          <p className="text-xs text-muted-foreground mt-1">Estimativa de 15min/tarefa</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status da Conexão</CardTitle>
          <Wifi className={`h-4 w-4 ${waConnected ? 'text-emerald-500' : 'text-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            WhatsApp
            <Badge
              variant="outline"
              className={
                waConnected
                  ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10 h-5 px-1.5 text-[10px] font-semibold uppercase'
                  : 'text-red-600 border-red-500/30 bg-red-500/10 h-5 px-1.5 text-[10px] font-semibold uppercase'
              }
            >
              {waConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Gerenciado nas Configurações</p>
        </CardContent>
      </Card>
    </div>
  )
}

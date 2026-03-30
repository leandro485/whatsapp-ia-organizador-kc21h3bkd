import { Bot, CheckSquare, MessageSquare, FileText, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

const activities = [
  {
    id: 1,
    type: 'summary',
    icon: FileText,
    title: 'Resumo gerado para João Silva',
    time: 'Há 5 minutos',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 2,
    type: 'task',
    icon: CheckSquare,
    title: 'Nova tarefa adicionada: "Revisar contrato"',
    time: 'Há 12 minutos',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 3,
    type: 'message',
    icon: MessageSquare,
    title: 'Mensagem urgente de Cliente VIP',
    time: 'Há 30 minutos',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    id: 4,
    type: 'summary',
    icon: FileText,
    title: 'Resumo do Grupo "Marketing Team"',
    time: 'Há 1 hora',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 5,
    type: 'system',
    icon: Bot,
    title: 'IA concluiu organização diária',
    time: 'Há 2 horas',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
]

export default function RecentActivity() {
  return (
    <Card className="h-full flex flex-col shadow-sm">
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          Atividades Recentes da IA
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
          Ver todas <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[300px] w-full">
          <div className="flex flex-col">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors flex items-start gap-4 group"
              >
                <div
                  className={`mt-0.5 flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${activity.bgColor} ${activity.color}`}
                >
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

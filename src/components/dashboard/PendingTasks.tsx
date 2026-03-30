import { CheckCircle2, MoreHorizontal } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/stores/main'
import { Button } from '@/components/ui/button'

export default function PendingTasks() {
  const { tasks, updateTaskStatus } = useAppStore()
  const pendingTasks = tasks
    .filter((t) => t.status === 'Detectada' || t.status === 'Em Progresso')
    .slice(0, 4)

  return (
    <Card className="h-full flex flex-col shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Tarefas Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        {pendingTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma tarefa pendente
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 group">
                <button
                  onClick={() => updateTaskStatus(task.id, 'Concluída')}
                  className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-md border-2 border-muted-foreground/30 flex items-center justify-center group-hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <div className="h-3 w-3 bg-primary rounded-sm opacity-0 group-hover:opacity-50 transition-opacity" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground truncate">
                      {task.contactName}
                    </span>
                    {task.deadline && (
                      <>
                        <span className="text-xs text-muted-foreground/50">•</span>
                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium">
                          {task.deadline}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

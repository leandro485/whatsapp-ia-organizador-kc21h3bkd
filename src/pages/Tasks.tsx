import { useAppStore, TaskStatus } from '@/stores/main'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MessageSquare, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COLUMNS: TaskStatus[] = ['Detectada', 'Em Progresso', 'Agendada', 'Concluída']

export default function Tasks() {
  const { tasks } = useAppStore()

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            Extraídas automaticamente das suas conversas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" /> Visualização Calendário
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-start">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column)

          return (
            <div
              key={column}
              className="bg-muted/40 rounded-xl p-4 flex flex-col h-full max-h-full overflow-hidden border border-border/50"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-sm">{column}</h3>
                <Badge variant="secondary" className="bg-background">
                  {columnTasks.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto pb-2">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-grab hover:shadow-md transition-all border-border/60"
                  >
                    <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
                      <CardTitle className="text-sm font-medium leading-tight pr-4">
                        {task.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 -mr-2 text-muted-foreground"
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <div className="bg-muted/50 p-2 rounded-md mb-3 border border-border/50">
                        <p className="text-xs text-muted-foreground italic line-clamp-2">
                          "{task.snippet}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 font-medium text-foreground/70">
                          <MessageSquare className="h-3 w-3" />
                          {task.contactName}
                        </div>
                        {task.deadline && (
                          <span
                            className={
                              task.status === 'Detectada' ? 'text-warning font-medium' : ''
                            }
                          >
                            {task.deadline}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="p-4 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground text-xs mt-2">
                    Nenhuma tarefa
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

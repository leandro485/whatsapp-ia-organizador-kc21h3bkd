import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MessageSquare, GripVertical, Download, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTasks, updateTaskStatus as updatePbTaskStatus } from '@/services/tasks'
import { useRealtime } from '@/hooks/use-realtime'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

type TaskStatus = 'Detectada' | 'Em Progresso' | 'Concluída'
const COLUMNS: TaskStatus[] = ['Detectada', 'Em Progresso', 'Concluída']

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const { toast } = useToast()

  const loadTasks = useCallback(async () => {
    try {
      const pbTasks = await getTasks()
      setTasks(
        pbTasks.map((t) => ({
          id: t.id,
          title: t.title,
          snippet: t.description || 'Sem descrição',
          contactName: t.expand?.chat?.name || 'Sistema',
          deadline: t.deadline ? new Date(t.deadline).toLocaleDateString() : undefined,
          rawDeadline: t.deadline,
          status:
            t.status === 'detected'
              ? 'Detectada'
              : t.status === 'in_progress'
                ? 'Em Progresso'
                : 'Concluída',
        })),
      )
    } catch (err) {
      console.error('Failed to load tasks', err)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useRealtime('tasks', () => {
    loadTasks()
  })

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      const pbStatus =
        status === 'Detectada'
          ? 'detected'
          : status === 'Em Progresso'
            ? 'in_progress'
            : 'completed'
      await updatePbTaskStatus(taskId, pbStatus)
      loadTasks()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast({
        title: 'Erro de Exportação',
        description: 'Não há tarefas para exportar.',
        variant: 'destructive',
      })
      return
    }

    const headers = ['Título', 'Status', 'Prazo', 'Descrição', 'Contato']
    const rows = tasks.map((t) => [
      `"${t.title?.replace(/"/g, '""') || ''}"`,
      `"${t.status}"`,
      `"${t.deadline || ''}"`,
      `"${t.snippet?.replace(/"/g, '""') || ''}"`,
      `"${t.contactName?.replace(/"/g, '""') || ''}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    // Adiciona BOM para que o Excel abra UTF-8 corretamente
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'tarefas.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getCalendarUrls = (task: any) => {
    const start = task.rawDeadline ? new Date(task.rawDeadline) : new Date()
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    const title = encodeURIComponent(task.title || 'Nova Tarefa')
    const desc = encodeURIComponent(task.snippet || '')

    const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')
    const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${desc}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}`

    const formatOutlookDate = (d: Date) => d.toISOString()
    const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&body=${desc}&startdt=${formatOutlookDate(start)}&enddt=${formatOutlookDate(end)}`

    return { google, outlook }
  }

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
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
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

              <div
                className="flex flex-col gap-3 overflow-y-auto pb-2 min-h-[100px]"
                onDrop={(e) => handleDrop(e, column)}
                onDragOver={handleDragOver}
              >
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab hover:shadow-md transition-all border-border/60"
                  >
                    <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
                      <CardTitle className="text-sm font-medium leading-tight pr-4">
                        {task.title}
                      </CardTitle>
                      <div className="flex items-center gap-1 -mr-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-primary"
                            >
                              <CalendarPlus className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => window.open(getCalendarUrls(task).google, '_blank')}
                            >
                              Google Calendar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(getCalendarUrls(task).outlook, '_blank')}
                            >
                              Outlook
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground cursor-grab"
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </div>
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

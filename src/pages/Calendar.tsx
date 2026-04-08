import { useState, useEffect, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTasks, updateTaskStatus } from '@/services/tasks'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
    } catch (err) {
      console.error('Failed to load tasks', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('tasks', () => loadData())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentDate])

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTask) return
    try {
      await updateTaskStatus(selectedTask.id, status)
      setSelectedTask({ ...selectedTask, status })
      toast({ title: 'Status atualizado', description: 'A tarefa foi atualizada com sucesso.' })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" /> Calendário
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize e gerencie as datas de entrega das suas tarefas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="w-32 text-center font-medium capitalize">
            {format(currentDate, 'MM/yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col overflow-auto min-h-[500px]">
          <div className="grid grid-cols-7 gap-px bg-border flex-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div key={d} className="bg-muted p-2 text-center text-sm font-semibold sticky top-0">
                {d}
              </div>
            ))}
            {days.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())
              const dayTasks = tasks.filter(
                (t) => t.deadline && isSameDay(new Date(t.deadline), day),
              )

              return (
                <div
                  key={idx}
                  className={cn(
                    'bg-background min-h-[120px] p-2 flex flex-col gap-1 border-b border-r border-border/50',
                    !isCurrentMonth && 'text-muted-foreground bg-muted/30',
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1',
                      isToday ? 'bg-primary text-primary-foreground' : '',
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[150px] pr-1">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className={cn(
                          'text-xs p-1.5 rounded truncate cursor-pointer transition-colors border-l-2',
                          t.status === 'completed'
                            ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-400'
                            : t.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
                          'hover:opacity-80',
                        )}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes da Tarefa</SheetTitle>
            <SheetDescription>Gerencie o status e visualize as informações.</SheetDescription>
          </SheetHeader>
          {selectedTask && (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Título</Label>
                <p className="font-medium text-base">{selectedTask.title}</p>
              </div>

              {selectedTask.description && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Prazo
                </Label>
                <p className="text-sm">
                  {selectedTask.deadline
                    ? format(new Date(selectedTask.deadline), 'dd/MM/yyyy HH:mm')
                    : 'Sem prazo definido'}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Status da Tarefa</Label>
                <Select value={selectedTask.status} onValueChange={handleUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detected">Detectada</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTask.priority && (
                <div className="space-y-1 mt-4">
                  <Label className="text-xs text-muted-foreground">Prioridade</Label>
                  <div>
                    <Badge variant="outline" className="capitalize">
                      {selectedTask.priority === 'high'
                        ? 'Alta'
                        : selectedTask.priority === 'medium'
                          ? 'Média'
                          : 'Baixa'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

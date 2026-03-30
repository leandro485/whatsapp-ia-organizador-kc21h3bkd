import { Bot, CheckSquare, Sparkles, Send, Tag } from 'lucide-react'
import { useAppStore } from '@/stores/main'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function AiSidebar({ className }: { className?: string }) {
  const { chats, activeChatId } = useAppStore()
  const activeChat = chats.find((c) => c.id === activeChatId)

  if (!activeChat) {
    return (
      <div
        className={`flex flex-col bg-slate-50 items-center justify-center p-6 text-center ${className}`}
      >
        <Bot className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">
          Selecione uma conversa para ver a análise da IA.
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col bg-slate-50/50 dark:bg-card border-l ${className}`}>
      <div className="p-4 border-b shrink-0 flex items-center gap-2 bg-background">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Análise Inteligente</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Metadata */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1 uppercase tracking-wider">
              <Tag className="h-3 w-3" /> Metadados
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Prioridade {activeChat.priority}
              </Badge>
              <Badge variant="outline">{activeChat.category}</Badge>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Resumo da Conversa
            </h4>
            <ul className="space-y-2">
              {activeChat.summary.map((item, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Action Items */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1 uppercase tracking-wider">
              <CheckSquare className="h-3 w-3" /> Tarefas Identificadas
            </h4>
            {activeChat.actionItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa detectada.</p>
            ) : (
              <div className="space-y-2">
                {activeChat.actionItems.map((item, i) => (
                  <Card key={i} className="p-3 bg-background shadow-sm border border-border/50">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-muted-foreground/30 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Suggested Replies */}
      <div className="p-4 border-t bg-background shrink-0">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Respostas Sugeridas
        </h4>
        <div className="flex flex-col gap-2">
          {activeChat.suggestedReplies.map((reply, i) => (
            <Button
              key={i}
              variant="outline"
              className="justify-start h-auto py-2 px-3 text-left font-normal text-sm bg-muted/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30 group transition-all"
            >
              <span className="truncate flex-1">{reply}</span>
              <Send className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

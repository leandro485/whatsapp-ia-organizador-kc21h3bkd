import { Bot, Sparkles, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function SummaryCard() {
  return (
    <Card className="border-none shadow-sm bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary p-3 shadow-sm shadow-primary/20 mt-1">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">Resumo Diário da IA</h2>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Nas últimas 24 horas, você recebeu{' '}
              <strong className="text-foreground">142 mensagens</strong> em 12 conversas.
              <strong className="text-warning"> 3 tarefas urgentes</strong> foram detectadas e 1
              prazo foi perdido. O grupo de <strong className="text-foreground">Vendas</strong> teve
              a maior atividade, focado em metas do trimestre.
            </p>
            <div className="flex items-center gap-4 pt-4 text-sm font-medium">
              <div className="flex items-center gap-1.5 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span>+12% volume hoje</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Tempo médio de resposta: 14 min</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

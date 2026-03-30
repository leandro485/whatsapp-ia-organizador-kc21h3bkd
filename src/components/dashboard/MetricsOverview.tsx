import { MessageSquare, CheckSquare, Clock, Wifi } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function MetricsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1.284</div>
          <p className="text-xs text-muted-foreground mt-1">+12% em relação à semana passada</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas Criadas</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45</div>
          <p className="text-xs text-muted-foreground mt-1">12 concluídas esta semana</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12.5h</div>
          <p className="text-xs text-muted-foreground mt-1">Estimativa nesta semana</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status da Conexão</CardTitle>
          <Wifi className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            WhatsApp
            <Badge
              variant="outline"
              className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/10 h-5 px-1.5 text-[10px] font-semibold tracking-wider uppercase"
            >
              Online
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Sincronizado há 2 minutos</p>
        </CardContent>
      </Card>
    </div>
  )
}

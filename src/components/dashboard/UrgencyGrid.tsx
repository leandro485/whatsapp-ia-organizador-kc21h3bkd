import { AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const URGENT_ITEMS = [
  {
    id: 1,
    title: 'Falha crítica na API',
    contact: 'Carlos (Tech Lead)',
    time: 'Há 45 min',
    type: 'critical',
  },
  {
    id: 2,
    title: 'Revisão de contrato XPTO',
    contact: 'Diretoria Vendas',
    time: 'Atrasado 2h',
    type: 'warning',
  },
]

export default function UrgencyGrid() {
  return (
    <Card className="h-full flex flex-col shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          Ação Imediata Necessária
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <div className="flex flex-col">
          {URGENT_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors flex items-start gap-3 group"
            >
              <Avatar className="h-9 w-9 border">
                <AvatarFallback>{item.contact[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm truncate">{item.contact}</span>
                  <Badge
                    variant={item.type === 'critical' ? 'destructive' : 'secondary'}
                    className={
                      item.type === 'warning'
                        ? 'bg-warning text-warning-foreground hover:bg-warning/80'
                        : ''
                    }
                  >
                    {item.type === 'critical' ? 'Crítico' : 'Atrasado'}
                  </Badge>
                </div>
                <p className="text-sm text-foreground truncate mb-2">{item.title}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Responder <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

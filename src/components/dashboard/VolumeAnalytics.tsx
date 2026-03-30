import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { date: 'Seg', messages: 120 },
  { date: 'Ter', messages: 150 },
  { date: 'Qua', messages: 180 },
  { date: 'Qui', messages: 140 },
  { date: 'Sex', messages: 210 },
  { date: 'Sáb', messages: 80 },
  { date: 'Dom', messages: 60 },
]

const chartConfig = {
  messages: {
    label: 'Mensagens',
    color: 'hsl(var(--primary))',
  },
}

export default function VolumeAnalytics() {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Volume de Mensagens (Últimos 7 dias)
        </CardTitle>
        <CardDescription>Tendência de mensagens recebidas e processadas pela IA.</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-messages)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-messages)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{
                stroke: 'hsl(var(--muted-foreground)/0.2)',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
            />
            <Area
              type="monotone"
              dataKey="messages"
              stroke="var(--color-messages)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMessages)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

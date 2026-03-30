import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { category: 'Trabalho', messages: 120 },
  { category: 'Família', messages: 45 },
  { category: 'Financeiro', messages: 25 },
  { category: 'Vendas', messages: 85 },
  { category: 'Outros', messages: 15 },
]

const chartConfig = {
  messages: {
    label: 'Mensagens',
    color: 'hsl(var(--primary))',
  },
}

export default function ActivityChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Volume por Categoria (Hoje)</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="category"
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
              cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
            />
            <Bar
              dataKey="messages"
              fill="var(--color-messages)"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

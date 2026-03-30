import { Pie, PieChart } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { name: 'Trabalho', value: 45, fill: 'var(--color-Trabalho)' },
  { name: 'Pessoal', value: 25, fill: 'var(--color-Pessoal)' },
  { name: 'Financeiro', value: 15, fill: 'var(--color-Financeiro)' },
  { name: 'Urgente', value: 10, fill: 'var(--color-Urgente)' },
  { name: 'Outros', value: 5, fill: 'var(--color-Outros)' },
]

const chartConfig = {
  value: { label: 'Mensagens' },
  Trabalho: { label: 'Trabalho', color: 'hsl(var(--primary))' },
  Pessoal: { label: 'Pessoal', color: 'hsl(var(--chart-2, 160 60% 45%))' },
  Financeiro: { label: 'Financeiro', color: 'hsl(var(--chart-3, 30 80% 55%))' },
  Urgente: { label: 'Urgente', color: 'hsl(var(--destructive))' },
  Outros: { label: 'Outros', color: 'hsl(var(--muted-foreground, 215 16% 47%))' },
}

export default function CategoryDistribution() {
  return (
    <Card className="h-full shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Distribuição por Categoria</CardTitle>
        <CardDescription>Classificação da IA nas últimas 24h.</CardDescription>
      </CardHeader>
      <CardContent className="pb-4 flex-1 flex flex-col justify-center">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: chartConfig[entry.name as keyof typeof chartConfig].color,
                }}
              />
              <span className="text-muted-foreground font-medium">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

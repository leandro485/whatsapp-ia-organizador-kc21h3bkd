import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste o comportamento da IA e da integração.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comportamento da IA</CardTitle>
          <CardDescription>
            Personalize como a inteligência artificial analisa suas mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Geração de Tarefas Automática</Label>
              <p className="text-sm text-muted-foreground">
                Criar tarefas automaticamente quando prazos forem detectados.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Resumo Diário</Label>
              <p className="text-sm text-muted-foreground">
                Receber um resumo por mensagem toda manhã às 08:00.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base">Agressividade da IA</Label>
            <p className="text-sm text-muted-foreground">
              Define o quão rigorosa a IA será ao classificar mensagens como urgentes.
            </p>
            <Select defaultValue="balanced">
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relaxed">Relaxada (Menos alertas)</SelectItem>
                <SelectItem value="balanced">Balanceada (Recomendado)</SelectItem>
                <SelectItem value="strict">Rigorosa (Qualquer prazo é urgente)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar Alterações</Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Smartphone,
  RefreshCcw,
  Plus,
  Shield,
  Bell,
  Bot,
  Settings2,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react'

export default function Settings() {
  const { toast } = useToast()
  const [categories, setCategories] = useState(['Trabalho', 'Família', 'Financeiro', 'Vendas'])
  const [newCategory, setNewCategory] = useState('')
  const [waConnected, setWaConnected] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sliderValue, setSliderValue] = useState([50])

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat))
  }

  const handleSave = () => {
    toast({
      title: 'Configurações salvas',
      description: 'Suas preferências foram atualizadas com sucesso.',
    })
  }

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      toast({
        title: 'Sincronização concluída',
        description: 'Suas mensagens foram atualizadas com o WhatsApp.',
      })
    }, 2000)
  }

  const getAgressivenessLabel = (val: number) => {
    if (val < 30) return 'Relaxada'
    if (val > 70) return 'Rigorosa'
    return 'Balanceada'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas preferências de IA, privacidade e integrações.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1 mb-4 p-1">
          <TabsTrigger value="general" className="py-2 text-xs sm:text-sm">
            Geral
          </TabsTrigger>
          <TabsTrigger value="ai" className="py-2 text-xs sm:text-sm">
            Inteligência
          </TabsTrigger>
          <TabsTrigger value="privacy" className="py-2 text-xs sm:text-sm">
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="notifications" className="py-2 text-xs sm:text-sm">
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5 text-primary" />
                Integração WhatsApp
              </CardTitle>
              <CardDescription>
                Gerencie a conexão da sua conta do WhatsApp com o Hub Inteligente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${waConnected ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                  >
                    {waConnected ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{waConnected ? 'Conectado' : 'Desconectado'}</p>
                    <p className="text-sm text-muted-foreground">
                      {waConnected ? '+55 11 99999-9999' : 'Nenhuma conta vinculada'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    disabled={!waConnected || isSyncing}
                    className="flex-1 sm:flex-none"
                  >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </Button>
                  <Button
                    variant={waConnected ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => setWaConnected(!waConnected)}
                    className="flex-1 sm:flex-none"
                  >
                    {waConnected ? 'Desconectar' : 'Conectar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                Categorias e Workspaces
              </CardTitle>
              <CardDescription>
                Personalize as etiquetas usadas para agrupar suas conversas automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="px-3 py-1 text-sm flex items-center gap-1"
                  >
                    {cat}
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="hover:text-destructive transition-colors focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm pt-2">
                <Input
                  placeholder="Nova categoria..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button variant="secondary" onClick={handleAddCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="w-5 h-5 text-primary" />
                Comportamento da IA
              </CardTitle>
              <CardDescription>
                Configure como o assistente interpreta e reage às suas mensagens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base">Agressividade na Detecção de Prazos</Label>
                    <p className="text-sm text-muted-foreground">
                      Define quão sensível a IA será ao criar tarefas a partir de conversas.
                    </p>
                  </div>
                  <span className="text-sm font-medium px-2 py-1 bg-primary/10 text-primary rounded-md hidden sm:inline-block">
                    {getAgressivenessLabel(sliderValue[0])}
                  </span>
                </div>
                <div className="pt-4 pb-2">
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Relaxada (Apenas explícitos)</span>
                  <span>Rigorosa (Qualquer indício)</span>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Tom de Voz (Respostas Rápidas)</Label>
                  <p className="text-sm text-muted-foreground">
                    Define o estilo de linguagem nas sugestões da IA.
                  </p>
                </div>
                <Select defaultValue="professional">
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Selecione o tom..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="casual">Casual & Amigável</SelectItem>
                    <SelectItem value="objective">Direto ao Ponto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-base">Geração de Tarefas Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Criar tarefas automaticamente no painel quando pedidos forem detectados.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Privacidade e Segurança
              </CardTitle>
              <CardDescription>
                Controles de proteção de dados e retenção de informações no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-base">Mascaramento de Dados Sensíveis</Label>
                  <p className="text-sm text-muted-foreground">
                    Oculta CPFs, senhas e valores financeiros nos resumos da IA.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Retenção de Mensagens</Label>
                  <p className="text-sm text-muted-foreground">
                    Tempo que o histórico é mantido para dar contexto à IA.
                  </p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="forever">Indeterminado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-base">Criptografia Ponta-a-Ponta</Label>
                  <p className="text-sm text-muted-foreground">
                    Status da comunicação com os provedores LLM.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                >
                  Ativa
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-primary" />
                Preferências de Alerta
              </CardTitle>
              <CardDescription>Configure como e quando você deseja ser notificado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-base">Resumo Diário (Briefing)</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber um briefing consolidado via notificação todas as manhãs.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-base">Alertas de Urgência Extremas</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações imediatas quando a IA detectar um assunto crítico.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-base">Descoberta de Novas Tarefas</Label>
                  <p className="text-sm text-muted-foreground">
                    Avisar silenciosamente no painel quando uma nova tarefa for criada.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t mt-8">
        <Button variant="outline" className="w-full sm:w-auto">
          Restaurar Padrões
        </Button>
        <Button onClick={handleSave} className="w-full sm:w-auto">
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/stores/main'
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
  QrCode,
  Loader2,
} from 'lucide-react'

export default function Settings() {
  const { toast } = useToast()
  const {
    waConnected,
    setWaConnected,
    waPhoneNumber,
    setWaPhoneNumber,
    lastSync,
    setLastSync,
    categories,
    setCategories,
    aiAggressiveness,
    setAiAggressiveness,
    saveSettings,
  } = useAppStore()
  const [newCategory, setNewCategory] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [isPairing, setIsPairing] = useState(false)

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory('')
    }
  }

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setLastSync(new Date().toLocaleString('pt-BR'))
      toast({
        title: 'Sincronização concluída',
        description: 'Suas mensagens foram atualizadas com o WhatsApp.',
      })
    }, 2000)
  }

  const simulatePairing = () => {
    setIsPairing(true)
    setTimeout(async () => {
      setIsPairing(false)
      setIsQRDialogOpen(false)
      setWaConnected(true)
      setWaPhoneNumber('+55 11 99999-9999')
      setLastSync(new Date().toLocaleString('pt-BR'))
      await saveSettings()
      toast({ title: 'WhatsApp Conectado', description: 'Sua conta foi vinculada com sucesso.' })
    }, 2000)
  }

  const handleDisconnect = async () => {
    setWaConnected(false)
    setWaPhoneNumber(null)
    setLastSync(null)
    await saveSettings()
    toast({ title: 'WhatsApp Desconectado', description: 'Sua conta foi desvinculada.' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas preferências de IA, privacidade e integrações.
          </p>
        </div>
        <Button
          onClick={async () => {
            await saveSettings()
            toast({
              title: 'Salvo com sucesso',
              description: 'Suas configurações foram atualizadas no banco de dados.',
            })
          }}
        >
          Salvar Alterações
        </Button>
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
                <Smartphone className="w-5 h-5 text-primary" /> Conexão WhatsApp
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
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">Status:</p>
                      <Badge
                        variant={waConnected ? 'default' : 'destructive'}
                        className={waConnected ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {waConnected ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                    {waConnected ? (
                      <div className="text-sm text-muted-foreground">
                        <p>Número: {waPhoneNumber}</p>
                        <p>Última sincronização: {lastSync}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma conta vinculada no momento.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {waConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex-1 sm:flex-none"
                      >
                        <RefreshCcw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />{' '}
                        Sincronizar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDisconnect}
                        className="flex-1 sm:flex-none"
                      >
                        Desconectar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsQRDialogOpen(true)}
                      className="flex-1 sm:flex-none"
                    >
                      <QrCode className="w-4 h-4 mr-2" /> Conectar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" /> Categorias e Workspaces
              </CardTitle>
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
                      onClick={() => setCategories(categories.filter((c) => c !== cat))}
                      className="hover:text-destructive"
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
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="w-5 h-5 text-primary" /> Comportamento da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Agressividade na Detecção de Prazos</Label>
                <Slider
                  value={[aiAggressiveness]}
                  onValueChange={(val) => setAiAggressiveness(val[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label className="text-base">Geração de Tarefas Automática</Label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" /> Privacidade e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-base">Mascaramento de Dados Sensíveis</Label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-primary" /> Preferências de Alerta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-base">Resumo Diário (Briefing)</Label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o código QR abaixo para vincular sua conta.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
              {isPairing ? (
                <div className="w-48 h-48 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Conectando...</p>
                </div>
              ) : (
                <img
                  src="https://img.usecurling.com/p/200/200?q=qrcode"
                  alt="QR Code"
                  className="w-48 h-48 object-cover rounded"
                />
              )}
            </div>
            <div className="space-y-3 w-full max-w-sm">
              <h4 className="font-semibold text-sm">Instruções:</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em Configurações &gt; Aparelhos Conectados</li>
                <li>Aponte a câmera para este código</li>
              </ol>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            {!isPairing && (
              <Button onClick={simulatePairing} className="w-full sm:w-auto">
                Simular Conexão
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

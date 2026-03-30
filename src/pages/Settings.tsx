import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  QrCode,
  Loader2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getUserSettings, updateUserSettings, createUserSettings } from '@/services/settings'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

export default function Settings() {
  const { toast } = useToast()
  const { user } = useAuth()

  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [waConnected, setWaConnected] = useState(false)
  const [waPhoneNumber] = useState<string | null>('+55 11 99999-9999')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [aiAggressiveness, setAiAggressiveness] = useState(50)

  const [newCategory, setNewCategory] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [isPairing, setIsPairing] = useState(false)

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const [qrData, setQrData] = useState('')
  const [qrExpired, setQrExpired] = useState(false)
  const [isLoadingQR, setIsLoadingQR] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const [qrSuccess, setQrSuccess] = useState(false)

  const loadSettings = useCallback(async () => {
    if (!user) return
    try {
      let settings = await getUserSettings(user.id)
      if (!settings) {
        settings = await createUserSettings({
          user: user.id,
          whatsapp_connected: false,
          ai_aggressiveness: 50,
          categories: ['Geral', 'Trabalho', 'Pessoal'],
        })
      }
      setSettingsId(settings.id)
      setWaConnected(settings.whatsapp_connected || false)
      setAiAggressiveness(settings.ai_aggressiveness ?? 50)
      setCategories(settings.categories || ['Geral', 'Trabalho', 'Pessoal'])
    } catch (error) {
      console.error('Failed to load settings', error)
    }
  }, [user])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useRealtime(
    'user_settings',
    (e) => {
      if (user && e.record.user === user.id) {
        setWaConnected(e.record.whatsapp_connected || false)
        setAiAggressiveness(e.record.ai_aggressiveness ?? 50)
        setCategories(e.record.categories || [])
        if (e.record.whatsapp_connected && isQRDialogOpen) {
          setQrSuccess(true)
          toast({ title: 'WhatsApp Conectado', description: 'Conta vinculada com sucesso.' })
        }
      }
    },
    !!user,
  )

  useEffect(() => {
    if (qrSuccess) {
      const t = setTimeout(() => {
        setIsQRDialogOpen(false)
        setQrSuccess(false)
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [qrSuccess])

  const generateQR = useCallback(async () => {
    setIsLoadingQR(true)
    setQrError(null)
    setQrExpired(false)
    setQrSuccess(false)
    try {
      const res = await pb.send<{ qr: string }>('/backend/v1/whatsapp/qr', { method: 'GET' })
      if (res && res.qr) {
        setQrData(res.qr)
      } else {
        throw new Error('Invalid QR response')
      }
    } catch (e) {
      setQrError('Código QR inválido ou falha de conexão.')
      toast({ title: 'Erro', description: 'Falha ao obter QR Code.', variant: 'destructive' })
    } finally {
      setIsLoadingQR(false)
    }
  }, [toast])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isQRDialogOpen && !qrExpired && !isLoadingQR && !qrError && !qrSuccess && qrData) {
      timer = setTimeout(() => {
        setQrExpired(true)
      }, 45000)
    }
    return () => clearTimeout(timer)
  }, [isQRDialogOpen, qrExpired, isLoadingQR, qrError, qrSuccess, qrData])

  const handleCancelPairing = async () => {
    if (waConnected || qrSuccess) {
      setIsQRDialogOpen(false)
      return
    }
    try {
      await pb.send('/backend/v1/whatsapp/disconnect', { method: 'POST' })
    } catch (e) {
      console.error('Failed to disconnect', e)
    } finally {
      setIsQRDialogOpen(false)
      setQrData('')
    }
  }

  const handleConnectClick = () => {
    generateQR()
    setIsQRDialogOpen(true)
  }

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
        description: 'Suas mensagens foram atualizadas.',
      })
    }, 2000)
  }

  const simulatePairing = async () => {
    if (!settingsId) return
    setIsPairing(true)
    setTimeout(async () => {
      try {
        await updateUserSettings(settingsId, { whatsapp_connected: true })
        setLastSync(new Date().toLocaleString('pt-BR'))
      } catch (err) {
        toast({ title: 'Erro', description: 'Falha ao vincular.', variant: 'destructive' })
      } finally {
        setIsPairing(false)
      }
    }, 1500)
  }

  const confirmDisconnect = async () => {
    if (!settingsId) return
    setIsDisconnecting(true)
    try {
      await pb.send('/backend/v1/whatsapp/disconnect', { method: 'POST' })
      setLastSync(null)
      toast({ title: 'Desconectado', description: 'WhatsApp foi desvinculado.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao desvincular.', variant: 'destructive' })
    } finally {
      setIsDisconnecting(false)
      setShowDisconnectConfirm(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settingsId) return
    try {
      await updateUserSettings(settingsId, {
        ai_aggressiveness: aiAggressiveness,
        categories,
      })
      toast({
        title: 'Salvo com sucesso',
        description: 'Suas configurações foram atualizadas.',
      })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas preferências de IA e integrações.
          </p>
        </div>
        <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
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
              <CardDescription>Gerencie a conexão da sua conta.</CardDescription>
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
                        {lastSync && <p>Sincronizado: {lastSync}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma conta vinculada.</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-wrap justify-end">
                  {waConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await pb.send('/backend/v1/webhook/whatsapp', {
                              method: 'POST',
                              body: {
                                userId: user?.id,
                                contactName: 'Cliente ' + Math.floor(Math.random() * 100),
                                message: 'Preciso que você me envie o relatório amanhã!',
                              },
                            })
                            toast({
                              title: 'Mensagem Simulada',
                              description: 'Webhook disparado com sucesso.',
                            })
                          } catch (e) {
                            toast({
                              title: 'Erro',
                              description: 'Falha no webhook.',
                              variant: 'destructive',
                            })
                          }
                        }}
                        className="flex-1 sm:flex-none"
                        title="Simular recebimento de mensagem via Webhook"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" /> Simular Webhook
                      </Button>
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
                        onClick={() => setShowDisconnectConfirm(true)}
                        className="flex-1 sm:flex-none"
                      >
                        Desconectar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleConnectClick}
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
                <Settings2 className="w-5 h-5 text-primary" /> Categorias
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
                  <Plus className="w-4 h-4 mr-2" /> Add
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
                <Shield className="w-5 h-5 text-primary" /> Privacidade
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
                <Bell className="w-5 h-5 text-primary" /> Alertas
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

      <Dialog
        open={isQRDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelPairing()
          else setIsQRDialogOpen(true)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o código QR abaixo com seu WhatsApp para vincular a conta.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-border relative min-h-[256px] min-w-[256px] flex items-center justify-center">
              {qrSuccess ? (
                <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="font-medium text-lg">Conectado!</p>
                </div>
              ) : isLoadingQR || isPairing ? (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-sm font-medium">
                    {isPairing ? 'Simulando scan...' : 'Gerando código seguro...'}
                  </p>
                </div>
              ) : qrError ? (
                <div className="flex flex-col items-center text-destructive text-center space-y-4 p-4">
                  <XCircle className="w-12 h-12" />
                  <p className="text-sm font-medium">{qrError}</p>
                  <Button variant="outline" size="sm" onClick={generateQR}>
                    Tentar Novamente
                  </Button>
                </div>
              ) : qrExpired ? (
                <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground text-center">
                  <p className="text-sm font-medium text-destructive">Código QR Expirado</p>
                  <Button variant="outline" size="sm" onClick={generateQR}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Atualizar Código
                  </Button>
                </div>
              ) : (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&margin=0&data=${encodeURIComponent(qrData)}`}
                  alt="QR Code"
                  className="w-56 h-56 object-contain rounded animate-in fade-in duration-500"
                />
              )}
            </div>
            {!qrSuccess && (
              <div className="space-y-3 w-full max-w-sm">
                <h4 className="font-semibold text-sm">Instruções:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Abra o WhatsApp no seu celular</li>
                  <li>Toque em Configurações &gt; Aparelhos Conectados</li>
                  <li>Toque em "Conectar um aparelho"</li>
                  <li>Aponte a câmera para este código</li>
                </ol>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <Button onClick={handleCancelPairing} variant="ghost" className="text-muted-foreground">
              Cancelar
            </Button>
            {!isLoadingQR && !qrError && !qrExpired && !qrSuccess && !isPairing && (
              <Button onClick={simulatePairing} variant="secondary" size="sm">
                Simular Scan
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar WhatsApp?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desvincular sua conta do WhatsApp? Suas mensagens deixarão de
              ser sincronizadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDisconnect()
              }}
              disabled={isDisconnecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

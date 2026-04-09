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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
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
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { updateUserSettings, ensureUserSettings } from '@/services/settings'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

const QR_LIFESPAN = 45

type QrStatus = 'idle' | 'generating' | 'ready' | 'validating' | 'success' | 'error'

export default function Settings() {
  const { toast } = useToast()
  const { user } = useAuth()

  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [waConnected, setWaConnected] = useState(false)
  const [waPhoneNumber] = useState<string | null>('+55 11 99999-9999')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [aiAggressiveness, setAiAggressiveness] = useState(50)
  const [remindersEnabled, setRemindersEnabled] = useState(false)
  const [reminderLeadTime, setReminderLeadTime] = useState(15)

  const [newCategory, setNewCategory] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [qrStatus, setQrStatus] = useState<QrStatus>('idle')
  const [qrData, setQrData] = useState('')
  const [qrTimeLeft, setQrTimeLeft] = useState(0)
  const [qrErrorMessage, setQrErrorMessage] = useState('')

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const loadSettings = useCallback(async () => {
    if (!user) return
    try {
      const settings = await ensureUserSettings(user.id)
      if (settings) {
        setSettingsId(settings.id !== 'local-default' ? settings.id : null)
        setWaConnected(settings.whatsapp_connected || false)
        setAiAggressiveness(settings.ai_aggressiveness ?? 50)
        setCategories(settings.categories || ['Geral', 'Trabalho', 'Pessoal'])
        setRemindersEnabled(settings.reminders_enabled || false)
        setReminderLeadTime(settings.reminder_lead_time ?? 15)
      }
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
        const isNowConnected = e.record.whatsapp_connected || false
        setWaConnected(isNowConnected)
        setAiAggressiveness(e.record.ai_aggressiveness ?? 50)
        setCategories(e.record.categories || [])
        setRemindersEnabled(e.record.reminders_enabled || false)
        setReminderLeadTime(e.record.reminder_lead_time ?? 15)

        // Handle successful connection feedback via SSE
        if (isNowConnected && isQRDialogOpen && qrStatus !== 'success') {
          setQrStatus('success')
          toast({
            title: 'WhatsApp Conectado',
            description: 'Sessão iniciada e sincronizada com sucesso.',
          })
        }
      }
    },
    !!user,
  )

  useEffect(() => {
    if (qrStatus === 'success') {
      const t = setTimeout(() => {
        setIsQRDialogOpen(false)
        setQrStatus('idle')
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [qrStatus])

  const generateQR = useCallback(async (isRetry = false) => {
    setQrStatus('generating')
    setQrErrorMessage('')
    setQrTimeLeft(QR_LIFESPAN)
    try {
      if (isRetry) {
        // Clear any stale session on the backend before generating a new QR
        await pb.send('/backend/v1/whatsapp/disconnect', { method: 'POST' }).catch(() => {})
      }
      const res = await pb.send<{ qr: string }>('/backend/v1/whatsapp/qr', { method: 'GET' })
      if (res && res.qr) {
        setQrData(res.qr)
        setQrStatus('ready')
      } else {
        throw new Error('Invalid QR response')
      }
    } catch (e: any) {
      setQrStatus('error')
      const msg = getErrorMessage(e)
      if (msg.includes('Credenciais do Z-API não configuradas')) {
        setQrErrorMessage(
          'Credenciais Z-API (ZAPI_INSTANCE_ID e ZAPI_TOKEN) não configuradas no painel de Secrets.',
        )
      } else if (msg.includes('400') || msg.includes('ZAPI_400') || msg.includes('ocupada')) {
        setQrErrorMessage(
          `Erro no Gateway Z-API: ${msg}. A instância pode estar ocupada ou as credenciais estão incorretas. Tente limpar a sessão.`,
        )
      } else {
        setQrErrorMessage(
          msg ||
            'Falha ao obter QR Code válido do Gateway. Verifique sua conexão e tente novamente.',
        )
      }
    }
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isQRDialogOpen && qrStatus === 'ready' && qrTimeLeft > 0) {
      timer = setTimeout(() => setQrTimeLeft((prev) => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [isQRDialogOpen, qrStatus, qrTimeLeft])

  useEffect(() => {
    let pollInterval: NodeJS.Timeout
    if (isQRDialogOpen && qrStatus === 'ready') {
      pollInterval = setInterval(async () => {
        try {
          const res = await pb.send('/backend/v1/whatsapp/status', { method: 'GET' })
          if (res.connected || res.status === 'CONNECTED') {
            // The backend hook already updates whatsapp_connected in user_settings
            // SSE will pick this up, but we can set success directly here to be responsive.
            setQrStatus('success')
          }
        } catch (error) {
          console.error('Failed to check status', error)
        }
      }, 5000)
    }
    return () => clearInterval(pollInterval)
  }, [isQRDialogOpen, qrStatus, settingsId])

  const handleCancelPairing = async () => {
    if (waConnected || qrStatus === 'success') {
      setIsQRDialogOpen(false)
      return
    }
    try {
      await pb.send('/backend/v1/whatsapp/disconnect', { method: 'POST' }).catch(() => {})
    } finally {
      setIsQRDialogOpen(false)
      setQrStatus('idle')
      setQrData('')
    }
  }

  const handleConnectClick = () => {
    setIsQRDialogOpen(true)
    generateQR(false)
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
    if (!settingsId || qrStatus !== 'ready') return
    setQrStatus('validating')
    setTimeout(async () => {
      try {
        await updateUserSettings(settingsId, { whatsapp_connected: true })
        setLastSync(new Date().toLocaleString('pt-BR'))
        // Do not set success here. The SSE useRealtime listener will pick up the DB change
        // and update the status to 'success', providing a true reactive feedback loop.
      } catch (err) {
        setQrStatus('error')
        setQrErrorMessage('Falha na autenticação do dispositivo. QR Code pode ser inválido.')
      }
    }, 2000)
  }

  const confirmDisconnect = async () => {
    if (!settingsId) return
    setIsDisconnecting(true)
    try {
      await pb.send('/backend/v1/whatsapp/disconnect', { method: 'POST' })
      setLastSync(null)
      toast({ title: 'Desconectado', description: 'Sessão do WhatsApp encerrada e dados limpos.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao desvincular.', variant: 'destructive' })
    } finally {
      setIsDisconnecting(false)
      setShowDisconnectConfirm(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settingsId) return
    setFieldErrors({})
    try {
      await updateUserSettings(settingsId, {
        ai_aggressiveness: aiAggressiveness,
        categories,
        reminders_enabled: remindersEnabled,
        reminder_lead_time: reminderLeadTime,
      })
      toast({
        title: 'Salvo com sucesso',
        description: 'Suas configurações foram atualizadas.',
      })
    } catch (err) {
      const extractedErrors = extractFieldErrors(err)
      if (Object.keys(extractedErrors).length > 0) {
        setFieldErrors(extractedErrors)
        toast({
          title: 'Erro de validação',
          description: 'Verifique os campos destacados.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro',
          description: getErrorMessage(err) || 'Falha ao salvar.',
          variant: 'destructive',
        })
      }
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
              <CardDescription>
                Gerencie a conexão da sua conta e sincronização do Gateway.
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
                        {lastSync && <p>Último handshake: {lastSync}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma sessão ativa encontrada.
                      </p>
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
                      <QrCode className="w-4 h-4 mr-2" /> Conectar via QR Code
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" /> Categorias de Organização
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
              <div className="flex flex-col gap-2 max-w-sm pt-2">
                <div className="flex gap-2">
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
                {fieldErrors.categories && (
                  <p className="text-sm text-destructive">{fieldErrors.categories}</p>
                )}
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
                <Label className="text-base">Sensibilidade na Detecção de Prazos</Label>
                <Slider
                  value={[aiAggressiveness]}
                  onValueChange={(val) => setAiAggressiveness(val[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                {fieldErrors.ai_aggressiveness && (
                  <p className="text-sm text-destructive">{fieldErrors.ai_aggressiveness}</p>
                )}
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
                <Label className="text-base">Mascaramento de Dados Sensíveis (PII)</Label>
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
                <Label className="text-base">Resumo Diário de Conversas (Briefing)</Label>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Lembretes via WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas antes do vencimento das tarefas
                    </p>
                  </div>
                  <Switch checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
                </div>
                {fieldErrors.reminders_enabled && (
                  <p className="text-sm text-destructive">{fieldErrors.reminders_enabled}</p>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Antecedência do Lembrete</Label>
                  <p className="text-sm text-muted-foreground">
                    Tempo antes do prazo para enviar a mensagem: {reminderLeadTime} minutos
                  </p>
                </div>
                <Slider
                  value={[reminderLeadTime]}
                  onValueChange={(val) => setReminderLeadTime(val[0])}
                  max={120}
                  step={5}
                  className="w-full"
                  disabled={!remindersEnabled}
                />
                {fieldErrors.reminder_lead_time && (
                  <p className="text-sm text-destructive">{fieldErrors.reminder_lead_time}</p>
                )}
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
            <DialogTitle>Vincular Gateway do WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o código QR para iniciar uma nova sessão segura com o Gateway.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-border relative min-h-[256px] min-w-[256px] flex flex-col items-center justify-center overflow-hidden">
              {qrStatus === 'success' && (
                <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="font-medium text-lg">Sessão Estabelecida!</p>
                </div>
              )}

              {qrStatus === 'generating' && (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <Skeleton className="w-56 h-56 rounded-md" />
                  <div className="flex items-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm font-medium">Gerando novo código...</span>
                  </div>
                </div>
              )}

              {qrStatus === 'validating' && (
                <div className="flex flex-col items-center text-primary animate-in fade-in">
                  <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                  <p className="font-medium text-lg">Validando Token...</p>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Aguardando confirmação do gateway.
                    <br />
                    Não feche esta janela.
                  </p>
                </div>
              )}

              {qrStatus === 'error' && (
                <div className="flex flex-col items-center w-full space-y-4 animate-in fade-in">
                  <Alert variant="destructive" className="text-left">
                    <ShieldAlert className="w-4 h-4" />
                    <AlertTitle>Erro de Conexão</AlertTitle>
                    <AlertDescription>{qrErrorMessage}</AlertDescription>
                  </Alert>
                  <Button variant="outline" onClick={() => generateQR(true)} className="w-full">
                    Limpar Sessão e Tentar Novamente
                  </Button>
                </div>
              )}

              {qrStatus === 'ready' && qrTimeLeft > 0 && (
                <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-500">
                  <img
                    src={
                      qrData.startsWith('http') || qrData.startsWith('data:')
                        ? qrData
                        : `https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=0&data=${encodeURIComponent(qrData)}`
                    }
                    alt="QR Code"
                    className="w-56 h-56 object-contain rounded"
                  />
                  <div className="w-full space-y-2">
                    <Progress value={(qrTimeLeft / QR_LIFESPAN) * 100} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      Aguardando validação do aparelho... (Expira em {qrTimeLeft}s)
                    </p>
                  </div>
                </div>
              )}

              {qrStatus === 'ready' && qrTimeLeft === 0 && (
                <div className="flex flex-col items-center w-full space-y-4 animate-in fade-in duration-500">
                  <div className="p-4 rounded-full bg-muted">
                    <RefreshCw className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-medium text-lg">QR Code Expirado</p>
                    <p className="text-sm text-muted-foreground">
                      Por segurança, o código expirou.
                    </p>
                  </div>
                  <Button onClick={() => generateQR(true)} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar Novo Código
                  </Button>
                </div>
              )}
            </div>

            {['generating', 'ready'].includes(qrStatus) && (
              <div className="space-y-3 w-full max-w-sm">
                <h4 className="font-semibold text-sm">Instruções para conexão:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Abra o WhatsApp no seu celular principal</li>
                  <li>Acesse Configurações &gt; Aparelhos Conectados</li>
                  <li>Toque em "Conectar um aparelho"</li>
                  <li>Aponte a câmera para o código acima para iniciar o handshake</li>
                </ol>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <Button onClick={handleCancelPairing} variant="ghost" className="text-muted-foreground">
              Cancelar
            </Button>
            {qrStatus === 'ready' && (
              <Button
                onClick={(e) => {
                  if (e.altKey) {
                    setQrStatus('error')
                    setQrErrorMessage(
                      'Falha na autenticação do dispositivo. QR Code pode ser inválido.',
                    )
                  } else {
                    simulatePairing()
                  }
                }}
                variant="secondary"
                size="sm"
                title="Dica: Segure ALT ao clicar para simular falha"
              >
                Simular Conexão
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Sessão do WhatsApp?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá destruir o token de autenticação no Gateway e parar a sincronização de novas
              mensagens em tempo real.
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
              Confirmar Desconexão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

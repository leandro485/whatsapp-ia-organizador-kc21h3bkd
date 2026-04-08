import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { Loader2, Camera } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({})
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsUpdatingProfile(true)
    setProfileErrors({})

    try {
      const formData = new FormData()
      formData.append('name', name)

      const file = fileInputRef.current?.files?.[0]
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          setProfileErrors({ avatar: 'O tamanho da imagem não pode exceder 2MB.' })
          setIsUpdatingProfile(false)
          return
        }
        formData.append('avatar', file)
      }

      await pb.collection('users').update(user.id, formData)

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setProfileErrors(extractFieldErrors(err))
      toast({
        title: 'Erro ao salvar',
        description: 'Verifique os campos e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsUpdatingPassword(true)
    setPasswordErrors({})

    try {
      await pb.collection('users').update(user.id, {
        oldPassword,
        password,
        passwordConfirm,
      })

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi alterada com sucesso.',
      })
      setOldPassword('')
      setPassword('')
      setPasswordConfirm('')
    } catch (err) {
      setPasswordErrors(extractFieldErrors(err))
      toast({
        title: 'Erro ao alterar senha',
        description: 'Verifique as informações fornecidas.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações pessoais e segurança.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seu nome e foto de perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border">
                  <AvatarImage
                    src={user?.avatar ? `/api/files/_pb_users_auth_/${user.id}/${user.avatar}` : ''}
                  />
                  <AvatarFallback className="text-2xl">{name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={() => {
                    // Update trigger handled natively
                  }}
                />
              </div>
              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
                {profileErrors.name && (
                  <p className="text-xs text-destructive">{profileErrors.name}</p>
                )}
                {profileErrors.avatar && (
                  <p className="text-xs text-destructive">{profileErrors.avatar}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Altere a senha da sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Senha Atual</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              {passwordErrors.oldPassword && (
                <p className="text-xs text-destructive">{passwordErrors.oldPassword}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {passwordErrors.password && (
                  <p className="text-xs text-destructive">{passwordErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmar Nova Senha</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
                {passwordErrors.passwordConfirm && (
                  <p className="text-xs text-destructive">{passwordErrors.passwordConfirm}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Atualizar Senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

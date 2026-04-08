import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import { Bot } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import pb from '@/lib/pocketbase/client'

export default function Login() {
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetMsg('')
    setResetError('')
    try {
      await pb.collection('users').requestPasswordReset(resetEmail)
      setResetMsg('Um link de recuperação foi enviado para o seu email.')
    } catch (err) {
      setResetError(getErrorMessage(err))
    } finally {
      setResetLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    const { error: signInError } = await signIn({ identity, password })
    if (signInError) {
      setError('Email/Username ou senha inválidos.')
      setFieldErrors(extractFieldErrors(signInError))
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm bg-card p-8 rounded-xl shadow-sm border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="text-muted-foreground text-sm mt-1">Entre na sua conta para continuar</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identity">Email ou Username</Label>
            <Input
              id="identity"
              type="text"
              placeholder="seu@email.com ou username"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              required
            />
            {fieldErrors.identity && (
              <p className="text-xs text-destructive">{fieldErrors.identity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              className="px-0 font-normal h-auto text-xs"
              onClick={() => setIsResetOpen(true)}
            >
              Esqueceu a senha?
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <Dialog
          open={isResetOpen}
          onOpenChange={(open) => {
            setIsResetOpen(open)
            if (!open) {
              setResetEmail('')
              setResetMsg('')
              setResetError('')
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recuperar Senha</DialogTitle>
              <DialogDescription>
                Digite seu email para receber um link de redefinição de senha.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResetSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              {resetMsg && <p className="text-sm text-green-600">{resetMsg}</p>}
              {resetError && <p className="text-sm text-destructive">{resetError}</p>}
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem uma conta?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Crie uma
          </Link>
        </p>
      </div>
    </div>
  )
}

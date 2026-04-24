'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('No se pudo actualizar la contraseña. El link puede haber expirado.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/role')
    const { role } = await res.json() as { role: string | null }
    router.push(role === 'admin' ? '/admin/dashboard' : '/schedule')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-pink rounded-2xl items-center justify-center mb-2">
            <span className="text-white font-black text-2xl">DF</span>
          </div>
          <h1 className="text-2xl font-bold">Nueva contraseña</h1>
          <p className="text-text-muted text-sm">Elige una contraseña segura</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nueva contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repite la contraseña"
            required
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Guardar contraseña
          </Button>
        </form>
      </div>
    </div>
  )
}

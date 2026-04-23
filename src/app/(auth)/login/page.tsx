'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    window.location.href = profile?.role === 'admin' ? '/admin/dashboard' : '/schedule'
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-pink rounded-2xl items-center justify-center mb-2">
            <span className="text-white font-black text-2xl">DF</span>
          </div>
          <h1 className="text-2xl font-bold">Bienvenido</h1>
          <p className="text-text-muted text-sm">Ingresa a tu cuenta Danifit</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Ingresar
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted">
          ¿No tienes cuenta? Solicita una invitación a Daniel
        </p>
      </div>
    </div>
  )
}

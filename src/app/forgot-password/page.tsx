'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError('No pudimos enviar el correo. Verifica el email ingresado.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-pink rounded-2xl items-center justify-center mb-2">
            <span className="text-white font-black text-2xl">DF</span>
          </div>
          <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
          <p className="text-text-muted text-sm">Te enviaremos un link para resetearla</p>
        </div>

        {sent ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-green-400 font-medium">¡Correo enviado!</p>
            <p className="text-sm text-text-muted">
              Revisa tu bandeja de entrada en <span className="text-white">{email}</span> y sigue el link para crear una nueva contraseña.
            </p>
            <a href="/login" className="block text-xs text-pink hover:underline mt-4">
              Volver al login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoComplete="email"
            />
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Enviar link de recuperación
            </Button>
            <a href="/login" className="block text-center text-xs text-text-muted hover:text-white transition-colors">
              Volver al login
            </a>
          </form>
        )}
      </div>
    </div>
  )
}

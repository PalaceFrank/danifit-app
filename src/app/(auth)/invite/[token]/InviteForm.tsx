'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface InviteFormProps {
  invitationId: string
  defaultName: string
}

export function InviteForm({ invitationId, defaultName }: InviteFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: defaultName,
    email: '',
    phone: '',
    password: '',
  })

  function u(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: 'student',
          status: 'pending',
        },
      },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Error al registrarse')
      setLoading(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('profiles') as any).update({
      full_name: form.full_name,
      phone: form.phone || null,
    }).eq('id', data.user.id)

    await fetch('/api/invitations/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId, userId: data.user.id }),
    })

    // Sign in immediately so the session is active
    await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    window.location.href = '/schedule'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre completo"
        value={form.full_name}
        onChange={e => u('full_name', e.target.value)}
        required
        placeholder="Tu nombre"
      />
      <Input
        label="Correo electrónico"
        type="email"
        value={form.email}
        onChange={e => u('email', e.target.value)}
        required
        placeholder="tu@correo.com"
        autoComplete="email"
      />
      <Input
        label="Teléfono (opcional)"
        type="tel"
        value={form.phone}
        onChange={e => u('phone', e.target.value)}
        placeholder="+56 9 1234 5678"
      />
      <Input
        label="Contraseña"
        type="password"
        value={form.password}
        onChange={e => u('password', e.target.value)}
        required
        placeholder="Mínimo 8 caracteres"
        minLength={8}
        autoComplete="new-password"
      />

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Crear cuenta
      </Button>
    </form>
  )
}

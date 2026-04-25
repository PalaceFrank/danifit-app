'use client'

import { useState, useEffect } from 'react'
import {
  Bell, BellOff, LogOut, ChevronRight,
  User, Mail, Shield, Activity, Dumbbell,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileViewProps {
  profile: Profile
}

const STATUS_LABEL: Record<string, string> = {
  active:   'Activo',
  pending:  'Pendiente de activación',
  inactive: 'Inactivo',
}

const STATUS_DESC: Record<string, string> = {
  active:   'Tu cuenta está activa y tienes acceso completo.',
  pending:  'Tu Coach aún no ha activado tu cuenta.',
  inactive: 'Tu cuenta ha sido desactivada.',
}

export function ProfileView({ profile }: ProfileViewProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }
  }, [])

  async function togglePush() {
    setPushLoading(true)
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast('Tu navegador no soporta notificaciones push', 'error')
      setPushLoading(false)
      return
    }

    if (pushEnabled) {
      setPushEnabled(false)
      toast('Notificaciones desactivadas')
      setPushLoading(false)
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      toast('Permiso denegado — actívalo en ajustes del navegador', 'error')
      setPushLoading(false)
      return
    }

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setPushEnabled(true)
      toast('Notificaciones activadas 🔔')
    } catch {
      toast('Error al activar notificaciones', 'error')
    }
    setPushLoading(false)
  }

  async function handleLogout() {
    if (!confirmLogout) {
      setConfirmLogout(true)
      setTimeout(() => setConfirmLogout(false), 3000)
      return
    }
    setLoggingOut(true)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const initials = profile.full_name
    ?.split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="px-4 py-6 space-y-5 max-w-sm mx-auto">

      {/* Hero card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-pink to-pink-hover rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-pink/20">
              {initials}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface ${
              profile.status === 'active' ? 'bg-green-400' : profile.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base truncate">{profile.full_name || 'Sin nombre'}</p>
            <p className="text-xs text-text-muted truncate flex items-center gap-1 mt-0.5">
              <Mail size={11} />
              {profile.email}
            </p>
            <div className="mt-2">
              <Badge
                variant={profile.status === 'active' ? 'green' : profile.status === 'pending' ? 'yellow' : 'red'}
              >
                {STATUS_LABEL[profile.status] ?? profile.status}
              </Badge>
            </div>
          </div>
        </div>
        {profile.status !== 'active' && (
          <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border">
            {STATUS_DESC[profile.status]}
          </p>
        )}
      </Card>

      {/* Sección: cuenta */}
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider px-1 mb-2">Cuenta</p>
        <div className="space-y-2">
          <Link href="/tracker/onboarding">
            <Card padded={false} className="p-4 flex items-center gap-3 hover:border-pink/40 active:bg-white/5 transition-colors cursor-pointer">
              <div className="w-9 h-9 bg-pink/10 rounded-xl flex items-center justify-center shrink-0">
                <Dumbbell size={16} className="text-pink" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Perfil físico</p>
                <p className="text-xs text-text-muted">Meta, medidas, nivel de actividad</p>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </Card>
          </Link>

          <Card padded={false} className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${pushEnabled ? 'bg-pink/10' : 'bg-white/5'}`}>
              {pushEnabled
                ? <Bell size={16} className="text-pink" />
                : <BellOff size={16} className="text-text-muted" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Notificaciones push</p>
              <p className="text-xs text-text-muted">
                {pushEnabled ? 'Activadas — recibirás avisos de clases' : 'Desactivadas'}
              </p>
            </div>
            <ToggleSwitch
              checked={pushEnabled}
              onChange={togglePush}
              disabled={pushLoading}
            />
          </Card>
        </div>
      </div>

      {/* Sección: info */}
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider px-1 mb-2">Información</p>
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <User size={14} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Nombre</p>
              <p className="text-sm font-medium">{profile.full_name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={14} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm font-medium truncate">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={14} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Rol</p>
              <p className="text-sm font-medium capitalize">{profile.role === 'admin' ? 'Administrador' : 'Alumno'}</p>
            </div>
          </div>
          {profile.role === 'student' && (
            <div className="flex items-center gap-3">
              <Activity size={14} className="text-text-muted shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Estado</p>
                <p className="text-sm font-medium">{STATUS_LABEL[profile.status] ?? profile.status}</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Logout */}
      <Button
        variant={confirmLogout ? 'danger' : 'secondary'}
        onClick={handleLogout}
        loading={loggingOut}
        fullWidth
        size="lg"
      >
        <LogOut size={16} />
        {confirmLogout ? 'Toca de nuevo para confirmar' : 'Cerrar sesión'}
      </Button>
    </div>
  )
}

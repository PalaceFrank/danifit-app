'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, LogOut, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileViewProps {
  profile: Profile
}

export function ProfileView({ profile }: ProfileViewProps) {
  const supabase = createClient()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }
  }, [])

  async function togglePush() {
    setPushLoading(true)
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Tu navegador no soporta notificaciones push')
      setPushLoading(false)
      return
    }

    if (pushEnabled) {
      setPushEnabled(false)
      setPushLoading(false)
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setPushLoading(false)
      return
    }

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
    setPushLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const STATUS_LABEL: Record<string, string> = {
    active:   'Activo',
    pending:  'Pendiente de activación',
    inactive: 'Inactivo',
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-sm mx-auto">
      {/* Avatar */}
      <Card className="flex items-center gap-4">
        <div className="w-14 h-14 bg-pink/20 rounded-full flex items-center justify-center text-pink text-xl font-bold shrink-0">
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-bold truncate">{profile.full_name}</p>
          <p className="text-xs text-text-muted truncate">{profile.email}</p>
          <Badge variant={profile.status === 'active' ? 'green' : profile.status === 'pending' ? 'yellow' : 'red'} className="mt-1">
            {STATUS_LABEL[profile.status]}
          </Badge>
        </div>
      </Card>

      {/* Settings */}
      <div className="space-y-2">
        <Link href="/tracker/onboarding">
          <Card padded={false} className="p-4 flex items-center justify-between hover:border-pink/40 transition-colors cursor-pointer">
            <div>
              <p className="text-sm font-medium">Perfil físico</p>
              <p className="text-xs text-text-muted">Meta, altura, peso objetivo</p>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </Card>
        </Link>

        <Card padded={false} className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notificaciones push</p>
            <p className="text-xs text-text-muted">Recibe avisos de clases</p>
          </div>
          <button
            onClick={togglePush}
            disabled={pushLoading}
            className={`p-2 rounded-xl transition-colors ${pushEnabled ? 'bg-pink/20 text-pink' : 'bg-white/5 text-text-muted'}`}
          >
            {pushEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </Card>
      </div>

      {/* Logout */}
      <Button variant="danger" onClick={handleLogout} className="w-full" size="lg">
        <LogOut size={16} />
        Cerrar sesión
      </Button>
    </div>
  )
}

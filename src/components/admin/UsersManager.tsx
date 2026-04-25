'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserCheck, UserX, Search, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UsersManagerProps {
  users: Profile[]
}

const STATUS_BADGE: Record<string, 'yellow' | 'green' | 'red'> = {
  pending:  'yellow',
  active:   'green',
  inactive: 'red',
}

const STATUS_LABEL: Record<string, string> = {
  pending:  'Pendiente',
  active:   'Activo',
  inactive: 'Inactivo',
}

export function UsersManager({ users: initial }: UsersManagerProps) {
  const supabase = createClient()
  const [users, setUsers] = useState(initial)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(userId: string, status: 'active' | 'inactive') {
    setLoading(userId)
    const updates: Partial<Profile> = { status }
    if (status === 'active') updates.activated_at = new Date().toISOString()

    await supabase.from('profiles').update(updates).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
    setLoading(null)
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    total:    users.length,
    active:   users.filter(u => u.status === 'active').length,
    pending:  users.filter(u => u.status === 'pending').length,
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card padded={false} className="p-3 text-center">
          <p className="text-2xl font-bold">{counts.total}</p>
          <p className="text-xs text-text-muted">Total</p>
        </Card>
        <Card padded={false} className="p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{counts.active}</p>
          <p className="text-xs text-text-muted">Activos</p>
        </Card>
        <Card padded={false} className="p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{counts.pending}</p>
          <p className="text-xs text-text-muted">Pendientes</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar alumno..."
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-pink"
        />
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-text-muted text-sm py-8">Sin alumnos</p>
        )}
        {filtered.map(user => (
          <Card key={user.id} padded={false} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 bg-pink/20 rounded-full flex items-center justify-center text-pink font-bold shrink-0">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{user.full_name}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                  {user.phone && <p className="text-xs text-text-muted">{user.phone}</p>}
                </div>
                <ChevronRight size={15} className="text-text-muted shrink-0" />
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_BADGE[user.status]}>{STATUS_LABEL[user.status]}</Badge>
                {user.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(user.id, 'active')}
                    loading={loading === user.id}
                  >
                    <UserCheck size={14} />
                    Activar
                  </Button>
                )}
                {user.status === 'active' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={e => { e.preventDefault(); updateStatus(user.id, 'inactive') }}
                    loading={loading === user.id}
                  >
                    <UserX size={14} />
                    Dar de baja
                  </Button>
                )}
                {user.status === 'inactive' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={e => { e.preventDefault(); updateStatus(user.id, 'active') }}
                    loading={loading === user.id}
                  >
                    <UserCheck size={14} />
                    Reactivar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Copy, Check, Plus, Clock, UserCheck, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Invitation = Database['public']['Tables']['invitations']['Row']

interface InvitationsManagerProps {
  invitations: Invitation[]
  adminId: string
}

export function InvitationsManager({ invitations: initial, adminId }: InvitationsManagerProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [invitations, setInvitations] = useState(initial)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function createInvitation() {
    setLoading(true)
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, created_by: adminId }),
    })
    const data = await res.json()
    if (data.invitation) {
      setInvitations(prev => [data.invitation, ...prev])
      setName('')
    }
    setLoading(false)
  }

  function getInviteUrl(token: string) {
    return `${window.location.origin}/invite/${token}`
  }

  async function deleteInvitation(id: string) {
    const { error } = await supabase.from('invitations').delete().eq('id', id)
    if (error) { toast('Error al eliminar', 'error'); return }
    setInvitations(prev => prev.filter(i => i.id !== id))
    toast('Invitación eliminada')
  }

  async function copyLink(token: string, id: string) {
    await navigator.clipboard.writeText(getInviteUrl(token))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const STATUS_BADGE: Record<string, 'gray' | 'green' | 'red'> = {
    pending: 'gray',
    used:    'green',
    expired: 'red',
  }

  const STATUS_LABEL: Record<string, string> = {
    pending: 'Pendiente',
    used:    'Usado',
    expired: 'Expirado',
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
      {/* Create */}
      <Card>
        <h2 className="font-semibold text-sm mb-3">Nueva invitación</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Nombre del alumno (opcional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={createInvitation} loading={loading}>
            <Plus size={16} />
            Generar
          </Button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          El link expira en 7 días. Cópialo y envíalo por WhatsApp o email.
        </p>
      </Card>

      {/* List */}
      <div className="space-y-2">
        {invitations.length === 0 && (
          <p className="text-center text-text-muted text-sm py-8">Sin invitaciones aún</p>
        )}
        {invitations.map(inv => (
          <Card key={inv.id} padded={false} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{inv.name || 'Sin nombre'}</span>
                  <Badge variant={STATUS_BADGE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    Expira {new Date(inv.expires_at).toLocaleDateString('es-CL')}
                  </span>
                  {inv.used_at && (
                    <span className="flex items-center gap-1 text-green-400">
                      <UserCheck size={11} />
                      Registrado
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {inv.status === 'pending' && (
                  <button
                    onClick={() => copyLink(inv.token, inv.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {copiedId === inv.id ? (
                      <><Check size={13} className="text-green-400" /> Copiado</>
                    ) : (
                      <><Copy size={13} /> Copiar link</>
                    )}
                  </button>
                )}
                <button
                  onClick={() => deleteInvitation(inv.id)}
                  className="p-2 rounded-lg hover:bg-red-900/20 text-text-muted hover:text-red-400 transition-colors"
                  title="Eliminar invitación"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

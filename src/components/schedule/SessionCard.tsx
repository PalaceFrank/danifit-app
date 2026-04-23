'use client'

import { useState } from 'react'
import { MapPin, Clock, Users, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TIME_BLOCKS } from '@/config/schedule'
import type { Database } from '@/types/database'

type Session = Database['public']['Tables']['schedule_sessions']['Row']

interface SessionCardProps {
  session: Session
  isCheckedIn?: boolean
  onCheckIn?: (sessionId: string) => Promise<void>
}

const LEVEL_LABELS = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
  all:          'Todos los niveles',
}

const LEVEL_BADGE: Record<string, 'green' | 'yellow' | 'pink' | 'gray'> = {
  beginner:     'green',
  intermediate: 'yellow',
  advanced:     'pink',
  all:          'gray',
}

export function SessionCard({ session, isCheckedIn, onCheckIn }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const block = TIME_BLOCKS[session.time_block]

  async function handleCheckIn() {
    if (!onCheckIn) return
    setLoading(true)
    await onCheckIn(session.id)
    setLoading(false)
  }

  if (session.is_cancelled) {
    return (
      <div className="bg-surface border border-red-900/40 rounded-2xl p-4 opacity-70">
        <div className="flex items-center gap-2">
          <XCircle size={16} className="text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-medium line-through text-text-muted">{session.title}</p>
            <p className="text-xs text-red-400">{session.cancellation_note || 'Clase cancelada'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-pink">{block.label}</span>
              {block.start && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock size={11} />
                  {block.start}–{block.end}
                </span>
              )}
            </div>
            <p className="font-semibold text-sm leading-tight">{session.title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {session.level && (
              <Badge variant={LEVEL_BADGE[session.level] || 'gray'}>
                {LEVEL_LABELS[session.level]}
              </Badge>
            )}
            {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {session.description && (
            <p className="text-sm text-text-muted leading-relaxed">{session.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            {session.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {session.location}
              </span>
            )}
            {session.materials && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {session.materials}
              </span>
            )}
          </div>

          {onCheckIn && (
            <div className="pt-1">
              {isCheckedIn ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle2 size={16} />
                  Asistencia registrada
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleCheckIn}
                  loading={loading}
                  className="w-full"
                >
                  Marcar asistencia
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
  status?: 'today' | 'upcoming' | 'past'
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

export function SessionCard({ session, status = 'upcoming', isCheckedIn, onCheckIn }: SessionCardProps) {
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

  const isToday = status === 'today'
  const isPast = status === 'past'

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
      isToday
        ? 'bg-pink/5 border-pink/40 shadow-[0_0_0_1px_rgba(232,24,90,0.15)]'
        : isPast
        ? 'bg-surface border-border opacity-50'
        : 'bg-surface border-border'
    }`}>
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {isToday && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink bg-pink/10 border border-pink/20 px-2 py-0.5 rounded-full">
                  Hoy
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={11} />
                {block.start}–{block.end}
              </span>
            </div>
            <p className={`font-semibold text-sm leading-tight ${isPast ? 'text-text-muted' : ''}`}>
              {session.title}
            </p>
            {session.location && (
              <p className="flex items-center gap-1 text-xs text-text-muted mt-1">
                <MapPin size={11} />
                {session.location}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {session.level && (
              <Badge variant={LEVEL_BADGE[session.level] || 'gray'}>
                {LEVEL_LABELS[session.level as keyof typeof LEVEL_LABELS] ?? session.level}
              </Badge>
            )}
            {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          {session.description && (
            <p className="text-sm text-text-muted leading-relaxed">{session.description}</p>
          )}

          {session.materials && (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Users size={12} />
              <span>{session.materials}</span>
            </div>
          )}

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
                  fullWidth
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

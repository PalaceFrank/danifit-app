'use client'

import { useState } from 'react'
import { Plus, Edit2, X, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { WEEK_DAYS, TIME_BLOCKS, REGULAR_BLOCKS } from '@/config/schedule'
import type { Database, DayOfWeek, TimeBlock } from '@/types/database'

type Session = Database['public']['Tables']['schedule_sessions']['Row']

interface AdminScheduleManagerProps {
  sessions: Session[]
  weekStart: string
}

type SessionForm = {
  title: string
  description: string
  level: string
  materials: string
  location: string
}

const DAYS: DayOfWeek[] = [1, 2, 3, 4, 6]

export function AdminScheduleManager({ sessions: initial, weekStart }: AdminScheduleManagerProps) {
  const supabase = createClient()
  const [sessions, setSessions] = useState(initial)
  const [editing, setEditing] = useState<{ day: DayOfWeek; block: TimeBlock } | null>(null)
  const [form, setForm] = useState<SessionForm>({ title: '', description: '', level: 'all', materials: '', location: 'Parque Las Américas' })
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  function openEditor(day: DayOfWeek, block: TimeBlock) {
    const existing = sessions.find(s => s.day_of_week === day && s.time_block === block)
    setForm({
      title: existing?.title || '',
      description: existing?.description || '',
      level: existing?.level || 'all',
      materials: existing?.materials || '',
      location: existing?.location || 'Parque Las Américas',
    })
    setEditing({ day, block })
  }

  async function saveSession() {
    if (!editing || !form.title.trim()) return
    setSaving(true)

    const payload = {
      week_start: weekStart,
      day_of_week: editing.day,
      time_block: editing.block,
      title: form.title.trim(),
      description: form.description || null,
      level: form.level as Session['level'],
      materials: form.materials || null,
      location: form.location || 'Parque Las Américas',
      is_cancelled: false,
      cancellation_note: null,
    }

    const { data } = await supabase
      .from('schedule_sessions')
      .upsert(payload, { onConflict: 'week_start,day_of_week,time_block' })
      .select()
      .single()

    if (data) {
      setSessions(prev => {
        const filtered = prev.filter(s => !(s.day_of_week === editing.day && s.time_block === editing.block))
        return [...filtered, data]
      })
    }
    setSaving(false)
    setEditing(null)
  }

  async function toggleCancel(session: Session) {
    setCancelling(session.id)
    const note = !session.is_cancelled
      ? prompt('Motivo de cancelación (opcional):') ?? ''
      : null

    const { data } = await supabase
      .from('schedule_sessions')
      .update({ is_cancelled: !session.is_cancelled, cancellation_note: note })
      .eq('id', session.id)
      .select()
      .single()

    if (data) {
      setSessions(prev => prev.map(s => s.id === session.id ? data : s))

      if (!session.is_cancelled) {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '⚠️ Clase cancelada',
            body: `La clase "${session.title}" del ${WEEK_DAYS[session.day_of_week as DayOfWeek]} ha sido cancelada. ${note || ''}`,
            sessionId: session.id,
          }),
        })
      }
    }
    setCancelling(null)
  }

  return (
    <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
      <p className="text-xs text-text-muted">
        Semana del {new Date(weekStart + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {DAYS.map(day => {
        const isSpecial = day === 6
        const blocks = isSpecial ? ['special' as TimeBlock] : REGULAR_BLOCKS

        return (
          <div key={day} className="space-y-2">
            <h3 className="font-semibold text-sm text-pink">{WEEK_DAYS[day]}</h3>
            {blocks.map(block => {
              const session = sessions.find(s => s.day_of_week === day && s.time_block === block)
              const timeInfo = TIME_BLOCKS[block]

              return (
                <Card key={block} padded={false} className={`p-3 ${session?.is_cancelled ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-pink font-medium">{timeInfo.label}</span>
                        {timeInfo.start && (
                          <span className="text-xs text-text-muted">{timeInfo.start}–{timeInfo.end}</span>
                        )}
                        {session?.is_cancelled && <Badge variant="red">Cancelada</Badge>}
                      </div>
                      {session ? (
                        <p className="text-sm font-medium">{session.title}</p>
                      ) : (
                        <p className="text-sm text-text-muted italic">Sin sesión</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditor(day, block)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      {session && (
                        <button
                          onClick={() => toggleCancel(session)}
                          disabled={cancelling === session.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            session.is_cancelled
                              ? 'text-green-400 hover:bg-green-900/20'
                              : 'text-yellow-400 hover:bg-yellow-900/20'
                          }`}
                        >
                          {session.is_cancelled ? <Plus size={14} /> : <AlertTriangle size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      })}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-surface border-t border-border rounded-t-3xl p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Editar sesión</h2>
                <p className="text-xs text-text-muted">
                  {WEEK_DAYS[editing.day]} · {TIME_BLOCKS[editing.block].label}
                  {TIME_BLOCKS[editing.block].start && ` · ${TIME_BLOCKS[editing.block].start}`}
                </p>
              </div>
              <button onClick={() => setEditing(null)} className="text-text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>

            <Input label="Título" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej: HIIT + Funcional" />
            <div>
              <label className="text-sm font-medium text-text-muted block mb-1.5">Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción de la sesión..."
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-pink resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-muted block mb-1.5">Nivel</label>
              <div className="grid grid-cols-2 gap-2">
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setForm(p => ({ ...p, level: l }))}
                    className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                      form.level === l ? 'border-pink bg-pink/10' : 'border-border bg-background text-text-muted'
                    }`}
                  >
                    {l === 'all' ? 'Todos' : l === 'beginner' ? 'Principiante' : l === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Materiales / qué traer" value={form.materials} onChange={e => setForm(p => ({ ...p, materials: e.target.value }))} placeholder="Ej: Botella de agua, peto, zapatillas" />
            <Input label="Ubicación" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Parque Las Américas" />

            <Button onClick={saveSession} loading={saving} className="w-full" size="lg">
              Guardar sesión
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

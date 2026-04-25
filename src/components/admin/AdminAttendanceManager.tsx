'use client'

import { useState } from 'react'
import { Users, CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { TIME_BLOCKS, WEEK_DAYS } from '@/config/schedule'
import type { Database } from '@/types/database'

type Session = Database['public']['Tables']['schedule_sessions']['Row']
type Attendance = Database['public']['Tables']['attendance']['Row']

interface Student {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface AdminAttendanceManagerProps {
  sessions: Session[]
  students: Student[]
  attendance: Attendance[]
  weekStart: string
}

export function AdminAttendanceManager({ sessions, students, attendance: initial, weekStart }: AdminAttendanceManagerProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>(initial)
  const [toggling, setToggling] = useState<string | null>(null)

  function isPresent(studentId: string) {
    return attendance.some(a => a.session_id === selectedSession?.id && a.user_id === studentId)
  }

  async function toggleAttendance(student: Student) {
    if (!selectedSession) return
    setToggling(student.id)

    const present = isPresent(student.id)

    if (present) {
      await supabase
        .from('attendance')
        .delete()
        .eq('session_id', selectedSession.id)
        .eq('user_id', student.id)
      setAttendance(prev => prev.filter(a => !(a.session_id === selectedSession.id && a.user_id === student.id)))
      toast(`${student.full_name} — ausente`)
    } else {
      const { data } = await supabase
        .from('attendance')
        .insert({ session_id: selectedSession.id, user_id: student.id })
        .select()
        .single()
      if (data) {
        setAttendance(prev => [...prev, data])
        toast(`${student.full_name} — presente ✓`)
      }
    }
    setToggling(null)
  }

  const presentCount = selectedSession
    ? attendance.filter(a => a.session_id === selectedSession.id).length
    : 0

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">

      {/* Week label */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <CalendarDays size={13} />
        Semana del {new Date(weekStart + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
      </div>

      {/* Session selector */}
      {sessions.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={CalendarDays}
            title="Sin sesiones esta semana"
            description="Crea sesiones en el módulo Programa para poder marcar asistencia."
            action={{ label: 'Ir a Programa', href: '/admin/schedule' }}
          />
        </Card>
      ) : (
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">Selecciona una sesión</p>
          <div className="space-y-1.5">
            {sessions.map(session => {
              const block = TIME_BLOCKS[session.time_block as keyof typeof TIME_BLOCKS]
              const day = WEEK_DAYS[session.day_of_week as keyof typeof WEEK_DAYS]
              const count = attendance.filter(a => a.session_id === session.id).length
              const isSelected = selectedSession?.id === session.id

              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(isSelected ? null : session)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    isSelected
                      ? 'border-pink bg-pink/10'
                      : 'border-border bg-surface hover:border-pink/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{session.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{day} · {block?.start} – {block?.end}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                      <Users size={12} />
                      {count}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Student list */}
      {selectedSession && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
              Alumnos — {selectedSession.title}
            </p>
            <p className="text-xs text-pink font-medium">{presentCount} / {students.length} presentes</p>
          </div>

          {students.length === 0 ? (
            <Card padded={false}>
              <EmptyState icon={Users} title="Sin alumnos activos" description="Activa alumnos desde la sección Alumnos." />
            </Card>
          ) : (
            <Card padded={false} className="divide-y divide-border">
              {students.map(student => {
                const present = isPresent(student.id)
                const loading = toggling === student.id
                const initials = student.full_name
                  ?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 p-3 transition-colors ${present ? 'bg-green-900/10' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-pink/10 flex items-center justify-center shrink-0 text-pink text-sm font-bold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.full_name || 'Sin nombre'}</p>
                      {student.role === 'admin' && (
                        <p className="text-[10px] text-pink">Coach</p>
                      )}
                    </div>
                    <ToggleSwitch
                      checked={present}
                      onChange={() => !loading && toggleAttendance(student)}
                      disabled={loading}
                    />
                  </div>
                )
              })}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

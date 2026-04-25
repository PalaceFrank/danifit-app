'use client'

import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { SessionCard } from './SessionCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { WEEK_DAYS, REGULAR_BLOCKS, TIME_BLOCKS } from '@/config/schedule'
import type { Database } from '@/types/database'
import type { DayOfWeek, TimeBlock } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

type Session = Database['public']['Tables']['schedule_sessions']['Row']

interface ScheduleViewProps {
  sessions: Session[]
  checkedInIds: Set<string>
  userId: string
  weekStart: string
}

const DAY_ORDER: DayOfWeek[] = [1, 2, 3, 4, 6]

// JS getDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
// App day_of_week: 1=Mon,2=Tue,3=Wed,4=Thu,6=Sat
function jsToAppDay(jsDay: number): DayOfWeek | null {
  const map: Record<number, DayOfWeek> = { 1: 1, 2: 2, 3: 3, 4: 4, 6: 6 }
  return map[jsDay] ?? null
}

export function ScheduleView({ sessions, checkedInIds: initialCheckedIn, userId, weekStart }: ScheduleViewProps) {
  const now = new Date()
  const todayAppDay = jsToAppDay(now.getDay())
  const defaultDay: DayOfWeek = (todayAppDay && DAY_ORDER.includes(todayAppDay))
    ? todayAppDay
    : 1
  const [activeDay, setActiveDay] = useState<DayOfWeek>(defaultDay)
  const [checkedInIds, setCheckedInIds] = useState(initialCheckedIn)
  const supabase = createClient()

  const daySessions = sessions.filter(s => s.day_of_week === activeDay)
  const isSpecialDay = activeDay === 6
  const blocks: TimeBlock[] = isSpecialDay ? ['special'] : REGULAR_BLOCKS

  function getSessionStatus(session: Session): 'today' | 'past' | 'upcoming' {
    if (activeDay !== todayAppDay) return 'upcoming'
    // If viewing today, check time
    const [h, m] = (TIME_BLOCKS[session.time_block].end || '').split(':').map(Number)
    if (!h && h !== 0) return 'today'
    const endMinutes = h * 60 + (m || 0)
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    return nowMinutes > endMinutes ? 'past' : 'today'
  }

  async function handleCheckIn(sessionId: string) {
    const { error } = await supabase
      .from('attendance')
      .insert({ user_id: userId, session_id: sessionId })
    if (!error) {
      setCheckedInIds(prev => { const s = new Set(prev); s.add(sessionId); return s })
    }
  }

  const weekLabel = new Date(weekStart + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
          Semana del {weekLabel}
        </p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {DAY_ORDER.map(day => {
          const hasSession = sessions.some(s => s.day_of_week === day && !s.is_cancelled)
          const hasCancelled = sessions.some(s => s.day_of_week === day && s.is_cancelled)
          const isToday = day === todayAppDay
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl shrink-0 transition-all duration-150 ${
                activeDay === day
                  ? 'bg-pink text-white'
                  : 'bg-surface border border-border text-text-muted hover:border-pink/50'
              }`}
            >
              <span className={`text-[10px] font-medium uppercase ${isToday && activeDay !== day ? 'text-pink' : ''}`}>
                {WEEK_DAYS[day].slice(0, 3)}
              </span>
              <span className={`text-base font-bold leading-tight ${isToday && activeDay !== day ? 'text-pink' : ''}`}>
                {new Date(new Date(weekStart + 'T12:00:00').getTime() + ([1,2,3,4,6].indexOf(day)) * 86400000).getDate()}
              </span>
              {hasSession && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  hasCancelled ? 'bg-red-400' : activeDay === day ? 'bg-white/60' : 'bg-pink'
                }`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        {isSpecialDay ? (
          daySessions.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sin actividad este sábado"
              description="El Coach no ha programado actividad especial esta semana."
            />
          ) : (
            daySessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                status={getSessionStatus(session)}
                isCheckedIn={checkedInIds.has(session.id)}
                onCheckIn={handleCheckIn}
              />
            ))
          )
        ) : (
          <>
            {blocks.map(block => {
              const session = daySessions.find(s => s.time_block === block && !s.is_cancelled)
              const cancelled = daySessions.find(s => s.time_block === block && s.is_cancelled)
              if (cancelled) {
                return (
                  <SessionCard key={`cancelled-${block}`} session={cancelled} status="upcoming" />
                )
              }
              if (!session) {
                return (
                  <div key={block} className="bg-surface/40 border border-border/50 rounded-2xl p-4">
                    <p className="text-xs text-text-muted">
                      <span className="font-medium">{TIME_BLOCKS[block].start}–{TIME_BLOCKS[block].end}</span>
                      {' · '}Sin sesión asignada
                    </p>
                  </div>
                )
              }
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  status={getSessionStatus(session)}
                  isCheckedIn={checkedInIds.has(session.id)}
                  onCheckIn={handleCheckIn}
                />
              )
            })}
            {daySessions.length === 0 && blocks.every(b => !daySessions.find(s => s.time_block === b)) && (
              <EmptyState
                icon={CalendarDays}
                title="Sin sesiones este día"
                description="El Coach no ha programado sesiones para este día."
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

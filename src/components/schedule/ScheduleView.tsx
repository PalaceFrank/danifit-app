'use client'

import { useState } from 'react'
import { SessionCard } from './SessionCard'
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

export function ScheduleView({ sessions, checkedInIds: initialCheckedIn, userId, weekStart }: ScheduleViewProps) {
  const today = new Date().getDay()
  const defaultDay: DayOfWeek = ([1, 2, 3, 4].includes(today) ? today : 1) as DayOfWeek
  const [activeDay, setActiveDay] = useState<DayOfWeek>(defaultDay)
  const [checkedInIds, setCheckedInIds] = useState(initialCheckedIn)
  const supabase = createClient()

  const daySessions = sessions.filter(s => s.day_of_week === activeDay)

  const isSpecialDay = activeDay === 6
  const blocks: TimeBlock[] = isSpecialDay ? ['special'] : REGULAR_BLOCKS

  async function handleCheckIn(sessionId: string) {
    const { error } = await supabase
      .from('attendance')
      .insert({ user_id: userId, session_id: sessionId })

    if (!error) {
      setCheckedInIds(prev => { const s = new Set(prev); s.add(sessionId); return s })
    }
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xs text-text-muted font-medium uppercase tracking-wide">
          Semana del {new Date(weekStart + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
        </h2>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {DAY_ORDER.map(day => {
          const hasSession = sessions.some(s => s.day_of_week === day)
          const hasCancelled = sessions.some(s => s.day_of_week === day && s.is_cancelled)
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl shrink-0 transition-colors ${
                activeDay === day
                  ? 'bg-pink text-white'
                  : 'bg-surface border border-border text-text-muted hover:border-pink/50'
              }`}
            >
              <span className="text-xs font-medium">{WEEK_DAYS[day].slice(0, 3)}</span>
              {hasSession && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
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
            <EmptyDay label="No hay actividad especial este sábado" />
          ) : (
            daySessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                isCheckedIn={checkedInIds.has(session.id)}
                onCheckIn={handleCheckIn}
              />
            ))
          )
        ) : (
          blocks.map(block => {
            const session = daySessions.find(s => s.time_block === block)
            if (!session) {
              return (
                <div key={block} className="bg-surface/50 border border-border/50 rounded-2xl p-4">
                  <p className="text-xs text-text-muted">
                    <span className="text-pink font-medium">{TIME_BLOCKS[block].label}</span>
                    {' · '}{TIME_BLOCKS[block].start}–{TIME_BLOCKS[block].end}
                    {' · '}Sin sesión asignada
                  </p>
                </div>
              )
            }
            return (
              <SessionCard
                key={session.id}
                session={session}
                isCheckedIn={checkedInIds.has(session.id)}
                onCheckIn={handleCheckIn}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function EmptyDay({ label }: { label: string }) {
  return (
    <div className="text-center py-12 text-text-muted">
      <p className="text-sm">{label}</p>
    </div>
  )
}

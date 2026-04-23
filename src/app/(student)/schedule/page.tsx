import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ScheduleView } from '@/components/schedule/ScheduleView'
import { getWeekStart, formatWeekStart } from '@/config/schedule'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = formatWeekStart(getWeekStart())

  const { data: sessions } = await supabase
    .from('schedule_sessions')
    .select('*')
    .eq('week_start', weekStart)
    .order('day_of_week')
    .order('time_block')

  const { data: attendance } = await supabase
    .from('attendance')
    .select('session_id')
    .eq('user_id', user.id)

  const checkedInIds = new Set((attendance || []).map(a => a.session_id))

  return (
    <>
      <TopBar title="Programa" />
      <ScheduleView
        sessions={sessions || []}
        checkedInIds={checkedInIds}
        userId={user.id}
        weekStart={weekStart}
      />
    </>
  )
}

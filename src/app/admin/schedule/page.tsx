import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { AdminScheduleManager } from '@/components/admin/AdminScheduleManager'
import { getWeekStart, formatWeekStart } from '@/config/schedule'

export default async function AdminSchedulePage() {
  const supabase = await createClient()
  const weekStart = formatWeekStart(getWeekStart())

  const { data: sessions } = await supabase
    .from('schedule_sessions')
    .select('*')
    .eq('week_start', weekStart)
    .order('day_of_week')
    .order('time_block')

  return (
    <>
      <TopBar title="Programa semanal" />
      <AdminScheduleManager sessions={sessions || []} weekStart={weekStart} />
    </>
  )
}

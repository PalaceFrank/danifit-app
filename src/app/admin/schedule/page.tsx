import { createClient } from '@/lib/supabase/server'
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

  return <AdminScheduleManager sessions={sessions || []} weekStart={weekStart} />
}

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { AdminAttendanceManager } from '@/components/admin/AdminAttendanceManager'
import { getWeekStart, formatWeekStart } from '@/config/schedule'

export default async function AttendancePage() {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const weekStart = formatWeekStart(getWeekStart())

  const [{ data: sessions }, { data: students }] = await Promise.all([
    supabase
      .from('schedule_sessions')
      .select('*')
      .eq('week_start', weekStart)
      .order('day_of_week')
      .order('time_block'),
    adminClient
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('status', 'active')
      .order('full_name'),
  ])

  const sessionIds = (sessions || []).map(s => s.id)
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .in('session_id', sessionIds)

  return (
    <>
      <TopBar title="Asistencia" />
      <AdminAttendanceManager
        sessions={sessions || []}
        students={students || []}
        attendance={attendance || []}
        weekStart={weekStart}
      />
    </>
  )
}

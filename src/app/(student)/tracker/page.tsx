import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { TrackerDashboard } from '@/components/tracker/TrackerDashboard'

export default async function TrackerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bodyProfile } = await supabase
    .from('user_body_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!bodyProfile) {
    redirect('/tracker/onboarding')
  }

  const { data: measurements } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: true })

  return (
    <>
      <TopBar title="Mi progreso" />
      <TrackerDashboard bodyProfile={bodyProfile} measurements={measurements || []} userId={user.id} />
    </>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ProfileView } from '@/components/profile/ProfileView'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <>
      <TopBar title="Mi perfil" />
      <ProfileView profile={profile!} />
    </>
  )
}

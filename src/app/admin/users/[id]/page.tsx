import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { StudentProfileView } from '@/components/admin/StudentProfileView'

interface Props {
  params: Promise<{ id: string }>
}

export default async function StudentProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createAdminClient()

  const [{ data: profile }, { data: bodyProfile }, { data: measurements }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('user_body_profiles').select('*').eq('user_id', id).single(),
    supabase.from('body_measurements').select('*').eq('user_id', id).order('measured_at', { ascending: true }),
  ])

  if (!profile) notFound()

  return (
    <StudentProfileView
      profile={profile}
      bodyProfile={bodyProfile ?? null}
      measurements={measurements ?? []}
    />
  )
}

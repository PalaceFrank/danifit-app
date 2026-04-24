import { createClient } from '@/lib/supabase/server'
import { InvitationsManager } from '@/components/admin/InvitationsManager'

export default async function InvitationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invitations } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false })

  return <InvitationsManager invitations={invitations || []} adminId={user!.id} />
}

import { createClient } from '@/lib/supabase/server'
import { UsersManager } from '@/components/admin/UsersManager'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  return <UsersManager users={users || []} />
}

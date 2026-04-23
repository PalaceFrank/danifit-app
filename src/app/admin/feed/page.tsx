import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { AdminFeedManager } from '@/components/admin/AdminFeedManager'

export default async function AdminFeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <TopBar title="Feed" />
      <AdminFeedManager posts={posts || []} adminId={user!.id} />
    </>
  )
}

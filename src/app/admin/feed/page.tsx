import { createClient } from '@/lib/supabase/server'
import { AdminFeedManager } from '@/components/admin/AdminFeedManager'

export default async function AdminFeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  const postIds = (posts || []).map(p => p.id)

  const [{ data: reactions }, { data: comments }] = await Promise.all([
    supabase.from('post_reactions').select('post_id, emoji, profiles(full_name)').in('post_id', postIds),
    supabase.from('post_comments').select('post_id, content, created_at, profiles(full_name)').in('post_id', postIds).order('created_at'),
  ])

  return (
    <AdminFeedManager
      posts={posts || []}
      adminId={user!.id}
      reactions={reactions || []}
      comments={comments || []}
    />
  )
}

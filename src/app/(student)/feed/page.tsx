import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { PostCard } from '@/components/feed/PostCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Rss } from 'lucide-react'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(full_name)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  const postIds = (posts || []).map(p => p.id)

  const [{ data: reactions }, { data: rawComments }] = await Promise.all([
    supabase.from('post_reactions').select('*').in('post_id', postIds),
    supabase.from('post_comments')
      .select('*, profiles(full_name, avatar_url)')
      .in('post_id', postIds)
      .order('created_at'),
  ])

  return (
    <>
      <TopBar title="Feed" />
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto pb-6">
        {(!posts || posts.length === 0) && (
          <EmptyState
            icon={Rss}
            title="Sin publicaciones aún"
            description="Tu Coach compartirá rutinas, avisos y motivación aquí. ¡Muy pronto!"
          />
        )}
        {(posts || []).map(post => {
          const postReactions = (reactions || []).filter(r => r.post_id === post.id)
          const postComments = buildCommentTree(
            (rawComments || []).filter(c => c.post_id === post.id)
          )
          return (
            <PostCard
              key={post.id}
              post={post}
              reactions={postReactions}
              comments={postComments}
              currentUserId={user.id}
              isAdmin={profile?.role === 'admin'}
              authorName={(post as { profiles?: { full_name?: string } }).profiles?.full_name || 'Coach'}
            />
          )
        })}
      </div>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCommentTree(comments: any[]): any[] {
  const roots = comments.filter((c: { parent_id: string | null }) => !c.parent_id)
  return roots.map(root => ({
    ...root,
    replies: comments.filter((c: { parent_id: string | null }) => c.parent_id === root.id),
  }))
}

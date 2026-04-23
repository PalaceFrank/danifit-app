'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle, Pin, Trash2, Send } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Database, ReactionEmoji } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

type Post = Database['public']['Tables']['posts']['Row']
type Comment = Database['public']['Tables']['post_comments']['Row'] & {
  profiles: { full_name: string; avatar_url: string | null }
  replies?: Comment[]
}
type Reaction = Database['public']['Tables']['post_reactions']['Row']

const EMOJIS: ReactionEmoji[] = ['💪', '🔥', '❤️', '👏']

const POST_TYPE_BADGE: Record<string, { label: string; variant: 'pink' | 'green' | 'yellow' | 'gray' }> = {
  announcement: { label: 'Aviso',       variant: 'pink' },
  motivation:   { label: 'Motivación',  variant: 'yellow' },
  result:       { label: 'Resultado',   variant: 'green' },
  nutrition:    { label: 'Nutrición',   variant: 'green' },
  general:      { label: '',            variant: 'gray' },
}

interface PostCardProps {
  post: Post
  reactions: Reaction[]
  comments: Comment[]
  currentUserId: string
  isAdmin: boolean
  authorName: string
}

export function PostCard({ post, reactions: initialReactions, comments: initialComments, currentUserId, isAdmin, authorName }: PostCardProps) {
  const [reactions, setReactions] = useState(initialReactions)
  const [comments, setComments] = useState(initialComments)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const userReactions = reactions.filter(r => r.user_id === currentUserId).map(r => r.emoji)

  async function toggleReaction(emoji: ReactionEmoji) {
    const existing = reactions.find(r => r.user_id === currentUserId && r.emoji === emoji)
    if (existing) {
      await supabase.from('post_reactions').delete().eq('id', existing.id)
      setReactions(prev => prev.filter(r => r.id !== existing.id))
    } else {
      const { data } = await supabase.from('post_reactions')
        .insert({ post_id: post.id, user_id: currentUserId, emoji })
        .select().single()
      if (data) setReactions(prev => [...prev, data])
    }
  }

  function countReaction(emoji: ReactionEmoji) {
    return reactions.filter(r => r.emoji === emoji).length
  }

  async function submitComment() {
    if (!newComment.trim()) return
    setSubmitting(true)
    const { data } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, author_id: currentUserId, content: newComment.trim() })
      .select('*, profiles(full_name, avatar_url)')
      .single()
    if (data) setComments(prev => [...prev, { ...data, replies: [] } as Comment])
    setNewComment('')
    setSubmitting(false)
  }

  async function submitReply(parentId: string) {
    if (!replyText.trim()) return
    setSubmitting(true)
    const { data } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, author_id: currentUserId, content: replyText.trim(), parent_id: parentId })
      .select('*, profiles(full_name, avatar_url)')
      .single()
    if (data) {
      setComments(prev => prev.map(c =>
        c.id === parentId ? { ...c, replies: [...(c.replies || []), data as Comment] } : c
      ))
    }
    setReplyText('')
    setReplyTo(null)
    setSubmitting(false)
  }

  async function deleteComment(commentId: string) {
    await supabase.from('post_comments').update({ is_deleted: true }).eq('id', commentId)
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, is_deleted: true, content: '' } : c
    ))
  }

  const topComments = comments.filter(c => !c.parent_id)
  const typeInfo = POST_TYPE_BADGE[post.post_type] || POST_TYPE_BADGE.general

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink rounded-full flex items-center justify-center text-white text-xs font-bold">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{authorName}</p>
            <p className="text-xs text-text-muted">
              {new Date(post.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.is_pinned && <Pin size={14} className="text-pink" />}
          {typeInfo.label && <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative w-full aspect-video">
          <Image
            src={post.image_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      )}

      {/* Reactions */}
      <div className="px-4 py-3 flex items-center gap-2 border-t border-border">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors ${
              userReactions.includes(emoji)
                ? 'bg-pink/20 border border-pink/40'
                : 'bg-white/5 border border-transparent hover:bg-white/10'
            }`}
          >
            <span>{emoji}</span>
            {countReaction(emoji) > 0 && (
              <span className="text-xs text-text-muted">{countReaction(emoji)}</span>
            )}
          </button>
        ))}

        <button
          onClick={() => setShowComments(!showComments)}
          className="ml-auto flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
        >
          <MessageCircle size={15} />
          {topComments.length > 0 && <span>{topComments.length}</span>}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-border">
          <div className="px-4 py-3 space-y-3 max-h-80 overflow-y-auto">
            {topComments.length === 0 && (
              <p className="text-xs text-text-muted text-center py-2">Sin comentarios aún</p>
            )}
            {topComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onDelete={deleteComment}
                onReply={setReplyTo}
                replyTo={replyTo}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                onSubmitReply={submitReply}
                submitting={submitting}
              />
            ))}
          </div>

          {/* New comment */}
          <div className="px-4 pb-4 flex gap-2">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-pink"
            />
            <button
              onClick={submitComment}
              disabled={!newComment.trim() || submitting}
              className="text-pink disabled:text-text-muted transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  isAdmin: boolean
  onDelete: (id: string) => void
  onReply: (id: string | null) => void
  replyTo: string | null
  replyText: string
  onReplyTextChange: (v: string) => void
  onSubmitReply: (parentId: string) => void
  submitting: boolean
}

function CommentItem({ comment, currentUserId, isAdmin, onDelete, onReply, replyTo, replyText, onReplyTextChange, onSubmitReply, submitting }: CommentItemProps) {
  if (comment.is_deleted) {
    return <p className="text-xs text-text-muted italic">Comentario eliminado</p>
  }

  const canDelete = isAdmin || comment.author_id === currentUserId

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 group">
        <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] shrink-0">
          {comment.profiles?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold">{comment.profiles?.full_name}</span>
            <span className="text-[10px] text-text-muted">
              {new Date(comment.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">{comment.content}</p>
          <button
            onClick={() => onReply(replyTo === comment.id ? null : comment.id)}
            className="text-[10px] text-text-muted hover:text-pink mt-0.5"
          >
            Responder
          </button>
        </div>
        {canDelete && (
          <button onClick={() => onDelete(comment.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all">
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Replies */}
      {comment.replies?.filter(r => !r.is_deleted).map(reply => (
        <div key={reply.id} className="ml-8 flex items-start gap-2 group">
          <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] shrink-0">
            {reply.profiles?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold">{reply.profiles?.full_name}</span>
            <p className="text-xs text-text-muted">{reply.content}</p>
          </div>
          {(isAdmin || reply.author_id === currentUserId) && (
            <button onClick={() => onDelete(reply.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ))}

      {/* Reply input */}
      {replyTo === comment.id && (
        <div className="ml-8 flex gap-2">
          <input
            value={replyText}
            onChange={e => onReplyTextChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSubmitReply(comment.id)}
            placeholder="Tu respuesta..."
            autoFocus
            className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs placeholder:text-text-muted focus:outline-none focus:border-pink"
          />
          <button
            onClick={() => onSubmitReply(comment.id)}
            disabled={!replyText.trim() || submitting}
            className="text-pink disabled:text-text-muted"
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Plus, Pin, PinOff, Trash2, Image as ImageIcon, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { Database, PostType } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'general',      label: 'General' },
  { value: 'announcement', label: 'Aviso' },
  { value: 'motivation',   label: 'Motivación' },
  { value: 'result',       label: 'Resultado' },
  { value: 'nutrition',    label: 'Nutrición' },
]

interface AdminFeedManagerProps {
  posts: Post[]
  adminId: string
}

export function AdminFeedManager({ posts: initial, adminId }: AdminFeedManagerProps) {
  const supabase = createClient()
  const [posts, setPosts] = useState(initial)
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<PostType>('general')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function publishPost() {
    if (!content.trim()) return
    setPublishing(true)

    let image_url: string | null = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `posts/${adminId}/${Date.now()}.${ext}`
      const { data } = await supabase.storage
        .from('post-images')
        .upload(path, imageFile, { upsert: false })
      if (data) {
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(data.path)
        image_url = urlData.publicUrl
      }
    }

    const { data } = await supabase
      .from('posts')
      .insert({ author_id: adminId, content: content.trim(), post_type: postType, image_url })
      .select()
      .single()

    if (data) setPosts(prev => [data, ...prev])
    setContent('')
    setPostType('general')
    setImageFile(null)
    setImagePreview(null)
    setPublishing(false)
  }

  async function togglePin(post: Post) {
    const { data } = await supabase
      .from('posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', post.id)
      .select()
      .single()
    if (data) setPosts(prev => prev.map(p => p.id === post.id ? data : p))
  }

  async function deletePost(postId: string) {
    if (!confirm('¿Eliminar esta publicación?')) return
    await supabase.from('posts').delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
      {/* Composer */}
      <Card className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {POST_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setPostType(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                postType === t.value ? 'border-pink bg-pink/10 text-white' : 'border-border text-text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="¿Qué quieres compartir con tus alumnos?"
          rows={4}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-pink resize-none"
        />

        {imagePreview && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image src={imagePreview} alt="" fill className="object-cover" sizes="600px" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
          >
            <ImageIcon size={16} />
            Imagen
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <Button onClick={publishPost} loading={publishing} className="ml-auto">
            <Plus size={16} />
            Publicar
          </Button>
        </div>
      </Card>

      {/* Posts list */}
      <div className="space-y-3">
        {posts.map(post => (
          <Card key={post.id} padded={false} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={post.post_type === 'announcement' ? 'pink' : 'gray'}>
                  {POST_TYPES.find(t => t.value === post.post_type)?.label}
                </Badge>
                {post.is_pinned && <Pin size={12} className="text-pink" />}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => togglePin(post)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                  title={post.is_pinned ? 'Desfijar' : 'Fijar'}
                >
                  {post.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 rounded-lg hover:bg-red-900/20 text-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{post.content}</p>
            <p className="text-xs text-text-muted mt-2">
              {new Date(post.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

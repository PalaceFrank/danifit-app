import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import {
  Users, UserCheck, Rss, Mail,
  CalendarDays, PlusCircle, UserPlus, AlertCircle, MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'ahora'
  if (mins  < 60) return `hace ${mins}m`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: totalPosts },
    { count: pendingInvites },
    { data: recentReactions },
    { data: recentComments },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'pending'),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('post_reactions')
      .select('id, emoji, created_at, profiles(full_name), posts(content)')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase.from('post_comments')
      .select('id, content, created_at, profiles(full_name), posts(content)')
      .gte('created_at', sevenDaysAgo)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  // Merge and sort activity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activity = [
    ...(recentReactions || []).map((r: any) => ({
      id: `r-${r.id}`,
      type: 'reaction' as const,
      emoji: r.emoji,
      studentName: r.profiles?.full_name || 'Alumno',
      postSnippet: (r.posts?.content || '').slice(0, 50),
      date: r.created_at,
    })),
    ...(recentComments || []).map((c: any) => ({
      id: `c-${c.id}`,
      type: 'comment' as const,
      emoji: null,
      studentName: c.profiles?.full_name || 'Alumno',
      postSnippet: (c.posts?.content || '').slice(0, 50),
      commentSnippet: (c.content || '').slice(0, 60),
      date: c.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)

  const stats = [
    {
      label: 'Alumnos activos',
      value: totalUsers ?? 0,
      icon: UserCheck,
      href: '/admin/users',
      bg: 'bg-green-900/30',
      text: 'text-green-400',
      border: 'border-green-800/40',
    },
    {
      label: 'Por activar',
      value: pendingUsers ?? 0,
      icon: AlertCircle,
      href: '/admin/users',
      bg: 'bg-yellow-900/30',
      text: 'text-yellow-400',
      border: 'border-yellow-800/40',
      urgent: (pendingUsers ?? 0) > 0,
    },
    {
      label: 'Publicaciones',
      value: totalPosts ?? 0,
      icon: Rss,
      href: '/admin/feed',
      bg: 'bg-pink/10',
      text: 'text-pink',
      border: 'border-pink/20',
    },
    {
      label: 'Invitaciones',
      value: pendingInvites ?? 0,
      icon: Mail,
      href: '/admin/invitations',
      bg: 'bg-blue-900/30',
      text: 'text-blue-400',
      border: 'border-blue-800/40',
    },
  ]

  const quickActions = [
    { href: '/admin/schedule',    icon: CalendarDays, label: 'Editar programa',   desc: 'Sesiones de esta semana',    color: 'text-pink' },
    { href: '/admin/feed',        icon: PlusCircle,   label: 'Nueva publicación', desc: 'Comparte con tus alumnos',   color: 'text-pink' },
    { href: '/admin/invitations', icon: UserPlus,     label: 'Invitar alumno',    desc: 'Genera un link de acceso',   color: 'text-pink' },
    { href: '/admin/users',       icon: Users,        label: 'Gestionar alumnos', desc: 'Activar o desactivar cuentas', color: 'text-pink' },
  ]

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">

        {/* Stats */}
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">Resumen</p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <Link key={s.label} href={s.href}>
                <div className={`relative p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${s.bg} ${s.border}`}>
                  {s.urgent && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-black/20">
                    <s.icon size={18} className={s.text} />
                  </div>
                  <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
                  <p className="text-xs text-text-muted mt-0.5 font-medium">{s.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Actividad reciente</p>
            {activity.length > 0 && (
              <Link href="/admin/feed" className="text-xs text-pink hover:underline">Ver feed →</Link>
            )}
          </div>

          {activity.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <MessageCircle size={22} className="text-text-muted" />
              <p className="text-sm text-text-muted">Sin actividad en los últimos 7 días</p>
            </Card>
          ) : (
            <Card padded={false} className="divide-y divide-border">
              {activity.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm mt-0.5">
                    {item.type === 'reaction' ? item.emoji : <MessageCircle size={14} className="text-text-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-medium text-white">{item.studentName}</span>
                      {' '}
                      <span className="text-text-muted">
                        {item.type === 'reaction' ? 'reaccionó a' : 'comentó en'}
                      </span>
                      {' '}
                      <span className="text-text-muted italic truncate">"{item.postSnippet}{item.postSnippet.length === 50 ? '…' : ''}"</span>
                    </p>
                    {'commentSnippet' in item && item.commentSnippet && (
                      <p className="text-xs text-white/70 mt-0.5 line-clamp-1">"{item.commentSnippet}"</p>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0 mt-0.5">{timeAgo(item.date)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">Acciones rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(a => (
              <Link key={a.href} href={a.href}>
                <Card padded={false} className="p-4 hover:border-pink/40 active:bg-white/5 transition-all cursor-pointer group">
                  <a.icon size={20} className={`${a.color} mb-3 transition-transform group-hover:scale-110`} />
                  <p className="font-semibold text-sm">{a.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}

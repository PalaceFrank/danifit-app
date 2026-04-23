import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import { Users, CalendarCheck, Rss, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: totalPosts },
    { count: pendingInvites },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'pending'),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Alumnos activos', value: totalUsers ?? 0,    icon: Users,        href: '/admin/users',       color: 'text-green-400' },
    { label: 'Pendientes',      value: pendingUsers ?? 0,  icon: CalendarCheck, href: '/admin/users',      color: 'text-yellow-400' },
    { label: 'Posts',           value: totalPosts ?? 0,    icon: Rss,           href: '/admin/feed',       color: 'text-pink' },
    { label: 'Invit. activas',  value: pendingInvites ?? 0, icon: Mail,         href: '/admin/invitations', color: 'text-blue-400' },
  ]

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <Link key={s.label} href={s.href}>
              <Card className="space-y-2 hover:border-pink/40 transition-colors cursor-pointer">
                <s.icon size={20} className={s.color} />
                <div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-text-muted">{s.label}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/schedule">
            <Card className="hover:border-pink/40 transition-colors cursor-pointer">
              <p className="font-semibold text-sm">Programa</p>
              <p className="text-xs text-text-muted mt-1">Editar sesiones de esta semana</p>
            </Card>
          </Link>
          <Link href="/admin/feed">
            <Card className="hover:border-pink/40 transition-colors cursor-pointer">
              <p className="font-semibold text-sm">Publicar</p>
              <p className="text-xs text-text-muted mt-1">Nuevo post para tus alumnos</p>
            </Card>
          </Link>
        </div>
      </div>
    </>
  )
}

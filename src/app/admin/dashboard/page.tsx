import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import {
  Users, UserCheck, Rss, Mail,
  CalendarDays, PlusCircle, UserPlus, AlertCircle,
} from 'lucide-react'
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
    {
      href: '/admin/schedule',
      icon: CalendarDays,
      label: 'Editar programa',
      desc: 'Sesiones de esta semana',
      color: 'text-pink',
    },
    {
      href: '/admin/feed',
      icon: PlusCircle,
      label: 'Nueva publicación',
      desc: 'Comparte con tus alumnos',
      color: 'text-pink',
    },
    {
      href: '/admin/invitations',
      icon: UserPlus,
      label: 'Invitar alumno',
      desc: 'Genera un link de acceso',
      color: 'text-pink',
    },
    {
      href: '/admin/users',
      icon: Users,
      label: 'Gestionar alumnos',
      desc: 'Activar o desactivar cuentas',
      color: 'text-pink',
    },
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
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-black/20`}>
                    <s.icon size={18} className={s.text} />
                  </div>
                  <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
                  <p className="text-xs text-text-muted mt-0.5 font-medium">{s.label}</p>
                </div>
              </Link>
            ))}
          </div>
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

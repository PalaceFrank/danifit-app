import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarDays, Users, Rss, Mail, LayoutDashboard } from 'lucide-react'

const ADMIN_NAV = [
  { href: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/schedule',     icon: CalendarDays,    label: 'Programa' },
  { href: '/admin/feed',         icon: Rss,             label: 'Feed' },
  { href: '/admin/users',        icon: Users,           label: 'Alumnos' },
  { href: '/admin/invitations',  icon: Mail,            label: 'Invitaciones' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/schedule')

  return (
    <div className="min-h-dvh flex">
      {/* Sidebar (md+) */}
      <aside className="hidden md:flex w-56 border-r border-border bg-surface flex-col p-4 gap-1">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-8 h-8 bg-pink rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">DF</span>
          </div>
          <span className="font-bold text-sm">Admin</span>
        </div>
        {ADMIN_NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Bottom nav (mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border safe-bottom z-50">
          <div className="flex items-center justify-around px-2 py-2">
            {ADMIN_NAV.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-text-muted">
                <Icon size={20} />
                <span className="text-[9px]">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

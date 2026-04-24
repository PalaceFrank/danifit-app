'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Users, Rss, Mail, LayoutDashboard } from 'lucide-react'

const ADMIN_NAV = [
  { href: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/schedule',     icon: CalendarDays,    label: 'Programa' },
  { href: '/admin/feed',         icon: Rss,             label: 'Feed' },
  { href: '/admin/users',        icon: Users,           label: 'Alumnos' },
  { href: '/admin/invitations',  icon: Mail,            label: 'Invitaciones' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <nav className="space-y-0.5">
      {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              active
                ? 'bg-pink/10 text-pink font-medium'
                : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around px-1 py-1.5">
        {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${
                active ? 'text-pink' : 'text-text-muted'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

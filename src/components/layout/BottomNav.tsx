'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Rss, Activity, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/schedule', icon: CalendarDays, label: 'Programa' },
  { href: '/feed',     icon: Rss,          label: 'Feed' },
  { href: '/tracker',  icon: Activity,     label: 'Progreso' },
  { href: '/profile',  icon: User,         label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                active ? 'text-pink' : 'text-text-muted'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

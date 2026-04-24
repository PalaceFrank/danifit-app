'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarDays, Users, Rss, Mail, LayoutDashboard,
  ArrowLeftRight, ClipboardCheck, Menu, X, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_NAV = [
  { href: '/admin/dashboard',    icon: LayoutDashboard,  label: 'Dashboard'    },
  { href: '/admin/schedule',     icon: CalendarDays,     label: 'Programa'     },
  { href: '/admin/attendance',   icon: ClipboardCheck,   label: 'Asistencia'   },
  { href: '/admin/feed',         icon: Rss,              label: 'Feed'         },
  { href: '/admin/users',        icon: Users,            label: 'Alumnos'      },
  { href: '/admin/invitations',  icon: Mail,             label: 'Invitaciones' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col flex-1 space-y-0.5">
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
      <div className="flex-1" />
      <Link
        href="/schedule"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors border-t border-border pt-4 mt-2"
      >
        <ArrowLeftRight size={18} strokeWidth={1.8} />
        Vista alumno
      </Link>
    </nav>
  )
}

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const currentLabel = ADMIN_NAV.find(n => pathname.startsWith(n.href))?.label ?? 'Admin'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-pink rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xs">DF</span>
          </div>
          <span className="font-semibold text-sm">{currentLabel}</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`md:hidden fixed top-0 right-0 h-full w-72 bg-surface border-l border-border z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">DF</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Danifit</p>
              <p className="text-[10px] text-text-muted">Panel admin</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-text-muted hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
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

        {/* Footer actions */}
        <div className="p-4 border-t border-border space-y-1">
          <Link
            href="/schedule"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeftRight size={18} strokeWidth={1.8} />
            Vista alumno
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}

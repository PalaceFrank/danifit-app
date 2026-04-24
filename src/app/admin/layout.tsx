import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar, AdminMobileHeader } from '@/components/admin/AdminNav'
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton'

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
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 border-r border-border bg-surface flex-col p-4">
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-9 h-9 bg-pink rounded-xl flex items-center justify-center shadow-md shadow-pink/20">
            <span className="text-white font-black text-sm">DF</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Danifit</p>
            <p className="text-[10px] text-text-muted">Panel admin</p>
          </div>
        </div>
        <AdminSidebar />
        <AdminLogoutButton />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminMobileHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

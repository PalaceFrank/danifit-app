import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/server'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  let isAdmin = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      isAdmin = profile?.role === 'admin'
    }
  } catch {}

  return (
    <div className="min-h-dvh flex flex-col">
      {isAdmin && (
        <div className="bg-pink/10 border-b border-pink/20 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-pink font-medium">Modo admin — vista de alumno</span>
          <Link href="/admin/dashboard" className="text-xs bg-pink text-white px-3 py-1 rounded-full font-medium">
            Panel Admin →
          </Link>
        </div>
      )}
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

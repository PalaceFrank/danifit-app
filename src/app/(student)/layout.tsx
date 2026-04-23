import { BottomNav } from '@/components/layout/BottomNav'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

import { type ReactNode } from 'react'

interface TopBarProps {
  title?: string
  action?: ReactNode
}

export function TopBar({ title, action }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-pink rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">DF</span>
          </div>
          {title && <h1 className="font-semibold text-sm">{title}</h1>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}

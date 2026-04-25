import { type ElementType } from 'react'
import { Button } from './Button'
import Link from 'next/link'

interface EmptyStateProps {
  icon: ElementType
  title: string
  description?: string
  action?: { label: string; href: string } | { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
        <Icon size={28} className="text-text-muted" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-base">{title}</p>
        {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
      </div>
      {action && (
        'href' in action
          ? <Link href={action.href}><Button size="sm">{action.label}</Button></Link>
          : <Button size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}

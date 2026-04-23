import { type HTMLAttributes } from 'react'

type BadgeVariant = 'pink' | 'green' | 'yellow' | 'red' | 'gray'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  pink:   'bg-pink/20 text-pink border-pink/30',
  green:  'bg-green-900/30 text-green-400 border-green-800',
  yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  red:    'bg-red-900/30 text-red-400 border-red-800',
  gray:   'bg-white/5 text-text-muted border-border',
}

export function Badge({ variant = 'gray', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

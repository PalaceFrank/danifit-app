import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
}

export function Card({ padded = true, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-2xl ${padded ? 'p-4' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

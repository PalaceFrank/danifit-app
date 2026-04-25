import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  interactive?: boolean
  elevated?: boolean
}

export function Card({ padded = true, interactive, elevated, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-surface border border-border rounded-2xl
        ${padded ? 'p-4' : ''}
        ${interactive ? 'cursor-pointer transition-all duration-150 hover:border-white/20 hover:scale-[1.01] active:scale-[0.98]' : ''}
        ${elevated ? 'shadow-lg hover:shadow-xl transition-shadow duration-200' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  )
}

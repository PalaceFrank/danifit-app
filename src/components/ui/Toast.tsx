'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: AlertCircle,
}

const COLORS = {
  success: 'border-green-800 bg-green-900/40 text-green-300',
  error: 'border-red-800 bg-red-900/40 text-red-300',
  info: 'border-pink/30 bg-pink/10 text-pink',
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = ICONS[toast.type]

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3500)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 ${COLORS[toast.type]}`}>
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-2), { id, message, type }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 left-4 right-4 z-[100] flex flex-col gap-2 max-w-sm mx-auto pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

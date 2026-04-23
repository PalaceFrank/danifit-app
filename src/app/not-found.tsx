import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-background">
      <div className="space-y-4 max-w-sm">
        <div className="inline-flex w-16 h-16 bg-surface border border-border rounded-2xl items-center justify-center mb-2">
          <span className="text-pink font-black text-2xl">DF</span>
        </div>
        <h1 className="text-2xl font-bold">Página no encontrada</h1>
        <p className="text-text-muted text-sm">
          El contenido que buscas no existe o el link ha expirado.
        </p>
        <Link
          href="/schedule"
          className="inline-block mt-4 px-6 py-3 bg-pink hover:bg-pink-hover text-white text-sm font-medium rounded-xl transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}

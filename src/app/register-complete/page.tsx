export default function RegisterCompletePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-background">
      <div className="space-y-4 max-w-sm">
        <div className="inline-flex w-16 h-16 bg-pink rounded-2xl items-center justify-center mb-2">
          <span className="text-white font-black text-2xl">DF</span>
        </div>
        <h1 className="text-2xl font-bold">¡Registro completado!</h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Tu cuenta está siendo revisada por Daniel. Recibirás acceso en cuanto sea aprobada.
        </p>
        <p className="text-xs text-text-muted">
          Si tienes dudas, escríbele directamente a tu entrenador.
        </p>
      </div>
    </div>
  )
}

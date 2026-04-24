'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Goal, ActivityLevel } from '@/types/database'

const GOALS: { value: Goal; label: string; desc: string }[] = [
  { value: 'lose_fat',     label: '🔥 Bajar grasa',     desc: 'Reducir porcentaje de grasa corporal' },
  { value: 'gain_muscle',  label: '💪 Ganar músculo',   desc: 'Aumentar masa muscular' },
  { value: 'maintain',     label: '⚖️ Mantenerme',      desc: 'Mantener composición actual' },
  { value: 'endurance',    label: '🏃 Resistencia',     desc: 'Mejorar resistencia y rendimiento' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary',   label: 'Sedentario',      desc: 'Poco o nada de ejercicio fuera del entreno' },
  { value: 'light',       label: 'Ligero',          desc: '1-3 días de actividad extra por semana' },
  { value: 'moderate',    label: 'Moderado',        desc: '3-5 días de actividad extra por semana' },
  { value: 'active',      label: 'Activo',          desc: '6-7 días de actividad intensa' },
  { value: 'very_active', label: 'Muy activo',      desc: 'Trabajo físico + entreno diario' },
]

const DIETARY_OPTIONS = [
  'Vegetariano', 'Vegano', 'Sin gluten', 'Sin lactosa',
  'Alto en proteína', 'Bajo en carbohidratos', 'Ninguno en particular',
]

type Step = 'basic' | 'goal' | 'activity' | 'diet'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('basic')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    birth_date: '',
    sex: '' as 'male' | 'female' | '',
    height_cm: '',
    initial_weight_kg: '',
    target_weight_kg: '',
    goal: '' as Goal | '',
    activity_level: '' as ActivityLevel | '',
    dietary_preferences: [] as string[],
    dietary_restrictions: '',
  })

  function update(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleDiet(option: string) {
    setForm(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(option)
        ? prev.dietary_preferences.filter(o => o !== option)
        : [...prev.dietary_preferences, option],
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('user_body_profiles').upsert({
      user_id: user.id,
      birth_date: form.birth_date || null,
      sex: form.sex || null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      initial_weight_kg: form.initial_weight_kg ? Number(form.initial_weight_kg) : null,
      target_weight_kg: form.target_weight_kg ? Number(form.target_weight_kg) : null,
      goal: form.goal || null,
      activity_level: form.activity_level || null,
      dietary_preferences: form.dietary_preferences,
      dietary_restrictions: form.dietary_restrictions || null,
    }, { onConflict: 'user_id' })

    router.push('/tracker')
  }

  const steps: Step[] = ['basic', 'goal', 'activity', 'diet']
  const stepIndex = steps.indexOf(step)

  return (
    <div className="min-h-dvh flex flex-col px-6 py-8 max-w-sm mx-auto">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-pink' : 'bg-surface'}`} />
        ))}
      </div>

      <div className="flex-1 space-y-6">
        {step === 'basic' && (
          <>
            <div>
              <h1 className="text-xl font-bold">Tu perfil físico</h1>
              <p className="text-sm text-text-muted mt-1">Esta info nos permite calcular tu progreso con precisión</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Sexo biológico</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['male', 'female'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => update('sex', s)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                        form.sex === s ? 'border-pink bg-pink/10 text-white' : 'border-border bg-surface text-text-muted'
                      }`}
                    >
                      {s === 'male' ? '♂ Masculino' : '♀ Femenino'}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Fecha de nacimiento"
                type="date"
                value={form.birth_date}
                onChange={e => update('birth_date', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Altura (cm)"
                  type="number"
                  inputMode="decimal"
                  placeholder="170"
                  value={form.height_cm}
                  onChange={e => update('height_cm', e.target.value)}
                />
                <Input
                  label="Peso actual (kg)"
                  type="number"
                  inputMode="decimal"
                  placeholder="70"
                  value={form.initial_weight_kg}
                  onChange={e => update('initial_weight_kg', e.target.value)}
                />
              </div>

              <Input
                label="Peso objetivo (kg) — opcional"
                type="number"
                inputMode="decimal"
                placeholder="65"
                value={form.target_weight_kg}
                onChange={e => update('target_weight_kg', e.target.value)}
              />
            </div>
          </>
        )}

        {step === 'goal' && (
          <>
            <div>
              <h1 className="text-xl font-bold">¿Cuál es tu meta?</h1>
              <p className="text-sm text-text-muted mt-1">Selecciona tu objetivo principal</p>
            </div>
            <div className="space-y-2">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => update('goal', g.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    form.goal === g.value ? 'border-pink bg-pink/10' : 'border-border bg-surface'
                  }`}
                >
                  <p className="font-medium text-sm">{g.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'activity' && (
          <>
            <div>
              <h1 className="text-xl font-bold">Nivel de actividad</h1>
              <p className="text-sm text-text-muted mt-1">Fuera de tus clases con tu Coach</p>
            </div>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map(a => (
                <button
                  key={a.value}
                  onClick={() => update('activity_level', a.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    form.activity_level === a.value ? 'border-pink bg-pink/10' : 'border-border bg-surface'
                  }`}
                >
                  <p className="font-medium text-sm">{a.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'diet' && (
          <>
            <div>
              <h1 className="text-xl font-bold">Alimentación</h1>
              <p className="text-sm text-text-muted mt-1">Preferencias o restricciones (opcional)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleDiet(opt)}
                  className={`px-3 py-2 rounded-full border text-sm transition-colors ${
                    form.dietary_preferences.includes(opt)
                      ? 'border-pink bg-pink/10 text-white'
                      : 'border-border bg-surface text-text-muted'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <Input
              label="Alergias u otras restricciones"
              placeholder="Ej: alergia al maní, intolerancia a la lactosa..."
              value={form.dietary_restrictions}
              onChange={e => update('dietary_restrictions', e.target.value)}
            />
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {stepIndex > 0 && (
          <Button variant="secondary" onClick={() => setStep(steps[stepIndex - 1])} className="flex-1">
            Atrás
          </Button>
        )}
        {stepIndex < steps.length - 1 ? (
          <Button onClick={() => setStep(steps[stepIndex + 1])} className="flex-1">
            Continuar
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            Listo
          </Button>
        )}
      </div>
    </div>
  )
}

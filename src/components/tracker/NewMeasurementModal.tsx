'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { calcBodyFatNavy } from '@/lib/body-calc'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Measurement = Database['public']['Tables']['body_measurements']['Row']

interface NewMeasurementModalProps {
  userId: string
  sex: 'male' | 'female' | null
  heightCm: number | null
  onSave: (m: Measurement) => void
  onClose: () => void
}

export function NewMeasurementModal({ userId, sex, heightCm, onSave, onClose }: NewMeasurementModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    measured_at: new Date().toISOString().split('T')[0],
    weight_kg: '',
    neck_cm: '',
    waist_cm: '',
    hip_cm: '',
    bicep_cm: '',
    thigh_cm: '',
    notes: '',
  })

  function u(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setLoading(true)
    const n = (v: string) => v ? Number(v) : null

    const body_fat_pct = sex && heightCm
      ? calcBodyFatNavy({
          sex,
          height_cm: heightCm,
          neck_cm: n(form.neck_cm)!,
          waist_cm: n(form.waist_cm)!,
          hip_cm: n(form.hip_cm) ?? undefined,
        })
      : null

    const { data } = await supabase
      .from('body_measurements')
      .insert({
        user_id: userId,
        measured_at: form.measured_at,
        weight_kg: n(form.weight_kg),
        neck_cm: n(form.neck_cm),
        waist_cm: n(form.waist_cm),
        hip_cm: n(form.hip_cm),
        bicep_cm: n(form.bicep_cm),
        thigh_cm: n(form.thigh_cm),
        body_fat_pct,
        notes: form.notes || null,
      })
      .select()
      .single()

    if (data) onSave(data)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-surface border-t border-border rounded-t-3xl p-6 pb-24 md:pb-6 space-y-4 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Nueva medición</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        <Input label="Fecha" type="date" value={form.measured_at} onChange={e => u('measured_at', e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Peso (kg)" type="number" inputMode="decimal" placeholder="70.5" value={form.weight_kg} onChange={e => u('weight_kg', e.target.value)} />
          <Input label="Cuello (cm)" type="number" inputMode="decimal" placeholder="37.0" value={form.neck_cm} onChange={e => u('neck_cm', e.target.value)} hint="Para % grasa" />
          <Input label="Cintura (cm)" type="number" inputMode="decimal" placeholder="80.0" value={form.waist_cm} onChange={e => u('waist_cm', e.target.value)} hint="A nivel del ombligo" />
          {sex === 'female' && (
            <Input label="Cadera (cm)" type="number" inputMode="decimal" placeholder="95.0" value={form.hip_cm} onChange={e => u('hip_cm', e.target.value)} hint="Para % grasa femenino" />
          )}
          <Input label="Bícep (cm)" type="number" inputMode="decimal" placeholder="32.0" value={form.bicep_cm} onChange={e => u('bicep_cm', e.target.value)} />
          <Input label="Muslo (cm)" type="number" inputMode="decimal" placeholder="55.0" value={form.thigh_cm} onChange={e => u('thigh_cm', e.target.value)} />
        </div>

        <Input label="Notas" placeholder="Cómo te sentiste, cambios en dieta..." value={form.notes} onChange={e => u('notes', e.target.value)} />

        <Button onClick={handleSave} loading={loading} className="w-full" size="lg">
          Guardar medición
        </Button>
      </div>
    </div>
  )
}

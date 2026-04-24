'use client'

import { useState, useRef } from 'react'
import { X, Camera } from 'lucide-react'
import Image from 'next/image'
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
  birthDate: string | null
  lastMeasurement: Measurement | null
  onSave: (m: Measurement) => void
  onClose: () => void
}

function str(v: number | null | undefined) {
  return v != null ? String(v) : ''
}

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function NewMeasurementModal({ userId, sex, heightCm, birthDate, lastMeasurement, onSave, onClose }: NewMeasurementModalProps) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    measured_at: new Date().toISOString().split('T')[0],
    weight_kg:  str(lastMeasurement?.weight_kg),
    neck_cm:    str(lastMeasurement?.neck_cm),
    waist_cm:   str(lastMeasurement?.waist_cm),
    hip_cm:     str(lastMeasurement?.hip_cm),
    bicep_cm:   str(lastMeasurement?.bicep_cm),
    thigh_cm:   str(lastMeasurement?.thigh_cm),
    notes: '',
  })

  const age = calcAge(birthDate)

  function u(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
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

    let photo_url: string | null = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { data: uploaded } = await supabase.storage
        .from('progress-photos')
        .upload(path, photoFile, { upsert: false })
      if (uploaded) {
        const { data: urlData } = supabase.storage.from('progress-photos').getPublicUrl(uploaded.path)
        photo_url = urlData.publicUrl
      }
    }

    const { data } = await supabase
      .from('body_measurements')
      .insert({
        user_id: userId,
        measured_at: form.measured_at,
        weight_kg:  n(form.weight_kg),
        neck_cm:    n(form.neck_cm),
        waist_cm:   n(form.waist_cm),
        hip_cm:     n(form.hip_cm),
        bicep_cm:   n(form.bicep_cm),
        thigh_cm:   n(form.thigh_cm),
        body_fat_pct,
        photo_url,
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
          <div>
            <h2 className="font-bold text-lg">Nueva medición</h2>
            {lastMeasurement && (
              <p className="text-xs text-text-muted mt-0.5">Pre-rellenado con tu última medición — ajusta lo que cambió</p>
            )}
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Edad calculada */}
        {age !== null && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
            <span className="text-xs text-text-muted">Edad calculada</span>
            <span className="text-sm font-semibold ml-auto">{age} años</span>
          </div>
        )}

        <Input label="Fecha" type="date" value={form.measured_at} onChange={e => u('measured_at', e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Peso (kg)"    type="number" inputMode="decimal" placeholder="70.5" value={form.weight_kg} onChange={e => u('weight_kg', e.target.value)} />
          <Input label="Cuello (cm)"  type="number" inputMode="decimal" placeholder="37.0" value={form.neck_cm}   onChange={e => u('neck_cm', e.target.value)}   hint="Para % grasa" />
          <Input label="Cintura (cm)" type="number" inputMode="decimal" placeholder="80.0" value={form.waist_cm}  onChange={e => u('waist_cm', e.target.value)}  hint="A nivel del ombligo" />
          {sex === 'female' && (
            <Input label="Cadera (cm)" type="number" inputMode="decimal" placeholder="95.0" value={form.hip_cm} onChange={e => u('hip_cm', e.target.value)} hint="Para % grasa femenino" />
          )}
          <Input label="Bícep (cm)"  type="number" inputMode="decimal" placeholder="32.0" value={form.bicep_cm}  onChange={e => u('bicep_cm', e.target.value)} />
          <Input label="Muslo (cm)"  type="number" inputMode="decimal" placeholder="55.0" value={form.thigh_cm}  onChange={e => u('thigh_cm', e.target.value)} />
        </div>

        <Input label="Notas" placeholder="Cómo te sentiste, cambios en dieta..." value={form.notes} onChange={e => u('notes', e.target.value)} />

        {/* Foto de progreso */}
        <div>
          <p className="text-sm font-medium text-text-muted mb-2">Foto de progreso (opcional)</p>
          {photoPreview ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <Image src={photoPreview} alt="Preview" fill className="object-cover" sizes="400px" />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-border text-text-muted hover:border-pink/40 hover:text-white transition-colors text-sm"
            >
              <Camera size={18} />
              Subir foto
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
        </div>

        <Button onClick={handleSave} loading={loading} className="w-full" size="lg">
          Guardar medición
        </Button>
      </div>
    </div>
  )
}

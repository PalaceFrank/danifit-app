'use client'

import { useState } from 'react'
import { Plus, TrendingDown, TrendingUp, Minus, Pencil } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { NewMeasurementModal } from './NewMeasurementModal'
import { ProgressChart } from './ProgressChart'
import { calcBodyFatNavy } from '@/lib/body-calc'
import type { Database } from '@/types/database'

type BodyProfile = Database['public']['Tables']['user_body_profiles']['Row']
type Measurement = Database['public']['Tables']['body_measurements']['Row']

interface TrackerDashboardProps {
  bodyProfile: BodyProfile
  measurements: Measurement[]
  userId: string
}

const GOAL_LABELS = {
  lose_fat:    '🔥 Bajar grasa',
  gain_muscle: '💪 Ganar músculo',
  maintain:    '⚖️ Mantener',
  endurance:   '🏃 Resistencia',
}

export function TrackerDashboard({ bodyProfile, measurements, userId }: TrackerDashboardProps) {
  const [allMeasurements, setAllMeasurements] = useState(measurements)
  const [showModal, setShowModal] = useState(false)

  const latest = allMeasurements[allMeasurements.length - 1]
  const previous = allMeasurements[allMeasurements.length - 2]

  const currentFat = latest
    ? calcBodyFatNavy({
        sex: bodyProfile.sex!,
        height_cm: bodyProfile.height_cm!,
        neck_cm: latest.neck_cm!,
        waist_cm: latest.waist_cm!,
        hip_cm: latest.hip_cm ?? undefined,
      })
    : null

  const weightDelta = latest && previous
    ? +(latest.weight_kg! - previous.weight_kg!).toFixed(1)
    : null

  function handleNewMeasurement(m: Measurement) {
    setAllMeasurements(prev => [...prev, m])
    setShowModal(false)
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
      {/* Goal + edit */}
      <div className="flex items-center justify-between">
        {bodyProfile.goal
          ? <Badge variant="pink">{GOAL_LABELS[bodyProfile.goal]}</Badge>
          : <span className="text-xs text-text-muted">Sin meta definida</span>
        }
        <Link href="/tracker/onboarding" className="flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors">
          <Pencil size={11} />
          Editar perfil
        </Link>
      </div>

      {/* Body profile summary (always visible) */}
      <Card padded={false} className="p-3 grid grid-cols-3 divide-x divide-border text-center">
        <div className="px-3">
          <p className="text-xs text-text-muted">Altura</p>
          <p className="text-sm font-semibold mt-0.5">{bodyProfile.height_cm ? `${bodyProfile.height_cm} cm` : '—'}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-text-muted">Peso inicial</p>
          <p className="text-sm font-semibold mt-0.5">{bodyProfile.initial_weight_kg ? `${bodyProfile.initial_weight_kg} kg` : '—'}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-text-muted">Peso objetivo</p>
          <p className="text-sm font-semibold mt-0.5">{bodyProfile.target_weight_kg ? `${bodyProfile.target_weight_kg} kg` : '—'}</p>
        </div>
      </Card>

      {/* Stats cards */}
      {latest ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Peso actual"
            value={`${latest.weight_kg} kg`}
            delta={weightDelta}
            deltaLabel="vs anterior"
          />
          <StatCard
            label="% Grasa"
            value={currentFat ? `${currentFat}%` : '—'}
            hint={!latest.neck_cm ? 'Agrega medidas de cuello y cintura' : undefined}
          />
          {bodyProfile.target_weight_kg && latest.weight_kg && (
            <StatCard
              label="Falta para meta"
              value={`${Math.abs(+(latest.weight_kg - bodyProfile.target_weight_kg).toFixed(1))} kg`}
              hint={latest.weight_kg <= bodyProfile.target_weight_kg ? '¡Meta alcanzada! 🎉' : undefined}
            />
          )}
          {latest.waist_cm && (
            <StatCard label="Cintura" value={`${latest.waist_cm} cm`} />
          )}
        </div>
      ) : (
        <Card className="text-center py-8 space-y-2">
          <p className="text-text-muted text-sm">Sin mediciones aún</p>
          <p className="text-xs text-text-muted">Registra tu primera medición para ver tu progreso</p>
        </Card>
      )}

      {/* Add button */}
      <Button onClick={() => setShowModal(true)} className="w-full" size="lg">
        <Plus size={18} />
        Nueva medición
      </Button>

      {/* Progress chart */}
      {allMeasurements.length >= 2 && (
        <ProgressChart
          measurements={allMeasurements}
          sex={bodyProfile.sex}
          heightCm={bodyProfile.height_cm}
        />
      )}

      {/* History */}
      {allMeasurements.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs text-text-muted font-medium uppercase tracking-wide">Historial</h3>
          {[...allMeasurements].reverse().map((m, i) => {
            const fat = calcBodyFatNavy({
              sex: bodyProfile.sex!,
              height_cm: bodyProfile.height_cm!,
              neck_cm: m.neck_cm!,
              waist_cm: m.waist_cm!,
              hip_cm: m.hip_cm ?? undefined,
            })
            return (
              <Card key={m.id} padded={false} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted">
                      {new Date(m.measured_at + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex gap-3 mt-1 text-sm">
                      {m.weight_kg && <span className="font-semibold">{m.weight_kg} kg</span>}
                      {fat && <span className="text-text-muted">{fat}% grasa</span>}
                      {m.waist_cm && <span className="text-text-muted">{m.waist_cm} cm cintura</span>}
                    </div>
                  </div>
                  {i === 0 && <Badge variant="pink">Último</Badge>}
                </div>
                {m.notes && <p className="text-xs text-text-muted mt-1 italic">{m.notes}</p>}
                {m.photo_url && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-2">
                    <Image src={m.photo_url} alt="Foto de progreso" fill className="object-cover" sizes="400px" />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {showModal && (
        <NewMeasurementModal
          userId={userId}
          sex={bodyProfile.sex}
          heightCm={bodyProfile.height_cm}
          birthDate={bodyProfile.birth_date ?? null}
          lastMeasurement={latest ?? null}
          onSave={handleNewMeasurement}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  delta?: number | null
  deltaLabel?: string
  hint?: string
}

function StatCard({ label, value, delta, deltaLabel, hint }: StatCardProps) {
  const DeltaIcon = delta === null || delta === undefined ? null : delta < 0 ? TrendingDown : delta > 0 ? TrendingUp : Minus
  const deltaColor = delta === null || delta === undefined ? '' : delta < 0 ? 'text-green-400' : delta > 0 ? 'text-red-400' : 'text-text-muted'

  return (
    <Card padded={false} className="p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {delta !== null && delta !== undefined && DeltaIcon && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${deltaColor}`}>
          <DeltaIcon size={12} />
          <span>{delta > 0 ? '+' : ''}{delta} {deltaLabel}</span>
        </div>
      )}
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </Card>
  )
}

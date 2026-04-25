'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, Mail, Phone, Activity, Ruler, Weight,
  Target, Flame, User, Calendar, TrendingDown, TrendingUp, Minus,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressChart } from '@/components/tracker/ProgressChart'
import { calcBodyFatNavy } from '@/lib/body-calc'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type BodyProfile = Database['public']['Tables']['user_body_profiles']['Row']
type Measurement = Database['public']['Tables']['body_measurements']['Row']

interface StudentProfileViewProps {
  profile: Profile
  bodyProfile: BodyProfile | null
  measurements: Measurement[]
}

const STATUS_BADGE: Record<string, 'green' | 'yellow' | 'red'> = {
  active: 'green', pending: 'yellow', inactive: 'red',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Activo', pending: 'Pendiente', inactive: 'Inactivo',
}

const GOAL_LABELS: Record<string, string> = {
  lose_fat: '🔥 Bajar grasa',
  gain_muscle: '💪 Ganar músculo',
  maintain: '⚖️ Mantener',
  endurance: '🏃 Resistencia',
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentario',
  light: 'Ligero',
  moderate: 'Moderado',
  active: 'Activo',
  very_active: 'Muy activo',
}

function calcAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function StudentProfileView({ profile, bodyProfile, measurements }: StudentProfileViewProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [status, setStatus] = useState(profile.status)
  const [updating, setUpdating] = useState(false)

  const initials = profile.full_name
    ?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

  const latest = measurements[measurements.length - 1]
  const first = measurements[0]

  const currentFat = latest && bodyProfile
    ? calcBodyFatNavy({
        sex: bodyProfile.sex!,
        height_cm: bodyProfile.height_cm!,
        neck_cm: latest.neck_cm!,
        waist_cm: latest.waist_cm!,
        hip_cm: latest.hip_cm ?? undefined,
      })
    : null

  const firstFat = first && first !== latest && bodyProfile
    ? calcBodyFatNavy({
        sex: bodyProfile.sex!,
        height_cm: bodyProfile.height_cm!,
        neck_cm: first.neck_cm!,
        waist_cm: first.waist_cm!,
        hip_cm: first.hip_cm ?? undefined,
      })
    : null

  const weightDeltaTotal = latest && first && first !== latest
    ? +(latest.weight_kg! - first.weight_kg!).toFixed(1) : null
  const fatDeltaTotal = currentFat !== null && firstFat !== null
    ? +(currentFat - firstFat).toFixed(1) : null
  const waistDeltaTotal = latest?.waist_cm && first?.waist_cm && first !== latest
    ? +(latest.waist_cm - first.waist_cm).toFixed(1) : null

  async function toggleStatus() {
    const next = status === 'active' ? 'inactive' : 'active'
    setUpdating(true)
    const updates: Partial<Profile> = { status: next }
    if (next === 'active') updates.activated_at = new Date().toISOString()
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id)
    if (error) { toast('Error al actualizar estado', 'error') }
    else { setStatus(next); toast(next === 'active' ? 'Alumno reactivado' : 'Alumno dado de baja') }
    setUpdating(false)
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors">
        <ArrowLeft size={15} />
        Volver a alumnos
      </Link>

      {/* Hero */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-pink to-pink-hover rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-pink/20">
              {initials}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface ${
              status === 'active' ? 'bg-green-400' : status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg truncate">{profile.full_name}</p>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5 truncate">
              <Mail size={11} />{profile.email}
            </p>
            {profile.phone && (
              <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                <Phone size={11} />{profile.phone}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>
              {bodyProfile?.goal && (
                <span className="text-xs text-text-muted">{GOAL_LABELS[bodyProfile.goal]}</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex justify-end">
          <Button
            size="sm"
            variant={status === 'active' ? 'danger' : 'secondary'}
            onClick={toggleStatus}
            loading={updating}
          >
            {status === 'active' ? 'Dar de baja' : 'Reactivar'}
          </Button>
        </div>
      </Card>

      {/* Perfil físico */}
      {bodyProfile ? (
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider px-1 mb-2">Perfil físico</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <InfoTile icon={Ruler} label="Altura" value={bodyProfile.height_cm ? `${bodyProfile.height_cm} cm` : '—'} />
            <InfoTile icon={Weight} label="Peso inicial" value={bodyProfile.initial_weight_kg ? `${bodyProfile.initial_weight_kg} kg` : '—'} />
            <InfoTile icon={Target} label="Peso objetivo" value={bodyProfile.target_weight_kg ? `${bodyProfile.target_weight_kg} kg` : '—'} />
            <InfoTile icon={Activity} label="Actividad" value={bodyProfile.activity_level ? ACTIVITY_LABELS[bodyProfile.activity_level] ?? bodyProfile.activity_level : '—'} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <InfoTile icon={User} label="Sexo" value={bodyProfile.sex === 'male' ? 'Masculino' : bodyProfile.sex === 'female' ? 'Femenino' : '—'} />
            <InfoTile icon={Calendar} label="Edad" value={bodyProfile.birth_date ? `${calcAge(bodyProfile.birth_date)} años` : '—'} />
          </div>
        </div>
      ) : (
        <Card>
          <p className="text-sm text-text-muted text-center py-4">Este alumno aún no ha completado su perfil físico.</p>
        </Card>
      )}

      {/* Stats actuales */}
      {latest && (
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider px-1 mb-2">Medición actual</p>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Peso" value={`${latest.weight_kg}`} unit="kg" delta={weightDeltaTotal} />
            <StatCard
              label="% Grasa"
              value={currentFat ? `${currentFat}` : '—'}
              unit={currentFat ? '%' : ''}
              delta={fatDeltaTotal}
              hint={!latest.neck_cm ? 'Faltan medidas' : undefined}
            />
            <StatCard label="Cintura" value={latest.waist_cm ? `${latest.waist_cm}` : '—'} unit={latest.waist_cm ? 'cm' : ''} delta={waistDeltaTotal} />
          </div>
        </div>
      )}

      {/* Gráfico */}
      {measurements.length >= 2 && bodyProfile && (
        <ProgressChart
          measurements={measurements}
          sex={bodyProfile.sex}
          heightCm={bodyProfile.height_cm}
        />
      )}

      {/* Historial de mediciones */}
      {measurements.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider px-1">
            Historial · {measurements.length} medición{measurements.length !== 1 ? 'es' : ''}
          </p>
          {[...measurements].reverse().map((m, i) => {
            const fat = bodyProfile ? calcBodyFatNavy({
              sex: bodyProfile.sex!,
              height_cm: bodyProfile.height_cm!,
              neck_cm: m.neck_cm!,
              waist_cm: m.waist_cm!,
              hip_cm: m.hip_cm ?? undefined,
            }) : null
            return (
              <Card key={m.id} padded={false} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted">
                      {new Date(m.measured_at + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex gap-3 mt-1 text-sm flex-wrap">
                      {m.weight_kg && <span className="font-semibold">{m.weight_kg} kg</span>}
                      {fat && <span className="text-text-muted">{fat}% grasa</span>}
                      {m.waist_cm && <span className="text-text-muted">{m.waist_cm} cm cintura</span>}
                      {m.neck_cm && <span className="text-text-muted">{m.neck_cm} cm cuello</span>}
                    </div>
                    {m.notes && <p className="text-xs text-text-muted mt-1 italic">"{m.notes}"</p>}
                  </div>
                  {i === 0 && <Badge variant="pink">Último</Badge>}
                </div>
                {m.photo_url && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-2">
                    <Image src={m.photo_url} alt="Foto de progreso" fill className="object-cover" sizes="600px" />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-text-muted text-center py-4">Este alumno aún no tiene mediciones registradas.</p>
        </Card>
      )}
    </div>
  )
}

interface InfoTileProps {
  icon: React.ElementType
  label: string
  value: string
}

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <Card padded={false} className="p-3 flex items-center gap-2.5">
      <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
        <Icon size={14} className="text-text-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </Card>
  )
}

interface StatCardProps {
  label: string
  value: string
  unit?: string
  delta?: number | null
  hint?: string
}

function StatCard({ label, value, unit, delta, hint }: StatCardProps) {
  const DeltaIcon = delta == null ? null : delta < 0 ? TrendingDown : delta > 0 ? TrendingUp : Minus
  const deltaColor = delta == null ? '' : delta < 0 ? 'text-green-400' : delta > 0 ? 'text-red-400' : 'text-text-muted'

  return (
    <Card padded={false} className="p-3 flex flex-col gap-1">
      <p className="text-xs text-text-muted font-medium">{label}</p>
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-black leading-none">{value}</span>
        {unit && <span className="text-xs text-text-muted ml-0.5">{unit}</span>}
      </div>
      {delta != null && DeltaIcon && (
        <div className={`flex items-center gap-0.5 text-xs ${deltaColor}`}>
          <DeltaIcon size={11} />
          <span>{delta > 0 ? '+' : ''}{delta} total</span>
        </div>
      )}
      {hint && <p className="text-[10px] text-text-muted leading-tight">{hint}</p>}
    </Card>
  )
}

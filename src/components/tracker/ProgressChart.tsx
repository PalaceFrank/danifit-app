'use client'

import { useState } from 'react'
import type { Database } from '@/types/database'
import { calcBodyFatNavy } from '@/lib/body-calc'

type Measurement = Database['public']['Tables']['body_measurements']['Row']

interface ProgressChartProps {
  measurements: Measurement[]
  sex: 'male' | 'female' | null
  heightCm: number | null
}

type Metric = 'weight' | 'fat' | 'waist'

const METRICS: { key: Metric; label: string; unit: string }[] = [
  { key: 'weight', label: 'Peso',    unit: 'kg' },
  { key: 'fat',    label: '% Grasa', unit: '%'  },
  { key: 'waist',  label: 'Cintura', unit: 'cm' },
]

function getValue(m: Measurement, metric: Metric, sex: string | null, heightCm: number | null): number | null {
  if (metric === 'weight') return m.weight_kg ? Number(m.weight_kg) : null
  if (metric === 'waist')  return m.waist_cm  ? Number(m.waist_cm)  : null
  if (metric === 'fat' && sex && heightCm && m.neck_cm && m.waist_cm) {
    return calcBodyFatNavy({
      sex: sex as 'male' | 'female',
      height_cm: heightCm,
      neck_cm: Number(m.neck_cm),
      waist_cm: Number(m.waist_cm),
      hip_cm: m.hip_cm ? Number(m.hip_cm) : undefined,
    })
  }
  return null
}

export function ProgressChart({ measurements, sex, heightCm }: ProgressChartProps) {
  const [metric, setMetric] = useState<Metric>('weight')

  const points = measurements
    .map(m => ({ date: m.measured_at, value: getValue(m, metric, sex, heightCm) }))
    .filter(p => p.value !== null) as { date: string; value: number }[]

  if (points.length < 2) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Progreso</p>
        <p className="text-sm text-text-muted text-center py-6">
          Necesitas al menos 2 mediciones para ver el gráfico
        </p>
      </div>
    )
  }

  const W = 320
  const H = 120
  const PAD = { top: 12, right: 16, bottom: 24, left: 36 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const values = points.map(p => p.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const range = maxV - minV || 1

  const toX = (i: number) => PAD.left + (i / (points.length - 1)) * chartW
  const toY = (v: number) => PAD.top + chartH - ((v - minV) / range) * chartH

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.value).toFixed(1)}`)
    .join(' ')

  const areaD = `${pathD} L ${toX(points.length - 1).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`

  const unit = METRICS.find(m => m.key === metric)?.unit ?? ''
  const first = points[0].value
  const last  = points[points.length - 1].value
  const delta = +(last - first).toFixed(1)
  const deltaColor = metric === 'weight' || metric === 'fat' || metric === 'waist'
    ? delta < 0 ? 'text-green-400' : delta > 0 ? 'text-red-400' : 'text-text-muted'
    : 'text-text-muted'

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Progreso</p>
        <span className={`text-xs font-semibold ${deltaColor}`}>
          {delta > 0 ? '+' : ''}{delta} {unit}
        </span>
      </div>

      {/* Metric tabs */}
      <div className="flex gap-1.5">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              metric === m.key
                ? 'border-pink bg-pink/10 text-white'
                : 'border-border text-text-muted hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#E8185A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E8185A" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map(t => {
          const y = PAD.top + t * chartH
          const v = maxV - t * range
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1e1e1e" strokeWidth="1" />
              <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#888">
                {v.toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#chartGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#E8185A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={toX(i)} cy={toY(p.value)} r="3" fill="#E8185A" />
        ))}

        {/* Date labels: first and last */}
        {[0, points.length - 1].map(i => (
          <text key={i} x={toX(i)} y={H - 4} textAnchor={i === 0 ? 'start' : 'end'} fontSize="9" fill="#888">
            {new Date(points[i].date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
          </text>
        ))}
      </svg>
    </div>
  )
}

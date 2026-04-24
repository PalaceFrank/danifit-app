import type { TimeBlock, DayOfWeek } from '@/types/database'

export const TIME_BLOCKS: Record<TimeBlock, { label: string; start: string; end: string }> = {
  morning_a: { label: '08:30', start: '08:30', end: '09:20' },
  evening_a: { label: '18:00', start: '18:00', end: '18:50' },
  evening_b: { label: '19:00', start: '19:00', end: '19:50' },
  morning_b: { label: '20:00', start: '20:00', end: '20:50' },
  special:   { label: 'Especial', start: '',   end: '' },
}

export const WEEK_DAYS: Record<DayOfWeek, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  6: 'Sábado',
}

export const REGULAR_DAYS: DayOfWeek[] = [1, 2, 3, 4]
export const SPECIAL_DAYS: DayOfWeek[] = [6]

export const REGULAR_BLOCKS: TimeBlock[] = ['morning_a', 'evening_a', 'evening_b', 'morning_b']

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatWeekStart(date: Date): string {
  return date.toISOString().split('T')[0]
}

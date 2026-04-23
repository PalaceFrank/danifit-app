export function calcBodyFatNavy(params: {
  sex: 'male' | 'female'
  height_cm: number
  neck_cm: number
  waist_cm: number
  hip_cm?: number
}): number | null {
  const { sex, height_cm, neck_cm, waist_cm, hip_cm } = params

  if (sex === 'male') {
    if (!neck_cm || !waist_cm || !height_cm) return null
    const pct = 86.010 * Math.log10(waist_cm - neck_cm)
      - 70.041 * Math.log10(height_cm)
      + 36.76
    return Math.round(pct * 10) / 10
  }

  if (sex === 'female') {
    if (!neck_cm || !waist_cm || !hip_cm || !height_cm) return null
    const pct = 163.205 * Math.log10(waist_cm + hip_cm - neck_cm)
      - 97.684 * Math.log10(height_cm)
      - 78.387
    return Math.round(pct * 10) / 10
  }

  return null
}

export function calcBMR(params: {
  sex: 'male' | 'female'
  weight_kg: number
  height_cm: number
  age: number
}): number {
  const { sex, weight_kg, height_cm, age } = params
  // Mifflin-St Jeor
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export const ACTIVITY_MULTIPLIERS = {
  sedentary:  1.2,
  light:      1.375,
  moderate:   1.55,
  active:     1.725,
  very_active: 1.9,
}

export function calcAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

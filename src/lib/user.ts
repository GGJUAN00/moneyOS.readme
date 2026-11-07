import { colombiaNow } from './format'

// User profile captured on first launch and kept only on this device (localStorage).

export const documentTypes = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'PPT', label: 'Permiso por protección temporal' },
  { value: 'PAS', label: 'Pasaporte' },
] as const

export const occupations = [
  'Empleado(a)',
  'Independiente',
  'Empresario(a)',
  'Estudiante',
  'Pensionado(a)',
  'Hogar',
  'Otro',
] as const

export const colombianCities = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Cúcuta',
  'Pereira', 'Manizales', 'Ibagué', 'Santa Marta', 'Villavicencio', 'Pasto', 'Montería',
  'Neiva', 'Armenia', 'Popayán', 'Valledupar', 'Sincelejo', 'Tunja', 'Riohacha', 'Yopal',
]

export interface UserProfile {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  birthDate: string // YYYY-MM-DD
  phone: string // 10 digits, without +57
  email: string
  city: string
  occupation: string
  acceptedDataPolicy: boolean
  registeredAt: string // ISO date
}

const STORAGE_KEY = 'moneyos:user'

export function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const user = JSON.parse(raw) as UserProfile
    return user?.firstName ? user : null
  } catch {
    return null
  }
}

export function saveUser(user: UserProfile): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    // Ask the browser not to evict our data under storage pressure.
    navigator.storage?.persist?.().catch(() => {})
    return true
  } catch {
    return false
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to clear */
  }
}

export function firstNameOf(user: UserProfile): string {
  return user.firstName.trim().split(/\s+/)[0] ?? ''
}

export function displayName(user: UserProfile): string {
  const first = firstNameOf(user)
  const last = user.lastName.trim().split(/\s+/)[0] ?? ''
  return `${first} ${last}`.trim()
}

export function initialsOf(user: UserProfile): string {
  const a = user.firstName.trim().charAt(0)
  const b = user.lastName.trim().charAt(0)
  return `${a}${b}`.toUpperCase()
}

export function greeting(date = colombiaNow()): string {
  const h = date.getHours()
  if (h < 12) return 'Buenos días,'
  if (h < 19) return 'Buenas tardes,'
  return 'Buenas noches,'
}

export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length !== 10) return phone
  return `+57 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

export function ageFrom(birthDate: string, today = colombiaNow()): number {
  const b = new Date(birthDate + 'T00:00:00')
  let age = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--
  return age
}

export type ProfileErrors = Partial<Record<keyof UserProfile, string>>

export function validateProfile(p: Omit<UserProfile, 'registeredAt'>): ProfileErrors {
  const e: ProfileErrors = {}
  const name = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,}$/

  if (!p.firstName.trim()) e.firstName = 'Escribe tus nombres'
  else if (!name.test(p.firstName.trim())) e.firstName = 'Usa solo letras'

  if (!p.lastName.trim()) e.lastName = 'Escribe tus apellidos'
  else if (!name.test(p.lastName.trim())) e.lastName = 'Usa solo letras'

  if (!p.documentType) e.documentType = 'Elige el tipo de documento'

  const doc = p.documentNumber.trim()
  if (!doc) e.documentNumber = 'Escribe el número de documento'
  else if (p.documentType === 'PAS' ? !/^[A-Za-z0-9]{5,15}$/.test(doc) : !/^\d{5,12}$/.test(doc))
    e.documentNumber = p.documentType === 'PAS' ? 'Entre 5 y 15 letras o números' : 'Entre 5 y 12 dígitos, sin puntos'

  if (!p.birthDate) e.birthDate = 'Elige tu fecha de nacimiento'
  else {
    const age = ageFrom(p.birthDate)
    if (Number.isNaN(age) || age < 0) e.birthDate = 'Fecha no válida'
    else if (age < 14) e.birthDate = 'Debes tener al menos 14 años'
    else if (age > 110) e.birthDate = 'Revisa el año de nacimiento'
  }

  const phone = p.phone.replace(/\D/g, '')
  if (!phone) e.phone = 'Escribe tu número de celular'
  else if (!/^3\d{9}$/.test(phone)) e.phone = 'Debe tener 10 dígitos y empezar por 3'

  if (!p.email.trim()) e.email = 'Escribe tu correo'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) e.email = 'Correo no válido'

  if (!p.city.trim()) e.city = 'Escribe tu ciudad'

  if (!p.occupation) e.occupation = 'Elige tu ocupación'

  if (!p.acceptedDataPolicy) e.acceptedDataPolicy = 'Debes aceptar para continuar'

  return e
}

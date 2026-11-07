// Colombian-peso and Spanish (es-CO) formatting helpers.

const thousands = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

/** Full amount: "$ 104.370.000" (sign not included). */
export function formatCOP(amount: number): string {
  return '$ ' + thousands.format(Math.abs(Math.round(amount)))
}

/** Compact amount: "$ 24,5M", "$ 376 mil", "$ 1,2 mil M" (sign not included). */
export function formatCOPShort(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000) return `$ ${oneDecimal.format(abs / 1_000_000_000)} mil M`
  if (abs >= 1_000_000) return `$ ${oneDecimal.format(abs / 1_000_000)}M`
  if (abs >= 1_000) return `$ ${thousands.format(abs / 1_000)} mil`
  return `$ ${thousands.format(abs)}`
}

/** Percentage with a Spanish decimal comma, e.g. "3,6%". */
export function formatPct(value: number, decimals = 1): string {
  return value.toLocaleString('es-CO', { maximumFractionDigits: decimals }) + '%'
}

/** Digits typed by the user → number of pesos. */
export function parseDigits(text: string): number {
  const digits = text.replace(/\D/g, '').slice(0, 12)
  return digits ? Number(digits) : 0
}

/** Number → "125.000" for an amount field (empty for 0). */
export function formatDigits(value: number): string {
  return value > 0 ? thousands.format(value) : ''
}

// ---- Dates (always local time, as YYYY-MM-DD strings) ----

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseISODate(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const monthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** "Noviembre 2026" */
export function monthTitle(d = new Date()): string {
  return `${capitalize(monthNames[d.getMonth()])} ${d.getFullYear()}`
}

export function monthName(monthIndex: number): string {
  return monthNames[monthIndex]
}

export function monthShortName(monthIndex: number): string {
  return monthShort[monthIndex]
}

/** "Hoy", "Ayer" or "mié, 23 sept" */
export function relativeDay(iso: string, today = new Date()): string {
  const date = parseISODate(iso)
  const t = parseISODate(toISODate(today))
  const diff = Math.round((t.getTime() - date.getTime()) / 86_400_000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  const sameYear = date.getFullYear() === t.getFullYear()
  return date
    .toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) })
    .replace(/\./g, '')
}

// The user's own money movements, entered by hand and kept only on this device.

import { parseISODate, toISODate, monthShortName } from './format'

export type TxType = 'ingreso' | 'gasto'

export interface Transaction {
  id: string
  type: TxType
  amount: number // always positive, in pesos
  category: string
  description: string
  date: string // YYYY-MM-DD (local)
  createdAt: string // ISO timestamp
}

export interface Settings {
  monthlyBudget: number // 0 = not set
  sound: boolean // interface sounds on transactions
}

export const defaultSettings: Settings = { monthlyBudget: 0, sound: true }

export interface Category {
  name: string
  icon: string
  color: string
  hint?: string
}

export const expenseCategories: Category[] = [
  { name: 'Comida', icon: '🍜', color: '#F4F4F5', hint: 'Mercado, restaurantes, domicilios' },
  { name: 'Transporte', icon: '🚇', color: '#CFCFD4', hint: 'TransMilenio, Uber, gasolina' },
  { name: 'Compras', icon: '🛍️', color: '#ABABB1', hint: 'Ropa, tecnología, tiendas' },
  { name: 'Facturas', icon: '⚡', color: '#8E8E95', hint: 'Servicios, arriendo, suscripciones' },
  { name: 'Entretenimiento', icon: '🎬', color: '#C8C1B4', hint: 'Cine, salidas, juegos' },
  { name: 'Salud', icon: '💊', color: '#9AA3AD', hint: 'Droguería, citas, EPS' },
  { name: 'Educación', icon: '📚', color: '#727279', hint: 'Matrícula, cursos, libros' },
  { name: 'Hogar', icon: '🏠', color: '#B9B2A6', hint: 'Aseo, muebles, arreglos' },
  { name: 'Envíos', icon: '💸', color: '#5F6670', hint: 'Plata que le mandas a alguien' },
  { name: 'Otros', icon: '📦', color: '#4A4A50' },
]

export const incomeCategories: Category[] = [
  { name: 'Saldo inicial', icon: '🏦', color: '#F4F4F5', hint: 'Lo que ya tienes en Nequi' },
  { name: 'Salario', icon: '💼', color: '#F4F4F5' },
  { name: 'Me enviaron', icon: '📲', color: '#F4F4F5' },
  { name: 'Otro ingreso', icon: '✨', color: '#F4F4F5' },
]

export function categoryInfo(name: string, type?: TxType): Category {
  const list = type === 'ingreso' ? incomeCategories : type === 'gasto' ? expenseCategories : [...expenseCategories, ...incomeCategories]
  return list.find(c => c.name === name) ?? { name, icon: type === 'ingreso' ? '✨' : '📦', color: '#8C8C93' }
}

// ---- Storage ----

const TX_KEY = 'moneyos:transactions'
const SETTINGS_KEY = 'moneyos:settings'

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TX_KEY)
    const list = raw ? (JSON.parse(raw) as Transaction[]) : []
    return Array.isArray(list) ? list.filter(t => t && t.id && t.amount > 0) : []
  } catch {
    return []
  }
}

export function saveTransactions(list: Transaction[]): boolean {
  try {
    localStorage.setItem(TX_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    const s = raw ? (JSON.parse(raw) as Partial<Settings>) : {}
    return {
      monthlyBudget: Number(s.monthlyBudget) > 0 ? Number(s.monthlyBudget) : 0,
      sound: s.sound !== false,
    }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(s: Settings): boolean {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    return true
  } catch {
    return false
  }
}

export function clearFinanceData() {
  try {
    localStorage.removeItem(TX_KEY)
    localStorage.removeItem(SETTINGS_KEY)
  } catch {
    /* nothing to clear */
  }
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// ---- Calculations ----

export const signed = (t: Transaction) => (t.type === 'ingreso' ? t.amount : -t.amount)

/** Newest first (by date, then by creation time). */
export function sortNewest(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export function balanceOf(list: Transaction[], upToISO?: string): number {
  return list.filter(t => !upToISO || t.date <= upToISO).reduce((s, t) => s + signed(t), 0)
}

function monthKey(iso: string) {
  return iso.slice(0, 7)
}

export function inMonth(list: Transaction[], ref = new Date()): Transaction[] {
  const key = toISODate(ref).slice(0, 7)
  return list.filter(t => monthKey(t.date) === key)
}

/** Money that came in this month, not counting the opening balance (which isn't income). */
export function incomeOf(list: Transaction[]): number {
  return list.filter(t => t.type === 'ingreso' && t.category !== 'Saldo inicial').reduce((s, t) => s + t.amount, 0)
}

export function spentOf(list: Transaction[]): number {
  return list.filter(t => t.type === 'gasto').reduce((s, t) => s + t.amount, 0)
}

export interface CategoryTotal extends Category {
  amount: number
  count: number
}

export function spendingByCategory(list: Transaction[]): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>()
  for (const t of list) {
    if (t.type !== 'gasto') continue
    const info = categoryInfo(t.category, 'gasto')
    const cur = map.get(t.category) ?? { ...info, amount: 0, count: 0 }
    cur.amount += t.amount
    cur.count += 1
    map.set(t.category, cur)
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount)
}

export function daysLeftInMonth(ref = new Date()): number {
  const last = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
  return last - ref.getDate()
}

function lastDayOfMonth(year: number, month: number): string {
  return toISODate(new Date(year, month + 1, 0))
}

/** Spending per month for the last `n` months (oldest first), current month last. */
export function monthlySpending(list: Transaction[], n = 6, ref = new Date()) {
  const out: { month: string; key: string; spent: number; income: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    const key = toISODate(d).slice(0, 7)
    const items = list.filter(t => monthKey(t.date) === key)
    out.push({ month: monthShortName(d.getMonth()), key, spent: spentOf(items), income: incomeOf(items) })
  }
  return out
}

/** Balance at the end of each of the last `n` months (current month = today). */
export function balanceTrend(list: Transaction[], n = 6, ref = new Date()) {
  const out: { month: string; value: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    const end = i === 0 ? toISODate(ref) : lastDayOfMonth(d.getFullYear(), d.getMonth())
    out.push({ month: monthShortName(d.getMonth()), value: balanceOf(list, end) })
  }
  return out
}

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Spending for each day of the current week (Monday → Sunday). */
export function weeklySpending(list: Transaction[], ref = new Date()) {
  const dow = (ref.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - dow)
  return weekDays.map((day, i) => {
    const iso = toISODate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))
    const amount = list.filter(t => t.type === 'gasto' && t.date === iso).reduce((s, t) => s + t.amount, 0)
    return { day, iso, amount, isToday: i === dow, isFuture: i > dow }
  })
}

/** Spending of the previous week (for comparison). */
export function previousWeekSpent(list: Transaction[], ref = new Date()) {
  const dow = (ref.getDay() + 6) % 7
  const start = toISODate(new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - dow - 7))
  const end = toISODate(new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - dow - 1))
  return list.filter(t => t.type === 'gasto' && t.date >= start && t.date <= end).reduce((s, t) => s + t.amount, 0)
}

export function groupByDate(list: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>()
  for (const t of sortNewest(list)) {
    const g = map.get(t.date) ?? []
    g.push(t)
    map.set(t.date, g)
  }
  return [...map.entries()]
}

export { parseISODate }

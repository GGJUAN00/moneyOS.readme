// Monthly summary: everything that happened in one calendar month (Colombian time).

import {
  balanceOf,
  categoryInfo,
  incomeOf,
  spendingByCategory,
  spentOf,
  type CategoryTotal,
  type Transaction,
} from './finance'
import { colombiaNow, toISODate } from './format'

export interface MonthSummary {
  key: string // YYYY-MM
  year: number
  month: number // 0-11
  income: number
  spent: number
  saved: number
  savingsRate: number | null // % of income, null when there was no income
  count: number
  expenseCount: number
  categories: CategoryTotal[]
  incomes: { name: string; icon: string; amount: number; count: number }[]
  topExpenses: Transaction[]
  biggestDay: { date: string; amount: number } | null
  avgDaily: number
  daysWithSpending: number
  startBalance: number
  endBalance: number
  prevSpent: number | null // previous month's spending, if it had any movement
}

export function monthKeyOf(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function monthsWithData(list: Transaction[]): string[] {
  return [...new Set(list.map(t => t.date.slice(0, 7)))].sort().reverse()
}

export function summarize(list: Transaction[], key: string): MonthSummary {
  const [y, m] = key.split('-').map(Number)
  const year = y
  const month = m - 1
  const items = list.filter(t => t.date.slice(0, 7) === key)
  const expenses = items.filter(t => t.type === 'gasto')

  const income = incomeOf(items)
  const spent = spentOf(items)

  const byDay = new Map<string, number>()
  for (const t of expenses) byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amount)
  const biggest = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0]

  const incomeMap = new Map<string, { name: string; icon: string; amount: number; count: number }>()
  for (const t of items.filter(t => t.type === 'ingreso')) {
    const info = categoryInfo(t.category, 'ingreso')
    const cur = incomeMap.get(t.category) ?? { name: t.category, icon: info.icon, amount: 0, count: 0 }
    cur.amount += t.amount
    cur.count += 1
    incomeMap.set(t.category, cur)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dayBefore = toISODate(new Date(year, month, 0))
  const lastDay = toISODate(new Date(year, month + 1, 0))

  const prevKey = monthKeyOf(new Date(year, month - 1, 1).getFullYear(), new Date(year, month - 1, 1).getMonth())
  const prevItems = list.filter(t => t.date.slice(0, 7) === prevKey)

  return {
    key,
    year,
    month,
    income,
    spent,
    saved: income - spent,
    savingsRate: income > 0 ? ((income - spent) / income) * 100 : null,
    count: items.length,
    expenseCount: expenses.length,
    categories: spendingByCategory(items),
    incomes: [...incomeMap.values()].sort((a, b) => b.amount - a.amount),
    topExpenses: [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5),
    biggestDay: biggest ? { date: biggest[0], amount: biggest[1] } : null,
    avgDaily: spent / daysInMonth,
    daysWithSpending: byDay.size,
    startBalance: balanceOf(list, dayBefore),
    endBalance: balanceOf(list, lastDay),
    prevSpent: prevItems.length ? spentOf(prevItems) : null,
  }
}

// ---- "New month" prompt ----

const SEEN_KEY = 'moneyos:summarySeen'

/** The month that just ended, if it has movements and its summary hasn't been shown yet. */
export function pendingSummaryKey(list: Transaction[], now = colombiaNow()): string | null {
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const key = monthKeyOf(prev.getFullYear(), prev.getMonth())
  if (!list.some(t => t.date.slice(0, 7) === key)) return null
  try {
    if (localStorage.getItem(SEEN_KEY) === key) return null
  } catch {
    /* storage unavailable: show it */
  }
  return key
}

export function markSummarySeen(key: string) {
  try {
    localStorage.setItem(SEEN_KEY, key)
  } catch {
    /* ignore */
  }
}

// Rule-based answers computed from the user's own movements (no external AI).

import {
  balanceOf,
  daysLeftInMonth,
  expenseCategories,
  inMonth,
  incomeOf,
  spendingByCategory,
  spentOf,
  type Settings,
  type Transaction,
} from './finance'
import { formatCOP, formatPct, monthName } from './format'

export const suggestedQuestions = [
  '¿Cuánta plata tengo?',
  '¿En qué gasto más dinero?',
  '¿Cómo va mi gasto en comida?',
  '¿Estoy sobre el presupuesto?',
  '¿Puedo ahorrar más este mes?',
]

const money = (n: number) => `**${n < 0 ? '-' : ''}${formatCOP(n)}**`

const categoryKeywords: Record<string, string[]> = {
  Comida: ['comida', 'comer', 'mercado', 'restaurante', 'almuerzo', 'domicilio', 'rappi'],
  Transporte: ['transporte', 'uber', 'transmilenio', 'bus', 'taxi', 'gasolina', 'indrive', 'didi'],
  Compras: ['compras', 'ropa', 'shopping', 'tienda'],
  Facturas: ['factura', 'servicio', 'arriendo', 'suscrip', 'netflix', 'spotify', 'luz', 'agua', 'internet'],
  Entretenimiento: ['entreten', 'cine', 'salida', 'fiesta', 'juego'],
  Salud: ['salud', 'droguer', 'medic', 'eps', 'cita'],
  Educación: ['educa', 'estudio', 'curso', 'universidad', 'colegio', 'libro'],
  Hogar: ['hogar', 'casa', 'aseo', 'mueble'],
  Envíos: ['envío', 'envio', 'envié', 'mandé', 'transfer'],
  Otros: ['otros'],
}

export function welcomeText(name: string, list: Transaction[], settings: Settings): string {
  if (list.length === 0) {
    return `¡Hola, ${name}! Soy tu asistente de MoneyOS. Cuando agregues tu dinero y anotes tus gastos, podré decirte en qué se va tu plata y cómo vas con tu presupuesto.`
  }
  const now = new Date()
  const month = inMonth(list, now)
  const spent = spentOf(month)
  let text = `¡Hola, ${name}! Tu saldo es ${money(balanceOf(list))}. En ${monthName(now.getMonth())} llevas ${money(spent)} en gastos.`
  if (settings.monthlyBudget > 0) {
    const left = settings.monthlyBudget - spent
    text += left >= 0
      ? ` Te quedan ${money(left)} de tu presupuesto.`
      : ` Ya pasaste tu presupuesto por ${money(-left)}.`
  }
  return text + ' Pregúntame lo que quieras.'
}

export function answer(question: string, list: Transaction[], settings: Settings): string {
  const q = question.toLowerCase()
  const now = new Date()
  const mName = monthName(now.getMonth())
  const month = inMonth(list, now)
  const spent = spentOf(month)
  const income = incomeOf(month)
  const balance = balanceOf(list)
  const byCat = spendingByCategory(month)
  const budget = settings.monthlyBudget
  const daysLeft = daysLeftInMonth(now)

  if (list.length === 0) {
    return 'Todavía no tienes movimientos anotados. Toca **Agregar dinero** en Inicio para poner lo que tienes en Nequi, y **Transacción** cada vez que gastes.'
  }

  // A specific category
  const cat = expenseCategories.find(c => q.includes(c.name.toLowerCase()) || categoryKeywords[c.name]?.some(k => q.includes(k)))
  if (cat && !/m[aá]s dinero|m[aá]s plata|gasto m[aá]s/.test(q)) {
    const c = byCat.find(x => x.name === cat.name)
    if (!c) return `Este mes no has anotado gastos en **${cat.name}**. ¡Bien ahí!`
    const share = spent > 0 ? (c.amount / spent) * 100 : 0
    const biggest = month.filter(t => t.type === 'gasto' && t.category === cat.name).sort((a, b) => b.amount - a.amount)[0]
    return `En **${cat.name}** llevas ${money(c.amount)} en ${mName}, el ${formatPct(share)} de tus gastos, en ${c.count} ${c.count === 1 ? 'movimiento' : 'movimientos'}.` +
      (biggest ? ` El más grande: ${biggest.description || cat.name} (${formatCOP(biggest.amount)}).` : '')
  }

  if (/saldo|cu[aá]nt[ao] (plata|dinero) tengo|tengo/.test(q)) {
    return `Tu saldo disponible es ${money(balance)}. Este mes te han entrado ${money(income)} y has gastado ${money(spent)}.`
  }

  if (/m[aá]s dinero|m[aá]s plata|gasto m[aá]s|en qu[eé] gasto/.test(q)) {
    if (byCat.length === 0) return `No has anotado gastos en ${mName} todavía.`
    const top = byCat[0]
    const share = spent > 0 ? (top.amount / spent) * 100 : 0
    const rest = byCat.slice(1, 3).map(c => `${c.name} (${formatCOP(c.amount)})`).join(' y ')
    return `Donde más gastas es en **${top.name}**: ${money(top.amount)}, el ${formatPct(share)} de lo que llevas en ${mName}.` + (rest ? ` Le siguen ${rest}.` : '')
  }

  if (/presupuesto|l[ií]mite|me pas[eé]|sobre/.test(q)) {
    if (budget <= 0) return 'Aún no tienes presupuesto. En Inicio toca **Presupuesto mensual** para ponerte un límite de gasto.'
    const left = budget - spent
    if (left < 0) return `Ya pasaste tu presupuesto de ${money(budget)} por ${money(-left)}. Intenta frenar los gastos que no sean necesarios hasta fin de mes.`
    const days = daysLeft + 1 // counting today
    const perDay = left / days
    return `Vas bien: has gastado ${money(spent)} de ${money(budget)}. Te quedan ${money(left)} para ${days === 1 ? 'hoy, el último día del mes' : `los ${days} días que faltan (contando hoy)`}, unos ${money(Math.floor(perDay))} por día.`
  }

  if (/ahorr/.test(q)) {
    if (income <= 0) return `Este mes no has anotado ingresos (aparte de tu saldo inicial), así que no puedo calcular tu ahorro. Cuando te entre plata, agrégala con **Agregar dinero**.`
    const saved = income - spent
    const rate = (saved / income) * 100
    if (saved < 0) return `Este mes has gastado ${money(-saved)} más de lo que te entró. Revisa **${byCat[0]?.name ?? 'tus gastos'}**, que es donde más se va la plata.`
    return `Llevas ${money(saved)} ahorrados en ${mName}: el ${formatPct(rate)} de lo que te entró.` +
      (rate < 20 ? ` Si bajas un poco **${byCat[0]?.name ?? 'tus gastos'}**, podrías llegar al 20%.` : ' ¡Muy bien, más del 20%!')
  }

  return `En ${mName}: te entraron ${money(income)}, gastaste ${money(spent)} y tu saldo es ${money(balance)}.` +
    (byCat[0] ? ` Donde más gastas es en **${byCat[0].name}**.` : '') +
    ' Puedes preguntarme por una categoría, tu presupuesto o tu ahorro.'
}

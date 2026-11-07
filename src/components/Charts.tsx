import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import {
  balanceOf,
  balanceTrend,
  inMonth,
  monthlySpending,
  previousWeekSpent,
  spendingByCategory,
  spentOf,
  weeklySpending,
  type Transaction,
} from '../lib/finance'
import { capitalize, colombiaNow, formatCOP, formatCOPShort, formatPct, monthName, monthTitle, toISODate } from '../lib/format'
import { monthsWithData, summarize } from '../lib/summary'

type View = 'monthly' | 'weekly' | 'networth'

const card = { background: '#111112', border: '1px solid rgba(255,255,255,0.06)' }

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} className="px-3 py-2">
      <p className="text-xs mb-0.5" style={{ color: '#8C8C93' }}>{label}</p>
      <p className="text-sm font-semibold font-mono-data" style={{ color: '#F4F4F5' }}>{formatCOP(payload[0].value)}</p>
    </div>
  )
}

function AreaTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div style={{ background: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} className="px-3 py-2">
      <p className="text-xs mb-0.5" style={{ color: '#8C8C93' }}>{label}</p>
      <p className="text-sm font-semibold font-mono-data" style={{ color: v < 0 ? '#E0706B' : '#F4F4F5' }}>{v < 0 ? '-' : ''}{formatCOP(v)}</p>
    </div>
  )
}

function Badge({ good, children }: { good: boolean; children: React.ReactNode }) {
  return (
    <span
      className="text-xs px-2 py-1 rounded-full font-medium"
      style={good ? { background: 'rgba(255,255,255,0.12)', color: '#F4F4F5' } : { background: 'rgba(224,112,107,0.12)', color: '#E0706B' }}
    >
      {children}
    </span>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-center py-10" style={{ color: '#8C8C93' }}>{text}</p>
}

const axisTick = { fill: '#8C8C93', fontSize: 10, fontFamily: 'Manrope' }
const labelTick = { fill: '#8C8C93', fontSize: 11, fontFamily: 'Manrope' }

export default function Charts({ transactions, onOpenSummary }: { transactions: Transaction[]; onOpenSummary: (key: string) => void }) {
  const [view, setView] = useState<View>('monthly')
  const [activeBar, setActiveBar] = useState<number | null>(null)

  const now = colombiaNow()
  const months = monthlySpending(transactions, 6, now)
  const thisMonth = months[months.length - 1]
  const previous = months.slice(0, -1).filter(m => m.spent > 0)
  const avgPrev = previous.length ? previous.reduce((s, m) => s + m.spent, 0) / previous.length : 0
  const vsAvg = avgPrev > 0 ? ((thisMonth.spent - avgPrev) / avgPrev) * 100 : null
  const categories = spendingByCategory(inMonth(transactions, now))
  const monthSpent = spentOf(inMonth(transactions, now))

  const week = weeklySpending(transactions, now)
  const weekTotal = week.reduce((s, d) => s + d.amount, 0)
  const weekMax = Math.max(...week.map(d => d.amount), 0)
  const prevWeek = previousWeekSpent(transactions, now)
  const vsWeek = prevWeek > 0 ? ((weekTotal - prevWeek) / prevWeek) * 100 : null

  const trend = balanceTrend(transactions, 6, now)
  const balance = balanceOf(transactions)
  const firstWithMoney = trend.find(t => t.value !== 0)
  const trendChange = firstWithMoney ? balance - firstWithMoney.value : 0

  const currentKey = toISODate(now).slice(0, 7)
  const pastMonths = monthsWithData(transactions).filter(k => k < currentKey).slice(0, 12)

  const views: { key: View; label: string }[] = [
    { key: 'monthly', label: 'Mensual' },
    { key: 'weekly', label: 'Semanal' },
    { key: 'networth', label: 'Saldo' },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-hide" style={{ background: '#050505' }}>
      {/* Header */}
      <div className="px-6 pt-4 pb-3">
        <p className="text-xl font-bold" style={{ color: '#F4F4F5' }}>Análisis</p>
        <p className="text-xs mt-0.5" style={{ color: '#8C8C93' }}>{monthTitle(now)}</p>
      </div>

      {/* View Tabs */}
      <div className="mx-4 mb-4 flex gap-1 p-1 rounded-2xl" style={{ background: '#111112' }}>
        {views.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: view === key ? '#1A1A1C' : 'transparent',
              color: view === key ? '#F4F4F5' : '#8C8C93',
              border: view === key ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Monthly */}
      {view === 'monthly' && (
        <div className="fade-up">
          <div className="mx-4 mb-4 rounded-2xl p-4" style={card}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs" style={{ color: '#8C8C93' }}>Gasto este mes</p>
                <p className="text-2xl font-bold font-mono-data mt-0.5" style={{ color: '#F4F4F5' }}>{formatCOPShort(thisMonth.spent)}</p>
              </div>
              {vsAvg !== null && (
                <Badge good={vsAvg <= 0}>{vsAvg <= 0 ? '↓ ' : '↑ '}{formatPct(Math.abs(vsAvg))} vs. promedio</Badge>
              )}
            </div>
            {months.every(m => m.spent === 0) ? (
              <Empty text="Cuando anotes gastos, aquí verás cuánto gastas cada mes" />
            ) : (
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" tick={labelTick} axisLine={false} tickLine={false} />
                    <YAxis width={72} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => formatCOPShort(v)} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
                    <Bar dataKey="spent" radius={[6, 6, 2, 2]} onMouseEnter={(_, i) => setActiveBar(i)} onMouseLeave={() => setActiveBar(null)}>
                      {months.map((_, i) => (
                        <Cell key={i} fill={i === months.length - 1 || i === activeBar ? '#F4F4F5' : '#262629'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="mx-4 mb-6 rounded-2xl p-4" style={card}>
            <p className="text-sm font-semibold mb-4" style={{ color: '#F4F4F5' }}>Por categoría</p>
            {categories.length === 0 ? (
              <Empty text="Aún no hay gastos este mes" />
            ) : (
              <div className="space-y-3">
                {categories.map(cat => {
                  const pct = monthSpent > 0 ? (cat.amount / monthSpent) * 100 : 0
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base mono-icon">{cat.icon}</span>
                          <span className="text-sm" style={{ color: '#F4F4F5' }}>{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono-data" style={{ color: '#8C8C93' }}>{Math.round(pct)}%</span>
                          <span className="text-sm font-semibold font-mono-data" style={{ color: '#F4F4F5' }}>{formatCOPShort(cat.amount)}</span>
                        </div>
                      </div>
                      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: '#262629' }}>
                        <div className="absolute left-0 top-0 h-full rounded-full bar-grow" style={{ width: `${pct}%`, background: cat.color }} />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: '#5E5E65' }}>
                        {cat.count} {cat.count === 1 ? 'movimiento' : 'movimientos'}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly */}
      {view === 'weekly' && (
        <div className="fade-up">
          <div className="mx-4 mb-4 rounded-2xl p-4" style={card}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs" style={{ color: '#8C8C93' }}>Esta semana</p>
                <p className="text-2xl font-bold font-mono-data mt-0.5" style={{ color: '#F4F4F5' }}>{formatCOPShort(weekTotal)}</p>
              </div>
              {vsWeek !== null && (
                <Badge good={vsWeek <= 0}>{vsWeek <= 0 ? '↓ ' : '↑ '}{formatPct(Math.abs(vsWeek), 0)} vs. semana anterior</Badge>
              )}
            </div>
            {weekTotal === 0 ? (
              <Empty text="No has anotado gastos esta semana" />
            ) : (
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={week} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <XAxis dataKey="day" tick={labelTick} axisLine={false} tickLine={false} />
                    <YAxis width={72} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => formatCOPShort(v)} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
                    <Bar dataKey="amount" radius={[6, 6, 2, 2]}>
                      {week.map((d, i) => (
                        <Cell key={i} fill={d.isToday ? '#F4F4F5' : d.amount > 0 && d.amount === weekMax ? '#8C8C93' : '#262629'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mx-4 mb-6 rounded-2xl overflow-hidden" style={card}>
            <div className="px-4 pt-4 pb-2">
              <p className="text-sm font-semibold" style={{ color: '#F4F4F5' }}>Día por día</p>
            </div>
            {week.map((d, i) => (
              <div key={d.day} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: d.isFuture ? 0.4 : 1 }}>
                <p className="text-sm w-8" style={{ color: d.isToday ? '#F4F4F5' : '#8C8C93' }}>{d.day}</p>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#262629' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${weekMax > 0 ? (d.amount / weekMax) * 100 : 0}%`, background: d.amount === weekMax ? '#F4F4F5' : '#6E6E75' }}
                  />
                </div>
                <p className="text-sm font-mono-data w-20 text-right" style={{ color: '#F4F4F5' }}>{formatCOPShort(d.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balance trend */}
      {view === 'networth' && (
        <div className="fade-up">
          <div className="mx-4 mb-6 rounded-2xl p-4" style={card}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs" style={{ color: '#8C8C93' }}>Saldo disponible</p>
                <p className="text-2xl font-bold font-mono-data mt-0.5" style={{ color: balance < 0 ? '#E0706B' : '#F4F4F5' }}>
                  {balance < 0 ? '-' : ''}{formatCOPShort(balance)}
                </p>
              </div>
              {firstWithMoney && trendChange !== 0 && (
                <Badge good={trendChange >= 0}>
                  {trendChange >= 0 ? '↑ +' : '↓ -'}{formatCOPShort(trendChange)} (6 meses)
                </Badge>
              )}
            </div>
            {transactions.length === 0 ? (
              <Empty text="Agrega dinero para ver cómo cambia tu saldo mes a mes" />
            ) : (
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F4F4F5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#F4F4F5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" vertical={false} />
                    <XAxis dataKey="month" tick={labelTick} axisLine={false} tickLine={false} />
                    <YAxis width={72} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => (v < 0 ? '-' : '') + formatCOPShort(v)} />
                    <Tooltip content={<AreaTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#F4F4F5"
                      strokeWidth={2}
                      fill="url(#nwGradient)"
                      dot={{ fill: '#F4F4F5', strokeWidth: 0, r: 3 }}
                      activeDot={{ fill: '#F4F4F5', r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="text-[10px] mt-2" style={{ color: '#5E5E65' }}>Saldo al final de cada mes, según tus movimientos</p>
          </div>
        </div>
      )}
      {/* Past monthly summaries */}
      <div className="mx-4 mb-6 rounded-2xl overflow-hidden" style={card}>
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-semibold" style={{ color: '#F4F4F5' }}>Resúmenes</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#5E5E65' }}>El detalle de cada mes que ya terminó</p>
        </div>
        {pastMonths.length === 0 ? (
          <p className="text-xs px-4 pb-5 pt-2" style={{ color: '#8C8C93' }}>
            Cuando termine {monthName(now.getMonth())} verás aquí su resumen.
          </p>
        ) : (
          pastMonths.map((key, i) => {
            const s = summarize(transactions, key)
            return (
              <button
                key={key}
                onClick={() => onOpenSummary(key)}
                className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-white/5"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="text-sm" style={{ color: '#F4F4F5' }}>{capitalize(monthName(s.month))} {s.year}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs font-mono-data" style={{ color: '#8C8C93' }}>-{formatCOPShort(s.spent)}</span>
                  <span style={{ color: '#5E5E65' }}>›</span>
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

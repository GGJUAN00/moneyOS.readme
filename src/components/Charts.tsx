import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { monthlySpending, netWorthTrend, weeklySpending, categories, totalSpent, formatCOP, formatCOPShort } from '../data/mockData'

type View = 'monthly' | 'weekly' | 'networth'

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} className="px-3 py-2">
      <p className="text-xs mb-0.5" style={{ color: '#5A6A8A' }}>{label}</p>
      <p className="text-sm font-semibold font-mono-data" style={{ color: '#E8EDFF' }}>{formatCOP(payload[0].value)}</p>
    </div>
  )
}

function AreaTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} className="px-3 py-2">
      <p className="text-xs mb-0.5" style={{ color: '#5A6A8A' }}>{label}</p>
      <p className="text-sm font-semibold font-mono-data" style={{ color: '#00E87A' }}>{formatCOP(payload[0].value)}</p>
    </div>
  )
}

export default function Charts() {
  const [view, setView] = useState<View>('monthly')
  const [activeBar, setActiveBar] = useState<number | null>(null)

  const views: { key: View; label: string }[] = [
    { key: 'monthly', label: 'Monthly' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'networth', label: 'Net Worth' },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-hide" style={{ background: '#06090F' }}>
      {/* Header */}
      <div className="px-6 pt-4 pb-3">
        <p className="text-xl font-bold" style={{ color: '#E8EDFF' }}>Analytics</p>
        <p className="text-xs mt-0.5" style={{ color: '#5A6A8A' }}>September 2026</p>
      </div>

      {/* View Tabs */}
      <div className="mx-4 mb-4 flex gap-1 p-1 rounded-2xl" style={{ background: '#0E1420' }}>
        {views.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: view === key ? '#141B2D' : 'transparent',
              color: view === key ? '#E8EDFF' : '#5A6A8A',
              border: view === key ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Monthly Spending Chart */}
      {view === 'monthly' && (
        <div className="fade-up">
          <div
            className="mx-4 mb-4 rounded-2xl p-4"
            style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs" style={{ color: '#5A6A8A' }}>Gasto 6 Meses</p>
                <p className="text-2xl font-bold font-mono-data mt-0.5" style={{ color: '#E8EDFF' }}>{formatCOPShort(totalSpent)}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(0,232,122,0.12)', color: '#00E87A' }}>
                ↓ 4.5% vs avg
              </span>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySpending} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#5A6A8A', fontSize: 11, fontFamily: 'Outfit' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    width={66}
                    tick={{ fill: '#5A6A8A', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => formatCOPShort(v)}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
                  <Bar
                    dataKey="spent"
                    radius={[6, 6, 2, 2]}
                    onMouseEnter={(_, i) => setActiveBar(i)}
                    onMouseLeave={() => setActiveBar(null)}
                  >
                    {monthlySpending.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === monthlySpending.length - 1 || i === activeBar
                          ? '#00E87A'
                          : '#1C2540'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div
            className="mx-4 mb-6 rounded-2xl p-4"
            style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: '#E8EDFF' }}>Por Categoría</p>
            <div className="space-y-3">
              {categories.map(cat => {
                const pct = Math.round((cat.amount / totalSpent) * 100)
                const overBudget = cat.amount > cat.budget
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-sm" style={{ color: '#E8EDFF' }}>{cat.name}</span>
                        {overBudget && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,71,87,0.15)', color: '#FF4757' }}>
                            over
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-data" style={{ color: '#5A6A8A' }}>{pct}%</span>
                        <span className="text-sm font-semibold font-mono-data" style={{ color: overBudget ? '#FF4757' : '#E8EDFF' }}>
                          {formatCOPShort(cat.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: '#1C2540' }}>
                      <div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{ width: `${pct}%`, background: cat.color, transition: 'width 0.6s ease' }}
                      />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: '#3A4A6A' }}>
                      Presupuesto: {formatCOPShort(cat.budget)} · {overBudget ? `${formatCOPShort(cat.amount - cat.budget)} excedido` : `${formatCOPShort(cat.budget - cat.amount)} restante`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      {view === 'weekly' && (
        <div className="fade-up">
          <div
            className="mx-4 mb-4 rounded-2xl p-4"
            style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs" style={{ color: '#5A6A8A' }}>Esta Semana</p>
                <p className="text-2xl font-bold font-mono-data mt-0.5" style={{ color: '#E8EDFF' }}>{formatCOPShort(weeklySpending.reduce((s, d) => s + d.amount, 0))}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(255,71,87,0.12)', color: '#FF4757' }}>
                ↑ 12% vs last week
              </span>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySpending} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#5A6A8A', fontSize: 11, fontFamily: 'Outfit' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    width={66}
                    tick={{ fill: '#5A6A8A', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => formatCOPShort(v)}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
                  <Bar dataKey="amount" radius={[6, 6, 2, 2]}>
                    {weeklySpending.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.amount === Math.max(...weeklySpending.map(d => d.amount))
                          ? '#FF4757'
                          : i === weeklySpending.length - 1
                          ? '#00E87A'
                          : '#1C2540'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div
            className="mx-4 mb-6 rounded-2xl overflow-hidden"
            style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="px-4 pt-4 pb-2">
              <p className="text-sm font-semibold" style={{ color: '#E8EDFF' }}>Promedio Diario</p>
            </div>
            {weeklySpending.map((d, i) => (
              <div
                key={d.day}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <p className="text-sm w-8" style={{ color: '#5A6A8A' }}>{d.day}</p>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1C2540' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(d.amount / 2_184_000) * 100}%`,
                      background: d.amount > 1_500_000 ? '#FF4757' : '#4F7FFF',
                    }}
                  />
                </div>
                <p className="text-sm font-mono-data w-20 text-right" style={{ color: '#E8EDFF' }}>{formatCOPShort(d.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Net Worth Chart */}
      {view === 'networth' && (
        <div className="fade-up">
          <div
            className="mx-4 mb-4 rounded-2xl p-4"
            style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs" style={{ color: '#5A6A8A' }}>Patrimonio Neto</p>
                <p className="text-2xl font-bold font-mono-data mt-0.5" style={{ color: '#E8EDFF' }}>{formatCOPShort(netWorthTrend[netWorthTrend.length - 1].value)}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(0,232,122,0.12)', color: '#00E87A' }}>
                ↑ +{formatCOPShort(netWorthTrend[netWorthTrend.length - 1].value - netWorthTrend[0].value)} (6m)
              </span>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E87A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00E87A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#5A6A8A', fontSize: 11, fontFamily: 'Outfit' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    width={66}
                    tick={{ fill: '#5A6A8A', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => formatCOPShort(v)}
                    domain={['dataMin - 2100000', 'dataMax + 2100000']}
                  />
                  <Tooltip content={<AreaTooltip />} cursor={{ stroke: 'rgba(0,232,122,0.3)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00E87A"
                    strokeWidth={2}
                    fill="url(#nwGradient)"
                    dot={{ fill: '#00E87A', strokeWidth: 0, r: 3 }}
                    activeDot={{ fill: '#00E87A', r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Milestones */}
          <div
            className="mx-4 mb-6 rounded-2xl p-4"
            style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-sm font-semibold mb-3" style={{ color: '#E8EDFF' }}>Milestones</p>
            {[
              { label: 'Fondo de Emergencia (3 meses)', current: 104_370_000, target: 90_720_000, done: true },
              { label: 'Cuota Inicial Casa', current: 104_370_000, target: 252_000_000, done: false },
              { label: 'Fondo de Vacaciones', current: 13_440_000, target: 21_000_000, done: false },
            ].map(m => (
              <div key={m.label} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span style={{ color: m.done ? '#00E87A' : '#5A6A8A' }}>
                      {m.done ? '✓' : '○'}
                    </span>
                    <p className="text-xs" style={{ color: m.done ? '#E8EDFF' : '#5A6A8A' }}>{m.label}</p>
                  </div>
                  <p className="text-xs font-mono-data" style={{ color: m.done ? '#00E87A' : '#5A6A8A' }}>
                    {Math.min(100, Math.round((m.current / m.target) * 100))}%
                  </p>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1C2540' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (m.current / m.target) * 100)}%`,
                      background: m.done ? '#00E87A' : '#4F7FFF',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

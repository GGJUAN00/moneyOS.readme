import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  categories,
  totalSpent,
  monthlyBudget,
  balance,
  monthlyIncome,
  transactions,
  formatCOP,
  formatCOPShort,
} from '../data/mockData'
import { displayName, greeting, initialsOf, type UserProfile } from '../lib/user'

const budgetPct = Math.round((totalSpent / monthlyBudget) * 100)
const saved = monthlyIncome - totalSpent

interface Props {
  user: UserProfile
  onNavigate: (tab: 'charts' | 'transactions' | 'ai') => void
  onOpenProfile: () => void
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{ background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
      className="px-3 py-2"
    >
      <p className="text-xs" style={{ color: '#5A6A8A' }}>{payload[0].name}</p>
      <p className="text-sm font-semibold" style={{ color: '#E8EDFF' }}>{formatCOP(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard({ user, onNavigate, onOpenProfile }: Props) {
  const [activeCat, setActiveCat] = useState<number | null>(null)
  const recentTx = transactions.slice(0, 4)

  return (
    <div
      className="h-full overflow-y-auto scrollbar-hide"
      style={{ background: '#06090F' }}
    >
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: '#5A6A8A' }}>{greeting()}</p>
          <p className="text-lg font-semibold" style={{ color: '#E8EDFF' }}>{displayName(user)}</p>
        </div>
        <button
          onClick={onOpenProfile}
          aria-label="Ver mi perfil"
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #00E87A 0%, #00A855 100%)', color: '#06090F' }}
        >
          {initialsOf(user)}
        </button>
      </div>

      {/* Balance Card */}
      <div className="mx-4 mt-2 mb-4 rounded-3xl p-6 relative overflow-hidden accent-glow"
        style={{
          background: 'linear-gradient(135deg, #0E2A1A 0%, #0A1F14 50%, #06090F 100%)',
          border: '1px solid rgba(0,232,122,0.2)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00E87A 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <p className="text-xs font-medium mb-1" style={{ color: 'rgba(0,232,122,0.7)', letterSpacing: '0.08em' }}>
          SALDO TOTAL
        </p>
        <p className="text-3xl font-bold mb-4 font-mono-data" style={{ color: '#E8EDFF' }}>
          {formatCOP(balance)}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,232,122,0.15)', color: '#00E87A' }}>
            ↑ +3,6%
          </span>
          <span className="text-xs" style={{ color: '#5A6A8A' }}>vs. mes anterior</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Ingresos', value: monthlyIncome, color: '#00E87A', prefix: '+' },
          { label: 'Gastos', value: totalSpent, color: '#FF4757', prefix: '-' },
          { label: 'Ahorro', value: saved, color: '#4F7FFF', prefix: '' },
        ].map(({ label, value, color, prefix }) => (
          <div
            key={label}
            className="rounded-2xl p-3"
            style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs mb-1" style={{ color: '#5A6A8A' }}>{label}</p>
            <p className="text-sm font-semibold font-mono-data" style={{ color }}>
              {prefix}{formatCOPShort(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Budget */}
      <div
        className="mx-4 mb-4 rounded-2xl p-4"
        style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: '#E8EDFF' }}>Presupuesto mensual</p>
          <p className="text-xs font-mono-data" style={{ color: '#5A6A8A' }}>
            <span style={{ color: '#E8EDFF' }}>{formatCOPShort(totalSpent)}</span>
            {' / '}{formatCOPShort(monthlyBudget)}
          </p>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#1C2540' }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{
              width: `${budgetPct}%`,
              background: budgetPct > 90
                ? 'linear-gradient(90deg, #FF4757, #FF6B78)'
                : 'linear-gradient(90deg, #00E87A, #00C464)',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs" style={{ color: '#5A6A8A' }}>{budgetPct}% usado · quedan 5 días</p>
          <p className="text-xs font-semibold" style={{ color: '#00E87A' }}>
            {formatCOPShort(monthlyBudget - totalSpent)} restante
          </p>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div
        className="mx-4 mb-4 rounded-2xl p-4"
        style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold" style={{ color: '#E8EDFF' }}>Gastos del mes</p>
          <button
            onClick={() => onNavigate('charts')}
            className="text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: '#00E87A' }}
          >
            Ver gráficas →
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="amount"
                  onMouseEnter={(_, idx) => setActiveCat(idx)}
                  onMouseLeave={() => setActiveCat(null)}
                  startAngle={90}
                  endAngle={-270}
                >
                  {categories.map((cat, i) => (
                    <Cell
                      key={cat.name}
                      fill={cat.color}
                      opacity={activeCat === null || activeCat === i ? 1 : 0.3}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <p className="text-[10px]" style={{ color: '#5A6A8A' }}>gastado</p>
              <p className="text-sm font-bold font-mono-data" style={{ color: '#E8EDFF' }}>
                {activeCat !== null
                  ? formatCOPShort(categories[activeCat].amount)
                  : formatCOPShort(totalSpent)
                }
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className="flex items-center gap-2 cursor-pointer"
                onMouseEnter={() => setActiveCat(i)}
                onMouseLeave={() => setActiveCat(null)}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate" style={{ color: activeCat === i ? '#E8EDFF' : '#5A6A8A' }}>
                      {cat.name}
                    </p>
                    <p className="text-xs font-mono-data ml-1" style={{ color: activeCat === i ? cat.color : '#5A6A8A' }}>
                      {formatCOPShort(cat.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className="mx-4 mb-6 rounded-2xl overflow-hidden"
        style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <p className="text-sm font-semibold" style={{ color: '#E8EDFF' }}>Recientes</p>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#00E87A' }}
          >
            Ver todos →
          </button>
        </div>

        {recentTx.map((tx, i) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 px-4 py-3 transition-colors"
            style={{
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: '#141B2D' }}
            >
              {tx.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#E8EDFF' }}>{tx.name}</p>
              <p className="text-xs" style={{ color: '#5A6A8A' }}>{tx.category}</p>
            </div>
            <p
              className="text-sm font-semibold font-mono-data flex-shrink-0"
              style={{ color: tx.amount > 0 ? '#00E87A' : '#E8EDFF' }}
            >
              {tx.amount > 0 ? '+' : '-'}{formatCOP(tx.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

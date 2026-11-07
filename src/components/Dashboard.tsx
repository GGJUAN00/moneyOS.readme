import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  balanceOf,
  categoryInfo,
  daysLeftInMonth,
  inMonth,
  incomeOf,
  sortNewest,
  spendingByCategory,
  spentOf,
  type Settings,
  type Transaction,
  type TxType,
} from '../lib/finance'
import { formatCOP, formatCOPShort, formatPct, relativeDay, toISODate } from '../lib/format'
import { displayName, greeting, initialsOf, type UserProfile } from '../lib/user'

interface Props {
  user: UserProfile
  transactions: Transaction[]
  settings: Settings
  onNavigate: (tab: 'charts' | 'transactions' | 'ai') => void
  onOpenProfile: () => void
  onAdd: (type: TxType) => void
  onEdit: (tx: Transaction) => void
  onEditBudget: () => void
}

const card = { background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }

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

export function ActionButtons({ onAdd }: { onAdd: (type: TxType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onAdd('ingreso')}
        className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-opacity active:opacity-80"
        style={{ background: '#00E87A', color: '#06090F' }}
      >
        <span className="text-lg leading-none">＋</span> Agregar dinero
      </button>
      <button
        onClick={() => onAdd('gasto')}
        className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-opacity active:opacity-80"
        style={{ background: 'rgba(255,71,87,0.12)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.35)' }}
      >
        <span className="text-lg leading-none">−</span> Transacción
      </button>
    </div>
  )
}

export default function Dashboard({ user, transactions, settings, onNavigate, onOpenProfile, onAdd, onEdit, onEditBudget }: Props) {
  const [activeCat, setActiveCat] = useState<number | null>(null)

  const now = new Date()
  const balance = balanceOf(transactions)
  const month = inMonth(transactions, now)
  const income = incomeOf(month)
  const spent = spentOf(month)
  const saved = income - spent
  const categories = spendingByCategory(month)
  const recent = sortNewest(transactions).slice(0, 4)
  const budget = settings.monthlyBudget
  const budgetPct = budget > 0 ? Math.round((spent / budget) * 100) : 0
  const daysLeft = daysLeftInMonth(now) + 1 // counting today

  // Balance change vs. the end of last month (only when there was money then)
  const lastMonthEnd = toISODate(new Date(now.getFullYear(), now.getMonth(), 0))
  const prevBalance = balanceOf(transactions, lastMonthEnd)
  const change = prevBalance > 0 ? ((balance - prevBalance) / prevBalance) * 100 : null

  const empty = transactions.length === 0

  return (
    <div className="h-full overflow-y-auto scrollbar-hide" style={{ background: '#06090F' }}>
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
      <div className="mx-4 mt-2 mb-3 rounded-3xl p-6 relative overflow-hidden accent-glow"
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
          SALDO DISPONIBLE
        </p>
        <p className="text-3xl font-bold mb-4 font-mono-data" style={{ color: balance < 0 ? '#FF4757' : '#E8EDFF' }}>
          {balance < 0 ? '-' : ''}{formatCOP(balance)}
        </p>
        <div className="flex items-center gap-2">
          {change !== null ? (
            <>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={change >= 0
                  ? { background: 'rgba(0,232,122,0.15)', color: '#00E87A' }
                  : { background: 'rgba(255,71,87,0.15)', color: '#FF4757' }}
              >
                {change >= 0 ? '↑ +' : '↓ '}{formatPct(change)}
              </span>
              <span className="text-xs" style={{ color: '#5A6A8A' }}>vs. mes anterior</span>
            </>
          ) : (
            <span className="text-xs" style={{ color: '#5A6A8A' }}>
              {empty ? 'Agrega la plata que tienes en Nequi para empezar' : 'Según los movimientos que has anotado'}
            </span>
          )}
        </div>
      </div>

      {/* Main actions */}
      <div className="mx-4 mb-4">
        <ActionButtons onAdd={onAdd} />
      </div>

      {empty && (
        <div className="mx-4 mb-4 rounded-2xl p-4 fade-up" style={{ ...card, border: '1px dashed rgba(0,232,122,0.3)' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: '#E8EDFF' }}>¿Cómo empiezo?</p>
          <ol className="space-y-1.5 text-xs list-decimal pl-4" style={{ color: '#8B9CC4' }}>
            <li>Toca <b style={{ color: '#00E87A' }}>Agregar dinero</b> y escribe lo que tienes hoy en Nequi.</li>
            <li>Cada vez que pagues algo, toca <b style={{ color: '#FF4757' }}>Transacción</b> y elige qué tipo de gasto fue.</li>
            <li>Cuando te entre plata, vuelve a <b style={{ color: '#00E87A' }}>Agregar dinero</b>.</li>
          </ol>
        </div>
      )}

      {/* Stats Row */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Ingresos', value: income, color: '#00E87A', prefix: '+', note: 'este mes' },
          { label: 'Gastos', value: spent, color: '#FF4757', prefix: '-', note: 'este mes' },
          // Savings only make sense once some income was recorded this month
          income > 0
            ? { label: 'Ahorro', value: saved, color: saved < 0 ? '#FF4757' : '#4F7FFF', prefix: saved < 0 ? '-' : '', note: 'este mes' }
            : { label: 'Ahorro', value: null, color: '#5A6A8A', prefix: '', note: 'sin ingresos aún' },
        ].map(({ label, value, color, prefix, note }) => (
          <div key={label} className="rounded-2xl p-3" style={card}>
            <p className="text-xs mb-1" style={{ color: '#5A6A8A' }}>{label}</p>
            <p className="text-sm font-semibold font-mono-data" style={{ color: !value ? '#5A6A8A' : color }}>
              {value === null ? '—' : `${value === 0 ? '' : prefix}${formatCOPShort(value)}`}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#3A4A6A' }}>{note}</p>
          </div>
        ))}
      </div>

      {/* Monthly Budget */}
      <button onClick={onEditBudget} className="mx-4 mb-4 rounded-2xl p-4 text-left block" style={{ ...card, width: 'calc(100% - 2rem)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: '#E8EDFF' }}>Presupuesto mensual</p>
          {budget > 0 ? (
            <p className="text-xs font-mono-data" style={{ color: '#5A6A8A' }}>
              <span style={{ color: '#E8EDFF' }}>{formatCOPShort(spent)}</span>
              {' / '}{formatCOPShort(budget)}
            </p>
          ) : (
            <p className="text-xs font-medium" style={{ color: '#00E87A' }}>Definir →</p>
          )}
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#1C2540' }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, budgetPct)}%`,
              background: budgetPct > 90
                ? 'linear-gradient(90deg, #FF4757, #FF6B78)'
                : 'linear-gradient(90deg, #00E87A, #00C464)',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {budget > 0 ? (
            <>
              <p className="text-xs" style={{ color: '#5A6A8A' }}>
                {budgetPct}% usado · {daysLeft === 1 ? 'último día del mes' : `quedan ${daysLeft} días`}
              </p>
              <p className="text-xs font-semibold" style={{ color: budget - spent < 0 ? '#FF4757' : '#00E87A' }}>
                {budget - spent < 0 ? `${formatCOPShort(spent - budget)} excedido` : `${formatCOPShort(budget - spent)} restante`}
              </p>
            </>
          ) : (
            <p className="text-xs" style={{ color: '#5A6A8A' }}>Ponte un límite de gasto para este mes</p>
          )}
        </div>
      </button>

      {/* Spending Breakdown */}
      <div className="mx-4 mb-4 rounded-2xl p-4" style={card}>
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

        {categories.length === 0 ? (
          <p className="text-xs py-6 text-center" style={{ color: '#5A6A8A' }}>
            Aún no has anotado gastos este mes
          </p>
        ) : (
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
                    paddingAngle={categories.length > 1 ? 3 : 0}
                    dataKey="amount"
                    nameKey="name"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px]" style={{ color: '#5A6A8A' }}>gastado</p>
                <p className="text-sm font-bold font-mono-data" style={{ color: '#E8EDFF' }}>
                  {activeCat !== null && categories[activeCat]
                    ? formatCOPShort(categories[activeCat].amount)
                    : formatCOPShort(spent)}
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2 min-w-0">
              {categories.slice(0, 6).map((cat, i) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-2 cursor-pointer"
                  onMouseEnter={() => setActiveCat(i)}
                  onMouseLeave={() => setActiveCat(null)}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <p className="text-xs truncate" style={{ color: activeCat === i ? '#E8EDFF' : '#5A6A8A' }}>{cat.name}</p>
                    <p className="text-xs font-mono-data ml-1" style={{ color: activeCat === i ? cat.color : '#5A6A8A' }}>
                      {formatCOPShort(cat.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="mx-4 mb-6 rounded-2xl overflow-hidden" style={card}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <p className="text-sm font-semibold" style={{ color: '#E8EDFF' }}>Recientes</p>
          {!empty && (
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#00E87A' }}
            >
              Ver todos →
            </button>
          )}
        </div>

        {recent.length === 0 && (
          <p className="text-xs px-4 pb-5 text-center" style={{ color: '#5A6A8A' }}>Aquí verás tus últimos movimientos</p>
        )}

        {recent.map((tx, i) => {
          const info = categoryInfo(tx.category, tx.type)
          const income = tx.type === 'ingreso'
          return (
            <button
              key={tx.id}
              onClick={() => onEdit(tx)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/5 transition-colors"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: '#141B2D' }}>
                {info.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#E8EDFF' }}>{tx.description || tx.category}</p>
                <p className="text-xs" style={{ color: '#5A6A8A' }}>{tx.category} · {relativeDay(tx.date)}</p>
              </div>
              <p className="text-sm font-semibold font-mono-data flex-shrink-0" style={{ color: income ? '#00E87A' : '#E8EDFF' }}>
                {income ? '+' : '-'}{formatCOP(tx.amount)}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

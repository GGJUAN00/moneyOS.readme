import { useState } from 'react'
import { categoryInfo, expenseCategories, groupByDate, signed, type Transaction, type TxType } from '../lib/finance'
import { formatCOP, formatCOPShort, relativeDay } from '../lib/format'
import { ActionButtons } from './Dashboard'

interface Props {
  transactions: Transaction[]
  onAdd: (type: TxType) => void
  onEdit: (tx: Transaction) => void
}

const INCOME_FILTER = 'Ingresos'

export default function Transactions({ transactions, onAdd, onEdit }: Props) {
  const [filter, setFilter] = useState<string>('Todos')

  // Only offer filters for categories the user actually has
  const used = new Set(transactions.map(t => (t.type === 'ingreso' ? INCOME_FILTER : t.category)))
  const filters = ['Todos', ...expenseCategories.map(c => c.name).filter(n => used.has(n)), ...(used.has(INCOME_FILTER) ? [INCOME_FILTER] : [])]

  const filtered = filter === 'Todos'
    ? transactions
    : filter === INCOME_FILTER
    ? transactions.filter(t => t.type === 'ingreso')
    : transactions.filter(t => t.type === 'gasto' && t.category === filter)

  const groups = groupByDate(filtered)
  const totalSpent = filtered.filter(t => t.type === 'gasto').reduce((s, t) => s + t.amount, 0)
  const totalIn = filtered.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0)
  const showingIncome = filter === INCOME_FILTER

  return (
    <div className="h-full overflow-y-auto scrollbar-hide" style={{ background: '#06090F' }}>
      {/* Header */}
      <div className="px-6 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold" style={{ color: '#E8EDFF' }}>Movimientos</p>
            <p className="text-xs mt-0.5" style={{ color: '#5A6A8A' }}>
              {transactions.length} {transactions.length === 1 ? 'registro' : 'registros'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#5A6A8A' }}>{showingIncome ? 'Total recibido' : 'Total gastado'}</p>
            <p className="text-base font-semibold font-mono-data" style={{ color: showingIncome ? '#00E87A' : '#FF4757' }}>
              {showingIncome ? '+' : totalSpent > 0 ? '-' : ''}{formatCOPShort(showingIncome ? totalIn : totalSpent)}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4">
        <ActionButtons onAdd={onAdd} />
      </div>

      {/* Category Filter */}
      {transactions.length > 0 && (
        <div className="px-4 mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
            {filters.map(f => {
              const color = f === 'Todos' || f === INCOME_FILTER ? '#00E87A' : categoryInfo(f, 'gasto').color
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0"
                  style={filter === f
                    ? { background: color, color: '#06090F' }
                    : { background: '#0E1420', color: '#5A6A8A', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="mx-4 rounded-2xl p-6 text-center" style={{ background: '#0E1420', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p className="text-3xl mb-2">🧾</p>
          <p className="text-sm font-medium mb-1" style={{ color: '#E8EDFF' }}>Todavía no hay movimientos</p>
          <p className="text-xs" style={{ color: '#5A6A8A' }}>Usa los botones de arriba para anotar tu plata y tus gastos.</p>
        </div>
      )}

      {/* Transaction Groups */}
      <div className="pb-6">
        {groups.map(([date, txs]) => {
          const dayTotal = txs.reduce((s, t) => s + signed(t), 0)
          return (
            <div key={date} className="mb-2">
              <div className="flex items-center justify-between px-6 py-2">
                <p className="text-xs font-semibold" style={{ color: '#5A6A8A', letterSpacing: '0.04em' }}>
                  {relativeDay(date).toUpperCase()}
                </p>
                <p className="text-xs font-mono-data" style={{ color: dayTotal > 0 ? '#00E87A' : '#5A6A8A' }}>
                  {dayTotal > 0 ? '+' : dayTotal < 0 ? '-' : ''}{formatCOP(dayTotal)}
                </p>
              </div>

              <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}>
                {txs.map((tx, i) => {
                  const info = categoryInfo(tx.category, tx.type)
                  const income = tx.type === 'ingreso'
                  return (
                    <button
                      key={tx.id}
                      onClick={() => onEdit(tx)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5 transition-colors"
                      style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#141B2D' }}>
                        {info.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#E8EDFF' }}>{tx.description || tx.category}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: `${info.color}18`, color: info.color }}
                          >
                            {tx.category}
                          </span>
                        </div>
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
        })}
        {transactions.length > 0 && (
          <p className="text-center text-[11px] mt-3" style={{ color: '#3A4A6A' }}>Toca un movimiento para editarlo o borrarlo</p>
        )}
      </div>
    </div>
  )
}

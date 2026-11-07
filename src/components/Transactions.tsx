import { useState } from 'react'
import { transactions, formatCOP, formatCOPShort } from '../data/mockData'

const categoryColors: Record<string, string> = {
  Food: '#00E87A',
  Transport: '#4F7FFF',
  Shopping: '#FF4757',
  Entertainment: '#FFB800',
  Bills: '#9B59B6',
  Income: '#00E87A',
}

function groupByDate(txs: typeof transactions) {
  const map = new Map<string, typeof transactions>()
  txs.forEach(tx => {
    const group = map.get(tx.date) ?? []
    group.push(tx)
    map.set(tx.date, group)
  })
  return map
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date('2026-09-25T00:00:00')
  const diff = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function Transactions() {
  const [filter, setFilter] = useState<string>('All')
  const categories = ['All', 'Food', 'Shopping', 'Bills', 'Transport', 'Entertainment']

  const filtered = filter === 'All'
    ? transactions
    : transactions.filter(tx => tx.category === filter)

  const grouped = groupByDate(filtered)
  const sortedDates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

  const totalSpent = filtered.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0)

  return (
    <div className="h-full overflow-y-auto scrollbar-hide" style={{ background: '#06090F' }}>
      {/* Header */}
      <div className="px-6 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold" style={{ color: '#E8EDFF' }}>Transacciones</p>
            <p className="text-xs mt-0.5" style={{ color: '#5A6A8A' }}>Septiembre 2026</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#5A6A8A' }}>Total gastado</p>
            <p className="text-base font-semibold font-mono-data" style={{ color: '#FF4757' }}>
              -{formatCOPShort(totalSpent)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0"
              style={filter === cat
                ? {
                    background: cat === 'All' ? '#00E87A' : categoryColors[cat] ?? '#00E87A',
                    color: '#06090F',
                  }
                : {
                    background: '#0E1420',
                    color: '#5A6A8A',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Groups */}
      <div className="pb-6">
        {sortedDates.map(date => {
          const txs = grouped.get(date) ?? []
          const dayTotal = txs.reduce((s, tx) => s + tx.amount, 0)

          return (
            <div key={date} className="mb-2">
              {/* Date header */}
              <div className="flex items-center justify-between px-6 py-2">
                <p className="text-xs font-semibold" style={{ color: '#5A6A8A', letterSpacing: '0.04em' }}>
                  {formatDate(date).toUpperCase()}
                </p>
                <p
                  className="text-xs font-mono-data"
                  style={{ color: dayTotal > 0 ? '#00E87A' : '#5A6A8A' }}
                >
                  {dayTotal > 0 ? '+' : '-'}{formatCOP(dayTotal)}
                </p>
              </div>

              {/* Transactions */}
              <div
                className="mx-4 rounded-2xl overflow-hidden"
                style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {txs.map((tx, i) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors cursor-pointer"
                    style={{
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: '#141B2D' }}
                    >
                      {tx.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#E8EDFF' }}>{tx.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            background: `${categoryColors[tx.category]}18`,
                            color: categoryColors[tx.category] ?? '#5A6A8A',
                          }}
                        >
                          {tx.category}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-sm font-semibold font-mono-data"
                        style={{ color: tx.amount > 0 ? '#00E87A' : '#E8EDFF' }}
                      >
                        {tx.amount > 0 ? '+' : '-'}{formatCOP(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

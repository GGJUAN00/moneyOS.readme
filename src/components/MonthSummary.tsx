import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { capitalize, formatCOP, formatCOPShort, formatPct, monthName, relativeDay } from '../lib/format'
import { categoryInfo } from '../lib/finance'
import type { MonthSummary } from '../lib/summary'

const card = { background: '#111112', border: '1px solid rgba(255,255,255,0.06)' }

function Money({ value, className, color = '#F4F4F5', sign = false }: { value: number; className?: string; color?: string; sign?: boolean }) {
  const v = useAnimatedNumber(value, 900, true)
  return (
    <span className={`font-mono-data ${className ?? ''}`} style={{ color }}>
      {v < 0 ? '-' : sign && v > 0 ? '+' : ''}{formatCOP(v)}
    </span>
  )
}

/** Centered card shown once when a new month starts. */
export function MonthSummaryPrompt({ summary, onOpen, onLater }: { summary: MonthSummary; onOpen: () => void; onLater: () => void }) {
  const name = monthName(summary.month)
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center px-6 backdrop-in" role="dialog" aria-modal="true" aria-label={`Resumen de ${name}`}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div className="relative w-full rounded-3xl p-6 metal-card pop-in">
        <p className="text-[11px] font-medium mb-2" style={{ color: '#8C8C93', letterSpacing: '0.18em' }}>TERMINÓ {name.toUpperCase()}</p>
        <p className="text-2xl font-light mb-1" style={{ color: '#FFFFFF' }}>Resumen del mes</p>
        <p className="text-sm mb-5" style={{ color: '#A8A8AF' }}>
          Mira cómo te fue en {name} de {summary.year}.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[11px]" style={{ color: '#8C8C93' }}>Gastaste</p>
            <Money value={summary.spent} className="text-base font-semibold" />
          </div>
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[11px]" style={{ color: '#8C8C93' }}>{summary.income > 0 ? 'Ahorraste' : 'Movimientos'}</p>
            {summary.income > 0
              ? <Money value={summary.saved} className="text-base font-semibold" color={summary.saved < 0 ? '#E0706B' : '#F4F4F5'} />
              : <span className="text-base font-semibold font-mono-data" style={{ color: '#F4F4F5' }}>{summary.count}</span>}
          </div>
        </div>
        <button onClick={onOpen} className="w-full rounded-2xl py-4 text-base font-semibold btn-press" style={{ background: '#F4F4F5', color: '#050505' }}>
          Ver resumen
        </button>
        <button onClick={onLater} className="w-full py-3 mt-1 text-sm" style={{ color: '#8C8C93' }}>
          Después
        </button>
      </div>
    </div>
  )
}

/** Full-screen detail of one month. */
export default function MonthSummaryView({ summary, onClose }: { summary: MonthSummary; onClose: () => void }) {
  const name = monthName(summary.month)
  const vsPrev = summary.prevSpent && summary.prevSpent > 0 ? ((summary.spent - summary.prevSpent) / summary.prevSpent) * 100 : null
  const topCat = summary.categories[0]

  return (
    <div className="absolute inset-0 z-30 flex flex-col sheet-in" style={{ background: '#050505' }} role="dialog" aria-modal="true" aria-label={`Resumen de ${name}`}>
      <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
        <div>
          <p className="text-[11px] font-medium" style={{ color: '#8C8C93', letterSpacing: '0.18em' }}>RESUMEN DEL MES</p>
          <p className="text-2xl font-light" style={{ color: '#FFFFFF' }}>{capitalize(name)} {summary.year}</p>
        </div>
        <button onClick={onClose} aria-label="Cerrar resumen" className="w-10 h-10 rounded-full flex items-center justify-center btn-press" style={{ background: '#1A1A1C', color: '#F4F4F5' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-4 stagger" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
        {/* Headline */}
        <div className="rounded-3xl p-6 metal-card">
          <p className="text-[11px] mb-1" style={{ color: '#8C8C93', letterSpacing: '0.18em' }}>GASTASTE</p>
          <Money value={summary.spent} className="text-[34px] font-light leading-tight block" color="#FFFFFF" />
          <p className="text-xs mt-3" style={{ color: '#A8A8AF' }}>
            {vsPrev === null
              ? `${summary.expenseCount} ${summary.expenseCount === 1 ? 'gasto' : 'gastos'} en ${summary.daysWithSpending} ${summary.daysWithSpending === 1 ? 'día' : 'días'}`
              : `${vsPrev <= 0 ? '↓' : '↑'} ${formatPct(Math.abs(vsPrev))} ${vsPrev <= 0 ? 'menos' : 'más'} que el mes anterior`}
          </p>
        </div>

        {/* Income / savings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={card}>
            <p className="text-xs mb-1" style={{ color: '#8C8C93' }}>Ingresos</p>
            <Money value={summary.income} className="text-base font-semibold" sign />
          </div>
          <div className="rounded-2xl p-4" style={card}>
            <p className="text-xs mb-1" style={{ color: '#8C8C93' }}>Ahorro</p>
            {summary.income > 0 ? (
              <>
                <Money value={summary.saved} className="text-base font-semibold" color={summary.saved < 0 ? '#E0706B' : '#F4F4F5'} />
                <p className="text-[10px] mt-0.5" style={{ color: '#5E5E65' }}>{formatPct(summary.savingsRate ?? 0)} de tus ingresos</p>
              </>
            ) : (
              <p className="text-base font-semibold" style={{ color: '#5E5E65' }}>—</p>
            )}
          </div>
          <div className="rounded-2xl p-4" style={card}>
            <p className="text-xs mb-1" style={{ color: '#8C8C93' }}>Saldo al empezar</p>
            <Money value={summary.startBalance} className="text-sm font-semibold" />
          </div>
          <div className="rounded-2xl p-4" style={card}>
            <p className="text-xs mb-1" style={{ color: '#8C8C93' }}>Saldo al terminar</p>
            <Money value={summary.endBalance} className="text-sm font-semibold" />
          </div>
        </div>

        {/* Highlights */}
        <div className="rounded-2xl overflow-hidden" style={card}>
          {[
            ['Categoría principal', topCat ? `${topCat.name} · ${formatCOPShort(topCat.amount)}` : '—'],
            ['Día de más gasto', summary.biggestDay ? `${relativeDay(summary.biggestDay.date)} · ${formatCOPShort(summary.biggestDay.amount)}` : '—'],
            ['Promedio diario', formatCOP(Math.round(summary.avgDaily))],
            ['Movimientos', String(summary.count)],
          ].map(([label, value], i) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3" style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <p className="text-xs" style={{ color: '#8C8C93' }}>{label}</p>
              <p className="text-sm text-right font-mono-data" style={{ color: '#F4F4F5' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-sm font-semibold mb-4" style={{ color: '#F4F4F5' }}>Gastos por categoría</p>
          {summary.categories.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: '#8C8C93' }}>No anotaste gastos este mes</p>
          ) : (
            <div className="space-y-3">
              {summary.categories.map(cat => {
                const pct = summary.spent > 0 ? (cat.amount / summary.spent) * 100 : 0
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base mono-icon">{cat.icon}</span>
                        <span className="text-sm" style={{ color: '#F4F4F5' }}>{cat.name}</span>
                        <span className="text-[10px]" style={{ color: '#5E5E65' }}>{cat.count}×</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-data" style={{ color: '#8C8C93' }}>{Math.round(pct)}%</span>
                        <span className="text-sm font-semibold font-mono-data" style={{ color: '#F4F4F5' }}>{formatCOPShort(cat.amount)}</span>
                      </div>
                    </div>
                    <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: '#262629' }}>
                      <div className="absolute left-0 top-0 h-full rounded-full bar-grow" style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top expenses */}
        {summary.topExpenses.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={card}>
            <p className="text-sm font-semibold px-4 pt-4 pb-2" style={{ color: '#F4F4F5' }}>Tus gastos más grandes</p>
            {summary.topExpenses.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 mono-icon" style={{ background: '#1A1A1C' }}>
                  {categoryInfo(t.category, 'gasto').icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: '#F4F4F5' }}>{t.description || t.category}</p>
                  <p className="text-xs" style={{ color: '#8C8C93' }}>{t.category} · {relativeDay(t.date)}</p>
                </div>
                <p className="text-sm font-semibold font-mono-data" style={{ color: '#A8A8AF' }}>-{formatCOP(t.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Income sources */}
        {summary.incomes.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={card}>
            <p className="text-sm font-semibold px-4 pt-4 pb-2" style={{ color: '#F4F4F5' }}>De dónde entró tu plata</p>
            {summary.incomes.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 mono-icon" style={{ background: '#1A1A1C' }}>{s.icon}</div>
                <p className="flex-1 text-sm" style={{ color: '#F4F4F5' }}>{s.name} <span className="text-[10px]" style={{ color: '#5E5E65' }}>{s.count}×</span></p>
                <p className="text-sm font-semibold font-mono-data" style={{ color: '#FFFFFF' }}>+{formatCOP(s.amount)}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-[11px]" style={{ color: '#5E5E65' }}>
          Puedes volver a ver este resumen en Gráficas → Resúmenes
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import Sheet, { AmountField } from './Sheet'
import {
  expenseCategories,
  incomeCategories,
  newId,
  type Transaction,
  type TxType,
} from '../lib/finance'
import { formatCOP, todayISO } from '../lib/format'

interface Props {
  type: TxType
  /** When set, the sheet edits this movement instead of creating one. */
  existing?: Transaction
  /** True when there are no movements yet: suggests "Saldo inicial". */
  isFirst?: boolean
  balance: number
  onSave: (tx: Transaction) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

export default function EntrySheet({ type: initialType, existing, isFirst, balance, onSave, onDelete, onClose }: Props) {
  const [type, setType] = useState<TxType>(existing?.type ?? initialType)
  const [amount, setAmount] = useState(existing?.amount ?? 0)
  const [category, setCategory] = useState<string>(
    existing?.category ?? (initialType === 'ingreso' ? (isFirst ? 'Saldo inicial' : 'Me enviaron') : ''),
  )
  const [description, setDescription] = useState(existing?.description ?? '')
  const [date, setDate] = useState(existing?.date ?? todayISO())
  const [tried, setTried] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isIncome = type === 'ingreso'
  const categories = isIncome ? incomeCategories : expenseCategories
  const accent = isIncome ? '#00E87A' : '#FF4757'

  const amountError = tried && amount <= 0 ? 'Escribe el monto' : undefined
  const categoryError = tried && !categories.some(c => c.name === category) ? (isIncome ? 'Elige de dónde viene la plata' : 'Elige qué tipo de gasto es') : undefined

  // Balance after this movement (for the hint under the amount)
  const previous = existing ? (existing.type === 'ingreso' ? -existing.amount : existing.amount) : 0
  const after = balance + previous + (isIncome ? amount : -amount)

  function switchType(next: TxType) {
    if (next === type) return
    setType(next)
    setCategory(next === 'ingreso' ? (isFirst ? 'Saldo inicial' : 'Me enviaron') : '')
  }

  function save() {
    setTried(true)
    if (amount <= 0 || !categories.some(c => c.name === category)) return
    onSave({
      id: existing?.id ?? newId(),
      type,
      amount,
      category,
      description: description.trim(),
      date: date || todayISO(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    })
  }

  const title = existing ? 'Editar movimiento' : isIncome ? 'Agregar dinero' : 'Nueva transacción'

  return (
    <Sheet label={title} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg font-semibold" style={{ color: '#E8EDFF' }}>{title}</p>
        <button onClick={onClose} className="text-sm" style={{ color: '#5A6A8A' }}>Cancelar</button>
      </div>

      {/* Type switch */}
      <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: '#0E1420' }}>
        {([['gasto', '− Gasto'], ['ingreso', '+ Ingreso']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => switchType(key)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: type === key ? '#141B2D' : 'transparent',
              color: type === key ? (key === 'ingreso' ? '#00E87A' : '#FF4757') : '#5A6A8A',
              border: type === key ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs font-medium mb-1.5" style={{ color: '#8B9CC4' }}>
        {isIncome ? '¿Cuánta plata entra?' : '¿Cuánto gastaste?'}
      </p>
      <AmountField value={amount} onChange={setAmount} color={accent} autoFocus={!existing} error={amountError} />
      <p className="text-[11px] mt-1.5 mb-4" style={{ color: after < 0 ? '#FF4757' : '#5A6A8A' }}>
        {amount > 0
          ? `Tu saldo quedará en ${after < 0 ? '-' : ''}${formatCOP(after)}`
          : isIncome && isFirst
          ? 'Escribe la plata que tienes hoy en Nequi'
          : `Saldo actual: ${balance < 0 ? '-' : ''}${formatCOP(balance)}`}
      </p>

      <p className="text-xs font-medium mb-2" style={{ color: '#8B9CC4' }}>
        {isIncome ? '¿De dónde viene?' : '¿Qué tipo de gasto es?'}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-1">
        {categories.map(c => {
          const active = category === c.name
          return (
            <button
              key={c.name}
              onClick={() => setCategory(c.name)}
              aria-pressed={active}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-150"
              style={{
                background: active ? `${c.color}1F` : '#0E1420',
                border: `1px solid ${active ? c.color : categoryError ? 'rgba(255,71,87,0.4)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="text-lg flex-shrink-0">{c.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium truncate" style={{ color: active ? '#E8EDFF' : '#A8B8D8' }}>{c.name}</span>
                {c.hint && <span className="block text-[10px] truncate" style={{ color: '#5A6A8A' }}>{c.hint}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {categoryError && <p className="text-xs mt-1" style={{ color: '#FF4757' }}>{categoryError}</p>}

      <div className="grid grid-cols-[1fr_auto] gap-2 mt-4 mb-5">
        <label className="block min-w-0">
          <span className="block text-xs font-medium mb-1.5" style={{ color: '#8B9CC4' }}>Descripción (opcional)</span>
          <input
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={60}
            placeholder={isIncome ? 'Ej. Pago quincena' : 'Ej. Almuerzo, Uber, Netflix'}
            className="w-full rounded-xl px-4 py-3 text-base outline-none"
            style={{ background: '#0E1420', color: '#E8EDFF', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#00E87A' }}
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium mb-1.5" style={{ color: '#8B9CC4' }}>Fecha</span>
          <input
            name="date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={e => setDate(e.target.value)}
            className="rounded-xl px-3 py-3 text-base outline-none"
            style={{ background: '#0E1420', color: '#E8EDFF', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark', minHeight: 50, width: 150 }}
          />
        </label>
      </div>

      <button
        onClick={save}
        className="w-full rounded-2xl py-4 text-base font-semibold transition-opacity active:opacity-80"
        style={{ background: accent, color: '#06090F' }}
      >
        {existing ? 'Guardar cambios' : isIncome ? 'Agregar dinero' : 'Guardar transacción'}
      </button>

      {existing && onDelete && (
        confirmDelete ? (
          <div className="flex gap-2 mt-2">
            <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-xl py-3 text-sm font-medium" style={{ background: '#141B2D', color: '#E8EDFF' }}>
              No borrar
            </button>
            <button onClick={() => onDelete(existing.id)} className="flex-1 rounded-xl py-3 text-sm font-semibold" style={{ background: '#FF4757', color: '#06090F' }}>
              Sí, borrar
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="w-full rounded-xl py-3 mt-2 text-sm font-medium" style={{ color: '#FF4757' }}>
            Borrar movimiento
          </button>
        )
      )}
    </Sheet>
  )
}

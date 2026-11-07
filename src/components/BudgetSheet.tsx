import { useState } from 'react'
import Sheet, { AmountField } from './Sheet'

interface Props {
  current: number
  onSave: (amount: number) => void
  onClose: () => void
}

export default function BudgetSheet({ current, onSave, onClose }: Props) {
  const [amount, setAmount] = useState(current)

  return (
    <Sheet label="Presupuesto mensual" onClose={onClose}>
      <p className="text-lg font-semibold mb-1" style={{ color: '#E8EDFF' }}>Presupuesto mensual</p>
      <p className="text-xs mb-4" style={{ color: '#5A6A8A' }}>
        ¿Cuánto quieres gastar como máximo cada mes? Te avisamos cuánto te queda.
      </p>
      <AmountField value={amount} onChange={setAmount} autoFocus />
      <div className="flex gap-2 mt-5">
        {current > 0 && (
          <button
            onClick={() => onSave(0)}
            className="flex-1 rounded-xl py-3 text-sm font-medium"
            style={{ color: '#FF4757', border: '1px solid rgba(255,71,87,0.3)' }}
          >
            Quitar
          </button>
        )}
        <button
          onClick={() => amount > 0 && onSave(amount)}
          disabled={amount <= 0}
          className="flex-[2] rounded-xl py-3 text-sm font-semibold"
          style={{ background: amount > 0 ? '#00E87A' : '#1C2540', color: amount > 0 ? '#06090F' : '#3A4A6A' }}
        >
          Guardar presupuesto
        </button>
      </div>
    </Sheet>
  )
}

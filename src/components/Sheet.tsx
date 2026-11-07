import type { ReactNode } from 'react'

interface Props {
  label: string
  onClose: () => void
  children: ReactNode
}

/** Bottom sheet that slides over the current screen inside the phone frame. */
export default function Sheet({ label, onClose, children }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={label}>
      <button aria-label="Cerrar" className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />
      <div
        className="relative rounded-t-3xl px-5 pt-3 fade-up max-h-[92%] overflow-y-auto scrollbar-hide"
        style={{
          background: '#0C0C0D',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        }}
      >
        <div className="mx-auto w-10 h-1 rounded-full mb-4" style={{ background: '#3C3C41' }} />
        {children}
      </div>
    </div>
  )
}

/** Big peso amount field: shows "$ 125.000" while the user types digits. */
export function AmountField({
  value,
  onChange,
  color = '#F4F4F5',
  autoFocus,
  error,
}: {
  value: number
  onChange: (v: number) => void
  color?: string
  autoFocus?: boolean
  error?: string
}) {
  const text = value > 0 ? value.toLocaleString('es-CO') : ''
  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-2xl px-4 py-3"
        style={{ background: '#111112', border: `1px solid ${error ? 'rgba(224,112,107,0.6)' : 'rgba(255,255,255,0.08)'}` }}
      >
        <span className="text-3xl font-bold font-mono-data" style={{ color: value > 0 ? color : '#5E5E65' }}>$</span>
        <input
          name="amount"
          aria-label="Monto en pesos"
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          value={text}
          placeholder="0"
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 12)
            onChange(digits ? Number(digits) : 0)
          }}
          className="flex-1 min-w-0 bg-transparent outline-none text-3xl font-bold font-mono-data placeholder:text-[#5E5E65]"
          style={{ color, caretColor: '#F4F4F5' }}
        />
        <span className="text-xs font-medium" style={{ color: '#8C8C93' }}>COP</span>
      </div>
      {error && <p className="text-xs mt-1.5" style={{ color: '#E0706B' }}>{error}</p>}
    </div>
  )
}

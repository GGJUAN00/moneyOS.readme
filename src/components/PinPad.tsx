import { useEffect, useState } from 'react'

interface Props {
  title: string
  subtitle?: string
  error?: string
  disabled?: boolean
  onComplete: (pin: string) => void
  length?: number
}

/** iPhone-style passcode keypad with dots. */
export default function PinPad({ title, subtitle, error, disabled, onComplete, length = 4 }: Props) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (!error) return
    setShake(true)
    setPin('')
    const t = setTimeout(() => setShake(false), 450)
    return () => clearTimeout(t)
  }, [error])

  function press(d: string) {
    if (disabled || pin.length >= length) return
    const next = pin + d
    setPin(next)
    if (next.length === length) setTimeout(() => { onComplete(next); setPin('') }, 120)
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className="flex flex-col items-center">
      <p className="text-base font-medium" style={{ color: '#F4F4F5' }}>{title}</p>
      <p className="text-xs mt-1 h-4" style={{ color: error ? '#E0706B' : '#8C8C93' }}>{error || subtitle}</p>
      <div className={`flex gap-4 my-7 ${shake ? 'shake' : ''}`} aria-label={`${pin.length} de ${length} dígitos`}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className="w-3.5 h-3.5 rounded-full transition-all duration-150"
            style={{ background: i < pin.length ? '#F4F4F5' : 'transparent', border: '1.5px solid #8C8C93', transform: i < pin.length ? 'scale(1.1)' : 'scale(1)' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        {keys.map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : k === 'del' ? (
            <button
              key={i}
              onClick={() => setPin(p => p.slice(0, -1))}
              aria-label="Borrar dígito"
              className="w-[74px] h-[74px] rounded-full flex items-center justify-center text-sm btn-press"
              style={{ color: '#A8A8AF' }}
            >
              Borrar
            </button>
          ) : (
            <button
              key={i}
              onClick={() => press(k)}
              disabled={disabled}
              className="w-[74px] h-[74px] rounded-full flex items-center justify-center text-3xl font-light btn-press"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#FFFFFF', opacity: disabled ? 0.4 : 1 }}
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import PinPad from './PinPad'
import { useNow } from '../hooks/useNow'
import { capitalize, colombiaLongDate, colombiaTime } from '../lib/format'
import { checkPin, verifyBiometric, type LockConfig } from '../lib/lock'

interface Props {
  config: LockConfig
  name: string
  onUnlock: () => void
}

const MAX_TRIES = 5
const WAIT_SECONDS = 30

function FaceIdIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden>
      <path d="M4 13V9a5 5 0 0 1 5-5h4M31 4h4a5 5 0 0 1 5 5v4M40 31v4a5 5 0 0 1-5 5h-4M13 40H9a5 5 0 0 1-5-5v-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M15 16v3M29 16v3M22 16v8l-2 1.5M16.5 30c3 2.5 8 2.5 11 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LockScreen({ config, name, onUnlock }: Props) {
  const now = useNow(1000)
  const hasBio = !!config.credentialId
  const [mode, setMode] = useState<'bio' | 'pin'>(hasBio ? 'bio' : 'pin')
  const [bioError, setBioError] = useState('')
  const [pinError, setPinError] = useState('')
  const [tries, setTries] = useState(0)
  const [waitUntil, setWaitUntil] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const autoTried = useRef(false)

  const waiting = waitUntil > now
  const waitLeft = Math.ceil((waitUntil - now) / 1000)

  function done() {
    setLeaving(true)
    setTimeout(onUnlock, 280)
  }

  async function tryBiometric(silent = false) {
    if (!config.credentialId) return
    setBioError('')
    try {
      if (await verifyBiometric(config.credentialId)) done()
      else if (!silent) setBioError('No se pudo verificar. Intenta de nuevo o usa tu PIN.')
    } catch {
      // The automatic attempt can be refused by iOS until the user taps; stay quiet then.
      if (!silent) setBioError('Face ID cancelado. Toca el botón para intentarlo otra vez.')
    }
  }

  // Ask for Face ID as soon as the lock appears (iOS may require a tap; then the button is there).
  useEffect(() => {
    if (hasBio && !autoTried.current) {
      autoTried.current = true
      void tryBiometric(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submitPin(pin: string) {
    if (waiting) return
    if (await checkPin(pin, config)) return done()
    const n = tries + 1
    setTries(n)
    if (n >= MAX_TRIES) {
      setWaitUntil(Date.now() + WAIT_SECONDS * 1000)
      setTries(0)
      setPinError(`Demasiados intentos. Espera ${WAIT_SECONDS} segundos.`)
    } else {
      setPinError(`PIN incorrecto · ${MAX_TRIES - n} ${MAX_TRIES - n === 1 ? 'intento' : 'intentos'} más`)
    }
  }

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center px-6 ${leaving ? 'lock-out' : 'lock-in'}`}
      style={{ background: 'radial-gradient(120% 70% at 50% 0%, #1A1A1C 0%, #050505 60%)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="App bloqueada"
    >
      {/* Colombian date & time */}
      <p className="text-sm" style={{ color: '#A8A8AF' }}>{capitalize(colombiaLongDate(now))}</p>
      <p className="text-5xl font-light font-mono-data mt-1 mb-1" style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}>
        {colombiaTime(now, false)}
      </p>
      <p className="text-[11px] mb-10" style={{ color: '#5E5E65', letterSpacing: '0.18em' }}>HORA DE COLOMBIA</p>

      {mode === 'bio' ? (
        <div className="flex-1 flex flex-col items-center w-full">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 metal-card" style={{ color: '#F4F4F5' }}>
            <FaceIdIcon />
          </div>
          <p className="text-lg font-medium" style={{ color: '#F4F4F5' }}>Hola, {name}</p>
          <p className="text-sm mt-1 text-center" style={{ color: '#8C8C93' }}>MoneyOS está bloqueada</p>
          {bioError && <p className="text-xs mt-3 text-center" style={{ color: '#E0706B' }}>{bioError}</p>}
          <div className="mt-auto w-full pb-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
            <button onClick={() => tryBiometric()} className="w-full rounded-2xl py-4 text-base font-semibold btn-press flex items-center justify-center gap-2" style={{ background: '#F4F4F5', color: '#050505' }}>
              <FaceIdIcon size={20} /> Desbloquear con Face ID
            </button>
            <button onClick={() => setMode('pin')} className="w-full py-3 mt-2 text-sm" style={{ color: '#A8A8AF' }}>
              Usar PIN
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center w-full">
          <PinPad
            title="Ingresa tu PIN"
            subtitle={`Hola, ${name}`}
            error={waiting ? `Espera ${waitLeft} s para intentar de nuevo` : pinError}
            disabled={waiting}
            onComplete={submitPin}
          />
          {hasBio && (
            <button onClick={() => { setMode('bio'); void tryBiometric() }} className="mt-6 text-sm" style={{ color: '#A8A8AF' }}>
              Usar Face ID
            </button>
          )}
        </div>
      )}
    </div>
  )
}

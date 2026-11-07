import { useEffect, useState } from 'react'
import PinPad from './PinPad'
import { biometricAvailable, hashPin, newSalt, registerBiometric, saveLock } from '../lib/lock'
import type { LockConfig } from '../lib/lock'

interface Props {
  userName: string
  displayName: string
  onDone: (config: LockConfig) => void
  onSkip: () => void
}

type Step = 'intro' | 'pin' | 'confirm' | 'bio'

export default function LockSetup({ userName, displayName, onDone, onSkip }: Props) {
  const [step, setStep] = useState<Step>('intro')
  const [first, setFirst] = useState('')
  const [error, setError] = useState('')
  const [bioOk, setBioOk] = useState<boolean | null>(null)
  const [bioError, setBioError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pinHash, setPinHash] = useState<{ hash: string; salt: string } | null>(null)

  useEffect(() => {
    void biometricAvailable().then(setBioOk)
  }, [])

  async function confirmPin(pin: string) {
    if (pin !== first) {
      setError('Los PIN no coinciden. Empieza de nuevo.')
      setFirst('')
      setStep('pin')
      return
    }
    const salt = newSalt()
    const hash = await hashPin(pin, salt)
    setPinHash({ hash, salt })
    if (bioOk) setStep('bio')
    else finish(null, { hash, salt })
  }

  function finish(credentialId: string | null, ph = pinHash) {
    if (!ph) return
    const config: LockConfig = { enabled: true, credentialId, pinHash: ph.hash, salt: ph.salt }
    saveLock(config)
    onDone(config)
  }

  async function activateBio() {
    setBusy(true)
    setBioError('')
    try {
      const id = await registerBiometric(userName, displayName)
      finish(id)
    } catch {
      setBioError('No se activó Face ID. Puedes intentarlo otra vez o seguir solo con el PIN.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col px-6 lock-in" style={{ background: '#050505', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 40px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }} role="dialog" aria-modal="true" aria-label="Proteger la app">
      {step === 'intro' && (
        <div className="flex-1 flex flex-col fade-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 metal-card" style={{ color: '#F4F4F5' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="5" y="10.5" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </div>
          <p className="text-[11px] mb-2" style={{ color: '#8C8C93', letterSpacing: '0.18em' }}>SEGURIDAD</p>
          <p className="text-3xl font-light leading-tight" style={{ color: '#FFFFFF' }}>Protege tu app<br />con Face ID</p>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: '#A8A8AF' }}>
            Cada vez que entres a MoneyOS te pediremos Face ID. También crearás un PIN de 4 dígitos por si Face ID no funciona.
          </p>
          {bioOk === false && (
            <p className="text-xs mt-4" style={{ color: '#8C8C93' }}>Este dispositivo no tiene Face ID disponible en el navegador; la app se protegerá solo con el PIN.</p>
          )}
          <div className="mt-auto">
            <button onClick={() => setStep('pin')} className="w-full rounded-2xl py-4 text-base font-semibold btn-press" style={{ background: '#F4F4F5', color: '#050505' }}>
              Activar protección
            </button>
            <button onClick={onSkip} className="w-full py-3 mt-1 text-sm" style={{ color: '#8C8C93' }}>Ahora no</button>
          </div>
        </div>
      )}

      {step === 'pin' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-up">
          <PinPad title="Crea un PIN de 4 dígitos" subtitle="Lo usarás si Face ID no funciona" error={error} onComplete={pin => { setFirst(pin); setError(''); setStep('confirm') }} />
        </div>
      )}

      {step === 'confirm' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-up">
          <PinPad title="Confirma tu PIN" subtitle="Escríbelo otra vez" onComplete={confirmPin} />
        </div>
      )}

      {step === 'bio' && (
        <div className="flex-1 flex flex-col fade-up">
          <p className="text-[11px] mb-2" style={{ color: '#8C8C93', letterSpacing: '0.18em' }}>ÚLTIMO PASO</p>
          <p className="text-3xl font-light leading-tight" style={{ color: '#FFFFFF' }}>Activa Face ID</p>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: '#A8A8AF' }}>
            Tu iPhone te pedirá Face ID y guardará una llave de acceso para MoneyOS. Esa llave solo sirve para desbloquear la app.
          </p>
          {bioError && <p className="text-xs mt-4" style={{ color: '#E0706B' }}>{bioError}</p>}
          <div className="mt-auto">
            <button onClick={activateBio} disabled={busy} className="w-full rounded-2xl py-4 text-base font-semibold btn-press" style={{ background: '#F4F4F5', color: '#050505', opacity: busy ? 0.6 : 1 }}>
              {busy ? 'Esperando Face ID…' : 'Activar Face ID'}
            </button>
            <button onClick={() => finish(null)} className="w-full py-3 mt-1 text-sm" style={{ color: '#8C8C93' }}>Usar solo el PIN</button>
          </div>
        </div>
      )}
    </div>
  )
}

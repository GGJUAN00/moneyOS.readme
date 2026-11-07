import { useState } from 'react'
import { colombiaDateOf } from '../lib/format'
import { documentTypes, formatPhone, initialsOf, type UserProfile } from '../lib/user'

interface Props {
  user: UserProfile
  soundOn: boolean
  onToggleSound: (on: boolean) => void
  lockOn: boolean
  lockHasFaceId: boolean
  onEnableLock: () => void
  onDisableLock: () => void
  onClose: () => void
  onDelete: () => void
}

function formatDate(iso: string): string {
  if (iso.length !== 10) return colombiaDateOf(iso) // a real timestamp
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProfileSheet({ user, soundOn, onToggleSound, lockOn, lockHasFaceId, onEnableLock, onDisableLock, onClose, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [confirmUnlock, setConfirmUnlock] = useState(false)
  const docLabel = documentTypes.find(d => d.value === user.documentType)?.label ?? user.documentType

  const rows: [string, string][] = [
    ['Documento', `${docLabel} · ${/^\d+$/.test(user.documentNumber) ? Number(user.documentNumber).toLocaleString('es-CO') : user.documentNumber}`],
    ['Fecha de nacimiento', formatDate(user.birthDate)],
    ['Celular', formatPhone(user.phone)],
    ['Correo', user.email],
    ['Ciudad', user.city],
    ['Ocupación', user.occupation],
    ['Registrado el', formatDate(user.registeredAt)],
  ]

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Mi perfil">
      <button aria-label="Cerrar" className="absolute inset-0 backdrop-in" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }} onClick={onClose} />
      <div
        className="relative rounded-t-3xl px-5 pt-3 sheet-in max-h-[90%] overflow-y-auto scrollbar-hide"
        style={{
          background: '#0C0C0D',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        }}
      >
        <div className="mx-auto w-10 h-1 rounded-full mb-5" style={{ background: '#3C3C41' }} />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F4F4F5 0%, #8C8C93 100%)', color: '#050505' }}
          >
            {initialsOf(user)}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold truncate" style={{ color: '#F4F4F5' }}>{user.firstName} {user.lastName}</p>
            <p className="text-xs" style={{ color: '#8C8C93' }}>Mi perfil</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#111112', border: '1px solid rgba(255,255,255,0.06)' }}>
          {rows.map(([label, value], i) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 px-4 py-3"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <p className="text-xs flex-shrink-0" style={{ color: '#8C8C93' }}>{label}</p>
              <p className="text-sm text-right truncate" style={{ color: '#F4F4F5' }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl mb-3 overflow-hidden" style={{ background: '#111112', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            role="switch"
            aria-checked={lockOn}
            onClick={() => (lockOn ? setConfirmUnlock(true) : onEnableLock())}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="text-left">
              <span className="block text-sm" style={{ color: '#F4F4F5' }}>Bloqueo con Face ID</span>
              <span className="block text-[11px]" style={{ color: '#8C8C93' }}>
                {lockOn ? (lockHasFaceId ? 'Face ID y PIN cada vez que entras' : 'PIN cada vez que entras') : 'Desactivado'}
              </span>
            </span>
            <span className="relative flex-shrink-0 rounded-full transition-colors duration-200" style={{ width: 46, height: 28, background: lockOn ? '#F4F4F5' : '#3C3C41' }}>
              <span className="absolute top-[3px] rounded-full transition-all duration-200" style={{ width: 22, height: 22, left: lockOn ? 21 : 3, background: lockOn ? '#050505' : '#8C8C93' }} />
            </span>
          </button>
          {confirmUnlock && (
            <div className="flex gap-2 px-4 pb-3">
              <button onClick={() => setConfirmUnlock(false)} className="flex-1 rounded-xl py-2.5 text-xs" style={{ background: '#1A1A1C', color: '#F4F4F5' }}>Mantener</button>
              <button onClick={() => { setConfirmUnlock(false); onDisableLock() }} className="flex-1 rounded-xl py-2.5 text-xs font-semibold" style={{ background: '#E0706B', color: '#050505' }}>Desactivar</button>
            </div>
          )}
        </div>

        <button
          role="switch"
          aria-checked={soundOn}
          onClick={() => onToggleSound(!soundOn)}
          className="w-full flex items-center justify-between rounded-2xl px-4 py-3 mb-4"
          style={{ background: '#111112', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-left">
            <span className="block text-sm" style={{ color: '#F4F4F5' }}>Sonidos</span>
            <span className="block text-[11px]" style={{ color: '#8C8C93' }}>Al agregar dinero o registrar una transacción</span>
          </span>
          <span
            className="relative flex-shrink-0 rounded-full transition-colors duration-200"
            style={{ width: 46, height: 28, background: soundOn ? '#F4F4F5' : '#3C3C41' }}
          >
            <span
              className="absolute top-[3px] rounded-full transition-all duration-200"
              style={{ width: 22, height: 22, left: soundOn ? 21 : 3, background: soundOn ? '#050505' : '#8C8C93' }}
            />
          </span>
        </button>

        <p className="text-[11px] text-center mb-4" style={{ color: '#5E5E65' }}>
          Estos datos están guardados solo en este dispositivo
        </p>

        {confirming ? (
          <div className="rounded-2xl p-4 mb-2" style={{ background: 'rgba(224,112,107,0.08)', border: '1px solid rgba(224,112,107,0.3)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#F4F4F5' }}>¿Eliminar tu registro?</p>
            <p className="text-xs mb-4" style={{ color: '#A8A8AF' }}>
              Se borrarán tus datos y todos tus movimientos de este dispositivo, y tendrás que registrarte de nuevo.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl py-3 text-sm font-medium"
                style={{ background: '#1A1A1C', color: '#F4F4F5' }}
              >
                Cancelar
              </button>
              <button
                onClick={onDelete}
                className="flex-1 rounded-xl py-3 text-sm font-semibold"
                style={{ background: '#E0706B', color: '#050505' }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-3 text-sm font-semibold"
              style={{ background: '#F4F4F5', color: '#050505' }}
            >
              Listo
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 rounded-xl py-3 text-sm font-medium"
              style={{ background: 'transparent', color: '#E0706B', border: '1px solid rgba(224,112,107,0.3)' }}
            >
              Eliminar registro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

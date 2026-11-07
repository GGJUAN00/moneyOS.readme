import { useState } from 'react'
import { documentTypes, formatPhone, initialsOf, type UserProfile } from '../lib/user'

interface Props {
  user: UserProfile
  onClose: () => void
  onDelete: () => void
}

function formatDate(iso: string): string {
  const date = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso)
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProfileSheet({ user, onClose, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)
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
      <button aria-label="Cerrar" className="absolute inset-0" style={{ background: 'rgba(2,4,10,0.7)' }} onClick={onClose} />
      <div
        className="relative rounded-t-3xl px-5 pt-3 fade-up max-h-[90%] overflow-y-auto scrollbar-hide"
        style={{
          background: '#0B101A',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        }}
      >
        <div className="mx-auto w-10 h-1 rounded-full mb-5" style={{ background: '#2A3550' }} />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00E87A 0%, #00A855 100%)', color: '#06090F' }}
          >
            {initialsOf(user)}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold truncate" style={{ color: '#E8EDFF' }}>{user.firstName} {user.lastName}</p>
            <p className="text-xs" style={{ color: '#5A6A8A' }}>Mi perfil</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)' }}>
          {rows.map(([label, value], i) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 px-4 py-3"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <p className="text-xs flex-shrink-0" style={{ color: '#5A6A8A' }}>{label}</p>
              <p className="text-sm text-right truncate" style={{ color: '#E8EDFF' }}>{value}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-center mb-4" style={{ color: '#3A4A6A' }}>
          🔒 Estos datos están guardados solo en este dispositivo
        </p>

        {confirming ? (
          <div className="rounded-2xl p-4 mb-2" style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.3)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#E8EDFF' }}>¿Eliminar tu registro?</p>
            <p className="text-xs mb-4" style={{ color: '#8B9CC4' }}>
              Se borrarán tus datos y todos tus movimientos de este dispositivo, y tendrás que registrarte de nuevo.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl py-3 text-sm font-medium"
                style={{ background: '#141B2D', color: '#E8EDFF' }}
              >
                Cancelar
              </button>
              <button
                onClick={onDelete}
                className="flex-1 rounded-xl py-3 text-sm font-semibold"
                style={{ background: '#FF4757', color: '#06090F' }}
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
              style={{ background: '#00E87A', color: '#06090F' }}
            >
              Listo
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 rounded-xl py-3 text-sm font-medium"
              style={{ background: 'transparent', color: '#FF4757', border: '1px solid rgba(255,71,87,0.3)' }}
            >
              Eliminar registro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

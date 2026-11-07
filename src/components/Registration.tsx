import { useState, type ReactNode } from 'react'
import {
  colombianCities,
  documentTypes,
  occupations,
  saveUser,
  validateProfile,
  type ProfileErrors,
  type UserProfile,
} from '../lib/user'

interface Props {
  onComplete: (user: UserProfile) => void
}

type Draft = Omit<UserProfile, 'registeredAt'>

const emptyDraft: Draft = {
  firstName: '',
  lastName: '',
  documentType: 'CC',
  documentNumber: '',
  birthDate: '',
  phone: '',
  email: '',
  city: '',
  occupation: '',
  acceptedDataPolicy: false,
}

const fieldStyle = (hasError: boolean): React.CSSProperties => ({
  background: '#0E1420',
  color: '#E8EDFF',
  border: `1px solid ${hasError ? 'rgba(255,71,87,0.6)' : 'rgba(255,255,255,0.08)'}`,
  caretColor: '#00E87A',
  colorScheme: 'dark',
})

// 16px text keeps iOS Safari from zooming in when a field gets focus.
const fieldClass = 'w-full rounded-xl px-4 py-3 text-base outline-none transition-colors focus:border-[#00E87A]'

function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5" style={{ color: '#8B9CC4' }}>{label}</span>
      {children}
      {error ? (
        <span className="block text-xs mt-1" style={{ color: '#FF4757' }}>{error}</span>
      ) : hint ? (
        <span className="block text-[11px] mt-1" style={{ color: '#3A4A6A' }}>{hint}</span>
      ) : null}
    </label>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{ background: 'rgba(14,20,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-xs font-semibold" style={{ color: 'rgba(0,232,122,0.8)', letterSpacing: '0.08em' }}>
        {title.toUpperCase()}
      </p>
      {children}
    </div>
  )
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="h-full flex flex-col px-6 pb-8 pt-10 fade-up">
      <div className="flex-1 flex flex-col justify-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 accent-glow"
          style={{ background: 'linear-gradient(135deg, #0E2A1A 0%, #06090F 100%)', border: '1px solid rgba(0,232,122,0.3)' }}
        >
          <svg width="30" height="30" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="13" width="4" height="7" rx="1" fill="#00E87A" opacity="0.55" />
            <rect x="9" y="8" width="4" height="12" rx="1" fill="#00E87A" opacity="0.8" />
            <rect x="15" y="3" width="4" height="17" rx="1" fill="#00E87A" />
          </svg>
        </div>
        <p className="text-3xl font-bold leading-tight" style={{ color: '#E8EDFF' }}>
          Te damos la bienvenida a<br />
          <span style={{ color: '#00E87A' }}>MoneyOS</span>
        </p>
        <p className="text-base mt-4 leading-relaxed" style={{ color: '#8B9CC4' }}>
          Controla tus ingresos, gastos y metas de ahorro en pesos colombianos, todo desde tu celular.
        </p>

        <div className="mt-8 space-y-3">
          {[
            ['📊', 'Mira en qué se va tu plata cada mes'],
            ['🎯', 'Ponte metas y sigue tu presupuesto'],
            ['🔒', 'Tus datos se guardan solo en este dispositivo'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: '#141B2D' }}>
                {icon}
              </div>
              <p className="text-sm" style={{ color: '#A8B8D8' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full rounded-2xl py-4 text-base font-semibold transition-opacity active:opacity-80"
        style={{ background: '#00E87A', color: '#06090F' }}
      >
        Crear mi cuenta
      </button>
      <p className="text-center text-xs mt-3" style={{ color: '#3A4A6A' }}>
        Solo te lo pediremos esta vez
      </p>
    </div>
  )
}

export default function Registration({ onComplete }: Props) {
  const [step, setStep] = useState<'welcome' | 'form'>('welcome')
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    const next = { ...draft, [key]: value }
    setDraft(next)
    if (submitted) setErrors(validateProfile(next))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const found = validateProfile(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0]
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    const user: UserProfile = {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      documentNumber: draft.documentNumber.trim(),
      phone: draft.phone.replace(/\D/g, ''),
      email: draft.email.trim().toLowerCase(),
      city: draft.city.trim(),
      registeredAt: new Date().toISOString(),
    }
    if (!saveUser(user)) {
      setSaveFailed(true)
      return
    }
    onComplete(user)
  }

  if (step === 'welcome') return <Welcome onStart={() => setStep('form')} />

  const today = new Date().toISOString().slice(0, 10)
  const errorCount = Object.keys(errors).length

  return (
    <form onSubmit={submit} noValidate className="h-full overflow-y-auto scrollbar-hide fade-up">
      <div className="px-6 pt-4 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep('welcome')}
          aria-label="Volver"
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)', color: '#8B9CC4' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <p className="text-xl font-bold" style={{ color: '#E8EDFF' }}>Crea tu cuenta</p>
          <p className="text-xs mt-0.5" style={{ color: '#5A6A8A' }}>Todos los campos son obligatorios</p>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-6">
        <Section title="Datos personales">
          <Field label="Nombres" error={errors.firstName}>
            <input
              name="firstName"
              className={fieldClass}
              style={fieldStyle(!!errors.firstName)}
              value={draft.firstName}
              onChange={e => update('firstName', e.target.value)}
              autoComplete="given-name"
              autoCapitalize="words"
              placeholder="Ej. Juan Camilo"
            />
          </Field>
          <Field label="Apellidos" error={errors.lastName}>
            <input
              name="lastName"
              className={fieldClass}
              style={fieldStyle(!!errors.lastName)}
              value={draft.lastName}
              onChange={e => update('lastName', e.target.value)}
              autoComplete="family-name"
              autoCapitalize="words"
              placeholder="Ej. Rodríguez Pérez"
            />
          </Field>
          <Field label="Tipo de documento" error={errors.documentType}>
            <select
              name="documentType"
              className={fieldClass}
              style={fieldStyle(!!errors.documentType)}
              value={draft.documentType}
              onChange={e => update('documentType', e.target.value)}
            >
              {documentTypes.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Número de documento" error={errors.documentNumber} hint="Sin puntos ni espacios">
            <input
              name="documentNumber"
              className={`${fieldClass} font-mono-data`}
              style={fieldStyle(!!errors.documentNumber)}
              value={draft.documentNumber}
              onChange={e => update('documentNumber', draft.documentType === 'PAS' ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ''))}
              inputMode={draft.documentType === 'PAS' ? 'text' : 'numeric'}
              maxLength={15}
              placeholder="Ej. 1020304050"
            />
          </Field>
          <Field label="Fecha de nacimiento" error={errors.birthDate}>
            <input
              name="birthDate"
              type="date"
              className={fieldClass}
              style={{ ...fieldStyle(!!errors.birthDate), minHeight: 50 }}
              value={draft.birthDate}
              max={today}
              onChange={e => update('birthDate', e.target.value)}
              autoComplete="bday"
            />
          </Field>
        </Section>

        <Section title="Contacto">
          <Field label="Celular" error={errors.phone}>
            <div className="flex gap-2">
              <span
                className="rounded-xl px-3 flex items-center text-base font-mono-data flex-shrink-0"
                style={{ background: '#141B2D', color: '#8B9CC4', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                🇨🇴 +57
              </span>
              <input
                name="phone"
                type="tel"
                className={`${fieldClass} font-mono-data`}
                style={fieldStyle(!!errors.phone)}
                value={draft.phone}
                onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="300 123 4567"
              />
            </div>
          </Field>
          <Field label="Correo electrónico" error={errors.email}>
            <input
              name="email"
              type="email"
              className={fieldClass}
              style={fieldStyle(!!errors.email)}
              value={draft.email}
              onChange={e => update('email', e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              placeholder="tucorreo@ejemplo.com"
            />
          </Field>
          <Field label="Ciudad" error={errors.city}>
            <input
              name="city"
              className={fieldClass}
              style={fieldStyle(!!errors.city)}
              value={draft.city}
              onChange={e => update('city', e.target.value)}
              list="moneyos-cities"
              autoComplete="address-level2"
              autoCapitalize="words"
              placeholder="Ej. Bogotá"
            />
            <datalist id="moneyos-cities">
              {colombianCities.map(c => <option key={c} value={c} />)}
            </datalist>
          </Field>
          <Field label="Ocupación" error={errors.occupation}>
            <select
              name="occupation"
              className={fieldClass}
              style={{ ...fieldStyle(!!errors.occupation), color: draft.occupation ? '#E8EDFF' : '#5A6A8A' }}
              value={draft.occupation}
              onChange={e => update('occupation', e.target.value)}
            >
              <option value="" disabled>Selecciona una opción</option>
              {occupations.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </Section>

        <label
          className="flex items-start gap-3 rounded-2xl p-4 cursor-pointer"
          style={{
            background: 'rgba(14,20,32,0.6)',
            border: `1px solid ${errors.acceptedDataPolicy ? 'rgba(255,71,87,0.6)' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          <input
            name="acceptedDataPolicy"
            type="checkbox"
            checked={draft.acceptedDataPolicy}
            onChange={e => update('acceptedDataPolicy', e.target.checked)}
            className="mt-0.5 w-5 h-5 flex-shrink-0"
            style={{ accentColor: '#00E87A' }}
          />
          <span className="text-xs leading-relaxed" style={{ color: '#8B9CC4' }}>
            Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.
            Mis datos se guardan únicamente en este dispositivo y no se envían a ningún servidor.
            {errors.acceptedDataPolicy && (
              <span className="block mt-1" style={{ color: '#FF4757' }}>{errors.acceptedDataPolicy}</span>
            )}
          </span>
        </label>

        {submitted && errorCount > 0 && (
          <p className="text-sm text-center" style={{ color: '#FF4757' }}>
            Revisa {errorCount === 1 ? 'el campo marcado' : `los ${errorCount} campos marcados`} en rojo
          </p>
        )}
        {saveFailed && (
          <p className="text-sm text-center" style={{ color: '#FF4757' }}>
            No se pudo guardar en este dispositivo. Si estás en navegación privada, ábrela en una ventana normal.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl py-4 text-base font-semibold transition-opacity active:opacity-80"
          style={{ background: '#00E87A', color: '#06090F' }}
        >
          Registrarme
        </button>
      </div>
    </form>
  )
}

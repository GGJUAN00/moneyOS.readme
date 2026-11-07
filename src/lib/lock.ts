// App lock: Face ID (via a WebAuthn passkey on this device) with a PIN as backup.
//
// This is a privacy lock for the screen: the passkey makes iOS ask for Face ID before the app
// opens. It does not encrypt the data stored on the phone.

export interface LockConfig {
  enabled: boolean
  credentialId: string | null // base64url; null = PIN only
  pinHash: string
  salt: string
}

const KEY = 'moneyos:lock'

export function loadLock(): LockConfig | null {
  try {
    const raw = localStorage.getItem(KEY)
    const c = raw ? (JSON.parse(raw) as LockConfig) : null
    return c && c.enabled && c.pinHash ? c : null
  } catch {
    return null
  }
}

export function saveLock(c: LockConfig): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
    return true
  } catch {
    return false
  }
}

export function clearLock() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

// ---- encoding helpers ----

function toB64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  bytes.forEach(b => (s += String.fromCharCode(b)))
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

const random = (n: number) => crypto.getRandomValues(new Uint8Array(n))

// ---- PIN ----

export function newSalt(): string {
  return toB64url(random(16))
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}:moneyos`)
  return toB64url(await crypto.subtle.digest('SHA-256', data))
}

export async function checkPin(pin: string, c: LockConfig): Promise<boolean> {
  return (await hashPin(pin, c.salt)) === c.pinHash
}

// ---- Face ID (platform authenticator) ----

// While iOS shows its Face ID sheet the page can briefly look hidden; the app checks this
// flag so that unlocking doesn't immediately re-lock it.
let busy = false
let busyUntil = 0
export function authInProgress(): boolean {
  return busy || Date.now() < busyUntil
}
async function guarded<T>(fn: () => Promise<T>): Promise<T> {
  busy = true
  try {
    return await fn()
  } finally {
    busy = false
    busyUntil = Date.now() + 1500
  }
}

export async function biometricAvailable(): Promise<boolean> {
  try {
    return !!window.PublicKeyCredential &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
  } catch {
    return false
  }
}

/** Creates a passkey on this device; iOS asks for Face ID to save it. Returns its id. */
export async function registerBiometric(userName: string, displayName: string): Promise<string> {
  const cred = (await guarded(() => navigator.credentials.create({
    publicKey: {
      challenge: random(32),
      rp: { name: 'MoneyOS' },
      user: { id: random(16), name: userName || 'MoneyOS', displayName: displayName || 'MoneyOS' },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
      attestation: 'none',
      timeout: 60_000,
    },
  }))) as PublicKeyCredential | null
  if (!cred) throw new Error('No se creó la llave')
  return toB64url(cred.rawId)
}

/** Asks for Face ID. Resolves true only when the OS confirms the user was verified. */
export async function verifyBiometric(credentialId: string): Promise<boolean> {
  const cred = (await guarded(() => navigator.credentials.get({
    publicKey: {
      challenge: random(32),
      allowCredentials: [{ type: 'public-key', id: fromB64url(credentialId), transports: ['internal'] }],
      userVerification: 'required',
      timeout: 60_000,
    },
  }))) as PublicKeyCredential | null
  if (!cred) return false
  const res = cred.response as AuthenticatorAssertionResponse
  const flags = new Uint8Array(res.authenticatorData)[32]
  const userPresent = (flags & 0x01) !== 0
  const userVerified = (flags & 0x04) !== 0
  return userPresent && userVerified
}

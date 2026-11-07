// Soft, bell-like interface sounds synthesized with the Web Audio API (no audio files).
// Browsers only allow audio after a user gesture, so these are always called from a tap.

type Ctx = AudioContext

let ctx: Ctx | null = null
let master: GainNode | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function audio(): { ctx: Ctx; out: GainNode } | null {
  if (!enabled) return null
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = 0.22

      // Gentle "room": a short filtered echo that gives the chime some air
      const delay = ctx.createDelay(1)
      delay.delayTime.value = 0.14
      const feedback = ctx.createGain()
      feedback.gain.value = 0.22
      const tone = ctx.createBiquadFilter()
      tone.type = 'lowpass'
      tone.frequency.value = 2600
      const wet = ctx.createGain()
      wet.gain.value = 0.35

      master.connect(ctx.destination)
      master.connect(delay)
      delay.connect(tone)
      tone.connect(feedback)
      feedback.connect(delay)
      tone.connect(wet)
      wet.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return { ctx, out: master! }
  } catch {
    return null
  }
}

/** One bell-like note: a sine fundamental with two soft overtones and a smooth decay. */
function bell(freq: number, start: number, duration: number, volume: number) {
  const a = audio()
  if (!a) return
  const { ctx, out } = a
  const t0 = ctx.currentTime + start
  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, t0)
  env.gain.exponentialRampToValueAtTime(volume, t0 + 0.008)
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  env.connect(out)

  const partials: [number, number][] = [[1, 1], [2, 0.18], [3.01, 0.05]]
  for (const [ratio, gain] of partials) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * ratio, t0)
    const g = ctx.createGain()
    g.gain.value = gain
    osc.connect(g)
    g.connect(env)
    osc.start(t0)
    osc.stop(t0 + duration + 0.05)
  }
}

/** Very short, quiet tick — opening the entry form. */
export function playTap() {
  bell(1760, 0, 0.09, 0.18)
}

/** Money in: two rising notes (E6 → B6), bright and light. */
export function playIncome() {
  bell(1318.5, 0, 0.9, 0.55)
  bell(1975.5, 0.085, 1.1, 0.45)
}

/** Money out: a warm, falling pair (G5 → D5), calm rather than alarming. */
export function playExpense() {
  bell(783.99, 0, 0.7, 0.5)
  bell(587.33, 0.09, 0.9, 0.42)
}

/** Movement deleted: a single low, soft note. */
export function playDelete() {
  bell(392, 0, 0.5, 0.35)
}

import { useEffect, useRef, useState } from 'react'

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Smoothly counts from the previous value to `target` (ease-out), e.g. for balances. */
export function useAnimatedNumber(target: number, durationMs = 700, fromZero = false): number {
  const [value, setValue] = useState(fromZero ? 0 : target)
  const fromRef = useRef(fromZero ? 0 : target)
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    if (reduceMotion()) {
      setValue(target)
      return
    }
    const from = valueRef.current
    fromRef.current = from
    if (from === target) return
    const start = performance.now()
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}

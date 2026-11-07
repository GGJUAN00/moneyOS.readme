import { useEffect, useState } from 'react'

/** Current timestamp, refreshed every `intervalMs` (aligned to the second). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      setNow(Date.now())
      timer = setTimeout(tick, intervalMs - (Date.now() % intervalMs))
    }
    timer = setTimeout(tick, intervalMs - (Date.now() % intervalMs))
    return () => clearTimeout(timer)
  }, [intervalMs])
  return now
}

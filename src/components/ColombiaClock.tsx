import { useNow } from '../hooks/useNow'
import { capitalize, colombiaLongDate, colombiaTime } from '../lib/format'

/** Live date and time in Colombia, e.g. "Sábado, 7 de noviembre de 2026 · 3:42:15 p. m." */
export default function ColombiaClock({ compact = false }: { compact?: boolean }) {
  const now = useNow(1000)
  if (compact) return <>{colombiaTime(now, false)}</>
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono-data" style={{ color: '#8C8C93' }}>
      <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: '#F4F4F5' }} />
      <span>
        {capitalize(colombiaLongDate(now))} · <span style={{ color: '#C9C9CE' }}>{colombiaTime(now)}</span>
      </span>
      <span className="sr-only">hora de Colombia</span>
    </div>
  )
}

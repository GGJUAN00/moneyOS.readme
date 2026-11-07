import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Charts from './components/Charts'
import Transactions from './components/Transactions'
import AIChat from './components/AIChat'
import Registration from './components/Registration'
import ProfileSheet from './components/ProfileSheet'
import { clearUser, loadUser, type UserProfile } from './lib/user'

type Tab = 'home' | 'charts' | 'transactions' | 'ai'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M3 9.5L11 2.5L19 9.5V19.5C19 19.7652 18.8946 20.0196 18.7071 20.2071C18.5196 20.3946 18.2652 20.5 18 20.5H14V14.5H8V20.5H4C3.73478 20.5 3.48043 20.3946 3.29289 20.2071C3.10536 20.0196 3 19.7652 3 19.5V9.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  )
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="13" width="4" height="7" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
      <rect x="9" y="8" width="4" height="12" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
      <rect x="15" y="3" width="4" height="17" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M8 6H19M8 11H19M8 16H19" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4" cy="11" r="1.5" fill="currentColor" />
      <circle cx="4" cy="16" r="1.5" fill="currentColor" />
    </svg>
  )
}

function AIIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 2C7.13 2 4 5.13 4 9c0 2.38 1.19 4.47 3 5.74V17l2.5-1.5c.47.09.96.14 1.5.14 3.87 0 7-3.13 7-7s-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.15}
      />
      <path d="M8.5 9.5h1M12.5 9.5h1" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

const tabs: { key: Tab; label: string; Icon: React.ComponentType<{ active: boolean }> }[] = [
  { key: 'home', label: 'Inicio', Icon: HomeIcon },
  { key: 'charts', label: 'Gráficas', Icon: ChartIcon },
  { key: 'transactions', label: 'Movimientos', Icon: ListIcon },
  { key: 'ai', label: 'Asistente', Icon: AIIcon },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [user, setUser] = useState<UserProfile | null>(() => loadUser())
  const [profileOpen, setProfileOpen] = useState(false)

  function handleDeleteUser() {
    clearUser()
    setProfileOpen(false)
    setTab('home')
    setUser(null)
  }

  return (
    <div
      className="app-stage w-full flex items-center justify-center"
      style={{ background: '#02040A' }}
    >
      {/* Phone shell: framed mockup on desktop, full-screen app on a real phone (see index.css) */}
      <div className="phone-shell relative flex flex-col overflow-hidden">
        {/* Mock status bar — only shown in the desktop mockup; a real phone shows its own */}
        <div className="mock-chrome flex items-center justify-between px-7 pt-3 pb-1 flex-shrink-0">
          <span className="text-xs font-semibold font-mono-data" style={{ color: '#E8EDFF' }}>9:41</span>
          <div className="flex items-center gap-1.5">
            {/* Signal */}
            <div className="flex items-end gap-0.5">
              {[3, 5, 7, 9].map((h, i) => (
                <div key={i} className="w-1 rounded-sm" style={{ height: h, background: i < 3 ? '#E8EDFF' : '#2A3550' }} />
              ))}
            </div>
            {/* Wifi */}
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
              <path d="M7.5 10.5h.01M4.5 7.5c.83-.83 1.97-1.34 3.22-1.34s2.39.51 3.22 1.34" stroke="#E8EDFF" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M1.5 4.5C3.17 2.83 5.22 2 7.5 2s4.33.83 6 2.5" stroke="#E8EDFF" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {/* Battery */}
            <div className="flex items-center gap-0.5">
              <div className="relative rounded-sm overflow-hidden" style={{ width: 22, height: 11, border: '1.5px solid #E8EDFF' }}>
                <div className="absolute left-0 top-0 h-full rounded-sm" style={{ width: '72%', background: '#E8EDFF' }} />
              </div>
              <div className="rounded-sm" style={{ width: 2, height: 5, background: '#E8EDFF', opacity: 0.6 }} />
            </div>
          </div>
        </div>

        {/* Notch */}
        <div
          className="mock-chrome absolute left-1/2 -translate-x-1/2 rounded-b-2xl"
          style={{ top: 0, width: 120, height: 34, background: '#06090F', zIndex: 10 }}
        />

        {/* First launch on this device: registration instead of the app */}
        {!user && (
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <Registration onComplete={setUser} />
          </div>
        )}

        {/* Content area */}
        {user && (
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          {tab === 'home' && (
            <Dashboard user={user} onNavigate={(t) => setTab(t)} onOpenProfile={() => setProfileOpen(true)} />
          )}
          {tab === 'charts' && <Charts />}
          {tab === 'transactions' && <Transactions />}
          {tab === 'ai' && <AIChat user={user} />}
        </div>
        )}

        {user && profileOpen && (
          <ProfileSheet user={user} onClose={() => setProfileOpen(false)} onDelete={handleDeleteUser} />
        )}

        {/* Bottom navigation */}
        {user && (
        <div
          className="flex items-stretch flex-shrink-0"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#06090F',
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          }}
        >
          {tabs.map(({ key, label, Icon }) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200"
                style={{ color: active ? '#00E87A' : '#3A4A6A' }}
              >
                <div className="relative">
                  <Icon active={active} />
                  {active && (
                    <div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: '#00E87A' }}
                    />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? '#00E87A' : '#3A4A6A' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
        )}
      </div>
    </div>
  )
}

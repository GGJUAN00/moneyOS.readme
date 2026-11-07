import { useState, useRef, useEffect } from 'react'
import { answer, suggestedQuestions, welcomeText } from '../lib/assistant'
import type { Settings, Transaction } from '../lib/finance'
import { firstNameOf, type UserProfile } from '../lib/user'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
  time: string
}

function now(): string {
  return new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#E8EDFF', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

interface Props {
  user: UserProfile
  transactions: Transaction[]
  settings: Settings
}

export default function AIChat({ user, transactions, settings }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, role: 'ai', text: welcomeText(firstNameOf(user), transactions, settings), time: now() },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestionsVisible, setSuggestionsVisible] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function sendMessage(text: string) {
    if (!text.trim() || isTyping) return

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: text.trim(),
      time: now(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setSuggestionsVisible(false)

    const delay = 700 + Math.random() * 500
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        text: answer(text, transactions, settings),
        time: now(),
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, delay)
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#06090F' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#06090F' }}
      >
        <div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0E2A1A, #141B2D)', border: '1px solid rgba(0,232,122,0.3)' }}
        >
          ✦
          <span
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: '#00E87A', borderColor: '#06090F' }}
          />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#E8EDFF' }}>Asistente MoneyOS</p>
          <p className="text-xs" style={{ color: '#00E87A' }}>En línea · analizando tus datos</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#141B2D', color: '#5A6A8A' }}>
            Beta
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-up`}
          >
            {msg.role === 'ai' && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5"
                style={{ background: '#141B2D', border: '1px solid rgba(0,232,122,0.2)', color: '#00E87A' }}
              >
                ✦
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={msg.role === 'user'
                  ? {
                      background: '#141B2D',
                      color: '#E8EDFF',
                      borderBottomRightRadius: 6,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
                  : {
                      background: '#0E1420',
                      color: '#A8B8D8',
                      borderBottomLeftRadius: 6,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }
                }
              >
                {msg.role === 'ai' ? parseBold(msg.text) : msg.text}
              </div>
              <p className="text-[10px] mt-1 px-1" style={{ color: '#3A4A6A' }}>{msg.time}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 fade-up">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: '#141B2D', border: '1px solid rgba(0,232,122,0.2)', color: '#00E87A' }}
            >
              ✦
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
              style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.06)', borderBottomLeftRadius: 6 }}
            >
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#5A6A8A' }} />
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#5A6A8A' }} />
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#5A6A8A' }} />
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {suggestionsVisible && (
          <div className="fade-up">
            <p className="text-xs mb-2 ml-9" style={{ color: '#3A4A6A' }}>Sugerencias</p>
            <div className="flex flex-wrap gap-2 ml-9">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-2 rounded-xl text-left transition-all duration-150 hover:border-accent/30"
                  style={{
                    background: '#0E1420',
                    color: '#8B9CC4',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#06090F' }}
      >
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
          style={{ background: '#0E1420', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* 16px font prevents iOS Safari from zooming into the field on focus */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Pregunta sobre tus finanzas…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-sm"
            style={{
              color: '#E8EDFF',
              caretColor: '#00E87A',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0"
            style={{
              background: input.trim() && !isTyping ? '#00E87A' : '#1C2540',
              color: input.trim() && !isTyping ? '#06090F' : '#3A4A6A',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: '#2A3550' }}>
          Las respuestas son solo orientativas, no son asesoría financiera
        </p>
      </div>
    </div>
  )
}

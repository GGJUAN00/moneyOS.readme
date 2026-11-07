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
      return <strong key={i} style={{ color: '#F4F4F5', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
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
    <div className="h-full flex flex-col" style={{ background: '#050505' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#050505' }}
      >
        <div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1F1F22, #1A1A1C)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          ✦
          <span
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: '#F4F4F5', borderColor: '#050505' }}
          />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#F4F4F5' }}>Asistente MoneyOS</p>
          <p className="text-xs" style={{ color: '#F4F4F5' }}>En línea · analizando tus datos</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#1A1A1C', color: '#8C8C93' }}>
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
                style={{ background: '#1A1A1C', border: '1px solid rgba(255,255,255,0.2)', color: '#F4F4F5' }}
              >
                ✦
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={msg.role === 'user'
                  ? {
                      background: '#1A1A1C',
                      color: '#F4F4F5',
                      borderBottomRightRadius: 6,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
                  : {
                      background: '#111112',
                      color: '#C9C9CE',
                      borderBottomLeftRadius: 6,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }
                }
              >
                {msg.role === 'ai' ? parseBold(msg.text) : msg.text}
              </div>
              <p className="text-[10px] mt-1 px-1" style={{ color: '#5E5E65' }}>{msg.time}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 fade-up">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: '#1A1A1C', border: '1px solid rgba(255,255,255,0.2)', color: '#F4F4F5' }}
            >
              ✦
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
              style={{ background: '#111112', border: '1px solid rgba(255,255,255,0.06)', borderBottomLeftRadius: 6 }}
            >
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#8C8C93' }} />
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#8C8C93' }} />
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#8C8C93' }} />
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {suggestionsVisible && (
          <div className="fade-up">
            <p className="text-xs mb-2 ml-9" style={{ color: '#5E5E65' }}>Sugerencias</p>
            <div className="flex flex-wrap gap-2 ml-9">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-2 rounded-xl text-left transition-all duration-150 hover:border-accent/30"
                  style={{
                    background: '#111112',
                    color: '#A8A8AF',
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
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#050505' }}
      >
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
          style={{ background: '#111112', border: '1px solid rgba(255,255,255,0.08)' }}
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
              color: '#F4F4F5',
              caretColor: '#F4F4F5',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0"
            style={{
              background: input.trim() && !isTyping ? '#F4F4F5' : '#262629',
              color: input.trim() && !isTyping ? '#050505' : '#5E5E65',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: '#3C3C41' }}>
          Las respuestas son solo orientativas, no son asesoría financiera
        </p>
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'
import { MessageCircle, Send, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }
type ContactMsg = { from: 'user' | 'ari'; text: string; t: number }
type Mode = 'ai' | 'contact'

const GREETING =
  '안녕하세요! ari의 기술 블로그 도우미예요. 인증·보안, 프론트엔드, 프로젝트 경험 등 궁금한 점을 물어보세요.'

const CONTACT_GREETING =
  'ari에게 직접 메시지를 보낼 수 있어요. 확인 후 여기서 답장드릴게요. (대화는 7일간 유지됩니다)'

const SUGGESTIONS = [
  'ari는 어떤 개발자인가요?',
  '인증 아키텍처를 어떻게 설계했나요?',
  '대표 프로젝트가 궁금해요',
]

// 콘텐츠(max-w-3xl=48rem) 오른쪽 끝에 딱 붙여 배치 (버튼 너비 3rem 만큼만 바깥),
// 좁은 화면에선 1rem 모서리로 폴백
const ANCHOR_RIGHT = 'right-[max(1rem,calc(50vw_-_24rem_-_3rem))]'

const STORAGE_KEY = 'ari-chat'
const VISITOR_KEY = 'ari-visitor-id'
const POLL_INTERVAL_MS = 5000

/** 마크다운 링크 [텍스트](url)만 앵커로 변환, 나머지는 평문 */
function renderContent(text: string) {
  const parts: React.ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <a
        key={i++}
        href={m[2]}
        className="text-foreground font-medium underline underline-offset-2"
      >
        {m[1]}
      </a>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // 폴백
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY)
    if (existing && /^[a-f0-9-]{8,64}$/i.test(existing)) return existing
    const fresh = uuid()
    localStorage.setItem(VISITOR_KEY, fresh)
    return fresh
  } catch {
    return uuid()
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('ai')

  // AI 챗
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  // 컨택트
  const [contactMsgs, setContactMsgs] = useState<ContactMsg[]>([])
  const [contactInput, setContactInput] = useState('')
  const [contactSending, setContactSending] = useState(false)
  const [contactError, setContactError] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const contactInputRef = useRef<HTMLTextAreaElement>(null)
  const hydrated = useRef(false)
  const visitorIdRef = useRef<string>('')
  const lastPollTsRef = useRef<number>(0)

  // 새로고침/재마운트 시 대화·열림 상태 복원 (sessionStorage 백업)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw) as {
          messages?: Msg[]
          open?: boolean
          mode?: Mode
          contactMsgs?: ContactMsg[]
        }
        if (Array.isArray(s.messages)) setMessages(s.messages)
        if (typeof s.open === 'boolean') setOpen(s.open)
        if (s.mode === 'ai' || s.mode === 'contact') setMode(s.mode)
        if (Array.isArray(s.contactMsgs)) {
          setContactMsgs(s.contactMsgs)
          const maxT = s.contactMsgs.reduce(
            (acc, m) => (typeof m?.t === 'number' && m.t > acc ? m.t : acc),
            0,
          )
          lastPollTsRef.current = maxT
        }
      }
    } catch {
      // 무시
    }
    visitorIdRef.current = getVisitorId()
    hydrated.current = true
  }, [])

  // 변경 시 저장 (복원 완료 전에는 빈 상태로 덮어쓰지 않음)
  useEffect(() => {
    if (!hydrated.current) return
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages, open, mode, contactMsgs }),
      )
    } catch {
      // 무시
    }
  }, [messages, open, mode, contactMsgs])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, contactMsgs, open, mode])

  useEffect(() => {
    if (!open) return
    if (mode === 'ai') inputRef.current?.focus()
    else contactInputRef.current?.focus()
  }, [open, mode])

  // 컨택트 모드: ari 답장 폴링
  useEffect(() => {
    if (!open || mode !== 'contact') return
    let cancelled = false

    async function poll() {
      const vid = visitorIdRef.current
      if (!vid) return
      try {
        const since = lastPollTsRef.current
        const res = await fetch(
          `/api/contact/messages?visitorId=${encodeURIComponent(vid)}&since=${since}`,
        )
        if (!res.ok) return
        const data = (await res.json()) as { messages?: ContactMsg[] }
        const incoming = Array.isArray(data.messages) ? data.messages : []
        // 본인 발신(user)은 로컬에 이미 있으니, ari 답장만 머지
        const ariOnly = incoming.filter((m) => m.from === 'ari')
        if (cancelled) return
        if (ariOnly.length > 0) {
          setContactMsgs((prev) => [...prev, ...ariOnly])
        }
        for (const m of incoming) {
          if (typeof m.t === 'number' && m.t > lastPollTsRef.current) {
            lastPollTsRef.current = m.t
          }
        }
      } catch {
        // 무시
      }
    }

    void poll()
    const id = window.setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [open, mode])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const history = [...messages, { role: 'user', content: trimmed } as Msg]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    const setLast = (content: string) =>
      setMessages((m) => {
        const c = [...m]
        c[c.length - 1] = { role: 'assistant', content }
        return c
      })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      if (!res.ok || !res.body) {
        setLast(
          res.status === 429
            ? '요청이 많습니다. 잠시 후 다시 시도해 주세요.'
            : '죄송해요, 답변을 가져오지 못했어요.',
        )
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setLast(acc)
      }
    } catch {
      setLast('죄송해요, 연결에 문제가 있었어요.')
    } finally {
      setLoading(false)
    }
  }

  async function sendContact(text: string) {
    const trimmed = text.trim()
    if (!trimmed || contactSending) return
    const vid = visitorIdRef.current || getVisitorId()
    visitorIdRef.current = vid

    const now = Date.now()
    setContactMsgs((prev) => [...prev, { from: 'user', text: trimmed, t: now }])
    setContactInput('')
    setContactError('')
    setContactSending(true)
    if (now > lastPollTsRef.current) lastPollTsRef.current = now

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: vid,
          message: trimmed,
          website: honeypot,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setContactError(
          data.error ??
            (res.status === 429
              ? '요청이 많습니다. 잠시 후 다시 시도해 주세요.'
              : '메시지 전송에 실패했어요.'),
        )
      }
    } catch {
      setContactError('연결에 문제가 있어 전송하지 못했어요.')
    } finally {
      setContactSending(false)
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // 한글 등 IME 조합 중에는 Enter로 전송하지 않음 (마지막 글자 잔류 버그 방지)
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void send(input)
    }
  }

  function onContactKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void sendContact(contactInput)
    }
  }

  return (
    <>
      {open && (
        <div
          className={cn(
            'bg-background fixed bottom-20 z-50 flex max-h-[70dvh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border shadow-lg sm:w-96',
            ANCHOR_RIGHT,
          )}
          role="dialog"
          aria-label="블로그 도우미 채팅"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-medium">
              {mode === 'ai' ? 'ari 봇에게 물어보기' : 'ari에게 메시지 보내기'}
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="채팅 닫기"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div
            className="grid grid-cols-2 border-b text-xs"
            role="tablist"
            aria-label="채팅 모드"
          >
            <button
              role="tab"
              aria-selected={mode === 'ai'}
              onClick={() => setMode('ai')}
              className={cn(
                'py-2 transition-colors',
                mode === 'ai'
                  ? 'border-foreground text-foreground border-b-2 font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              AI에게
            </button>
            <button
              role="tab"
              aria-selected={mode === 'contact'}
              onClick={() => setMode('contact')}
              className={cn(
                'py-2 transition-colors',
                mode === 'contact'
                  ? 'border-foreground text-foreground border-b-2 font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              사람에게
            </button>
          </div>

          {mode === 'ai' ? (
            <>
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto p-4"
              >
                <div className="bg-secondary/50 text-foreground/90 rounded-lg px-3 py-2 text-sm">
                  {GREETING}
                </div>
                {messages.length === 0 && (
                  <div className="flex flex-col items-start gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => void send(s)}
                        className="text-muted-foreground hover:text-foreground hover:border-foreground/30 rounded-full border px-3 py-1 text-xs transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                      m.role === 'user'
                        ? 'bg-foreground text-background ml-auto'
                        : 'bg-secondary/50 text-foreground/90',
                    )}
                  >
                    {m.role === 'assistant'
                      ? m.content === '' && loading
                        ? '…'
                        : renderContent(m.content)
                      : m.content}
                  </div>
                ))}
              </div>

              <div className="flex items-end gap-2 border-t p-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="메시지를 입력하세요…"
                  // 모바일은 16px(iOS 포커스 시 화면 강제 확대 방지), 데스크톱은 14px
                  className="bg-background placeholder:text-muted-foreground max-h-24 flex-1 resize-none rounded-md border px-3 py-2 text-base focus:outline-none sm:text-sm"
                />
                <button
                  onClick={() => void send(input)}
                  disabled={loading || input.trim().length === 0}
                  aria-label="보내기"
                  className="bg-foreground text-background grid size-9 shrink-0 place-items-center rounded-md transition-opacity disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto p-4"
              >
                <div className="bg-secondary/50 text-foreground/90 rounded-lg px-3 py-2 text-sm">
                  {CONTACT_GREETING}
                </div>
                {contactMsgs.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                      m.from === 'user'
                        ? 'bg-foreground text-background ml-auto'
                        : 'bg-secondary/50 text-foreground/90',
                    )}
                  >
                    {m.text}
                  </div>
                ))}
                {contactError && (
                  <div className="text-destructive rounded-lg border border-dashed px-3 py-2 text-xs">
                    {contactError}
                  </div>
                )}
              </div>

              <div className="flex items-end gap-2 border-t p-3">
                {/* 허니팟 (스크린리더·시각 모두 숨김, 봇만 채움) */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="pointer-events-none absolute size-0 opacity-0"
                />
                <textarea
                  ref={contactInputRef}
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  onKeyDown={onContactKeyDown}
                  rows={1}
                  placeholder="ari에게 보낼 메시지…"
                  className="bg-background placeholder:text-muted-foreground max-h-24 flex-1 resize-none rounded-md border px-3 py-2 text-base focus:outline-none sm:text-sm"
                />
                <button
                  onClick={() => void sendContact(contactInput)}
                  disabled={
                    contactSending || contactInput.trim().length === 0
                  }
                  aria-label="보내기"
                  className="bg-foreground text-background grid size-9 shrink-0 place-items-center rounded-md transition-opacity disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? '채팅 닫기' : '블로그 도우미 열기'}
        className={cn(
          'bg-foreground text-background fixed bottom-4 z-50 grid size-12 place-items-center rounded-full shadow-lg transition-transform hover:scale-105',
          ANCHOR_RIGHT,
        )}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </>
  )
}

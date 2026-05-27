import { cn } from '@/lib/utils'
import { MessageCircle, Send, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const GREETING =
  '안녕하세요! ari의 기술 블로그 도우미예요. 인증·보안, 프론트엔드, 프로젝트 경험 등 궁금한 점을 물어보세요.'

const SUGGESTIONS = [
  'ari는 어떤 개발자인가요?',
  '인증 아키텍처를 어떻게 설계했나요?',
  '대표 프로젝트가 궁금해요',
]

// 콘텐츠(max-w-3xl=48rem) 오른쪽 끝에 딱 붙여 배치 (버튼 너비 3rem 만큼만 바깥),
// 좁은 화면에선 1rem 모서리로 폴백
const ANCHOR_RIGHT = 'right-[max(1rem,calc(50vw_-_24rem_-_3rem))]'

const STORAGE_KEY = 'ari-chat'

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

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hydrated = useRef(false)

  // 새로고침/재마운트 시 대화·열림 상태 복원 (sessionStorage 백업)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw) as { messages?: Msg[]; open?: boolean }
        if (Array.isArray(s.messages)) setMessages(s.messages)
        if (typeof s.open === 'boolean') setOpen(s.open)
      }
    } catch {
      // 무시
    }
    hydrated.current = true
  }, [])

  // 변경 시 저장 (복원 완료 전에는 빈 상태로 덮어쓰지 않음)
  useEffect(() => {
    if (!hydrated.current) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, open }))
    } catch {
      // 무시
    }
  }, [messages, open])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

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

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // 한글 등 IME 조합 중에는 Enter로 전송하지 않음 (마지막 글자 잔류 버그 방지)
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void send(input)
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
            <span className="text-sm font-medium">ari 봇에게 물어보기</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="채팅 닫기"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
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

import { getSystemPrompt } from '@/lib/chat'
import { getRedis } from '@/lib/redis'
import { GoogleGenAI } from '@google/genai'
import type { APIRoute } from 'astro'

export const prerender = false

const MODEL = 'gemini-2.5-flash'
const MAX_TOKENS = 1024
const RATE_LIMIT_PER_HOUR = 30
const MAX_HISTORY = 12
const MAX_MESSAGE_CHARS = 2000
const LOG_KEY = 'chat:log'
const LOG_MAX = 500

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function isChatMessage(m: unknown): m is ChatMessage {
  return (
    !!m &&
    typeof m === 'object' &&
    ((m as ChatMessage).role === 'user' ||
      (m as ChatMessage).role === 'assistant') &&
    typeof (m as ChatMessage).content === 'string' &&
    (m as ChatMessage).content.trim().length > 0
  )
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const apiKey =
    process.env.GEMINI_API_KEY ?? import.meta.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: '챗봇이 아직 설정되지 않았습니다.' },
      { status: 503 },
    )
  }

  // 레이트 리밋: IP당 시간별 (Redis 없으면 graceful 통과)
  const redis = getRedis()
  if (redis) {
    try {
      const ip = clientAddress ?? 'unknown'
      const bucket = Math.floor(Date.now() / 3_600_000)
      const key = `chat:rl:${ip}:${bucket}`
      const n = await redis.incr(key)
      if (n === 1) await redis.expire(key, 3600)
      if (n > RATE_LIMIT_PER_HOUR) {
        return Response.json(
          { error: '요청이 많습니다. 잠시 후 다시 시도해 주세요.' },
          { status: 429 },
        )
      }
    } catch {
      // 레이트 리밋 실패는 무시 (가용성 우선)
    }
  }

  let messages: ChatMessage[] = []
  try {
    const body = (await request.json()) as { messages?: unknown }
    if (Array.isArray(body.messages)) {
      messages = body.messages
        .filter(isChatMessage)
        .slice(-MAX_HISTORY)
        .map((m) => ({
          role: m.role,
          content: m.content.slice(0, MAX_MESSAGE_CHARS),
        }))
    }
  } catch {
    // 아래 검증에서 걸림
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return Response.json({ error: '메시지가 올바르지 않습니다.' }, { status: 400 })
  }

  const ai = new GoogleGenAI({ apiKey })
  const system = await getSystemPrompt()

  // Gemini 역할 매핑: assistant → 'model'
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const question = messages[messages.length - 1].content

  const encoder = new TextEncoder()
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer = ''
      try {
        const stream = await ai.models.generateContentStream({
          model: MODEL,
          contents,
          config: {
            systemInstruction: system,
            maxOutputTokens: MAX_TOKENS,
          },
        })
        for await (const chunk of stream) {
          const text = chunk.text
          if (text) {
            answer += text
            controller.enqueue(encoder.encode(text))
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode('\n\n(오류가 발생했어요. 잠시 후 다시 시도해 주세요.)'),
        )
      } finally {
        controller.close()
        // 질문/답변 로그 적재 (최근 500개 유지) — fire-and-forget
        if (redis) {
          redis
            .lpush(LOG_KEY, {
              t: new Date().toISOString(),
              q: question,
              a: answer.slice(0, 4000),
            })
            .then(() => redis.ltrim(LOG_KEY, 0, LOG_MAX - 1))
            .catch(() => {})
        }
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

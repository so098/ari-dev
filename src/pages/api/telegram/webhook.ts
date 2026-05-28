import { getRedis } from '@/lib/redis'
import type { APIRoute } from 'astro'

export const prerender = false

const MSG_TTL_SECONDS = 60 * 60 * 24 * 7
const MSG_LIST_MAX = 200

type TgUpdate = {
  message?: {
    text?: string
    reply_to_message?: { text?: string }
    from?: { id?: number; first_name?: string }
  }
}

export const POST: APIRoute = async ({ request }) => {
  const secret =
    process.env.TELEGRAM_WEBHOOK_SECRET ??
    import.meta.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret) {
    return Response.json({ ok: false }, { status: 503 })
  }
  const headerSecret = request.headers.get('x-telegram-bot-api-secret-token')
  if (headerSecret !== secret) {
    return Response.json({ ok: false }, { status: 401 })
  }

  const redis = getRedis()
  if (!redis) {
    return Response.json({ ok: false }, { status: 503 })
  }

  let update: TgUpdate
  try {
    update = (await request.json()) as TgUpdate
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }

  const msg = update.message
  const replyText = msg?.text?.trim()
  const original = msg?.reply_to_message?.text ?? ''
  if (!replyText || !original) {
    // 답장이 아닌 일반 메시지 무시
    return Response.json({ ok: true })
  }

  const m = /\[ID:([a-f0-9]{4,16})\]/i.exec(original)
  if (!m) return Response.json({ ok: true })
  const sid = m[1].toLowerCase()

  const visitorId = await redis.get<string>(`contact:vid:${sid}`)
  if (!visitorId) {
    // 만료/없음
    return Response.json({ ok: true })
  }

  const key = `contact:msgs:${visitorId}`
  try {
    await redis.rpush(key, {
      t: Date.now(),
      from: 'ari',
      text: replyText.slice(0, 4000),
    })
    await redis.ltrim(key, -MSG_LIST_MAX, -1)
    await redis.expire(key, MSG_TTL_SECONDS)
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }

  return Response.json({ ok: true })
}

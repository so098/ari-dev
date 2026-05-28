import { getRedis } from '@/lib/redis'
import type { APIRoute } from 'astro'

export const prerender = false

const RATE_LIMIT_PER_HOUR = 10
const MAX_MESSAGE_CHARS = 2000
const VID_TTL_SECONDS = 60 * 60 * 24 * 7 // 7일
const MSG_TTL_SECONDS = 60 * 60 * 24 * 7
const MSG_LIST_MAX = 200

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function isValidVisitorId(v: unknown): v is string {
  return typeof v === 'string' && /^[a-f0-9-]{8,64}$/i.test(v)
}

function shortIdFrom(visitorId: string) {
  // 텔레그램 메시지에 노출되는 짧은 식별자 (UUID 마지막 8자)
  return visitorId.replace(/-/g, '').slice(-8)
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const token =
    process.env.TELEGRAM_BOT_TOKEN ?? import.meta.env.TELEGRAM_BOT_TOKEN
  const chatId =
    process.env.TELEGRAM_CHAT_ID ?? import.meta.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return Response.json(
      { error: '메시지 전송이 아직 설정되지 않았습니다.' },
      { status: 503 },
    )
  }

  const redis = getRedis()
  const ip = clientAddress ?? 'unknown'

  if (redis) {
    try {
      const bucket = Math.floor(Date.now() / 3_600_000)
      const key = `contact:rl:${ip}:${bucket}`
      const n = await redis.incr(key)
      if (n === 1) await redis.expire(key, 3600)
      if (n > RATE_LIMIT_PER_HOUR) {
        return Response.json(
          { error: '요청이 많습니다. 잠시 후 다시 시도해 주세요.' },
          { status: 429 },
        )
      }
    } catch {
      // 가용성 우선
    }
  }

  let message = ''
  let visitorId = ''
  let honeypot = ''
  try {
    const body = (await request.json()) as {
      message?: unknown
      visitorId?: unknown
      website?: unknown
    }
    if (typeof body.message === 'string') {
      message = body.message.trim().slice(0, MAX_MESSAGE_CHARS)
    }
    if (isValidVisitorId(body.visitorId)) visitorId = body.visitorId
    if (typeof body.website === 'string') honeypot = body.website.trim()
  } catch {
    // 아래에서 검증
  }

  if (!message) {
    return Response.json({ error: '메시지를 입력해주세요.' }, { status: 400 })
  }
  if (!visitorId) {
    return Response.json(
      { error: '세션이 올바르지 않습니다.' },
      { status: 400 },
    )
  }

  if (honeypot) {
    return Response.json({ ok: true })
  }

  const sid = shortIdFrom(visitorId)

  // shortId → visitorId 매핑 저장 (텔레그램 reply에서 역방향 조회용)
  if (redis) {
    try {
      await redis.set(`contact:vid:${sid}`, visitorId, { ex: VID_TTL_SECONDS })
    } catch {
      // 무시
    }
  }

  const ua = request.headers.get('user-agent') ?? 'unknown'
  const referer = request.headers.get('referer') ?? ''
  const text = [
    '📩 <b>블로그 새 메시지</b>',
    '',
    escapeHtml(message),
    '',
    `<i>IP:</i> ${escapeHtml(ip)}`,
    `<i>UA:</i> ${escapeHtml(ua).slice(0, 200)}`,
    referer ? `<i>From:</i> ${escapeHtml(referer)}` : '',
    '',
    `↩️ 이 메시지에 <b>답장(reply)</b>하시면 방문자에게 전달돼요. [ID:${sid}]`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
    )
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[contact] telegram sendMessage failed', res.status, body)
      return Response.json(
        {
          error: `텔레그램 전송 실패 (${res.status}): ${body.slice(0, 300)}`,
        },
        { status: 502 },
      )
    }
  } catch (e) {
    console.error('[contact] fetch threw', e)
    return Response.json(
      { error: `네트워크 오류: ${(e as Error).message}` },
      { status: 502 },
    )
  }

  // 본인 발신 메시지도 큐에 적재 (다른 디바이스/탭 동기화 필요 시 사용)
  if (redis) {
    const key = `contact:msgs:${visitorId}`
    redis
      .rpush(key, {
        t: Date.now(),
        from: 'user',
        text: message,
      })
      .then(() =>
        Promise.all([
          redis.ltrim(key, -MSG_LIST_MAX, -1),
          redis.expire(key, MSG_TTL_SECONDS),
        ]),
      )
      .catch(() => {})
  }

  return Response.json({ ok: true })
}

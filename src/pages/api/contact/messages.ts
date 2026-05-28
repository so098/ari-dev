import { getRedis } from '@/lib/redis'
import type { APIRoute } from 'astro'

export const prerender = false

const MAX_RETURN = 50

type StoredMsg = { t: number; from: 'user' | 'ari'; text: string }

function isValidVisitorId(v: string | null): v is string {
  return !!v && /^[a-f0-9-]{8,64}$/i.test(v)
}

export const GET: APIRoute = async ({ url }) => {
  const visitorId = url.searchParams.get('visitorId')
  const sinceRaw = url.searchParams.get('since') ?? '0'
  const since = Number.parseInt(sinceRaw, 10) || 0

  if (!isValidVisitorId(visitorId)) {
    return Response.json({ error: 'bad visitorId' }, { status: 400 })
  }

  const redis = getRedis()
  if (!redis) return Response.json({ messages: [] })

  let raw: unknown[] = []
  try {
    raw = await redis.lrange(`contact:msgs:${visitorId}`, -MAX_RETURN, -1)
  } catch {
    return Response.json({ messages: [] })
  }

  const messages: StoredMsg[] = []
  for (const item of raw) {
    // Upstash는 JSON value를 자동으로 파싱해서 반환할 수도, 문자열로 반환할 수도 있음
    let parsed: StoredMsg | null = null
    if (typeof item === 'string') {
      try {
        parsed = JSON.parse(item) as StoredMsg
      } catch {
        parsed = null
      }
    } else if (item && typeof item === 'object') {
      parsed = item as StoredMsg
    }
    if (!parsed) continue
    if (typeof parsed.t !== 'number' || parsed.t <= since) continue
    if (parsed.from !== 'user' && parsed.from !== 'ari') continue
    if (typeof parsed.text !== 'string') continue
    messages.push(parsed)
  }

  return Response.json({ messages })
}

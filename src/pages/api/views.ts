import type { APIRoute } from 'astro'
import { getRedis } from '@/lib/redis'
import { isValidSlug, slugToKey } from '@/lib/views-shared'

export const prerender = false

// 여러 슬러그 일괄 조회: GET /api/views?slugs=blog/a,knowledge/b
export const GET: APIRoute = async ({ url }) => {
  const redis = getRedis()
  const raw = url.searchParams.get('slugs') ?? ''
  const slugs = raw
    .split(',')
    .map((s) => s.trim())
    .filter(isValidSlug)
    .slice(0, 100)

  if (!redis || slugs.length === 0) {
    return Response.json({ counts: {} })
  }

  const keys = slugs.map(slugToKey)
  try {
    const values = await redis.mget<(number | null)[]>(...keys)
    const counts: Record<string, number> = {}
    slugs.forEach((slug, i) => {
      counts[slug] = Number(values[i] ?? 0)
    })
    return Response.json({ counts })
  } catch {
    return Response.json({ counts: {} })
  }
}

// 조회수 +1: POST /api/views  body: { slug: "blog/a" }
export const POST: APIRoute = async ({ request }) => {
  const redis = getRedis()
  let slug = ''
  try {
    const body = (await request.json()) as { slug?: unknown }
    slug = typeof body.slug === 'string' ? body.slug : ''
  } catch {
    // 무시 — 아래 검증에서 걸림
  }

  if (!redis) {
    return Response.json({ slug, count: null })
  }
  if (!isValidSlug(slug)) {
    return Response.json({ slug, count: null }, { status: 400 })
  }

  try {
    const count = await redis.incr(slugToKey(slug))
    return Response.json({ slug, count })
  } catch {
    return Response.json({ slug, count: null })
  }
}

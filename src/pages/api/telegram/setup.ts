import type { APIRoute } from 'astro'

export const prerender = false

/**
 * 텔레그램 webhook 등록 헬퍼 (관리자 1회 호출).
 * 호출:  GET /api/telegram/setup?secret=<TELEGRAM_WEBHOOK_SECRET>
 * 동작: 현재 도메인 + /api/telegram/webhook 을 setWebhook 으로 등록.
 */
export const GET: APIRoute = async ({ url }) => {
  const token =
    process.env.TELEGRAM_BOT_TOKEN ?? import.meta.env.TELEGRAM_BOT_TOKEN
  const secret =
    process.env.TELEGRAM_WEBHOOK_SECRET ??
    import.meta.env.TELEGRAM_WEBHOOK_SECRET
  if (!token || !secret) {
    return Response.json(
      { error: 'TELEGRAM_BOT_TOKEN / TELEGRAM_WEBHOOK_SECRET 미설정' },
      { status: 503 },
    )
  }
  if (url.searchParams.get('secret') !== secret) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const origin = url.origin
  const webhookUrl = `${origin}/api/telegram/webhook`

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: ['message'],
      }),
    },
  )

  const data = (await res.json()) as unknown
  return Response.json({ webhookUrl, telegram: data }, { status: res.ok ? 200 : 502 })
}

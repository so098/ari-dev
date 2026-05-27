import { Redis } from '@upstash/redis'

let client: Redis | null | undefined

/** env가 있으면 Redis, 없으면 null(로컬/미설정 환경에서 graceful) */
export function getRedis(): Redis | null {
  if (client !== undefined) return client
  const url = process.env.KV_REST_API_URL ?? import.meta.env.KV_REST_API_URL
  const token =
    process.env.KV_REST_API_TOKEN ?? import.meta.env.KV_REST_API_TOKEN
  client = url && token ? new Redis({ url, token }) : null
  return client
}

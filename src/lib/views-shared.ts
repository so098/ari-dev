const SLUG_RE = /^(blog|knowledge)\/[a-z0-9][a-z0-9-]*$/

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}

export function slugToKey(slug: string): string {
  return `views:${slug.replace('/', ':')}`
}

export function formatViews(n: number): string {
  if (n < 1000) return String(n)
  const k = n / 1000
  const rounded = Math.round(k * 10) / 10
  return `${rounded}k`
}

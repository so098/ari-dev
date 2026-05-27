import { describe, expect, it } from 'vitest'
import { isValidSlug, slugToKey, formatViews } from '../src/lib/views-shared'

describe('isValidSlug', () => {
  it('blog/knowledge 컬렉션 + 소문자/숫자/하이픈 id 허용', () => {
    expect(isValidSlug('blog/auth-architecture-retrospective')).toBe(true)
    expect(isValidSlug('knowledge/js-weekly-2026-w22')).toBe(true)
  })
  it('알 수 없는 컬렉션/형식 거부', () => {
    expect(isValidSlug('tags/foo')).toBe(false)
    expect(isValidSlug('blog/')).toBe(false)
    expect(isValidSlug('blog/Foo Bar')).toBe(false)
    expect(isValidSlug('blog/a/b')).toBe(false)
    expect(isValidSlug('')).toBe(false)
    expect(isValidSlug('views:blog:x')).toBe(false)
  })
})

describe('slugToKey', () => {
  it('Redis 키로 변환', () => {
    expect(slugToKey('blog/foo')).toBe('views:blog:foo')
    expect(slugToKey('knowledge/bar-1')).toBe('views:knowledge:bar-1')
  })
})

describe('formatViews', () => {
  it('1000 미만은 그대로', () => {
    expect(formatViews(0)).toBe('0')
    expect(formatViews(999)).toBe('999')
  })
  it('1000 이상은 k 축약', () => {
    expect(formatViews(1000)).toBe('1k')
    expect(formatViews(1200)).toBe('1.2k')
    expect(formatViews(12300)).toBe('12.3k')
  })
})

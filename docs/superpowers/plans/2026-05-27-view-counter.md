# 조회수 카운터 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그/지식 글의 실제 페이지뷰 누적 조회수를 Upstash Redis에 저장하고, 목록 카드에 눈 아이콘 + 숫자로 표시한다.

**Architecture:** 정적 Astro 사이트에 `@astrojs/vercel` 어댑터를 더해 `/api/views` 엔드포인트만 서버리스 함수로 동작시킨다(나머지 페이지는 정적 유지). 글 본문 페이지 로드 시 세션 중복 제거 후 `POST`로 +1, 목록 페이지는 화면의 모든 슬러그를 `GET`으로 일괄 조회해 카드에 채운다. 카운터는 Upstash Redis(`@upstash/redis`)에 `views:{collection}:{id}` 키로 저장.

**Tech Stack:** Astro 5, `@astrojs/vercel`, `@upstash/redis`, Tailwind v4, astro-icon(lucide), vitest(순수 함수 테스트)

**참조 스펙:** `docs/superpowers/specs/2026-05-27-view-counter-design.md`

**환경변수 (확정):** `KV_REST_API_URL`, `KV_REST_API_TOKEN` — 프로덕션은 Vercel Upstash 연동이 자동 주입, 로컬은 `.env`에 등록 완료.

---

## File Structure

| 파일 | 책임 | 비고 |
|------|------|------|
| `src/lib/views-shared.ts` | 순수 함수: 슬러그 검증·키 변환·숫자 포맷 (Astro/Node 의존 없음) | vitest로 테스트 |
| `tests/views-shared.test.ts` | 위 순수 함수 단위 테스트 | 신규 |
| `src/lib/redis.ts` | Upstash 클라이언트 생성(env 없으면 null) | 신규 |
| `src/pages/api/views.ts` | `GET`(일괄 조회)·`POST`(+1) 엔드포인트, `prerender = false` | 신규 |
| `src/components/ViewCount.astro` | 카드용 placeholder(눈 아이콘 + 숫자, 기본 숨김) | 신규 |
| `src/layouts/Layout.astro` | 전역 클라이언트 스크립트(카드 채우기 + 본문 +1) 추가 | 수정 |
| `src/components/BlogCard.astro` | 메타 줄에 `<ViewCount>` 추가 | 수정 |
| `src/components/KnowledgeCard.astro` | 메타 줄에 `<ViewCount>` 추가 | 수정 |
| `src/components/KnowledgeTile.astro` | 메타 줄에 `<ViewCount>` 추가 | 수정 |
| `src/pages/blog/[...id].astro` | 본문 +1 마커 추가 | 수정 |
| `src/pages/knowledge/[...id].astro` | 본문 +1 마커 추가 | 수정 |
| `astro.config.ts` | Vercel 어댑터 추가 | 수정 |

**슬러그 규약:** 카드 링크/본문과 동일하게 `{collection}/{id}` (예: `blog/auth-architecture-retrospective`). Redis 키는 `views:{collection}:{id}`.

---

## Task 1: 의존성 설치 & Vercel 어댑터

**Files:**
- Modify: `astro.config.ts`
- Modify: `package.json` (npm이 자동 갱신)

- [ ] **Step 1: 패키지 설치**

Run:
```bash
npm install @upstash/redis
npm install -D vitest
npx astro add vercel --yes
```
Expected: `@astrojs/vercel`, `@upstash/redis`가 dependencies에, `vitest`가 devDependencies에 추가됨. `astro add vercel`이 `astro.config.ts`에 `adapter: vercel()`을 자동 삽입.

- [ ] **Step 2: astro.config.ts 확인/정리**

`astro add`가 추가한 결과가 아래 형태인지 확인. 누락 시 직접 추가:
```ts
import vercel from '@astrojs/vercel'
// ...
export default defineConfig({
  site: 'https://ari.io.kr',
  adapter: vercel(),
  // ...기존 설정 그대로...
})
```
`output` 옵션은 추가하지 않는다(기본 `static` 유지 → 페이지는 정적, `prerender=false` 라우트만 함수화).

- [ ] **Step 3: 빌드가 깨지지 않는지 확인**

Run: `npm run build`
Expected: `astro check` 통과, 빌드 성공. (아직 엔드포인트가 없어도 OK)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json astro.config.ts
git commit -m "build: Vercel 어댑터 + upstash/vitest 의존성 추가"
```

---

## Task 2: 순수 공유 함수 (TDD)

순수 함수만 모아 vitest로 테스트한다. 이 파일은 Astro/Node API를 import 하지 않는다.

**Files:**
- Create: `src/lib/views-shared.ts`
- Test: `tests/views-shared.test.ts`
- Modify: `package.json` (test 스크립트)

- [ ] **Step 1: test 스크립트 추가**

`package.json`의 `scripts`에 추가:
```json
"test": "vitest run"
```

- [ ] **Step 2: 실패하는 테스트 작성**

Create `tests/views-shared.test.ts`:
```ts
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
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npm test`
Expected: FAIL — `src/lib/views-shared` 모듈/함수 없음.

- [ ] **Step 4: 최소 구현 작성**

Create `src/lib/views-shared.ts`:
```ts
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
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test`
Expected: PASS — 모든 케이스 통과.

- [ ] **Step 6: Commit**

```bash
git add package.json tests/views-shared.test.ts src/lib/views-shared.ts
git commit -m "feat: 조회수 슬러그/포맷 순수 함수 + 테스트"
```

---

## Task 3: Upstash Redis 클라이언트

**Files:**
- Create: `src/lib/redis.ts`

- [ ] **Step 1: 클라이언트 모듈 작성**

Create `src/lib/redis.ts`:
```ts
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
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: `astro check` 통과(타입 에러 없음). 빌드 성공.

- [ ] **Step 3: Commit**

```bash
git add src/lib/redis.ts
git commit -m "feat: Upstash Redis 클라이언트(env 없으면 null)"
```

---

## Task 4: /api/views 엔드포인트

**Files:**
- Create: `src/pages/api/views.ts`

- [ ] **Step 1: 엔드포인트 작성**

Create `src/pages/api/views.ts`:
```ts
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

  if (!redis || slugs.length === 0) {
    return Response.json({ counts: {} })
  }

  const keys = slugs.map(slugToKey)
  const values = await redis.mget<(number | null)[]>(...keys)
  const counts: Record<string, number> = {}
  slugs.forEach((slug, i) => {
    counts[slug] = Number(values[i] ?? 0)
  })
  return Response.json({ counts })
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

  const count = await redis.incr(slugToKey(slug))
  return Response.json({ slug, count })
}
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: `astro check` 통과, 빌드 성공.

- [ ] **Step 3: 로컬 실동작 확인 (dev 서버)**

별도 터미널에서 `npm run dev` 실행 후:
```bash
curl -s -X POST http://localhost:1234/api/views \
  -H 'Content-Type: application/json' \
  -d '{"slug":"blog/test-slug"}'
```
Expected: `{"slug":"blog/test-slug","count":1}` (재호출 시 count 증가).
```bash
curl -s "http://localhost:1234/api/views?slugs=blog/test-slug,knowledge/none"
```
Expected: `{"counts":{"blog/test-slug":1,"knowledge/none":0}}`

테스트로 만든 키 정리(선택):
```bash
curl -s -X POST http://localhost:1234/api/views -H 'Content-Type: application/json' -d '{"slug":"blog/bad slug"}'
```
Expected: HTTP 400, `count:null`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/views.ts
git commit -m "feat: /api/views 조회/증가 엔드포인트"
```

---

## Task 5: ViewCount 컴포넌트

카드에 들어갈 placeholder. 기본 숨김(`display:none`)이며 JS가 숫자를 채운 뒤 노출한다. 앞쪽 구분선까지 포함해 통째로 숨겨지므로 로딩 전 구분선이 덩그러니 남지 않는다.

**Files:**
- Create: `src/components/ViewCount.astro`

- [ ] **Step 1: 컴포넌트 작성**

Create `src/components/ViewCount.astro`:
```astro
---
import { Icon } from 'astro-icon/components'
import { Separator } from '@/components/ui/separator'

interface Props {
  slug: string
}

const { slug } = Astro.props
---

<span
  data-views-slug={slug}
  class="items-center gap-x-2"
  style="display:none"
  title="조회수"
>
  <Separator orientation="vertical" className="h-4!" />
  <span class="inline-flex items-center gap-1">
    <Icon name="lucide:eye" class="size-3" />
    <span data-views-count></span>
  </span>
</span>
```

(노출 시 JS가 `style.display = 'inline-flex'`로 설정한다.)

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: 통과(아직 미사용이라 경고만 없으면 OK).

- [ ] **Step 3: Commit**

```bash
git add src/components/ViewCount.astro
git commit -m "feat: 카드용 ViewCount placeholder 컴포넌트"
```

---

## Task 6: 카드 3종에 ViewCount 추가

**Files:**
- Modify: `src/components/BlogCard.astro`
- Modify: `src/components/KnowledgeCard.astro`
- Modify: `src/components/KnowledgeTile.astro`

- [ ] **Step 1: BlogCard 수정**

import 블록에 추가:
```astro
import ViewCount from './ViewCount.astro'
```
메타 줄(`{readTime}` span 다음)에 ViewCount 추가:
```astro
      <div
        class="text-muted-foreground mb-2 flex flex-wrap items-center gap-x-2 text-xs"
      >
        <span>{formattedDate}</span>
        <Separator orientation="vertical" className="h-4!" />
        <span>{readTime}</span>
        <ViewCount slug={`${entry.collection}/${entry.id}`} />
      </div>
```

- [ ] **Step 2: KnowledgeCard 수정**

import 블록에 추가:
```astro
import ViewCount from './ViewCount.astro'
```
기존 `갱신일` div를 flex 메타 줄로 교체:
```astro
    <div
      class="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-xs"
    >
      <span>갱신일 {formattedDate}</span>
      <ViewCount slug={`${entry.collection}/${entry.id}`} />
    </div>
```

- [ ] **Step 3: KnowledgeTile 수정**

import 블록에 추가:
```astro
import ViewCount from './ViewCount.astro'
```
기존 `갱신일` div를 flex 메타 줄로 교체:
```astro
  <div
    class="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-2 text-xs"
  >
    <span>갱신일 {formattedDate}</span>
    <ViewCount slug={`${entry.collection}/${entry.id}`} />
  </div>
```

- [ ] **Step 4: 타입 체크 & 렌더 확인**

Run: `npm run build`
Expected: 통과. (카드엔 아직 숫자 안 보임 — JS 미연결 상태라 placeholder 숨김 유지)

- [ ] **Step 5: Commit**

```bash
git add src/components/BlogCard.astro src/components/KnowledgeCard.astro src/components/KnowledgeTile.astro
git commit -m "feat: 블로그/지식 카드에 ViewCount 자리 추가"
```

---

## Task 7: 전역 클라이언트 스크립트 (카드 채우기 + 본문 +1)

`astro:page-load`(사이트가 ClientRouter 기반 — 기존 scroll-to-top 스크립트와 동일 패턴)에서 동작.

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Layout에 스크립트 추가**

`</body>` 직전(`<Analytics />` 아래)에 추가:
```astro
    <Analytics />
    <script>
      import { formatViews } from '@/lib/views-shared'

      async function fillCardViews() {
        const els = Array.from(
          document.querySelectorAll<HTMLElement>('[data-views-slug]'),
        )
        const slugs = Array.from(
          new Set(els.map((el) => el.dataset.viewsSlug).filter(Boolean)),
        ) as string[]
        if (slugs.length === 0) return

        try {
          const res = await fetch(
            `/api/views?slugs=${encodeURIComponent(slugs.join(','))}`,
          )
          if (!res.ok) return
          const { counts } = (await res.json()) as {
            counts: Record<string, number>
          }
          for (const el of els) {
            const slug = el.dataset.viewsSlug!
            const n = counts[slug]
            if (typeof n !== 'number') continue
            const countEl = el.querySelector('[data-views-count]')
            if (countEl) countEl.textContent = formatViews(n)
            el.style.display = 'inline-flex'
          }
        } catch {
          // 실패 시 placeholder 숨김 유지
        }
      }

      async function incrementView() {
        const marker = document.querySelector<HTMLElement>(
          '[data-view-increment]',
        )
        const slug = marker?.dataset.viewIncrement
        if (!slug) return
        const key = `viewed:${slug}`
        if (sessionStorage.getItem(key)) return
        sessionStorage.setItem(key, '1')
        try {
          await fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug }),
          })
        } catch {
          // 무시
        }
      }

      document.addEventListener('astro:page-load', () => {
        void incrementView()
        void fillCardViews()
      })
    </script>
  </body>
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: 카드 조회수 채우기 + 본문 조회수 증가 스크립트"
```

---

## Task 8: 본문 페이지에 +1 마커 추가

**Files:**
- Modify: `src/pages/blog/[...id].astro`
- Modify: `src/pages/knowledge/[...id].astro`

- [ ] **Step 1: blog/[...id].astro 수정**

최상위 `<Layout isWide>` 여는 태그 바로 다음 줄에 마커 추가:
```astro
<Layout isWide>
  <div data-view-increment={`blog/${post.id}`} hidden></div>
  <PostHead slot="head" post={post} />
```

- [ ] **Step 2: knowledge/[...id].astro 수정**

동일하게:
```astro
<Layout isWide>
  <div data-view-increment={`knowledge/${entry.id}`} hidden></div>
  <KnowledgeHead slot="head" entry={entry} />
```

- [ ] **Step 3: 타입 체크**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 4: Commit**

```bash
git add "src/pages/blog/[...id].astro" "src/pages/knowledge/[...id].astro"
git commit -m "feat: 본문 페이지 조회수 증가 마커"
```

---

## Task 9: 통합 검증

**Files:** (수정 없음 — 동작 확인)

- [ ] **Step 1: dev 서버에서 엔드투엔드 확인**

`npm run dev` 실행 상태에서 브라우저로:
1. 블로그 글 하나 열기 → 새로고침해도 `sessionStorage`에 `viewed:blog/...`가 생기고 POST는 1회만(개발자도구 Network 탭 확인).
2. `/blog`, `/knowledge`, 홈(`/`)으로 이동 → 해당 글 카드에 눈 아이콘 + 숫자가 나타나는지 확인.
3. 다른 글도 열어 카운트가 카드에 반영되는지 확인.

Expected: 카드에 `👁 N` 표시, 새로고침 시 중복 카운트 안 됨.

- [ ] **Step 2: 모바일 반응형 확인 (CLAUDE.md 준수)**

브라우저를 **576px 이하** 폭으로 줄여 `/blog`, `/knowledge`, 홈 카드 확인.
Expected: 메타 줄이 `flex-wrap`으로 자연스럽게 줄바꿈되고, 조회수가 잘리거나 레이아웃이 깨지지 않음.

- [ ] **Step 3: 정적/타입 최종 점검**

Run: `npm run build`
Expected: `astro check` 통과, 빌드 성공. `dist`에 `/api/views` 함수가 생성됨.

- [ ] **Step 4: 마무리 커밋(필요 시)**

검증 중 수정이 있었다면:
```bash
git add -A && git commit -m "fix: 조회수 카운터 검증 중 발견한 이슈 수정"
```

---

## 배포 후 수동 절차 (사용자)

1. `git push` → Vercel 자동 배포. (어댑터로 `/api/views`가 함수로 배포됨)
2. Vercel 프로젝트에 Upstash 연동이 `KV_REST_API_URL`/`KV_REST_API_TOKEN`을 주입했는지 Settings → Environment Variables에서 확인.
3. 프로덕션에서 글 열기 → 카드 조회수 표시 확인.
4. **보안:** 대화에 노출된 토큰을 Upstash 대시보드에서 rotate 후 Vercel/`.env` 갱신 권장.

## 비고

- 조회수는 0부터 시작(기존 Vercel Analytics 데이터 이관 불가 — 공개 읽기 API 없음).
- 봇/프리페치 부풀림은 "실제 navigation + 세션 중복 제거"로 1차 완화. 정밀 필터링은 비목표.

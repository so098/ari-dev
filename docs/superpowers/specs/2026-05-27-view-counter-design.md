# 조회수 카운터 설계 (View Counter)

날짜: 2026-05-27
상태: 설계 승인 완료, 구현 대기

## 목표

블로그/지식 글의 **실제 페이지뷰 누적 조회수**를 목록 카드에 표시한다.

- 카운팅 정의: 실제 페이지뷰 누적 (글 본문 페이지를 열 때 +1)
- 중복 제거: **세션 내 중복 제거** — 같은 방문자가 같은 글을 같은 브라우저 세션에서 이미 봤으면 다시 카운트하지 않음 (`sessionStorage` 기준)
- 표시 위치: `BlogCard`, `KnowledgeCard`, `KnowledgeTile` (글 본문 페이지/홈 Latest posts에는 표시하지 않음)
- 표시 형태: lucide `eye` 아이콘 + 숫자

## 비목표 (Non-goals)

- Vercel Web Analytics 데이터 활용 — 공개 읽기 API가 없어 불가. 새 카운터로 0부터 시작.
- 고유 방문자(UV) 측정 — 단순 페이지뷰만.
- 댓글 기능 — 별도 설계로 분리(이번 범위 아님).
- 봇/크롤러 정밀 필터링 — 세션 중복 제거로만 1차 완화.

## 전제: 정적 사이트 → 부분 SSR

현재 프로젝트는 어댑터 없는 순수 정적 빌드(`astro build` → static HTML)다.
조회수 증가/저장에는 서버 실행 환경이 필요하므로 `@astrojs/vercel` 어댑터를 추가한다.

- 기존 모든 페이지는 그대로 정적(prerender)으로 유지한다.
- `/api/views` 엔드포인트만 `export const prerender = false`로 Vercel 서버리스 함수로 동작한다.
- 사이트 구조/성능에 영향 없음.

## 아키텍처

### 저장소 (Upstash Redis)

- SDK: `@upstash/redis`
- 키 스킴: `views:{collection}:{id}` (정수)
  - 예: `views:blog:auth-architecture-retrospective`, `views:knowledge:harness-design-for-long-running-agents`
- 연결: 환경변수 **`KV_REST_API_URL`**, **`KV_REST_API_TOKEN`** (Vercel KV 스타일 이름으로 주입됨). `Redis.fromEnv()`는 `UPSTASH_*` 이름을 찾으므로 사용 불가 → `new Redis({ url, token })`로 명시 생성.
  - 프로덕션: Vercel Marketplace Upstash 연동으로 자동 주입.
  - 로컬: `.env`에 동일 값 등록(완료). 없으면 엔드포인트는 graceful하게 빈 결과 반환.

### API 엔드포인트 (Astro on-demand, `prerender = false`)

슬러그 표기는 `{collection}/{id}` 형식의 문자열을 쓰고, 내부에서 Redis 키 `views:{collection}:{id}`로 변환한다.

1. **`POST /api/views`**
   - 입력: `{ "slug": "blog/auth-architecture-retrospective" }`
   - 동작: `INCR views:{collection}:{id}`
   - 출력: `{ "slug": "...", "count": <number> }`
   - 호출: 글 본문 페이지에서 세션 중복 제거 통과 시 1회

2. **`GET /api/views?slugs=blog/a,knowledge/b`**
   - 동작: `MGET` 으로 여러 키 일괄 조회
   - 출력: `{ "counts": { "blog/a": 12, "knowledge/b": 3 } }`
   - 호출: 목록 페이지가 화면의 모든 카드 슬러그를 모아 1회

유효성: 알 수 없는/형식이 틀린 슬러그는 무시. `slug`는 `^(blog|knowledge)/[a-z0-9-]+$` 형태만 허용해 키 인젝션 방지.

### +1 트리거 (글 본문 페이지)

- 위치: 글 본문 레이아웃에 슬러그를 주입하는 작은 클라이언트 스크립트.
- 흐름:
  1. `sessionStorage["viewed:{slug}"]` 확인
  2. 있으면 아무 것도 안 함
  3. 없으면 `POST /api/views` 호출 후 플래그 기록 (fire-and-forget, 응답으로 DOM 갱신 없음 — 본문엔 숫자 미표시)
- prefetch로 인한 부풀림은 "실제 navigation 시 스크립트 실행 + 세션 중복 제거"로 완화.

### 카드 표시

- 카드는 정적 HTML이므로 placeholder만 렌더: `<span data-views-slug="{collection}/{id}">` (초기엔 빈 자리, 깜빡임 방지).
- 목록 페이지의 공유 클라이언트 스크립트:
  1. 페이지 내 모든 `[data-views-slug]` 수집
  2. 슬러그를 모아 `GET /api/views?slugs=...` 1회 호출
  3. 받은 카운트를 각 placeholder에 `eye` 아이콘 + 포맷된 숫자로 채움
- 숫자 포맷: 1,000 이상은 `1.2k` 식 축약.
- 실패 시: placeholder를 숨겨 레이아웃이 깨지지 않게 함.

## 표시 디자인 상세

- **BlogCard**: 기존 메타 줄(`날짜 · 읽기시간`) 끝에 ` · [eye] 123` 추가. 메타 줄은 이미 `flex-wrap` → 576px 이하 모바일에서 자연 줄바꿈, 잘림 없음.
- **KnowledgeCard / KnowledgeTile**: `갱신일 X` 줄에 ` · [eye] 123` 추가.
- 아이콘: lucide `eye`, 텍스트와 동일한 `text-muted-foreground text-xs` 톤.

## 에러 처리

- Redis 연결/조회 실패: API는 빈 결과 또는 에러 코드 반환, 카드는 placeholder 숨김.
- +1 실패: 조용히 무시(사용자 경험에 영향 없음).
- 환경변수 미설정(로컬): 엔드포인트가 빈 결과 반환, 사이트는 정상 동작.

## 컴포넌트 경계

| 단위 | 역할 | 의존성 |
|------|------|--------|
| `src/lib/redis.ts` | Upstash 클라이언트 생성(없으면 null) | `@upstash/redis`, env |
| `src/pages/api/views.ts` | GET(일괄 조회)·POST(+1) 엔드포인트 | `redis.ts` |
| `src/lib/views.ts` (client) | placeholder 수집 → GET → 채우기, 숫자 포맷 | fetch, DOM |
| 본문 +1 스크립트 | 세션 중복 제거 + POST | fetch, sessionStorage |
| `BlogCard`/`KnowledgeCard`/`KnowledgeTile` | placeholder span 렌더 | — |

## 테스트 관점

- 슬러그 검증 정규식: 허용/거부 케이스.
- 숫자 포맷 함수: 999 → "999", 1200 → "1.2k", 0/undefined 처리.
- 세션 중복 제거 로직: 두 번째 호출이 POST를 보내지 않는지.
- API: env 없을 때 graceful 반환.

## 모바일 반응형 (CLAUDE.md 준수)

메타 줄은 `flex-wrap`이라 항목 추가 시 576px 이하에서 줄바꿈으로 처리됨. 구현 후 모바일 폭에서 카드 레이아웃 깨짐 없는지 확인.

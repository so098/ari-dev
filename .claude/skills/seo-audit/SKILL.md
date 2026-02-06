---
name: seo-audit
description: 블로그의 SEO 인프라(메타 태그, canonical, sitemap, robots.txt 등)를 감사합니다.
allowed-tools: Read, Glob, Grep, Bash(npm run build *)
disable-model-invocation: true
---

# SEO 인프라 감사

블로그의 SEO 인프라/컴포넌트 레벨의 건전성을 검사한다.
콘텐츠(frontmatter) 최적화는 `seo-optimize` 스킬이 담당하므로, 이 스킬은 **인프라** 수준의 문제만 감지한다.
수정은 하지 않고 보고만 한다. 수정이 필요하면 사용자에게 안내한다.

## 감사 항목

아래 8개 항목을 순서대로 검사한다.

### 1. Canonical URL 검사

- `src/components/PostHead.astro`와 `src/components/PageHead.astro`를 읽는다.
- `<link rel="canonical" ...>` 태그의 `href` 값이 `Astro.url`을 사용하는지 확인한다.
- `SITE.href`를 직접 하드코딩하여 canonical URL을 조합하고 있으면 **Fail**로 판정한다.
  - 예시 (Fail): `href={\`${SITE.href}/blog/...\`}`
  - 예시 (Pass): `href={Astro.url}`

### 2. OG 메타 태그 완전성

**PostHead.astro** 에서 아래 필수 태그 존재 여부를 확인한다:
- OG 태그: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale`, `og:site_name`
- Article 태그: `article:published_time`, `article:author`
- 누락된 태그가 있으면 **Warn**으로 보고한다.

**PageHead.astro** 에서 아래 필수 태그 존재 여부를 확인한다:
- OG 태그: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale`, `og:site_name`
- 누락된 태그가 있으면 **Warn**으로 보고한다.

> Twitter 메타 태그는 의도적으로 제거되었으므로 검사하지 않는다.

### 3. 사이트 설정 일관성

- `src/consts.ts`에서 `SITE.href` 값을 읽는다.
- `astro.config.ts`에서 `site` 값을 읽는다.
- 두 값이 일치하지 않으면 **Fail**로 판정한다 (trailing slash 차이는 무시).

### 4. robots.txt 검증

- `src/pages/robots.txt.ts` 파일이 존재하는지 확인한다. 없으면 **Fail**.
- `npm run build`를 실행한 뒤 `dist/robots.txt` 파일을 읽어 `Sitemap:` URL이 포함되어 있는지 확인한다.
  - 포함되지 않으면 **Warn**.

### 5. Sitemap 검증

- `astro.config.ts`를 읽어 `@astrojs/sitemap` 통합이 설정되어 있는지 확인한다.
  - `sitemap()` 호출이 `integrations` 배열에 없으면 **Fail**.
- `src/components/Head.astro`에 `<link rel="sitemap" ...>` 태그가 존재하는지 확인한다.
  - 없으면 **Warn**.

### 6. RSS 피드 검증

- `src/pages/rss.xml.ts` 파일이 존재하는지 확인한다. 없으면 **Fail**.
- `src/components/Head.astro`에 `<link rel="alternate" type="application/rss+xml" ...>` 태그가 존재하는지 확인한다.
  - 없으면 **Warn**.

### 7. 매니페스트 검사

- `public/site.webmanifest`를 읽는다.
- `src/consts.ts`에서 `SITE.title` 값을 읽는다.
- `name`과 `short_name` 필드가 `SITE.title` 값과 일치하는지 확인한다.
  - 일치하지 않으면 **Warn** (브랜딩 불일치).

### 8. JSON-LD 구조화된 데이터 검증

- `src/components/PostHead.astro`를 읽어 `BlogPosting` 타입의 JSON-LD (`<script type="application/ld+json">`)가 존재하는지 확인한다.
  - 필수 필드: `headline`, `datePublished`, `author`, `publisher`
  - JSON-LD가 없거나 필수 필드가 누락되면 **Fail**.
- `src/components/PageHead.astro`를 읽어 `WebSite` 타입의 JSON-LD가 존재하는지 확인한다.
  - 필수 필드: `name`, `url`
  - JSON-LD가 없거나 필수 필드가 누락되면 **Fail**.

## 결과 보고 형식

모든 검사를 마친 뒤, 아래 형식의 표로 결과를 보고한다:

```
## SEO 인프라 감사 결과

| 항목 | 상태 | 비고 |
|------|------|------|
| Canonical URL | Pass/Fail | 세부 내용 |
| OG 메타 태그 | Pass/Warn | 세부 내용 |
| 사이트 설정 일관성 | Pass/Fail | 세부 내용 |
| robots.txt | Pass/Warn/Fail | 세부 내용 |
| Sitemap | Pass/Warn/Fail | 세부 내용 |
| RSS 피드 | Pass/Warn/Fail | 세부 내용 |
| 매니페스트 | Pass/Warn | 세부 내용 |
| JSON-LD 구조화된 데이터 | Pass/Fail | 세부 내용 |
```

### 상태 기준
- **Pass**: 문제 없음
- **Warn**: 동작하지만 개선 권장
- **Fail**: SEO에 악영향, 즉시 수정 필요

Fail이나 Warn 항목이 있으면 수정 방안을 간단히 안내한다.
수정은 직접 수행하지 않는다.

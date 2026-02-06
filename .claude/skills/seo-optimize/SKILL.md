---
name: seo-optimize
description: 블로그 글의 frontmatter(description, tags)를 SEO에 맞게 개선합니다. 새 글을 작성했거나 검색 최적화가 필요할 때 사용하세요.
argument-hint: "[slug]"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Edit, Bash(npm run build *)
---

# 블로그 SEO 메타 최적화

블로그 글의 frontmatter(description, tags)를 분석하고 검색 엔진 최적화에 맞게 개선합니다.

## 대상 파일 파악

- 인자가 없으면 `src/content/blog/` 아래 모든 `index.md` / `index.mdx` 파일을 스캔한다.
- 인자(`$ARGUMENTS`)가 있으면 `src/content/blog/$ARGUMENTS/index.{md,mdx}` 파일만 대상으로 한다.

## 분석 기준

### description 검사
- 현재 description 글자 수를 센다.
- **80자 미만**이면 "개선 필요"로 판정한다.
- 본문 전체를 읽고, 글의 핵심 내용/기술 스택/결론을 반영하여 **80~120자** 사이의 새 description을 작성한다.
- description은 한국어 문장형으로, 마침표로 끝나야 한다.
- 단순 요약이 아닌 **검색 클릭을 유도하는 문장**으로 쓴다.

### tags 검사
- tags 필드가 없거나 빈 배열이면 "태그 필요"로 판정한다.
- 본문 내용을 기반으로 **2~4개** 태그를 추천한다.
- 태그는 영문 소문자 케밥케이스로 작성한다. (예: `side-project`)
- 기존에 사용된 태그 어휘를 우선 재활용하여 태그 파편화를 방지한다.

**현재 사용 중인 태그 어휘** (새 태그를 만들어도 되지만 아래 목록에 해당하는 것이 있으면 우선 사용):
```
frontend, career, nextjs, devops, docker, documentation,
webhook, polling, database, postgresql, supabase,
side-project, performance, react
```

### 본문 이상 검사
- 다른 글의 본문이 복붙되어 섞여 있지 않은지 확인한다.
- frontmatter YAML 문법 오류가 없는지 확인한다. (예: 작은따옴표 중첩)

## 결과 보고

수정 **전에** 아래 형식으로 변경 사항을 사용자에게 보여주고 승인을 받는다.

```
## SEO 최적화 결과

| 파일 | description | tags | 비고 |
|------|-------------|------|------|
| slug | 유지 / 개선 (25자->92자) | 유지 / 추가 | 이상 없음 / 문제 발견 |
```

## 승인 후 적용
1. 사용자가 승인하면 각 파일의 frontmatter를 수정한다.
2. `npm run build`를 실행하여 빌드가 정상인지 확인한다.
3. 빌드 실패 시 원인을 파악하고 수정한다.

## 수정하지 않는 필드
- title (작성자 의도 존중)
- date, image, authors 등 다른 필드
- 기존 tags는 제거하지 않고 필요 시 추가만 한다.
- draft: true인 글도 대상에 포함한다 (발행 전 최적화).

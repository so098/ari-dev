---
title: "JavaScript Weekly 주간 압축 요약 (2026-W06)"
description: "JavaScript Weekly 주요 소식을 한 주 단위로 압축 정리한 글"
category: "javascript-weekly"
updated: "2026-02-02"
---

## 이번 주 핵심 요약

이번 JavaScript Weekly #788은 npm 패키지 보안 점검, 협업 백엔드, date-fns의 패키지 경량화와 Temporal 준비, npm install script 정책 같은 공급망 보안 이슈가 중심입니다. React/Next/Vercel/Overreacted 전용 링크는 요청 기준에 따라 제외했습니다.

## 링크별 정리

### 1. [JavaScript Weekly Issue 788: June 2, 2026](https://javascriptweekly.com/issues/788)

- 이번 호의 메인 흐름은 “패키지 신뢰성 검증”과 “JS 생태계 보안”입니다.
- 주요 기사로 **“How to Evaluate an npm Package: 2026 Edition”**가 소개됐습니다. 단순히 GitHub 스타 수나 다운로드 수만 보는 대신, provenance attestation, install script, CI 품질, 메인테이너 응답성 등을 함께 확인하라는 실무형 체크리스트 성격의 글입니다.
- 보안 측면에서는 Shai-Hulud 관련 이슈로 Red Hat npm 패키지 다수가 백도어에 노출됐다는 소식이 언급됐고, npm 11.16.0의 `allowScripts` 기반 install-script 정책 지원도 함께 소개됐습니다.
- 릴리스 섹션에서는 Ember 7.0, Node.js 26.3.0, Astro 6.4, pnpm 11.5.x, ESLint 10.4.1, Angular 22 RC3 등이 다뤄졌습니다.

### 2. [Hocuspocus](https://github.com/ueberdosis/hocuspocus)

- Hocuspocus는 **Yjs 기반 실시간 협업 백엔드**입니다.
- WebSocket 서버를 빠르게 붙여 다중 사용자 협업 기능을 구현할 수 있도록 설계되어 있으며, 문서 편집·화이트보드·협업형 UI 같은 기능에 적합합니다.
- 예시 코드에서는 `@hocuspocus/server`와 SQLite 확장을 사용해 간단히 서버를 띄우는 흐름을 보여줍니다.
- JavaScript Weekly에서는 “Node, Bun, Deno, Cloudflare Workers에서 실행 가능한 plug-and-play 협업 백엔드”로 소개됐습니다.

### 3. [date-fns v4.4.0](https://github.com/date-fns/date-fns/releases/tag/v4.4.0)

- date-fns v4.4.0은 CDN 사용 방식을 재정비하고, 새 패키지인 `@date-fns/cdn`을 도입했습니다.
- 기존 `date-fns` CDN 스크립트는 deprecated 처리됐으며, 다음 메이저 버전에서 제거될 예정입니다.
- 이 변경으로 압축 패키지 크기가 약 **5.83MB → 3.96MB**로 줄었습니다.
- v5.0.0-alpha.0에서는 CDN 스크립트를 완전히 제거해 약 **2.89MB**까지 줄어든다고 소개됐습니다.
- JavaScript Weekly 본문에서는 date-fns가 “Temporal-first library” 방향을 준비 중이라고 요약했습니다.

## 요약 불가/검증 필요 링크

아래 링크들은 JavaScript Weekly 맥락상 중요해 보이지만, 제공된 script 데이터에 충분한 본문 추출 결과가 없어 세부 요약은 보류합니다.

### 4. [npm CLI v11.16.0](https://github.com/npm/cli/releases/tag/v11.16.0)

- 사유: 본문 추출 데이터가 제공되지 않아 품질게이트를 충족하지 못함.
- 확인 필요 포인트: `allowScripts` 기반 install-script 정책의 실제 동작 범위와 기본값.

### 5. [npm CLI PR #9360](https://github.com/npm/cli/pull/9360)

- 사유: 본문 추출 데이터가 제공되지 않아 품질게이트를 충족하지 못함.
- 확인 필요 포인트: npm의 install script allowlist 정책 구현 세부사항.

### 6. [Node.js PR #63055](https://github.com/nodejs/node/pull/63055)

- 사유: 본문 추출 데이터가 제공되지 않아 품질게이트를 충족하지 못함.
- 확인 필요 포인트: Node.js 26.3.0 관련 변경 중 JavaScript 런타임/툴링에 직접 영향이 있는 항목.

### 7. [pnpm v11.5.0](https://github.com/pnpm/pnpm/releases/tag/v11.5.0)

- 사유: 본문 추출 데이터가 제공되지 않아 품질게이트를 충족하지 못함.
- 확인 필요 포인트: 패키지 매니저 동작 변경, 보안 정책, lockfile 또는 workspace 관련 변경.

### 8. [Meticulous AI](https://www.meticulous.ai/?utm_source=jsweekly&utm_medium=newsletter&utm_campaign=26q2&utm_content=primary)

- 사유: 접근은 가능하지만 `extract_len=0`으로 본문 추출이 부족함.
- 비고: JavaScript Weekly 내 스폰서 링크로, 자동 프론트엔드/E2E 테스트 생성 도구로 소개됐지만 script 근거만으로는 세부 기능 검증이 어렵습니다.

---
title: "JavaScript Weekly 주간 압축 요약 (2026-W25)"
description: "JavaScript Weekly 주요 소식을 한 주 단위로 압축 정리한 글"
category: "javascript-weekly"
updated: "2026-06-15"
---

# JavaScript Weekly Draft — 2026-W25

## TL;DR
- 이번 주 핵심은 **VoidZero의 Cloudflare 합류**입니다. Vite, Vitest, Rolldown, Oxc 생태계의 지속 가능성 문제가 Cloudflare의 인프라/자금 지원과 만났고, 프로젝트는 MIT 라이선스와 기존 리더십을 유지한다고 밝혔습니다.
- **Angular v22**는 Signal Forms, Angular Aria, asynchronous reactivity를 stable/production-ready 단계로 올렸고, 라우터는 브라우저 Navigation API 실험 지원을 시작했습니다.
- **브라우저/런타임 성능 축**도 움직입니다. Safari 27 beta는 ESM loader 재작성과 Wasm JSPI를, Electron 43 beta는 Node snapshot/V8 bytecode/LTO 기반 성능 개선을 예고했습니다.
- 지난 이슈에서 이어진 **공급망 보안, RSC 보안, Next.js 16.2 플랫폼/AI 개선**은 여전히 실무 점검 우선순위입니다.

## 중요도 맵(🔴🟡🟢)
- 🔴 **즉시 점검**
  - React Server Components 보안 공지: RSC 사용 프로젝트는 DoS/소스코드 노출 취약점 패치 상태와 프레임워크별 권장 버전을 재확인.
  - npm 공급망 보안: npm `allowScripts`, staged publishing, provenance/CI/메인테이너 신뢰도 기준을 의존성 검토 체크리스트에 반영.
- 🟡 **이번 스프린트 내 검토**
  - VoidZero → Cloudflare: Vite/Vitest/Rolldown/Oxc 의존 팀은 릴리스·거버넌스·Cloudflare 생태계 연계 변화를 추적.
  - Angular v22: Signal Forms, Angular Aria, async reactivity를 신규/마이그레이션 프로젝트 후보로 검토.
  - Next.js 16.2 Adapter API: Vercel 외 Netlify/Cloudflare/AWS Amplify/Google Cloud 배포 전략이 있는 팀은 adapter test suite 흐름 확인.
  - AI-assisted development: Next.js의 `AGENTS.md`, 브라우저 로그 포워딩, agent diagnostics와 “strict-but-fast feedback loop”를 개발 환경에 적용 검토.
- 🟢 **관찰/참고**
  - Safari 27 beta: ESM top-level await 개선과 WebAssembly JSPI 지원은 프론트엔드/wasm 앱 테스트 매트릭스에 추가.
  - Electron 43 beta: 데스크톱 앱의 cold start/번들 성능 개선 가능성 관찰.
  - React Foundation: React/React Native/JSX의 독립 재단 이전은 장기 거버넌스 변화로 추적.
  - Vercel Blob/Workflow SDK 변경: Hobby Blob store 한도 확대와 Nitro v3 native workflow는 소규모 프로젝트/서버 런타임 선택지에 영향.

## 링크별 한줄 요약 TOP 8-10
1. [JavaScript Weekly #789](https://javascriptweekly.com/issues/789) — VoidZero의 Cloudflare 합류, Angular v22, Safari 27 beta, Electron 43 beta, React Compiler Rust port, TanStack Table v9 beta 등 이번 주 중심 뉴스.
2. [JavaScript Weekly #788](https://javascriptweekly.com/issues/788) — npm 패키지 평가법, Hocuspocus 4, date-fns Temporal-first 전환, Shai-Hulud 계열 공급망 이슈, npm `allowScripts`를 다룸.
3. [JavaScript Weekly #787](https://javascriptweekly.com/issues/787) — npm/pnpm staged publishing, Expo UI stable, Firefox Web Serial, Chrome declarative partial updates, Storybook 10.4 흐름 정리.
4. [React Foundation 출범](https://react.dev/blog/2026/02/24/the-react-foundation) — React, React Native, JSX가 Meta 소유에서 Linux Foundation 산하 React Foundation으로 이전.
5. [React Server Components 보안 공지](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) — RSC 관련 DoS/소스코드 노출 취약점이 공개되어 React/프레임워크 버전 재점검 필요.
6. [Next.js Across Platforms](https://nextjs.org/blog/nextjs-across-platforms) — Next.js 16.2의 stable Adapter API와 공개 adapter test suite로 멀티 플랫폼 배포 일관성을 강화.
7. [Next.js 16.2 AI Improvements](https://nextjs.org/blog/next-16-2-ai) — `create-next-app`의 `AGENTS.md`, 브라우저 로그 포워딩, dev server lock file, agent debugging 도구를 추가.
8. [Vercel Blob store Hobby 한도 확대](https://vercel.com/changelog/increased-blob-store-limit-for-hobby-users) — Hobby 사용자의 Blob store 생성 한도가 5개에서 100개로 늘어 프로젝트/환경별 저장소 분리가 쉬워짐.
9. [Vercel Workflow SDK Nitro v3 native beta](https://vercel.com/changelog/workflow-sdk-now-runs-natively-in-nitro-v3) — Workflow step이 별도 번들이 아니라 Nitro 앱 런타임 안에서 실행되어 `useStorage()` 등 서버 API를 직접 활용 가능.
10. [Introducing RSC Explorer](https://overreacted.io/introducing-rsc-explorer/) — React Server Components 프로토콜을 눈으로 탐색하며 RSC 직렬화/역직렬화 흐름을 이해할 수 있는 참고 프로젝트.

## 실무 액션 체크리스트
- [ ] RSC 사용 여부를 확인하고 React/Next 등 관련 패키지의 보안 권장 버전을 최신으로 맞춘다.
- [ ] 신규 npm 패키지 도입 기준에 provenance, install script, CI 신뢰도, maintainer responsiveness, staged publishing 지원 여부를 추가한다.
- [ ] Vite/Vitest/Rolldown/Oxc 의존도가 높은 저장소는 VoidZero/Cloudflare 합류 이후 릴리스 노트와 로드맵을 모니터링한다.
- [ ] Angular 프로젝트는 v22의 Signal Forms/Angular Aria/async reactivity 안정화 범위와 마이그레이션 비용을 검토한다.
- [ ] Next.js를 Vercel 외 플랫폼에 배포한다면 Adapter API와 OpenNext 호환성 테스트를 CI 후보로 올린다.
- [ ] AI 코딩 에이전트 사용 저장소는 `AGENTS.md`, 테스트 명령, 브라우저 로그 수집, 빠른 피드백 루프를 명시한다.
- [ ] Safari 27 beta/Electron 43 beta 대상 앱은 ESM top-level await, Wasm JSPI, startup performance 회귀 테스트 항목을 준비한다.
- [ ] Vercel Hobby/ Nitro 사용 프로젝트는 Blob store 구성과 Workflow SDK native runtime 전환 가능성을 확인한다.

## 용어 정리 콜아웃
> **VoidZero**: Evan You가 만든 JS tooling 회사로 Vite, Vitest, Rolldown, Oxc 등 현대 프론트엔드 빌드/테스트 도구 생태계와 연결되어 있습니다.
>
> **Signal Forms / asynchronous reactivity**: Angular v22에서 안정화된 반응형 상태·폼 관련 기능 축입니다. 폼 상태와 비동기 반응성 처리를 프레임워크 기본 모델에 더 가깝게 통합합니다.
>
> **JSPI(JavaScript Promise Integration)**: WebAssembly와 JavaScript Promise를 더 자연스럽게 연결하기 위한 Wasm 기능입니다. Safari 27 beta에서 지원이 추가되었습니다.
>
> **Adapter API / OpenNext**: Next.js 앱을 여러 호스팅 플랫폼에 일관되게 배포하기 위한 인터페이스와 생태계 구현입니다.
>
> **staged publishing / allowScripts**: npm 패키지 릴리스 전 검토 단계를 두거나 설치 스크립트 실행을 정책적으로 제한해 공급망 공격 위험을 낮추는 메커니즘입니다.

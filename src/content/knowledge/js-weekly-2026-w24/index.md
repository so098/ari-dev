---
title: "JavaScript Weekly 주간 압축 요약 (2026-W24)"
description: "JavaScript Weekly 주요 소식을 한 주 단위로 압축 정리한 글"
category: "javascript-weekly"
updated: "2026-06-08"
---

# JavaScript Weekly Draft — 2026-W24

## TL;DR
- 이번 컨텍스트의 핵심은 **npm 패키지 검증과 공급망 보안**입니다. JavaScript Weekly #788은 provenance, install script 정책, CI/메인테이너 신뢰도까지 포함해 의존성 평가 기준을 재정비하라고 강조합니다.
- **React Server Components 보안 패치**는 이미 패치한 팀도 재확인이 필요합니다. 19.0.3/19.1.4/19.2.3 패치는 불완전하다고 공지되어 추가 업그레이드가 요구됩니다.
- **Next.js 16.2**는 배포 플랫폼 호환성을 위한 Adapter API와 AI 에이전트 친화 개발 흐름을 동시에 밀고 있습니다.
- **Hocuspocus 4, date-fns 4.4/5 alpha, Vercel Sandbox Drives**는 협업 기능, 날짜 처리, 에이전트 워크스페이스 운영 측면에서 관찰 가치가 있습니다.

## 중요도 맵(🔴🟡🟢)
- 🔴 **즉시 점검**
  - React Server Components DoS/소스코드 노출 취약점: React/Next 기반 RSC 사용 프로젝트는 버전 재확인 및 재패치 필요.
  - npm 패키지 공급망 보안: backdoored npm 패키지 사례와 npm `allowScripts` 정책 등장으로 설치 스크립트 통제가 실무 과제가 됨.
- 🟡 **이번 스프린트 내 검토**
  - Next.js Across Platforms: stable Adapter API, 공개 adapter test suite, OpenNext 협업으로 멀티 플랫폼 배포 안정성 개선.
  - Next.js 16.2 AI 개선: `AGENTS.md`, 브라우저 로그 포워딩, dev server lock file, agent diagnostics가 AI 코딩 워크플로에 직접 영향.
  - Hocuspocus: Yjs 기반 실시간 협업 백엔드로 협업형 문서/화이트보드/에디터 기능 후보.
  - date-fns 4.4/5 alpha: CDN 전략 변경, 패키지 경량화, Temporal-first 방향 전환.
- 🟢 **관찰/참고**
  - React Foundation 출범: React/React Native/JSX가 Meta 소유에서 Linux Foundation 산하 독립 재단으로 이전.
  - Vercel Sandbox Drives: disposable sandbox와 분리된 persistent drive로 에이전트 작업공간 유지 가능.
  - skills.sh API: Vercel OIDC 기반으로 OSS skill 메타데이터 조회 가능.
  - RSC Explorer / Social Filesystem: RSC 프로토콜과 “format over apps” 사고를 이해하는 참고 자료.

## 링크별 한줄 요약 TOP 8-10
1. [JavaScript Weekly #788](https://javascriptweekly.com/issues/788) — npm 패키지 평가 체크리스트, Shai-Hulud 계열 공급망 이슈, npm `allowScripts`, Ember/Node/Astro/pnpm/Angular 릴리스를 한 번에 짚은 이번 주 중심 링크.
2. [React Server Components 보안 공지](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) — RSC에서 DoS와 소스코드 노출 취약점이 추가 공개되어 기존 패치 팀도 최신 안전 버전으로 재업그레이드해야 함.
3. [Next.js Across Platforms](https://nextjs.org/blog/nextjs-across-platforms) — Next.js 16.2의 stable Adapter API와 adapter test suite로 Vercel 외 플랫폼 배포 일관성을 높이려는 공식 방향.
4. [Next.js 16.2 AI Improvements](https://nextjs.org/blog/next-16-2-ai) — `create-next-app`의 `AGENTS.md`, 브라우저 로그 터미널 전달, lock file, agent DevTools로 AI 에이전트 디버깅 경험을 강화.
5. [Hocuspocus](https://github.com/ueberdosis/hocuspocus) — Yjs 기반 CRDT WebSocket 백엔드로 Node/Bun/Deno/Cloudflare Workers에서 실시간 협업 기능을 빠르게 붙일 수 있음.
6. [date-fns v4.4.0](https://github.com/date-fns/date-fns/releases/tag/v4.4.0) — `@date-fns/cdn` 도입과 CDN script deprecation으로 zip 크기를 줄이고 v5의 CDN 제거/Temporal-first 전환을 예고.
7. [React Foundation 출범](https://react.dev/blog/2026/02/24/the-react-foundation) — React, React Native, JSX가 Linux Foundation 산하 React Foundation으로 이전되어 거버넌스 독립성이 강화됨.
8. [Vercel Sandbox Drives](https://vercel.com/changelog/drives-for-vercel-sandbox-in-private-beta) — sandbox 생명주기와 분리된 attachable storage로 에이전트 작업공간, repo/dependency/build cache 유지에 유용.
9. [skills.sh API](https://vercel.com/changelog/the-skills-sh-api-is-now-available) — Vercel OIDC 토큰으로 60만 개 이상 오픈소스 skill 검색·보안 감사 정보를 조회할 수 있는 API.
10. [Introducing RSC Explorer](https://overreacted.io/introducing-rsc-explorer/) — 문서화가 제한적인 RSC wire format과 직렬화 흐름을 실험적으로 이해할 수 있는 학습용 도구.

## 실무 액션 체크리스트
- [ ] RSC/Next.js 사용 저장소에서 `react`, `react-dom`, framework patch version을 확인하고 취약 버전 또는 불완전 패치(19.0.3/19.1.4/19.2.3) 사용 여부를 점검한다.
- [ ] npm 의존성 신규 도입 체크리스트에 provenance attestation, install script 유무, CI 상태, 릴리스 빈도, 메인테이너 응답성, 보안 이슈 처리 내역을 추가한다.
- [ ] `npm 11.16.0`의 `allowScripts` 정책을 샘플 프로젝트에서 시험하고, monorepo/CI에 적용 가능한 allowlist 운영 방식을 정한다.
- [ ] Next.js를 Vercel 외 플랫폼에 배포 중이면 Adapter API 및 OpenNext adapter test suite 적용 가능성을 확인한다.
- [ ] AI 코딩 에이전트를 쓰는 Next.js 프로젝트는 `AGENTS.md`와 브라우저 로그 포워딩을 개발 템플릿에 반영할지 검토한다.
- [ ] 실시간 협업 기능 후보가 있으면 Hocuspocus/Yjs 기반 PoC 범위와 persistence/authorization 설계를 분리해 검토한다.
- [ ] date-fns를 CDN script 방식으로 쓰는 레거시 화면이 있는지 확인하고 `@date-fns/cdn` 또는 번들러 기반 import로 이전 계획을 세운다.
- [ ] sandbox 기반 에이전트 실행 환경을 운영한다면 persistent workspace 요구사항과 Vercel Sandbox Drives beta 제약(동시 read-write 1개 등)을 기록한다.

## 용어 정리 콜아웃
> **Provenance attestation**: 패키지가 어떤 소스/빌드 파이프라인에서 생성됐는지 검증 가능한 증명. npm 공급망 공격 대응에서 중요하다.
>
> **Install script policy / allowScripts**: 패키지 설치 중 실행되는 스크립트를 기본 허용하지 않고 명시적으로 허용 목록화하는 정책. 악성 postinstall 공격을 줄이는 데 목적이 있다.
>
> **React Server Components(RSC)**: 서버에서 React 트리를 직렬화해 클라이언트와 조합하는 React 아키텍처. 성능 장점이 있지만 프로토콜/런타임 취약점 대응이 중요하다.
>
> **Adapter API**: 프레임워크 빌드 결과를 다양한 배포 플랫폼이 동일한 계약으로 실행할 수 있게 하는 인터페이스. Next.js 16.2에서 안정화됐다.
>
> **CRDT / Yjs**: 여러 사용자가 동시에 편집해도 충돌 없이 상태를 병합하기 위한 데이터 구조/라이브러리. Hocuspocus는 Yjs 기반 협업 백엔드다.
>
> **Temporal**: JavaScript의 차세대 날짜/시간 API. date-fns는 Temporal-first 방향을 준비하고 있다.

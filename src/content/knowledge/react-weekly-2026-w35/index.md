---
title: "React 주간 요약 (2026-W35)"
description: "이번 주 React 생태계 업데이트를 링크별로 한국어로 정리했습니다."
category: "react-weekly"
updated: "2026-08-24"
---

## 이번 주 선정 기준

script로 수집된 링크 중 `react.dev`, `overreacted.io`, 그리고 React 생태계 관련 링크만 골랐습니다. JavaScript 일반, Bun, Next.js 전용, Vercel 제품 소식은 제외했습니다.

## 링크별 정리

### 1. The React Foundation: A New Home for React Hosted by the Linux Foundation

- 링크: https://react.dev/blog/2026/02/24/the-react-foundation
- 출처: React Blog

React Foundation이 Linux Foundation 산하에서 공식 출범했습니다. 이에 따라 React, React Native, JSX 등 관련 프로젝트의 소유권은 Meta가 아니라 독립 재단인 React Foundation으로 이전됩니다.

창립 플래티넘 멤버로는 Amazon, Callstack, Expo, Huawei, Meta, Microsoft, Software Mansion, Vercel이 참여합니다. 재단은 각 멤버 대표로 구성된 이사회가 운영하며, Seth Webster가 전무이사 역할을 맡습니다.

기술적 방향성은 재단 이사회와 분리됩니다. React의 기술 거버넌스는 React에 기여하고 유지보수하는 사람들을 중심으로 독립적으로 운영될 예정이며, 이를 구체화하기 위한 임시 리더십 위원회가 구성됐습니다.

앞으로는 기술 거버넌스 구조 확정, 저장소·웹사이트·인프라 이전, 생태계 지원 프로그램 검토, 다음 React Conf 준비가 진행될 예정입니다.

### 2. Denial of Service and Source Code Exposure in React Server Components

- 링크: https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components
- 출처: React Blog

React Server Components 관련 추가 보안 취약점이 공개됐습니다. 이전의 치명적 취약점 패치를 분석하는 과정에서 두 종류의 후속 취약점이 발견됐으며, 이번 이슈는 원격 코드 실행은 허용하지 않지만 즉시 업그레이드가 권장됩니다.

공개된 취약점은 다음과 같습니다.

- 서비스 거부(DoS), High Severity: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864
- 소스 코드 노출, Medium Severity: CVE-2025-55183

영향을 받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 19.0.0부터 19.2.3까지 여러 버전이 포함됩니다. 특히 이전 보안 대응으로 19.0.3, 19.1.4, 19.2.3으로 올린 경우에도 패치가 불완전하므로 다시 업그레이드해야 합니다.

수정 버전은 19.0.4, 19.1.5, 19.2.4로 백포트됐습니다. 서버를 사용하지 않는 React 앱이나, React Server Components를 지원하는 프레임워크·번들러·플러그인을 사용하지 않는 앱은 영향을 받지 않습니다.

### 3. There Are No Instances in atproto

- 링크: https://overreacted.io/there-are-no-instances-in-atproto/
- 출처: overreacted

Dan Abramov는 atproto를 Mastodon식 “인스턴스” 모델로 이해하려는 관점이 왜 맞지 않는지 설명합니다. 핵심은 atproto에서 사용자의 데이터가 특정 앱이나 인스턴스 안에 “거주”하는 것이 아니라, 호스팅과 앱/집계 계층이 분리된 구조라는 점입니다.

글은 RSS와 Google Reader 비유로 시작합니다. 블로그 글은 각자의 블로그에 존재하고, Google Reader나 Feedly 같은 앱은 그것을 모아 보여주는 투영 계층일 뿐입니다. 사용자의 글이 리더 앱 안에 사는 것은 아닙니다.

반면 전통적 소셜 네트워크는 호스팅, 앱, 피드를 하나의 폐쇄된 공간에 묶습니다. Mastodon은 이를 분산하기 위해 커뮤니티별 “작은 소셜 네트워크”인 인스턴스를 두는 방식에 가깝습니다.

atproto는 이와 다르게 호스팅과 앱을 분리해 생각해야 하며, 그래서 “Bluesky 인스턴스는 어디 있나?”라는 질문 자체가 범주 오류라는 것이 글의 요지입니다. React 자체 소식은 아니지만, React 커뮤니티의 주요 저자인 Dan Abramov가 웹 플랫폼과 소셜 프로토콜의 구조를 설명한 글로 React 생태계 관심사에 포함했습니다.

## 요약 불가/검증 필요 링크

### A Social Filesystem

- 링크: https://overreacted.io/a-social-filesystem/
- 이유: 접근은 가능하지만 `extract_len`이 0이고 `extract_text`가 없어 본문 추출이 부족합니다.

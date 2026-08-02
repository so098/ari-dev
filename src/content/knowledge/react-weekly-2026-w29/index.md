---
title: "React 주간 요약 (2026-W29)"
description: "이번 주 React 생태계 업데이트를 링크별로 한국어로 정리했습니다."
category: "react-weekly"
updated: "2026-07-13"
---

## 핵심 업데이트

이번 주에는 React의 거버넌스 변화와 React Server Components 보안 업데이트가 가장 중요합니다. React는 Meta 소유에서 Linux Foundation 산하 React Foundation으로 이전되었고, React Server Components 관련 추가 취약점에 대한 즉시 업그레이드 권고가 나왔습니다. Overreacted에서는 atproto의 구조를 RSS/소셜 네트워크 모델과 비교해 설명한 글이 공유되었습니다.

## 링크별 정리

### 1. [The React Foundation: A New Home for React Hosted by the Linux Foundation](https://react.dev/blog/2026/02/24/the-react-foundation)

React Foundation이 Linux Foundation 산하에서 공식 출범했습니다. 이에 따라 React, React Native, JSX 등 관련 프로젝트는 더 이상 Meta가 소유하지 않고, 독립 재단인 React Foundation이 소유하게 됩니다.

주요 내용은 다음과 같습니다.

- React Foundation의 플래티넘 창립 멤버는 Amazon, Callstack, Expo, Huawei, Meta, Microsoft, Software Mansion, Vercel입니다.
- 재단 이사회는 각 멤버사의 대표로 구성되며, Seth Webster가 executive director를 맡습니다.
- React의 기술적 방향은 재단 이사회와 분리되어 유지됩니다.
- 임시 리더십 카운슬이 구성되어 향후 기술 거버넌스 구조를 정할 예정입니다.
- 앞으로 저장소, 웹사이트, 인프라를 React Foundation으로 이전하고 React 생태계 지원 프로그램과 다음 React Conf 계획을 진행할 예정입니다.

React 생태계 관점에서는 매우 큰 구조적 변화입니다. React의 소유권과 운영 기반이 특정 기업 중심에서 독립 재단 중심으로 이동하면서, 장기적인 기술 거버넌스와 생태계 지원 방식이 더 명확해질 가능성이 큽니다.

### 2. [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)

React 팀은 React Server Components에서 추가 보안 취약점이 발견되었다고 공지했습니다. 기존 React2Shell 패치 이후 보안 연구자들이 인접 코드 경로를 검토하는 과정에서 새 취약점이 공개되었습니다.

공개된 취약점은 다음과 같습니다.

- Denial of Service: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, High Severity, CVSS 7.5
- Source Code Exposure: CVE-2025-55183, Medium Severity, CVSS 5.3

영향을 받는 패키지는 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

영향을 받는 버전은 19.0.0부터 19.2.3까지의 여러 릴리스이며, 19.0.3, 19.1.4, 19.2.3처럼 이전 취약점 대응을 위해 올린 버전도 불완전한 패치로 분류됩니다. 수정 버전은 19.0.4, 19.1.5, 19.2.4입니다.

실무적으로는 React Server Components를 사용하는 프레임워크, 번들러, 번들러 플러그인 환경인지 확인하고, 해당 패키지가 포함되어 있다면 즉시 고정 버전 이상으로 업그레이드해야 합니다. 서버를 사용하지 않는 React 앱이나 React Server Components를 지원하는 도구 체인을 사용하지 않는 앱은 영향 대상이 아니라고 안내되어 있습니다.

### 3. [There Are No Instances in atproto](https://overreacted.io/there-are-no-instances-in-atproto/)

Dan Abramov는 atproto를 Mastodon식 “인스턴스” 개념으로 이해하려는 질문이 왜 맞지 않는지 설명합니다. 글의 핵심은 atproto에서는 사용자가 특정 인스턴스 안에 “사는” 구조가 아니라는 점입니다.

글은 RSS와 Google Reader의 비유에서 출발합니다. 블로그 글은 각자의 블로그에 존재하고, Google Reader나 Feedly 같은 앱은 이를 모아 보여주는 집계 계층일 뿐입니다. 즉, 호스팅과 집계가 분리되어 있습니다.

이후 전통적 소셜 미디어는 이 구조를 하나의 닫힌 공간으로 묶으면서 중앙화된 네트워크가 되었고, Mastodon은 이를 여러 “작은 소셜 네트워크”, 즉 인스턴스로 나누는 방식으로 탈중앙화를 시도했다고 설명합니다. 반면 atproto는 이런 인스턴스 중심 모델과 다르게 설계되어 있으므로, “Bluesky 인스턴스가 어디 있느냐”는 질문 자체가 범주 오류라는 주장입니다.

React 자체 업데이트는 아니지만, React 커뮤니티에서 영향력이 큰 Overreacted의 글이며, 웹 플랫폼과 소셜 프로토콜 설계에 관심 있는 프론트엔드 개발자에게 유용한 맥락을 제공합니다.

## 요약 불가/검증 필요 링크

### [A Social Filesystem](https://overreacted.io/a-social-filesystem/)

- 사유: 본문 추출 부족
- `accessible=true`이지만 `extract_len=0`이고 `extract_text`가 없어 품질게이트를 통과하지 못했습니다.

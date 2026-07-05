---
title: "React 주간 요약 (2026-W27)"
description: "이번 주 React 생태계 업데이트를 링크별로 한국어로 정리했습니다."
category: "react-weekly"
updated: "2026-06-29"
---

## 이번 주 핵심

이번 주 React 생태계에서는 React의 거버넌스 변화, React Server Components 보안 업데이트, 그리고 atproto의 구조를 설명하는 글이 주요하게 확인되었습니다. Next.js 전용 업데이트와 JavaScript 일반 뉴스는 제외했습니다.

## 링크별 정리

### 1. [The React Foundation: A New Home for React Hosted by the Linux Foundation](https://react.dev/blog/2026/02/24/the-react-foundation)

React, React Native, JSX 등 React 관련 핵심 프로젝트의 소유권이 Meta에서 독립 조직인 React Foundation으로 이전되었습니다. React Foundation은 Linux Foundation 산하에서 출범했으며, Amazon, Callstack, Expo, Huawei, Meta, Microsoft, Software Mansion, Vercel이 플래티넘 창립 멤버로 참여합니다.

중요한 점은 기술적 의사결정과 재단 이사회가 분리된다는 것입니다. React의 기술 방향은 계속해서 React에 기여하고 유지보수하는 사람들을 중심으로 정해지며, 이를 구체화하기 위한 임시 리더십 위원회가 구성되었습니다.

향후 작업으로는 기술 거버넌스 구조 확정, 저장소·웹사이트·인프라 이전, 생태계 지원 프로그램 검토, 다음 React Conf 준비가 예정되어 있습니다.

### 2. [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)

React Server Components 관련 추가 취약점이 공개되었습니다. 이번 취약점은 원격 코드 실행 취약점은 아니지만, 서비스 거부(DoS)와 소스 코드 노출 위험을 포함합니다.

공개된 취약점은 다음과 같습니다.

- Denial of Service: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864
- Source Code Exposure: CVE-2025-55183

영향을 받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 영향을 받는 버전은 React 19.0.x, 19.1.x, 19.2.x 계열의 일부 버전입니다. 특히 기존에 19.0.3, 19.1.4, 19.2.3으로 업데이트한 경우에도 패치가 불완전하므로 다시 업데이트해야 합니다.

고정 버전은 19.0.4, 19.1.5, 19.2.4입니다. 서버를 사용하지 않는 React 앱이나 React Server Components를 지원하는 프레임워크·번들러·플러그인을 사용하지 않는 앱은 영향받지 않습니다.

### 3. [There Are No Instances in atproto](https://overreacted.io/there-are-no-instances-in-atproto/)

Dan Abramov는 atproto를 Mastodon식 “인스턴스” 개념으로 이해하려는 접근이 왜 맞지 않는지 설명합니다. 글의 핵심은 atproto에서 게시물의 저장 위치와 앱에서의 소비 경험이 분리되어 있다는 점입니다.

RSS와 Google Reader의 관계처럼, 사용자는 자신의 블로그나 저장 위치에 콘텐츠를 게시하고, 여러 앱은 이를 모아 보여주는 역할을 할 수 있습니다. 이 관점에서 앱은 콘텐츠가 “사는 곳”이 아니라, 콘텐츠를 보여주는 투영 또는 인터페이스에 가깝습니다.

글은 전통적인 중앙집중형 소셜 네트워크와 Mastodon식 인스턴스 모델을 비교하면서, atproto는 “어느 인스턴스 안에 산다”는 모델이 아니라 호스팅과 집계를 분리한 모델에 가깝다고 설명합니다. React 자체 업데이트는 아니지만, React 커뮤니티 주요 저자의 웹·소셜 아키텍처 해설로 생태계 관점에서 참고할 만합니다.

## 요약 불가/검증 필요 링크

### [A Social Filesystem](https://overreacted.io/a-social-filesystem/)

- 이유: 본문 추출 부족
- 근거: `accessible=true`이지만 `extract_len=0`, `extract_text=null`로 품질 게이트를 통과하지 못했습니다.

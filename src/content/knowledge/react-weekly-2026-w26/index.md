---
title: "React 주간 요약 (2026-W26)"
description: "이번 주 React 생태계 업데이트를 링크별로 한국어로 정리했습니다."
category: "react-weekly"
updated: "2026-06-22"
---

## 이번 주 핵심

- React, React Native, JSX 등 주요 프로젝트의 소유권이 Meta에서 **Linux Foundation 산하 React Foundation**으로 이전되었습니다.
- React Server Components 관련 **DoS 및 소스 코드 노출 취약점**이 추가 공개되어, 영향을 받는 패키지는 즉시 패치 버전으로 업그레이드가 필요합니다.
- Dan Abramov가 atproto의 구조를 Mastodon식 “인스턴스” 모델과 대비해 설명하며, 분산 소셜 시스템을 이해하는 관점을 정리했습니다.

## 링크별 정리

### 1. [The React Foundation: A New Home for React Hosted by the Linux Foundation](https://react.dev/blog/2026/02/24/the-react-foundation)

React Foundation이 공식 출범했으며, Linux Foundation이 이를 호스팅합니다. 이에 따라 React, React Native, JSX 및 관련 지원 프로젝트들은 더 이상 Meta 소유가 아니라 독립 재단인 React Foundation 소유가 되었습니다.

주요 창립 플래티넘 멤버는 Amazon, Callstack, Expo, Huawei, Meta, Microsoft, Software Mansion, Vercel입니다. 재단 이사회는 각 회원사의 대표들로 구성되며, Seth Webster가 executive director를 맡습니다.

중요한 점은 기술적 의사결정 구조가 재단 이사회와 분리된다는 것입니다. React의 기술 방향은 계속해서 React를 유지보수하고 기여하는 사람들에 의해 결정되며, 이를 구체화하기 위한 임시 리더십 위원회가 구성되었습니다.

앞으로 진행될 작업은 다음과 같습니다.

- React의 기술 거버넌스 구조 확정
- 저장소, 웹사이트, 인프라를 React Foundation으로 이전
- React 생태계 지원 프로그램 검토
- 다음 React Conf 준비

React 생태계 입장에서는 React가 특정 기업의 내부 프로젝트 성격에서 벗어나, 더 명확한 독립 거버넌스와 생태계 중심의 운영 구조로 이동하는 중요한 전환점입니다.

### 2. [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)

React Server Components에서 추가 취약점이 공개되었습니다. 이번 취약점은 이전의 React2Shell 원격 코드 실행 취약점과 달리 RCE는 허용하지 않지만, **서비스 거부(DoS)** 및 **소스 코드 노출**로 이어질 수 있습니다.

공개된 취약점은 다음과 같습니다.

- Denial of Service — High Severity
  - CVE-2025-55184
  - CVE-2025-67779
  - CVE-2026-23864
  - CVSS 7.5
- Source Code Exposure — Medium Severity
  - CVE-2025-55183
  - CVSS 5.3

영향을 받는 패키지는 다음 React Server Components 관련 패키지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

영향을 받는 버전은 19.0.0부터 19.2.3까지의 일부 패치 버전입니다. 특히 이전 취약점 대응으로 19.0.3, 19.1.4, 19.2.3으로 업데이트한 경우에도 패치가 불완전하므로 다시 업데이트해야 합니다.

수정 버전은 다음과 같습니다.

- 19.0.4
- 19.1.5
- 19.2.4

단, React 코드를 서버에서 사용하지 않거나, React Server Components를 지원하는 프레임워크·번들러·플러그인을 사용하지 않는 앱은 이 취약점의 영향을 받지 않습니다.

React Server Components를 운영 환경에서 사용하는 팀은 의존성 트리를 확인하고, 위 패키지가 포함되어 있다면 즉시 고정 버전 이상으로 올리는 것이 좋습니다.

### 3. [There Are No Instances in atproto](https://overreacted.io/there-are-no-instances-in-atproto/)

Dan Abramov는 atproto를 설명하면서, 사람들이 자주 묻는 “Bluesky 인스턴스는 어디에 있는가?”라는 질문 자체가 잘못된 전제에서 나온다고 지적합니다. atproto에는 Mastodon식 “인스턴스” 개념이 없다는 것이 글의 핵심입니다.

글은 RSS와 Google Reader의 관계를 예로 들어 설명합니다. 블로그 글은 각자의 블로그에 존재하고, Google Reader나 Feedly 같은 앱은 그 글들을 모아 보여주는 집계자 역할을 합니다. 즉, 콘텐츠의 호스팅과 콘텐츠를 읽는 앱은 별개입니다.

전통적인 소셜 미디어는 이 구조를 하나의 닫힌 플랫폼 안에 넣습니다. 글도 플랫폼 안에 있고, 읽는 앱도 플랫폼이 통제합니다. Mastodon은 이를 분산시키기 위해 “각 커뮤니티가 자기 인스턴스를 운영하는 작은 소셜 네트워크” 모델을 사용합니다.

하지만 atproto는 다른 방식으로 접근합니다. 사용자가 특정 인스턴스 안에 “사는” 구조가 아니라, 데이터와 앱의 관계를 더 느슨하게 분리하는 모델에 가깝습니다. 따라서 atproto를 Mastodon의 인스턴스 관점으로 이해하려 하면 구조를 잘못 해석하게 됩니다.

React 자체 업데이트는 아니지만, React 커뮤니티에서 영향력 있는 저자의 글이며, 웹 애플리케이션과 소셜 프로토콜의 데이터 모델을 이해하는 데 참고할 만한 글입니다.

## 요약 불가/검증 필요 링크

### [A Social Filesystem](https://overreacted.io/a-social-filesystem/)

- 이유: 본문 추출 부족
- 근거: `accessible=true`였지만 `extract_len=0`이고 `extract_text`가 없어 품질게이트를 통과하지 못했습니다.

## 제외한 링크

다음 링크들은 JavaScript 일반, Next.js 전용, Vercel 플랫폼 소식 또는 광고성/비 React 전용 링크로 판단해 이번 React 주간 요약 대상에서 제외했습니다.

- JavaScript Weekly 이슈 및 리다이렉트 링크
- Next.js 16.3 관련 글
- Vercel Ship 2026 및 Vercel CLI Web Analytics 글
- Deno Desktop 문서
- Greptile 광고/제품 페이지

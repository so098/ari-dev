---
title: "React 주간 요약 (2026-W23)"
description: "이번 주 React 생태계 업데이트를 링크별로 한국어로 정리했습니다."
category: "react-weekly"
updated: "2026-06-01"
---

## 이번 주 React 생태계 요약

### 1. React Foundation 공식 출범: React의 새 거버넌스 기반
- 링크: https://react.dev/blog/2026/02/24/the-react-foundation
- 출처: React Blog

React Foundation이 Linux Foundation 산하에서 공식 출범했습니다. 이에 따라 React, React Native, JSX 등 주요 React 관련 프로젝트의 소유권은 Meta에서 독립 재단인 React Foundation으로 이전됩니다.

핵심 변화는 React의 생태계 운영 기반이 더 독립적인 구조로 이동한다는 점입니다. Amazon, Callstack, Expo, Huawei, Meta, Microsoft, Software Mansion, Vercel이 플래티넘 창립 멤버로 참여하며, 재단 이사회는 각 멤버사의 대표로 구성됩니다.

다만 기술적 의사결정은 재단 이사회와 분리됩니다. React의 기술 방향은 앞으로도 React에 기여하고 유지보수하는 사람들을 중심으로 정해지며, 이를 위한 임시 리더십 카운슬이 구성되었습니다. 향후 기술 거버넌스 구조 확정, 저장소와 웹사이트 및 인프라 이전, 생태계 지원 프로그램 검토, 다음 React Conf 준비 등이 진행될 예정입니다.

### 2. React Server Components 보안 업데이트: DoS 및 소스 코드 노출 취약점
- 링크: https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components
- 출처: React Blog

React Server Components와 관련해 추가 보안 취약점이 공개되었습니다. 이번 취약점은 원격 코드 실행은 허용하지 않지만, 서비스 거부 및 소스 코드 노출 가능성이 있어 즉시 업데이트가 권장됩니다.

공개된 취약점은 다음과 같습니다.

- Denial of Service: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, High severity, CVSS 7.5
- Source Code Exposure: CVE-2025-55183, Medium severity, CVSS 5.3

영향을 받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 영향 버전은 19.0.0부터 19.2.3까지의 여러 릴리스입니다. 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트한 경우에도 해당 패치는 불완전하므로 다시 업데이트해야 합니다.

수정 버전은 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하는 앱이라면 의존성 버전을 확인해야 합니다. 서버를 사용하지 않는 React 앱이나 RSC를 지원하지 않는 환경은 영향을 받지 않는다고 안내되어 있습니다.

### 3. RSC Explorer 공개: React Server Components 프로토콜을 시각적으로 이해하는 도구
- 링크: https://overreacted.io/introducing-rsc-explorer/
- 출처: Overreacted

Dan Abramov가 React Server Components 프로토콜을 탐색할 수 있는 도구인 RSC Explorer를 소개했습니다. RSC 프로토콜은 React 트리를 네트워크를 통해 직렬화하고 다시 복원하는 내부 형식이며, React가 서버와 클라이언트 사이에서 데이터를 주고받는 방식의 핵심입니다.

RSC Explorer는 이 과정을 단계별로 보여주는 브라우저 기반 도구입니다. 예를 들어 `<h1>Hello</h1>` 같은 JSX가 RSC 스트림 안에서 JSON 형태로 표현되고, 클라이언트가 이를 읽어 다시 JSX 트리로 복원하는 과정을 시각적으로 확인할 수 있습니다.

흥미로운 점은 이 도구가 단일 페이지 앱으로 동작한다는 것입니다. 실제 네트워크 요청 없이 브라우저 안에서 서버 역할이 워커로 실행되지만, React가 제공하는 RSC 읽기 및 쓰기 패키지를 그대로 사용하므로 출력되는 프로토콜 내용은 실제와 동일합니다.

최근 React Server Components 보안 이슈 이후 RSC 내부 동작에 대한 관심이 커진 상황에서, RSC Explorer는 RSC를 단순히 사용하는 수준을 넘어 내부 직렬화 형식과 스트리밍 모델을 이해하는 데 도움이 되는 학습 도구로 볼 수 있습니다.

## 요약 불가/검증 필요 링크

### A Social Filesystem
- 링크: https://overreacted.io/a-social-filesystem/
- 이유: 본문 추출 부족. `accessible=true`이지만 `extract_len=0`이고 `extract_text`가 없어 품질 기준을 충족하지 못했습니다.

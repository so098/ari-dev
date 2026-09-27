---
title: "React 주간 요약 (2026-W09)"
description: "이번 주 React 생태계 업데이트를 링크별로 한국어로 정리했습니다."
category: "react-weekly"
updated: "2026-02-23"
---

## 이번 주 React 생태계 요약

### 1. React 19.3 정식 출시

- 링크: https://react.dev/blog/2026/09/09/react-19-3
- 출처: react.dev

React 19.3이 npm에 공개되었습니다. 이번 릴리스의 핵심은 기존 실험 API였던 **View Transitions**와 **Fragment Refs**가 안정화되었다는 점입니다.

`<ViewTransition>` 컴포넌트는 브라우저의 View Transition API를 React 방식으로 사용할 수 있게 해 주며, UI 요소가 등장하거나 사라지거나 이동하거나 크기가 바뀌는 상황을 애니메이션으로 처리할 수 있습니다. React는 트리 변화에 따라 `enter`, `exit`, `update`, `share` 같은 전환 유형을 선택합니다.

중요한 점은 모든 업데이트가 애니메이션을 유발하는 것은 아니라는 것입니다. React는 `startTransition`, `<Suspense>` reveal, `useDeferredValue`로 인한 업데이트처럼 Transition으로 표시된 업데이트에 대해서만 View Transition을 적용합니다. 즉, 긴급하게 즉시 반영되어야 하는 UI 변경과 애니메이션 가능한 전환을 구분하는 설계입니다.

이번 버전에는 React DOM 관련 개선으로 브라우저 **Trusted Types 지원**도 포함되었습니다. React Server Components 쪽에서는 Server Components 안에서 `<Context>`를 직접 렌더링할 수 있는 변화가 언급되었습니다.

React 앱에서 화면 전환, 리스트 재배치, 상세 페이지 이동 같은 시각적 변화를 더 자연스럽게 만들고 싶다면 React 19.3의 View Transition 안정화를 주목할 만합니다.

---

### 2. React Foundation 공식 출범

- 링크: https://react.dev/blog/2026/02/24/the-react-foundation
- 출처: react.dev

React Foundation이 Linux Foundation 산하에서 공식 출범했습니다. 이에 따라 React, React Native, JSX 같은 관련 프로젝트는 더 이상 Meta 소유가 아니라 독립 재단인 **React Foundation** 소유가 되었습니다.

창립 Platinum 멤버로는 Amazon, Callstack, Expo, Huawei, Meta, Microsoft, Software Mansion, Vercel이 참여했습니다. 재단 이사회는 각 멤버사의 대표들로 구성되며, Seth Webster가 전무이사를 맡습니다.

다만 React의 기술적 방향성은 재단 이사회가 직접 정하는 구조가 아닙니다. React의 기술 거버넌스는 React에 기여하고 유지보수하는 사람들의 손에 계속 남아야 한다는 원칙 아래, 임시 리더십 위원회가 구성되어 향후 기술 거버넌스 구조를 정리할 예정입니다.

앞으로의 작업에는 기술 거버넌스 확정, 저장소와 웹사이트 및 인프라 이전, React 생태계 지원 프로그램 검토, 다음 React Conf 계획 등이 포함됩니다.

React가 특정 기업의 프로젝트에서 더 독립적인 생태계 기반 프로젝트로 전환되는 중요한 이정표입니다.

---

### 3. atproto에는 “인스턴스”가 없다는 설명

- 링크: https://overreacted.io/there-are-no-instances-in-atproto/
- 출처: overreacted.io

Dan Abramov의 글은 atproto를 Mastodon식 “인스턴스” 개념으로 이해하려는 시도가 왜 맞지 않는지 설명합니다.

글은 RSS와 Google Reader의 관계를 먼저 예로 듭니다. 블로그 글은 각자의 블로그에 존재하고, Google Reader나 Feedly 같은 앱은 그것을 모아 보여 주는 집계 계층입니다. 핵심은 **호스팅과 집계가 분리되어 있다**는 점입니다. 글은 리더 앱 안에 “사는” 것이 아니라, 앱은 블로그 생태계의 투영일 뿐입니다.

반대로 전통적인 소셜 네트워크는 게시물, 앱, 피드, 사용자 경험을 하나의 닫힌 공간 안에 묶습니다. Mastodon은 이를 탈중앙화하기 위해 각 커뮤니티가 자체 “작은 트위터” 같은 인스턴스를 운영하는 모델을 취합니다. 사용자는 특정 인스턴스 안에 소속되고, 그 인스턴스들이 서로 통신합니다.

하지만 글의 주장은 atproto가 이 모델과 다르다는 것입니다. atproto를 “Bluesky 인스턴스가 어디 있느냐”는 질문으로 접근하면, 애초에 구조를 잘못 전제하게 됩니다. atproto는 Mastodon식 인스턴스 중심 구조보다는, 호스팅과 앱/집계가 분리된 RSS적 사고방식에 더 가깝다는 설명입니다.

React 자체 업데이트는 아니지만, React 커뮤니티에서 영향력 있는 저자의 웹 플랫폼/소셜 프로토콜 해설로서 생태계 관점에서 참고할 만한 글입니다.

---

## 요약 불가/검증 필요 링크

### A Social Filesystem

- 링크: https://overreacted.io/a-social-filesystem/
- 출처: overreacted.io
- 사유: accessible=true이지만 `extract_len=0`이고 `extract_text`가 없어 본문 추출이 부족합니다.

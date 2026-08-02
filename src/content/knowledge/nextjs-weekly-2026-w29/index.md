---
title: "Next.js 주간 요약 (2026-W29)"
description: "이번 주 Next.js/Vercel 생태계 업데이트를 링크별로 한국어로 정리했습니다."
category: "nextjs-weekly"
updated: "2026-07-13"
---

## 링크별 정리

### 1. [Next.js Security Release and Our Next Patch Release](https://nextjs.org/blog/next-security-release-program)

Next.js 팀이 공식적인 보안 릴리스 프로그램을 도입한다고 발표했습니다. 기존에는 보안 패치가 필요할 때마다 비정기적으로 릴리스되었지만, 앞으로는 대략 월 1회 사전 공지를 통해 보안 릴리스 일정과 예상 최고 심각도를 안내하는 방식으로 운영됩니다.

핵심 변화는 팀들이 보안 업데이트를 미리 계획할 수 있게 된 점입니다. 사전 공지 기간 동안 애플리케이션 운영팀은 업그레이드 일정을 잡을 수 있고, Vercel 및 호스팅 제공자는 아직 패치되지 않은 애플리케이션을 보호하기 위한 방화벽 규칙 같은 완화책을 준비할 수 있습니다. 다만 이미 악용 중이거나 긴급한 취약점은 기존처럼 비정기 긴급 패치로 배포됩니다.

첫 번째 정기 보안 릴리스는 7월 릴리스로 예고되었으며, Next.js 사용자에게는 앞으로 보안 패치 공지를 정기적으로 확인하고 업그레이드 프로세스를 운영 루틴에 포함하는 것이 중요해졌습니다.

### 2. [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack)

Next.js 16.3 Preview에서 Turbopack 관련 성능 개선이 공개되었습니다. 이번 릴리스의 중심은 개발 서버 메모리 사용량 절감, 빌드 속도 향상, 런타임 경험 개선입니다.

가장 큰 변화는 개발 모드 메모리 사용량 감소입니다. Turbopack은 증분 컴파일을 위해 많은 결과를 메모리에 캐시해 왔지만, 이번 개선으로 파일 시스템 영속 캐시를 활용해 인메모리 캐시 일부를 비울 수 있게 되었습니다. 예시 기준으로 Vercel 대시보드는 21.5GB에서 2GB 수준으로, nextjs.org는 4.6GB에서 840MB 수준으로 줄어든 것으로 소개되었습니다.

또한 Next.js 16.3에는 빌드용 persistent file system cache, 실험적 Rust React Compiler 지원, `import.meta.glob` API 지원, 더 빠른 HMR 및 개발 서버 시작 개선이 포함됩니다. 대규모 Next.js 앱에서 Turbopack을 사용하는 팀이라면 16.3 Preview를 테스트해 볼 가치가 있습니다.

### 3. [Runtime logs now show cache reasons](https://vercel.com/changelog/runtime-logs-now-show-cache-reasons)

Vercel 런타임 로그에 캐시 상태뿐 아니라 캐시가 fresh hit이 아니었던 이유를 보여주는 “Cache Reason”이 추가되었습니다. 이 기능은 ISR, Partial Prerendering, `Cache-Control` 헤더를 설정한 함수 응답처럼 CDN 캐싱 대상이 되는 응답에서 캐시 미스나 우회 원인을 분석하는 데 유용합니다.

지원되는 이유는 상태별로 구분됩니다. 예를 들어 `MISS`는 Cold, Request collapsed, Error가 가능하고, `BYPASS`는 Draft Mode, Prerender Bypass, Crawler 등이 표시됩니다. `STALE`은 시간 기반 재검증, 태그 기반 무효화, 재검증 오류를 나타낼 수 있으며, `REVALIDATED`는 태그 기반 삭제와 연결됩니다.

로그 UI뿐 아니라 `vercel logs`, `vercel metrics`에서도 cache reason을 확인하거나 집계할 수 있습니다. Next.js 앱에서 ISR, 태그 기반 revalidation, CDN 캐시 정책을 적극적으로 사용하는 팀이라면 캐시 히트율 개선과 디버깅에 바로 활용할 수 있는 업데이트입니다.

## 요약 불가/검증 필요 링크

- [Data downloaded by Vercel Sandbox is now free](https://vercel.com/changelog/data-downloaded-by-vercel-sandbox-is-now-free) — 본문 추출 부족: `accessible=true`이지만 `extract_len=502`로 품질 기준인 1200자 이상에 미달합니다.

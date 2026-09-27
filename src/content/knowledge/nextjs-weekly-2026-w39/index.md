---
title: "Next.js 주간 요약 (2026-W39)"
description: "이번 주 Next.js/Vercel 생태계 업데이트를 링크별로 한국어로 정리했습니다."
category: "nextjs-weekly"
updated: "2026-09-21"
---

## 링크별 정리

### 1. Next.js Security Update for a Critical Upstream Issue

- 링크: https://nextjs.org/blog/nextjs-security-update-september-22-2026
- 출처: Next.js Blog
- 상태: 성공

Next.js가 2026년 9월 22일, critical 등급의 upstream 이슈에 대응하기 위해 out-of-band 보안 업데이트를 공개했다. 패치 버전은 Active LTS인 `16.3.6`과 Maintenance LTS인 `15.5.26`이다.

핵심 영향은 `next/og`의 Node.js `ImageResponse` 구현에서 발생할 수 있는 원격 코드 실행(RCE) 취약점이다. 영향 범위는 `Next.js >=16.2.0 <16.3.6`이며, 관련 advisory는 `GHSA-vcvr-r3jv-pc5j`로 안내됐다. upstream advisory로는 Satori 관련 `GHSA-wx4j-mvgx-mqwp`가 언급됐다.

Next.js 15.x는 해당 RCE에는 영향받지 않지만, `15.5.26`에는 관련 hardening이 포함됐다. Edge `ImageResponse` 구현은 영향받지 않는다고 명시되어 있다.

권장 조치:

```bash
npm install next@16.3.6 # for 16.3
npm install next@15.5.26 # for 15.5 (hardening only)
```

Next.js 16.2 이상 16.3.6 미만을 사용하면서 `next/og`의 Node.js `ImageResponse` 경로를 쓰는 서비스는 우선순위를 높여 패치하는 것이 좋다.

### 2. Push images to Vercel Container Registry from GitHub Actions

- 링크: https://vercel.com/changelog/vcr-login-github-action
- 출처: Vercel Changelog
- 상태: 성공

Vercel Container Registry(VCR)에 GitHub Actions에서 이미지를 push할 때, 장기 수명 registry credential을 GitHub Secrets에 저장하지 않아도 되는 `vercel/vcr-action/login` 액션이 공개됐다.

이 액션은 GitHub OIDC를 사용해 workflow의 OIDC token을 짧은 수명의 Vercel access token으로 교환하고, 이를 통해 `vcr.vercel.com`에 로그인한다. 작업이 끝나면 로그아웃하고 Vercel token을 revoke한다.

설정 흐름은 다음과 같다.

1. Vercel team에 GitHub repository/workflow와 매칭되는 OIDC policy를 만든다.
2. 해당 policy에 VCR read-write access를 부여한다.
3. GitHub repo variable에 `VERCEL_TEAM_ID` 등 필요한 team/project/repository 정보를 저장한다.
4. workflow 또는 job에 `id-token: write` 권한을 부여한다.
5. Docker build/push 전에 `vercel/vcr-action/login@v1`을 실행한다.

예시에서는 `docker/build-push-action@v6`와 함께 `vcr.vercel.com/<team>/<project>/<repository>:latest` 형태의 tag로 이미지를 push한다. 기본적으로 Docker 인증을 처리하지만, Podman 또는 Buildah 사용도 `engines` 옵션으로 지정할 수 있다.

Vercel Sandbox용 custom image를 GitHub Actions에서 안전하게 배포하려는 팀에게 특히 유용한 업데이트다.

### 3. State of agent skills

- 링크: https://vercel.com/blog/state-of-agent-skills
- 출처: Vercel Blog
- 상태: 성공

Vercel이 `skills.sh` registry의 성장과 사용 패턴을 분석한 보고서를 공개했다. 본문에 따르면 `skills.sh`는 7개월 만에 100만 개의 agent skill과 약 2억 8천만 install을 기록했다.

Vercel은 skill을 “AI agent에게 특정 작업을 수행하는 방법을 알려주는 재사용 가능한 지침”으로 설명한다. agent 자체는 범용적이지만, 개인·팀·회사별 작업 방식은 알지 못하므로 skill이 그 공백을 채운다는 관점이다.

보고서는 skill 생태계의 성장 속도를 GitHub repository, App Store app, npm package의 100만 개 도달 기간과 비교한다. `skills.sh`는 7개월 만에 100만 개에 도달했으며, 이는 GitHub 27개월, App Store 약 5년, npm 9년 이상보다 빠른 속도라고 설명한다.

또한 공급과 수요의 차이도 짚는다. 등록된 skill은 software engineering 비중이 크지만, install 기준으로는 80% 이상이 다른 종류의 작업에 분포한다고 요약한다. 즉, 작성자는 기술 중심으로 skill을 많이 만들지만, 실제 사용자는 더 넓은 업무 영역에서 agent skill을 설치하고 있다는 해석이 가능하다.

Next.js 자체 업데이트는 아니지만, Vercel이 agent tooling과 registry 생태계를 어떻게 바라보는지 보여주는 자료로서 Vercel 플랫폼 및 개발 워크플로우 변화에 관심 있는 팀이 참고할 만하다.

## 요약 불가/검증 필요 링크

### Upcoming Next.js September Security Release

- 링크: https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026
- 이유: 본문 추출 부족 (`extract_len=1089`, 품질 기준 `extract_len>=1200` 미달)

접근은 가능하지만 사전 정의된 품질 기준에 미달하므로 상세 요약 대상에서 제외했다. 다만 스크립트에 포함된 추출 내용 기준으로는 2026년 9월 30일 예정된 Next.js 보안 릴리스가 있으며, 총 9개 취약점(critical 1개, high 2개, medium 5개, low 1개)을 다룰 예정이라고 안내되어 있다.

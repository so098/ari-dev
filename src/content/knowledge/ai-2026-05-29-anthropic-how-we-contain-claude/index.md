---
title: "How We Contain Claude"
description: "Anthropic의 containment 전략을 바탕으로 에이전트 권한 통제와 다층 안전장치 운영 원칙을 해석한 글"
category: "AI"
updated: "2026-05-29"
source_updated: "2026-05-28"
---

원문 업데이트 날짜: 2026-05-28

## 1) 이 글의 핵심: 무엇이 구조적으로 달라졌는가
Anthropic의 **How We Contain Claude**는 “모델이 똑똑한가”보다 “모델이 할 수 있는 행동의 피해 반경을 얼마나 제한할 수 있는가”를 중심에 둔다. 핵심은 능력(capability) 중심 사고에서, 권한·환경·감시를 결합한 containment 중심 운영으로 초점을 이동했다는 점이다.

즉 성능 향상 자체가 배포 허가를 보장하지 않으며, 위험이 큰 작업일수록 실행 경로를 더 강하게 제약해야 한다는 메시지가 분명하다.

> [!NOTE] 원문 근거 포인트
> - relative damage of an autonomous agent ... through control over its environment
> - blast radius was deemed too high to ship
> - Model capability is an important factor in the total risk of deployment
> - supervise the agent’s behavior via a human-in-the-loop

> [!NOTE] 용어 정리
> - **alignment**: 모델 출력을 정책/의도에 맞게 조정하는 접근.
> - **safety**: 위험한 출력이나 오작동을 줄이기 위한 안전 설계/운영.

## 2) 실무적으로 중요한 이유
첫째, 배포 판단 기준이 달라진다. 같은 모델이라도 접근 가능한 시스템 권한, 네트워크 경계, 데이터 민감도에 따라 운영 위험은 크게 달라진다.

둘째, 단일 안전장치에 의존하면 실패한다. 사람 승인, 정책 필터, 실행 제한, 감사 로그를 겹겹이 두는 다층 방어가 필요하다.

셋째, 안전성과 속도의 균형이 핵심이다. 승인 프롬프트를 늘리는 것만으로는 운영 마찰이 커질 수 있어, 위험 등급별로 자동/수동 경로를 분리해야 한다.

> [!NOTE] 운영 신호(원문에서 포착된 정량·운영 단서)
> - 93% of permission prompts
> - 1% on single attempts, around 5–6% after 100 adaptive attempts
> - 83% of overeager behaviors before execution

## 3) 실행 설계 관점 해석
이 글을 운영 관점에서 보면, 모델의 "추론 품질"보다 "실행 게이트 설계"가 신뢰성을 결정한다. 에이전트가 제안한 액션을 그대로 실행하지 않고, 위험도에 맞는 승인 루트와 실행 한도를 통과하게 해야 한다.

특히 고위험 액션(외부 전송, 계정 권한 변경, 프로덕션 조작)은 기본 거부 후 조건부 승인으로 열고, 저위험 액션(요약, 분류, 초안 생성)은 자동화하는 이원 구조가 현실적이다.

## 4) 우리 파이프라인 적용 체크리스트
1. 액션 위험등급(저/중/고) 분류표를 정의하고 도구 호출마다 매핑한다.
2. 고위험 액션은 human-in-the-loop 승인 없이는 실행되지 않도록 강제한다.
3. 승인/거절/재시도 로그를 저장해 사후 감사 가능성을 확보한다.
4. 실패 시 즉시 중단·롤백하는 안전 중단 규칙(kill switch)을 둔다.
5. 발행 자동화에서도 본문 품질·최신성·중복성 검사를 통과해야만 publish한다.

## 5) 과장 없이 읽기 위한 주의점
원문 수치는 특정 실험 조건과 시스템 구성에 의존한다. 따라서 수치 자체를 목표로 삼기보다, “실패 가능성을 어떤 통제 계층으로 줄였는가”를 구조적으로 가져오는 편이 안전하다.

또한 공개 텍스트 기반 자동화는 문맥 손실이 있을 수 있으므로, 운영 정책 반영 전에는 원문 조건과 예외를 반드시 대조해야 한다.

원문 링크: https://www.anthropic.com/engineering/how-we-contain-claude

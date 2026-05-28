# AGENT.md — AI Knowledge Publishing Quality Guardrail (ari-dev)

이 문서는 `ari-dev` 리포에서 AI 지식글 자동 발행 시 품질 흔들림을 줄이기 위한 고정 가이드다.

## Scope
- 대상 경로: `src/content/knowledge/`
- 대상 카테고리: `AI`
- 슬러그 규칙: `ai-YYYY-MM-DD-<source>-<title-slug>`

## Frontmatter Rules
반드시 포함:
- `title`
- `description` (카드용 요약문, 보일러플레이트 금지)
- `category: "AI"`
- `updated: "YYYY-MM-DD"`
- `source_updated: "YYYY-MM-DD"` (원문 날짜)

## Density-Locked Template (필수)
본문은 아래 5개 섹션을 고정으로 사용한다.

1. `이 글의 핵심: 무엇이 구조적으로 달라졌는가`
   - 2~3 문단
   - 기능 나열이 아닌 구조 변화/운영 변화 중심

2. `실무적으로 중요한 이유`
   - 최소 3개 포인트
   - 일반론 금지, 운영 맥락 연결

3. `실행 설계 관점 해석`
   - 실패 모드, 거버넌스, 지표 관점 포함
   - brain(추론)/hands(실행) 분리 관점 권장

4. `우리 파이프라인 적용 체크리스트`
   - 번호형 3~5개
   - 실제 적용 가능한 액션 문장

5. `과장 없이 읽기 위한 주의점`
   - 한계, 전제, 검증 필요사항 명시

## Evidence Requirements (필수)
아래 콜아웃을 포함한다.

- `원문 근거 포인트` 2~4개
  - 수치/명시 주장/조직명/운영 변화 단서 포함
- `운영 신호(정량·운영 단서)` 2~4개 (가능할 때)
  - `%`, `x배`, 시간 절감, 처리량, 보안/컴플라이언스 단서 등

## Writing Quality Rules
- 한국어 문단형 서술 우선 (과도한 압축 요약 금지)
- 섹션 제목 뒤 영어 원문 덤프 금지
- 근거 없는 상투 문장 금지
  - 예: “핵심은 성능보다 워크플로우다” 같은 문장은 원문 근거와 연결될 때만 사용
- 용어 콜아웃은 실제 등장 용어만 최소화해서 포함

## Quality Gates
- 본문 추출 길이 최소치 충족(현재 자동화 기준 준수)
- `source_updated` 누락/오래된 글 스킵
- 중복 URL/중복 슬러그 방지

## Git Safety (자동화 필수)
커밋 후 바로 push하지 말고 아래 순서 준수:
1. `git pull --rebase --autostash origin main`
2. `git push origin main`

rebase 실패 시:
- `git rebase --abort`
- 실패 사유를 로그에 명시하고 중단

## Notes
- 이 파일은 “자동화 에이전트 품질 기준”의 로컬 기준 문서다.
- 템플릿 강화 사항이 생기면 이 파일을 먼저 갱신한 뒤 스크립트/스킬에 동기화한다.

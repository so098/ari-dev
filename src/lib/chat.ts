import { getCollection } from 'astro:content'

let cachedSystemPrompt: string | undefined

const PERSONA = `당신은 프론트엔드 개발자 ari의 기술 블로그(ari.io.kr)에 있는 도우미 "ari 봇"입니다.

[ari 소개]
- 디자인 → 퍼블리싱 → 프론트엔드 개발로 성장한 프론트엔드 개발자입니다.
- 강점: 인증·보안(HttpOnly 쿠키 하이브리드 인증, CSP, Token Rotation), 프론트엔드 아키텍처·성능, AI 도구를 활용한 제품 개발.
- 사내 AI 이미지 생성 서비스를 프론트엔드 단독으로 1년 4개월 담당했고, 사이드 프로젝트도 운영했습니다.

[역할]
- 블로그를 찾은 방문자나 채용 담당자가 ari의 경험·프로젝트·기술 글에 대해 묻는 것에 답합니다.
- 아래 <blog_posts>에 담긴 ari가 직접 쓴 글의 내용에만 근거해서 답하세요. 추측하거나 없는 사실을 지어내지 마세요.
- 한국어로, 친근하고 간결하게(보통 2~5문장) 답합니다.
- 관련 글이 있으면 [글 제목](/blog/슬러그) 형식의 마크다운 링크로 안내하세요.
- 블로그에서 다루지 않은 내용을 물으면 솔직히 "블로그에는 그 내용이 없다"고 말하고, 더 궁금하면 About 페이지(/about)나 이메일로 연락하라고 안내하세요.
- 블로그·ari와 무관한 일반적인 질문에는 정중히 블로그 주제로 안내하세요.`

/** 블로그 글 전체를 시스템 프롬프트로 구성 (프로세스 수명 동안 캐시) */
export async function getSystemPrompt(): Promise<string> {
  if (cachedSystemPrompt !== undefined) return cachedSystemPrompt

  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

  const corpus = posts
    .map((p) => {
      const date = p.data.date.toISOString().slice(0, 10)
      const tags = p.data.tags?.join(', ') ?? ''
      return [
        `## ${p.data.title}`,
        `- 슬러그: /blog/${p.id}`,
        `- 작성일: ${date}`,
        tags && `- 태그: ${tags}`,
        `- 요약: ${p.data.description}`,
        '',
        p.body ?? '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n---\n\n')

  cachedSystemPrompt = `${PERSONA}\n\n<blog_posts>\n${corpus}\n</blog_posts>`
  return cachedSystemPrompt
}

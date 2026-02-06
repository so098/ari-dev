# ari Space

프론트엔드 개발자 ari의 기술과 경험을 기록하는 블로그입니다.

https://ari.io.kr

## Tech Stack

| Category   | Technology                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------- |
| Framework  | [Astro](https://astro.build/)                                                               |
| Styling    | [Tailwind CSS](https://tailwindcss.com/)                                                    |
| Components | [shadcn/ui](https://ui.shadcn.com/)                                                         |
| Content    | [MDX](https://mdxjs.com/)                                                                   |
| Codeblocks | [Expressive Code](https://expressive-code.com/)                                             |
| Deployment | [Vercel](https://vercel.com/)                                                               |

## Getting Started

```bash
npm install
npm run dev
```

`http://localhost:1234`에서 확인할 수 있습니다.

### Commands

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | 개발 서버 실행           |
| `npm run build`   | 타입 체크 + 빌드         |
| `npm run preview` | 빌드 결과 미리보기       |

## Project Structure

```
src/
├── components/     # Astro/React 컴포넌트
├── content/
│   ├── blog/       # 블로그 글 (MDX/MD)
│   ├── authors/    # 작성자 프로필
│   └── projects/   # 프로젝트
├── layouts/        # 페이지 레이아웃
├── pages/          # 라우팅
├── styles/         # 글로벌 스타일
└── consts.ts       # 사이트 설정
```

## Credits

[astro-erudite](https://github.com/jktrn/astro-erudite) 템플릿을 기반으로 제작되었습니다.

## License

[MIT](LICENSE)

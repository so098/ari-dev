import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'ari Space',
  description: '프론트엔드 개발자 ari의 기술과 경험을 기록하는 공간입니다.',
  href: 'https://ari-dev-three.vercel.app',
  author: 'ari',
  locale: 'ko',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/so098',
    label: 'GitHub',
  },
  {
    href: 'mailto:szerohan@gmail.com',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}

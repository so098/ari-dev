import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Ari Space',
  description: 'ari space 입니다.',
  href: 'https://astro-erudite.vercel.app',
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
  {
    href: '/authors',
    label: 'authors',
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

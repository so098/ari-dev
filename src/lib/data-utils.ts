import { execFileSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { getCollection, type CollectionEntry } from 'astro:content'

// updated 날짜가 동률일 때 git 커밋 시각으로 최신순을 결정하기 위한 헬퍼.
// 모듈 캐시로 빌드 1회당 파일별 1회만 호출되도록 한다.
const commitTimeCache = new Map<string, number>()

function getCommitTimeMs(relPath: string): number {
  const cached = commitTimeCache.get(relPath)
  if (cached !== undefined) return cached

  let timeMs = 0
  try {
    const stdout = execFileSync(
      'git',
      ['log', '-1', '--format=%ct', '--', relPath],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim()
    if (stdout) timeMs = Number(stdout) * 1000
  } catch {
    // git 미설치/저장소 외 환경: mtime으로 폴백
  }

  // 아직 커밋 안 된 새 파일(또는 git 실패) → 파일 mtime을 폴백으로 사용
  if (!timeMs) {
    try {
      timeMs = statSync(relPath).mtimeMs
    } catch {
      timeMs = 0
    }
  }

  commitTimeCache.set(relPath, timeMs)
  return timeMs
}

function resolveKnowledgePath(id: string): string | null {
  for (const ext of ['md', 'mdx']) {
    const p = `src/content/knowledge/${id}/index.${ext}`
    if (existsSync(p)) return p
  }
  return null
}

export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog')
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getRecentPosts(
  count: number,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

export async function getAdjacentPosts(currentId: string): Promise<{
  prev: CollectionEntry<'blog'> | null
  next: CollectionEntry<'blog'> | null
}> {
  const posts = await getAllPosts()
  const currentIndex = posts.findIndex((post) => post.id === currentId)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
    prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  }
}


export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getAllPosts()

  return posts.reduce((acc, post) => {
    post.data.tags?.forEach((tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1)
    })
    return acc
  }, new Map<string, number>())
}

export async function getSortedTags(): Promise<
  { tag: string; count: number }[]
> {
  const tagCounts = await getAllTags()

  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

export function groupPostsByYear(
  posts: CollectionEntry<'blog'>[],
): Record<string, CollectionEntry<'blog'>[]> {
  return posts.reduce(
    (acc: Record<string, CollectionEntry<'blog'>[]>, post) => {
      const year = post.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(post)
      return acc
    },
    {},
  )
}


export async function getPostsByTag(
  tag: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.data.tags?.includes(tag))
}

export async function getAllKnowledge(): Promise<
  CollectionEntry<'knowledge'>[]
> {
  const entries = await getCollection('knowledge')
  const decorated = entries
    .filter((entry) => !entry.data.draft)
    .map((entry) => {
      const path = entry.filePath ?? resolveKnowledgePath(entry.id)
      return { entry, commitTime: path ? getCommitTimeMs(path) : 0 }
    })

  decorated.sort((a, b) => {
    const dateDiff = b.entry.data.updated.valueOf() - a.entry.data.updated.valueOf()
    if (dateDiff !== 0) return dateDiff
    return b.commitTime - a.commitTime
  })

  return decorated.map(({ entry }) => entry)
}

export async function getAdjacentKnowledge(currentId: string): Promise<{
  prev: CollectionEntry<'knowledge'> | null
  next: CollectionEntry<'knowledge'> | null
}> {
  const entries = await getAllKnowledge()
  const currentIndex = entries.findIndex((entry) => entry.id === currentId)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    next: currentIndex > 0 ? entries[currentIndex - 1] : null,
    prev: currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null,
  }
}

export function groupKnowledgeByCategory(
  entries: CollectionEntry<'knowledge'>[],
): Record<string, CollectionEntry<'knowledge'>[]> {
  return entries.reduce(
    (acc: Record<string, CollectionEntry<'knowledge'>[]>, entry) => {
      ;(acc[entry.data.category] ??= []).push(entry)
      return acc
    },
    {},
  )
}

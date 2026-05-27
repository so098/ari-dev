import { getCollection, type CollectionEntry } from 'astro:content'

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
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf())
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

export type ContentEntry =
  | CollectionEntry<'blog'>
  | CollectionEntry<'knowledge'>

export function getContentDate(entry: ContentEntry): Date {
  return entry.collection === 'blog' ? entry.data.date : entry.data.updated
}

export async function getAllContent(): Promise<ContentEntry[]> {
  const [posts, knowledge] = await Promise.all([
    getAllPosts(),
    getAllKnowledge(),
  ])
  return [...posts, ...knowledge].sort(
    (a, b) => getContentDate(b).valueOf() - getContentDate(a).valueOf(),
  )
}

export function groupContentByYear(
  entries: ContentEntry[],
): Record<string, ContentEntry[]> {
  return entries.reduce(
    (acc: Record<string, ContentEntry[]>, entry) => {
      const year = getContentDate(entry).getFullYear().toString()
      ;(acc[year] ??= []).push(entry)
      return acc
    },
    {},
  )
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

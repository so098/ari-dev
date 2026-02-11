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

export async function getAllBooks(): Promise<CollectionEntry<'book'>[]> {
  const books = await getCollection('book')
  return books
    .filter((book) => !book.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getRecentBooks(
  count: number,
): Promise<CollectionEntry<'book'>[]> {
  const books = await getAllBooks()
  return books.slice(0, count)
}

export async function getAdjacentBooks(currentId: string): Promise<{
  prev: CollectionEntry<'book'> | null
  next: CollectionEntry<'book'> | null
}> {
  const books = await getAllBooks()
  const currentIndex = books.findIndex((book) => book.id === currentId)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    next: currentIndex > 0 ? books[currentIndex - 1] : null,
    prev: currentIndex < books.length - 1 ? books[currentIndex + 1] : null,
  }
}

export function groupBooksByYear(
  books: CollectionEntry<'book'>[],
): Record<string, CollectionEntry<'book'>[]> {
  return books.reduce(
    (acc: Record<string, CollectionEntry<'book'>[]>, book) => {
      const year = book.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(book)
      return acc
    },
    {},
  )
}

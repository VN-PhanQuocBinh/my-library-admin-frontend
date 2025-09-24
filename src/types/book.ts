export interface Publisher {
  _id: string
  name: string
  address: string
  __v: number
}

export type BookGenre =
  | 'fiction'
  | 'nonFiction'
  | 'scienceFiction'
  | 'fantasy'
  | 'mystery'
  | 'biography'
  | 'history'
  | 'poetry'
  | 'self-help'
  | 'business'

export const BOOK_GENRES: BookGenre[] = [
  'fiction',
  'nonFiction',
  'scienceFiction',
  'fantasy',
  'mystery',
  'biography',
  'history',
  'poetry',
  'self-help',
  'business',
]

export interface Book {
  _id: string
  name: string
  description: string
  price: {
    original: number
    sale: number
  }
  quantity: number
  publisher: Publisher
  author: string
  genre: string
  pages: number
  language: string
  publishedDate: string
  status: boolean
  coverImage: string
  detailedImages: string[]
  slug: string
}

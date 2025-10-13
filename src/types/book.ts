export interface ImageInfo {
  url: string
  publicId: string
  folder?: string
  originalName?: string
  size?: number
  format?: string
  width?: number
  height?: number
  uploadedAt?: Date
}

export interface Publisher {
  _id: string
  name: string
  address: string
  __v: number
}

export type BookGenre = 'Tiểu thuyết' | 'Marketing - Bán hàng' | 'Kỹ năng sống' | 'Tâm lý'

export const BOOK_GENRES: BookGenre[] = [
  'Tiểu thuyết',
  'Marketing - Bán hàng',
  'Kỹ năng sống',
  'Tâm lý',
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
  coverImage: ImageInfo
  detailedImages: ImageInfo[]
  slug: string
}

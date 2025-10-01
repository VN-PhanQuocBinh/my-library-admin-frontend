import z from 'zod'

export const BookSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().min(1, 'Author is required'),
  genre: z.string().min(1, 'Genre is required'),
  price: z.number().min(0, 'Price must be positive'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  status: z.boolean().optional(),
  publisher: z.string().min(1, 'Publisher is required'),
  publishedDate: z.date().refine((date) => date <= new Date(), {
    message: 'Publish date must be in the past',
  }),
  coverImage: z.instanceof(File).optional().or(z.string().optional()),
  detailedImages: z.array(z.string().url('Each detailed image must be a valid URL')).optional(),
})

export type BookType = z.infer<typeof BookSchema> & {
  _id?: string
}



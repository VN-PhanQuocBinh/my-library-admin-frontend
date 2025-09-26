import { z } from 'zod'

export type Publisher = {
  _id?: string
  name: string
  address: string
}

export const PublisherSchema = z.object({
  name: z
    .string()
    .min(1, 'Publisher name is required')
    .max(100, 'Name must be less than 100 characters'),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters'),
})

import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'

export const LoginSchema = z.object({
   email: z.string().email('Invalid email address'),
   password: z.string().min(1, 'Password must be at least 1 characters long'),
})

export const RegisterSchema = z.object({
   fullname: z.string().min(1, 'Fullname is required'),
   email: z.string().email('Invalid email address'),
   password: z.string().min(6, 'Password must be at least 6 characters long'),
   duty: z.enum(['staff', 'manager'], 'Duty must be either admin or staff'),
   dateOfBirth: z.date().refine((date) => date <= new Date(), {
      message: 'Date of birth must be in the past',
   }),
   address: z.string().min(1, 'Address is required'),
   phoneNumber: z.string().min(1, 'Phone number is required'),
})

export type LoginType = z.infer<typeof LoginSchema>
export type RegisterType = z.infer<typeof RegisterSchema>

import apiClient from './api.service'
import { BOOK_ENDPOINTS } from '@/config/api-endpoints'

export const fetchBooks = async () => {
   try {
      const response = await apiClient.get(BOOK_ENDPOINTS.LIST)
      return response.data
   } catch (error) {
      console.error('Error fetching books:', error)
      throw error
   }
}

export const createBook = async (data: FormData) => {
   try {
      const response = await apiClient.post(BOOK_ENDPOINTS.CREATE, data, {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      })
      return response.data
   } catch (error) {
      console.error('Error creating book:', error)
      throw error
   }
}

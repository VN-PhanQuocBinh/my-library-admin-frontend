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

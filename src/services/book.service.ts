import apiClient from './api.service'
import { BOOK_ENDPOINTS } from '@/config/api-endpoints'
import type { BookGenre } from '@/types/book'
import type { ApiParams } from '@/types/common'

interface getBookParams extends ApiParams {
  publisher?: string
  category?: string
  status?: boolean
  genre?: BookGenre
}

export const fetchBooks = async (params?: getBookParams) => {
  try {
    const response = await apiClient.get(BOOK_ENDPOINTS.LIST, { params })
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

export const updateBook = async (bookId: string, data = {}) => {
  try {
    console.log('Updating book with ID:', bookId, 'and data:', data)
    const response = await apiClient.patch(`/book/${bookId}/update`, data, {
      headers: {
        'Content-Type': 'application/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error updating book:', error)
    throw error
  }
}

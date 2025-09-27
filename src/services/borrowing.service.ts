import apiClient from './api.service'

export const createBorrowingRegistration = async (data: any) => {
  try {
    const response = await apiClient.post('/book/borrow', data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllBorrowingRegistrations = async ({ query, status, page, limit }: any) => {
  try {
    const response = await apiClient.get('/book/borrowings', {
      params: {
        query,
        status,
        page,
        limit,
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateBorrowingStatus = async (id: string, status: string) => {
  try {
    const response = await apiClient.patch(`/book/borrow/${id}`, { status })
    return response.data
  } catch (error) {
    throw error
  }
}

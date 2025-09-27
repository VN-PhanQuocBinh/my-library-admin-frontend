import apiClient from './api.service'
import type { ApiParams } from '@/types/common'

export async function getAllUsers(params: ApiParams) {
  try {
    const response = await apiClient.get('/admin/user/list', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

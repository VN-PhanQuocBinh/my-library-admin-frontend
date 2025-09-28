import apiClient from './api.service'
import type { ApiParams } from '@/types/common'

export interface UserParams extends ApiParams {
  query?: string
  status?: string
}

export interface CreateUserPayload {
  firstname: string
  lastname: string
  email: string
  phoneNumber: string
  address: string
  dateOfBirth: Date
  gender: string
  password: string
}

export async function getAllUsers(params: UserParams) {
  try {
    const response = await apiClient.get('/admin/users/list', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function createUser(payload: CreateUserPayload) {
  try {
    const response = await apiClient.post('/admin/users/create', payload)
    return response.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUser(
  userId: string,
  payload: {
    firstname?: string
    lastname?: string
    email?: string
    duty?: string
    status?: string
  },
) {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}`, payload)
    return response.data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

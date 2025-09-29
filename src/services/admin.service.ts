import apiClient from './api.service'
import type { ApiParams } from '@/types/common'

export interface AdminParams extends ApiParams {
  query?: string
  duty?: string
  status?: string
}

interface UpdatePayload {
  fullname?: string
  email?: string
  duty?: string
  status?: string
  adress?: string
}

export interface CreateAdminPayload {
  fullname: string
  email: string
  duty: string
  dateOfBirth: Date
  phoneNumber: string
  password: string
  address: string
}

export async function getAllAdmins(params: AdminParams = {}) {
  try {
    const response = await apiClient.get('/admin/admins/list', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching admins:', error)
    throw error
  }
}

export async function createAdmin(payload: CreateAdminPayload) {
  try {
    const response = await apiClient.post('/admin/admins/create', payload)
    return response.data
  } catch (error) {
    console.error('Error creating admin:', error)
    throw error
  }
}

export async function resetAdminPassword(adminId: string, newPassword: string) {
  try {
    const response = await apiClient.post(`/admin/admins/${adminId}/reset-password`, { newPassword })
    return response.data
  } catch (error) {
    console.error('Error resetting admin password:', error)
    throw error
  }
}

export async function updateAdmin(adminId: string, payload: UpdatePayload) {
  try {
    const response = await apiClient.patch(`/admin/admins/${adminId}`, payload)
    return response.data
  } catch (error) {
    console.error('Error updating admin:', error)
    throw error
  }
}

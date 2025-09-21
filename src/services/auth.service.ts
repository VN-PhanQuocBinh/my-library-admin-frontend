import apiClient from './api.service'
import { type RegisterType } from '@/types/auth-schema'
import { AUTH_ENDPOINTS } from '@/config/api-endpoints';

export const login = async (payload: { email: string; password: string }) => {
   try {
      console.log(payload)
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, payload)
      return response.data
   } catch (error) {
      throw error
   }
}

export const register = async (payload: RegisterType) => {
   try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, payload)
      return response.data
   } catch (error) {
      throw error
   }
}

export const logout = async () => {
   try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT)
      return response.data
   } catch (error) {
      throw error
   }
}

import apiClient from './api.service'
import { type RegisterType } from '@/types/auth-schema'

export const login = async (payload: { email: string; password: string }) => {
   try {
      console.log(payload)
      const response = await apiClient.post('/auth/login', payload)
      return response.data
   } catch (error) {
      throw error
   }
}

export const register = async (payload: RegisterType) => {
   try {
      const response = await apiClient.post('/auth/register', payload)
      return response.data
   } catch (error) {
      throw error
   }
}

export const logout = async () => {
   try {
      const response = await apiClient.post('/auth/logout')
      return response.data
   } catch (error) {
      throw error
   }
}

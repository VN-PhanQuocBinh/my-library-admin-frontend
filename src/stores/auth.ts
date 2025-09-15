import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register } from '@/services/auth.service'

import { type RegisterType } from '@/types/auth-schema'

export const useAuthStore = defineStore('auth', () => {
   const user = ref<string | null>(localStorage.getItem('user'))
   const token = ref<string | null>(localStorage.getItem('token'))
   const isAuthenticated = computed(() => !!token)

   async function loginUser(payload: { email: string; password: string }) {
      try {
         const response = await login(payload)
         const { accessToken, user } = response.data
         if (accessToken && user) {
            localStorage.setItem('token', accessToken)
            localStorage.setItem('user', user)
         }
      } catch (error) {
         throw error
      }
   }

   async function registerUser(payload: RegisterType) {
      try {
         const response = await register(payload)
         return response.data
      } catch (error) {
         throw error
      }
   }

   return { user, token, isAuthenticated, loginUser, registerUser }
})

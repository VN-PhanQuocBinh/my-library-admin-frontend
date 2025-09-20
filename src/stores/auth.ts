import { useRouter } from 'vue-router'

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { login, register } from '@/services/auth.service'

import { type RegisterType } from '@/types/auth-schema'

export const useAuthStore = defineStore('auth', () => {
   const router = useRouter()

   const user = ref<string | null>(localStorage.getItem('user'))
   const token = ref<string | null>(localStorage.getItem('token'))
   const isAuthenticated = computed(() => !!token.value)

   async function loginUser(payload: { email: string; password: string }) {
      try {
         const response = await login(payload)
         const { accessToken, user } = response.data
         if (accessToken && user) {
            console.log('Login successful')
            localStorage.setItem('token', accessToken)
            localStorage.setItem('user', user)
            router.push({ name: 'dashboard' })
         }
      } catch (error) {
         throw error
      }
   }

   // watch

   async function registerUser(payload: RegisterType) {
      try {
         const response = await register(payload)
         return response.data
      } catch (error) {
         throw error
      }
   }

   function clearAuthData() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      user.value = null
      token.value = null
   }

   function logout() {
      clearAuthData()
   }

   return { user, token, isAuthenticated, loginUser, registerUser, logout }
})

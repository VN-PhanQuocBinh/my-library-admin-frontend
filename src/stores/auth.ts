import { useRouter } from 'vue-router'

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { login, register } from '@/services/auth.service'
import type { Admin } from '@/types/admin'

import { type RegisterType } from '@/types/auth-schema'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const user = ref<Admin | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = computed(() => !!token.value)

  console.log(user.value)

  async function loginUser(payload: { email: string; password: string }) {
    try {
      const response = await login(payload)
      const { accessToken, user: _user } = response.data
      if (accessToken && _user) {
        // Store token and user in localStorage
        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(_user))

        // Update the store state
        token.value = accessToken
        user.value = _user

        // navigate to dashboard
        await router.push('/dashboard/home')
        console.log('Login successful')
      }
    } catch (error) {
      throw error
    }
  }

  // watch

  async function registerUser(payload: RegisterType) {
    try {
      const response = await register(payload)
      router.push({ name: 'login' })
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

    router.push({ name: 'login' })
  }

  function logout() {
    clearAuthData()
  }

  return { user, token, isAuthenticated, loginUser, registerUser, logout }
})

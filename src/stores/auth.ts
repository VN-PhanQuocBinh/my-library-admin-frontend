import { useRouter } from 'vue-router'

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  login,
  register,
  getProfile as _getProfile,
  logout as _logout,
} from '@/services/auth.service'
import type { Admin } from '@/types/admin'

import { type RegisterType } from '@/types/auth-schema'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const user = ref<Admin | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = computed(() => !!token.value)

  async function verifyAuthentication() {
    if (user.value && token.value) {
      try {
        await getProfile()
        console.log('User is authenticated')
      } catch (error) {
        console.error('Token is invalid or expired')
        clearAuthData()
      }
    }
  }

  function assignUser(userData: Admin, tokenData?: string) {
    // Store token and user in localStorage
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))

    if (tokenData) {
      token.value = tokenData
      localStorage.setItem('token', tokenData)
    }
  }

  async function loginUser(payload: { email: string; password: string }) {
    try {
      const response = await login(payload)
      const { accessToken, user: _user } = response.data
      if (accessToken && _user) {
        assignUser(_user, accessToken)

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

  async function getProfile() {
    try {
      const response = await _getProfile()
      assignUser(response.data.user)
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

  async function logout() {
    await _logout()
    clearAuthData()
  }

  return { user, token, isAuthenticated, loginUser, registerUser, logout, verifyAuthentication }
})

import axios, { type AxiosInstance } from 'axios'

const apiClient: AxiosInstance = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
   headers: {
      'Content-Type': 'application/json',
   },
   timeout: 10000,
})

apiClient.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem('token')
      if (token) {
         config.headers.Authorization = `Bearer ${token}`
      }

      return config
   },
   (error) => {
      return Promise.reject(error)
   },
)

apiClient.interceptors.response.use(
   (response) => {
      return response
   },
   (error) => {
      const { status } = error.response

      if (status === 401) {
         // Handle unauthorized access, e.g., redirect to login
         console.error('Unauthorized access - perhaps redirect to login?')
      }
      return Promise.reject(error)
   },
)

export default apiClient

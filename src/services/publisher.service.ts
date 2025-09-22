import apiClient from './api.service'

export const fetchPublishers = async () => {
   try {
      const response = await apiClient.get('/publisher/list')
      return response.data
   } catch (error) {
      console.error('Error fetching publishers:', error)
      throw error
   }
}

// export const createPublisher = async (data) => {
//    try {
//       const response = await apiClient.post('/publisher/list', data)
//       return response.data
//    } catch (error) {
//       console.error('Error creating publisher:', error)
//       throw error
//    }
// }

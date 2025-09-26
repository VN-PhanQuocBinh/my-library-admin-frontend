import apiClient from './api.service'
import type { Publisher } from '@/types/publisher'

export const getAllPublishers = async () => {
  try {
    const response = await apiClient.get('/publisher/list')
    return response.data
  } catch (error) {
    console.error('Error fetching publishers:', error)
    throw error
  }
}

export const createPublisher = async (data: Publisher) => {
  try {
    const response = await apiClient.post('/publisher/create', {
      name: data.name,
      address: data.address,
    })
    return response.data
  } catch (error) {
    console.error('Error creating publisher:', error)
    throw error
  }
}

export const updatePublisher = async (data: Publisher) => {
  try {
    const response = await apiClient.patch(`/publisher/${data._id}`, {
      name: data.name,
      address: data.address,
    })
    return response.data
  } catch (error) {
    console.error('Error updating publisher:', error)
    throw error
  }
}

export const deletePublisher = async (id: string) => {
  try {
    const response = await apiClient.delete(`/publisher/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting publisher:', error)
    throw error
  }
}

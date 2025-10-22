// API configuration for MyCityKg backend
const API_BASE_URL = 'http://localhost:3001/api/v1'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  // Reports endpoints
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/reports${queryString ? `?${queryString}` : ''}`)
  }

  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  }

  async getReport(id) {
    return this.request(`/reports/${id}`)
  }

  async updateReport(id, data) {
    return this.request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteReport(id) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE',
    })
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile')
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Volunteer tasks endpoints
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/tasks${queryString ? `?${queryString}` : ''}`)
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`)
  }

  // Upload endpoints
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('image', file)

    return this.request('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }

  // Health check
  async healthCheck() {
    return fetch(`${this.baseURL.replace('/api/v1', '')}/health`)
      .then(res => res.json())
  }
}

export const apiService = new ApiService()
export default apiService

// Base API configuration
const API_BASE_URL = "http://localhost:5002/api"

// Helper function for handling API responses
async function handleResponse(response: Response) {
  const data = await response.json()

  if (!response.ok) {
    const error = data.message || response.statusText
    throw new Error(error)
  }

  return data
}

// Generic fetch function with authentication
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const config = {
    ...options,
    headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

// API request functions
export const api = {
  get: (endpoint: string) => fetchWithAuth(endpoint),

  post: (endpoint: string, data: any) =>
    fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data: any) =>
    fetchWithAuth(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint: string, data: any) =>
    fetchWithAuth(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string) =>
    fetchWithAuth(endpoint, {
      method: "DELETE",
    }),
}



import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Attach access token to outgoing requests
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access') || localStorage.getItem('jwt_token')
  if (access) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

// Response interceptor to attempt refresh on 401 (best-effort)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    // If unauthorized and we have a refresh token, try refresh once
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const resp = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh })
          const newAccess = resp.data?.access
          if (newAccess) {
            localStorage.setItem('access', newAccess)
            // update header and retry
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
            return api(originalRequest)
          }
        } catch (err) {
          // refresh failed; fall through to logout
        }
      }
      // no refresh or refresh failed: clear auth and redirect to sign-in
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      try { window.location.href = '/signin' } catch (e) {}
    }
    return Promise.reject(error)
  }
)

export default api

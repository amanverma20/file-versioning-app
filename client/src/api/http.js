import axios from 'axios'

// Point the client to the backend server running on port 5000
const api = axios.create({ baseURL: 'http://localhost:5000/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If server returns 401, clear token so UI can react and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      try { localStorage.removeItem('token') } catch(e){}
      // let the app handle navigation (components will see token removed)
    }
    return Promise.reject(err)
  }
)

export default api

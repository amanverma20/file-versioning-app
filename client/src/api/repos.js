import api from './http'

export const getRepos = () => api.get('/repos')
export const createRepo = (data) => api.post('/repos', data)
export const getRepo = (id) => api.get(`/repos/${id}`)
export const addCollaborator = (id, data) => api.post(`/repos/${id}/collaborators`, data)
export const updateRepo = (id, data) => api.put(`/repos/${id}`, data)
export const deleteRepo = (id) => api.delete(`/repos/${id}`)

import api from './http'

export const uploadFile = (repoId, formData, config = {}) => api.post(`/files/${repoId}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, ...config })
export const listFiles = (repoId) => api.get(`/files/${repoId}`)
export const getVersions = (repoId, fileId) => api.get(`/files/${repoId}/files/${fileId}/versions`)
export const downloadVersion = (versionId) => api.get(`/files/download/${versionId}`, { responseType: 'blob' })

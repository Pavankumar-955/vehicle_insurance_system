import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8090';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Log error details for debugging
    if (err.response?.status >= 400 && err.response?.status < 500) {
      console.warn(`API Error ${err.response.status}:`, err.config?.url, err.response?.data)
    }
    // Only auto-logout on 401 if it's from auth endpoints
    // For other endpoints, let components handle the error gracefully
    if (err.response?.status === 401 && err.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)
export const getMe = () => api.get('/api/auth/me')

// Profile
export const getMyProfile = () => api.get('/api/profile')
export const updateMyProfile = (data) => api.put('/api/profile', data)
export const getAllUsers = () => api.get('/api/profile/admin/users')
export const getUserProfile = (id) => api.get(`/api/profile/admin/users/${id}`)

// Vehicles
export const getVehicles = () => api.get('/api/vehicles')
export const getVehicle = (id) => api.get(`/api/vehicles/${id}`)
export const addVehicle = (data) => api.post('/api/vehicles', data)
export const updateVehicle = (id, data) => api.put(`/api/vehicles/${id}`, data)
export const deleteVehicle = (id) => api.delete(`/api/vehicles/${id}`)

// Plans removed from frontend API (handled server-side or not used in UI)

// Policies
export const buyPolicy = (data) => api.post('/api/policies/buy', data)
export const calculatePremium = (vehicleId, policyType, adminPlanId) =>
  api.get('/api/policies/calculate-premium', { params: { vehicleId, policyType, adminPlanId } })

// Admin Plans (frontend helpers)
export const listAdminPlans = (policyType, engineCC) =>
  api.get('/api/admin-plans', { params: { policyType, engineCC } })

export const getAdminPlan = (id) => api.get(`/api/admin-plans/${id}`)

export const createAdminPlan = (data) => api.post('/api/admin-plans', data)

export const updateAdminPlan = (id, data) => api.put(`/api/admin-plans/${id}`, data)
export const renewPolicy = (policyId) => api.post(`/api/policies/${policyId}/renew`)
export const getMyPolicies = () => api.get('/api/policies')
export const getMyActivePolicies = () => api.get('/api/policies/active')
export const requestPolicyCancellation = (policyId, data) => api.post(`/api/policies/${policyId}/cancel-request`, data)
export const getMyCancellationRequests = () => api.get('/api/policies/cancellation-requests/my')

// Claims
export const submitClaim = (data) => api.post('/api/claims', data)
export const getMyClaims = () => api.get('/api/claims')
export const getClaimDocuments = (claimId) => api.get(`/api/documents/entity/${claimId}`, { params: { entityType: 'CLAIM' } })
export const downloadClaimApprovalCertificate = (claimId) => api.get(`/api/claims/${claimId}/approval-certificate`, { responseType: 'blob' })

// Tickets
export const getTickets = () => api.get('/api/tickets')
export const getAllTickets = () => api.get('/api/tickets/all')
export const getTicket = (id) => api.get(`/api/tickets/${id}`)
export const createTicket = (data) => api.post('/api/tickets', data)
export const addTicketReply = (id, data) => api.post(`/api/tickets/${id}/replies`, data)
export const updateTicketStatus = (id, status) => api.put(`/api/tickets/${id}/status`, null, { params: { status } })
export const closeTicket = (id) => api.put(`/api/tickets/${id}/close`)
export const reopenTicket = (id) => api.put(`/api/tickets/${id}/reopen`)
export const getTicketReplies = (id) => api.get(`/api/tickets/${id}/replies`)

// Documents
export const uploadDocument = (formData) => api.post('/api/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const downloadDocument = (id) => api.get(`/api/documents/${id}/download`, { responseType: 'blob' })
export const getUserDocuments = () => api.get('/api/documents')
export const getDocumentsByEntity = (entityId, entityType) => api.get(`/api/documents/entity/${entityId}`, { params: { entityType } })
export const deleteDocument = (id) => api.delete(`/api/documents/${id}`)
export const downloadPolicyPdf = (policyId) => api.get(`/api/policies/${policyId}/pdf`, { responseType: 'blob' })

// Admin
export const getAdminDashboard = () => api.get('/api/admin/dashboard')
export const getAdminCustomers = () => api.get('/api/admin/customers')
export const getAdminPolicies = () => api.get('/api/admin/policies')
export const getAdminClaims = () => api.get('/api/admin/claims')
export const updateClaimStatus = (id, data) => api.put(`/api/admin/claims/${id}/status`, data)

// Admin Policy Cancellation Requests
export const getAdminCancellationRequests = () => api.get('/api/admin/policy-cancellation-requests')
export const getAdminPendingCancellationRequests = () => api.get('/api/admin/policy-cancellation-requests/pending')
export const approveCancellationRequest = (id, data) => api.post(`/api/admin/policy-cancellation-requests/${id}/approve`, data)
export const rejectCancellationRequest = (id, data) => api.post(`/api/admin/policy-cancellation-requests/${id}/reject`, data)

// Admin Tickets
export const getAdminTickets = () => api.get('/api/admin/tickets')
export const getAdminTicket = (id) => api.get(`/api/admin/tickets/${id}`)
export const getAdminTicketReplies = (id) => api.get(`/api/admin/tickets/${id}/replies`)
export const addAdminTicketReply = (id, data) => api.post(`/api/admin/tickets/${id}/replies`, data)
export const updateAdminTicketStatus = (id, status) => api.put(`/api/admin/tickets/${id}/status`, null, { params: { status } })

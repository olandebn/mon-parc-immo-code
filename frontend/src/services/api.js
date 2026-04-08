import axios from 'axios'

// En production (Vercel), VITE_API_URL pointe vers Railway (ex: https://mon-app.railway.app)
// En développement, le proxy Vite redirige /api → localhost:8080
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

// Instance axios de base
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - rediriger vers login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ==============================
// Services Property
// ==============================
export const propertyService = {
  getAllProperties: () => api.get('/properties'),
  getProperty: (propertyId) => api.get(`/properties/${propertyId}`),
  createProperty: (data) => api.post('/admin/properties', data),
  updateProperty: (propertyId, data) => api.put(`/admin/properties/${propertyId}`, data),
  deleteProperty: (propertyId) => api.delete(`/admin/properties/${propertyId}`),
  addMainPhoto: (propertyId, url) => api.post(`/admin/properties/${propertyId}/photos/main`, { url }),
  addSurroundingPhoto: (propertyId, url) => api.post(`/admin/properties/${propertyId}/photos/surrounding`, { url }),
}

// ==============================
// Services Réservations
// ==============================
export const reservationService = {
  getUnavailableDates: (propertyId) => api.get(`/properties/${propertyId}/unavailable-dates`),
  createReservation: (propertyId, data) => api.post(`/properties/${propertyId}/reservations`, data),
  getMyReservations: () => api.get('/reservations/my'),
  getReservation: (id) => api.get(`/reservations/${id}`),
  cancelReservation: (id) => api.patch(`/reservations/${id}/cancel`),
  // Admin
  getAllReservations: () => api.get('/admin/reservations'),
  getReservationsByProperty: (propertyId) => api.get(`/admin/properties/${propertyId}/reservations`),
  confirmReservation: (id) => api.patch(`/admin/reservations/${id}/confirm`),
  addAdminNote: (id, notes) => api.patch(`/admin/reservations/${id}/notes`, { notes }),
}

// ==============================
// Services Tarifs
// ==============================
export const pricingService = {
  getActiveSeasons: (propertyId) => api.get(`/pricing/${propertyId}/seasons`),
  calculatePrice: (propertyId, checkIn, checkOut) =>
    api.get(`/pricing/${propertyId}/calculate`, { params: { checkIn, checkOut } }),
  // Admin
  getAllSeasons: (propertyId) => api.get(`/admin/pricing/${propertyId}/seasons`),
  createSeason: (propertyId, data) => api.post(`/admin/pricing/${propertyId}/seasons`, data),
  updateSeason: (propertyId, id, data) => api.put(`/admin/pricing/${propertyId}/seasons/${id}`, data),
  deleteSeason: (propertyId, id) => api.delete(`/admin/pricing/${propertyId}/seasons/${id}`),
}

// ==============================
// Services Utilisateurs / Invitations
// ==============================
export const userService = {
  validateInvitation: (token) => api.get(`/auth/invitation/${token}`),
  acceptInvitation: (token, password) =>
    api.post(`/auth/invitation/${token}/accept`, { password }),
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (data) => api.put('/users/me', data),
  // Admin
  getAllUsers: () => api.get('/admin/users'),
  createInvitation: (data) => api.post('/admin/invitations', data),
  getAllInvitations: () => api.get('/admin/invitations'),
  deactivateUser: (uid) => api.patch(`/admin/users/${uid}/deactivate`),
}

// ==============================
// Services Messages
// ==============================
export const messageService = {
  sendMessage: (reservationId, content) =>
    api.post(`/messages/reservation/${reservationId}`, { content }),
  getMessages: (reservationId) =>
    api.get(`/messages/reservation/${reservationId}`),
  markAsRead: (reservationId) =>
    api.patch(`/messages/reservation/${reservationId}/read`),
  // Admin
  getAllThreads: () => api.get('/messages/admin/threads'),
}

// ==============================
// Services Avis
// ==============================
export const reviewService = {
  getPublicReviews: (propertyId) => api.get(`/reviews/public/${propertyId}`),
  getReviewSummary: (propertyId) => api.get(`/reviews/public/${propertyId}/summary`),
  submitReview: (propertyId, data) => api.post(`/reviews/${propertyId}`, data),
  // Admin
  getAllReviews: (propertyId) => api.get(`/admin/reviews/${propertyId}`),
  respondToReview: (id, response) =>
    api.patch(`/admin/reviews/${id}/respond`, { response }),
  toggleVisibility: (id, visible) =>
    api.patch(`/admin/reviews/${id}/visibility`, { visible }),
}

// ==============================
// Services Documents
// ==============================
export const documentService = {
  getClientDocuments: (propertyId) => api.get(`/documents/${propertyId}`),
  // Admin
  getAllDocuments: (propertyId) => api.get(`/admin/documents/${propertyId}`),
  addDocument: (propertyId, data) => api.post(`/admin/documents/${propertyId}`, data),
  updateDocument: (id, data) => api.put(`/admin/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/admin/documents/${id}`),
}

// ==============================
// Services Statistiques (Admin)
// ==============================
export const statsService = {
  getYearlyStats: (propertyId, year) => api.get(`/admin/statistics/${propertyId}/year/${year}`),
  getBookingsPerMonth: (propertyId, year) =>
    api.get(`/admin/statistics/${propertyId}/bookings-per-month/${year}`),
  getFinancialSummary: (propertyId, year) =>
    api.get(`/admin/statistics/${propertyId}/financial/${year}`),
  getClientsHistory: (propertyId) => api.get(`/admin/statistics/${propertyId}/clients-history`),
  getOccupancyRate: (propertyId, year) =>
    api.get(`/admin/statistics/${propertyId}/occupancy-rate/${year}`),
}

// ==============================
// Services Dépenses (Admin)
// ==============================
export const expenseService = {
  getAllExpenses: (propertyId) => api.get(`/admin/expenses/${propertyId}`),
  getExpensesByYear: (propertyId, year) => api.get(`/admin/expenses/${propertyId}/year/${year}`),
  getExpenseSummary: (propertyId, year) => api.get(`/admin/expenses/${propertyId}/summary/${year}`),
  addExpense: (propertyId, data) => api.post(`/admin/expenses/${propertyId}`, data),
  updateExpense: (id, data) => api.put(`/admin/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/admin/expenses/${id}`),
}

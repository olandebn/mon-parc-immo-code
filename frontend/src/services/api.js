import axios from 'axios'

// Instance axios de base
const api = axios.create({
  baseURL: '/api',
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
  getProperty: () => api.get('/property'),
  updateProperty: (data) => api.put('/property', data),
  addMainPhoto: (url) => api.post('/property/photos/main', { url }),
  addSurroundingPhoto: (url) => api.post('/property/photos/surrounding', { url }),
}

// ==============================
// Services Réservations
// ==============================
export const reservationService = {
  getUnavailableDates: () => api.get('/reservations/unavailable-dates'),
  createReservation: (data) => api.post('/reservations', data),
  getMyReservations: () => api.get('/reservations/my'),
  getReservation: (id) => api.get(`/reservations/${id}`),
  cancelReservation: (id) => api.patch(`/reservations/${id}/cancel`),
  // Admin
  getAllReservations: () => api.get('/reservations/admin/all'),
  confirmReservation: (id) => api.patch(`/reservations/admin/${id}/confirm`),
  addAdminNote: (id, notes) => api.patch(`/reservations/admin/${id}/notes`, { notes }),
}

// ==============================
// Services Tarifs
// ==============================
export const pricingService = {
  getActiveSeasons: () => api.get('/pricing/seasons'),
  calculatePrice: (checkIn, checkOut) =>
    api.get('/pricing/calculate', { params: { checkIn, checkOut } }),
  // Admin
  getAllSeasons: () => api.get('/pricing/admin/seasons'),
  createSeason: (data) => api.post('/pricing/admin/seasons', data),
  updateSeason: (id, data) => api.put(`/pricing/admin/seasons/${id}`, data),
  deleteSeason: (id) => api.delete(`/pricing/admin/seasons/${id}`),
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
  getPublicReviews: () => api.get('/reviews/public'),
  getReviewSummary: () => api.get('/reviews/public/summary'),
  submitReview: (data) => api.post('/reviews', data),
  // Admin
  getAllReviews: () => api.get('/reviews/admin/all'),
  respondToReview: (id, response) =>
    api.patch(`/reviews/admin/${id}/respond`, { response }),
  toggleVisibility: (id, visible) =>
    api.patch(`/reviews/admin/${id}/visibility`, { visible }),
}

// ==============================
// Services Documents
// ==============================
export const documentService = {
  getClientDocuments: () => api.get('/documents'),
  // Admin
  getAllDocuments: () => api.get('/documents/admin/all'),
  addDocument: (data) => api.post('/documents/admin', data),
  updateDocument: (id, data) => api.put(`/documents/admin/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/admin/${id}`),
}

// ==============================
// Services Statistiques (Admin)
// ==============================
export const statsService = {
  getYearlyStats: (year) => api.get(`/admin/statistics/year/${year}`),
  getBookingsPerMonth: (year) =>
    api.get(`/admin/statistics/bookings-per-month/${year}`),
  getFinancialSummary: (year) =>
    api.get(`/admin/statistics/financial/${year}`),
  getClientsHistory: () => api.get('/admin/statistics/clients-history'),
  getOccupancyRate: (year) =>
    api.get(`/admin/statistics/occupancy-rate/${year}`),
}

// ==============================
// Services Dépenses (Admin)
// ==============================
export const expenseService = {
  getAllExpenses: () => api.get('/admin/expenses'),
  getExpensesByYear: (year) => api.get(`/admin/expenses/year/${year}`),
  getExpenseSummary: (year) => api.get(`/admin/expenses/summary/${year}`),
  addExpense: (data) => api.post('/admin/expenses', data),
  updateExpense: (id, data) => api.put(`/admin/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/admin/expenses/${id}`),
}

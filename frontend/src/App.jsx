import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages publiques
import HomePage from './pages/HomePage'
import PropertyPage from './pages/PropertyPage'
import LoginPage from './pages/LoginPage'
import InvitationPage from './pages/InvitationPage'
import SetupAdminPage from './pages/SetupAdminPage'

// Pages client (authentifié)
import BookingPage from './pages/BookingPage'
import MyReservationsPage from './pages/MyReservationsPage'
import ReservationDetailPage from './pages/ReservationDetailPage'
import InstructionsPage from './pages/InstructionsPage'

// Pages admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProperties from './pages/admin/AdminProperties'
import AdminBookings from './pages/admin/AdminBookings'
import AdminPricing from './pages/admin/AdminPricing'
import AdminDocuments from './pages/admin/AdminDocuments'
import AdminStats from './pages/admin/AdminStats'
import AdminExpenses from './pages/admin/AdminExpenses'
import AdminMessages from './pages/admin/AdminMessages'
import AdminUsers from './pages/admin/AdminUsers'

// Affiche la homepage pour tout le monde.
// Les admins sont redirigés vers /admin uniquement après la connexion (dans LoginPage),
// pas à chaque visite de "/" — pour qu'ils puissent revenir à l'accueil librement.
function SmartHome() {
  return <HomePage />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<SmartHome />} />
          <Route path="/biens/:propertyId" element={<PropertyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/invitation/:token" element={<InvitationPage />} />

          {/* Routes client authentifié */}
          <Route path="/biens/:propertyId/reserver" element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } />
          <Route path="/booking" element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } />
          <Route path="/mes-reservations" element={
            <ProtectedRoute>
              <MyReservationsPage />
            </ProtectedRoute>
          } />
          <Route path="/reservations/:id" element={
            <ProtectedRoute>
              <ReservationDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/instructions" element={
            <ProtectedRoute>
              <InstructionsPage />
            </ProtectedRoute>
          } />

          {/* Routes admin */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/biens" element={
            <ProtectedRoute requireAdmin>
              <AdminProperties />
            </ProtectedRoute>
          } />
          <Route path="/admin/reservations" element={
            <ProtectedRoute requireAdmin>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/tarifs" element={
            <ProtectedRoute requireAdmin>
              <AdminPricing />
            </ProtectedRoute>
          } />
          <Route path="/admin/documents" element={
            <ProtectedRoute requireAdmin>
              <AdminDocuments />
            </ProtectedRoute>
          } />
          <Route path="/admin/statistiques" element={
            <ProtectedRoute requireAdmin>
              <AdminStats />
            </ProtectedRoute>
          } />
          <Route path="/admin/depenses" element={
            <ProtectedRoute requireAdmin>
              <AdminExpenses />
            </ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute requireAdmin>
              <AdminMessages />
            </ProtectedRoute>
          } />
          <Route path="/admin/utilisateurs" element={
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          } />

          {/* Setup — passer son compte en mode Gérant */}
          <Route path="/setup" element={<SetupAdminPage />} />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

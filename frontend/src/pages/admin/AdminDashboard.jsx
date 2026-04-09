import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { reservationService, messageService } from '../../services/api'
import {
  Calendar, Users, Euro, BarChart2, FileText,
  MessageSquare, Settings, TrendingUp, Home, Building2
} from 'lucide-react'

const AdminNavLink = ({ to, icon: Icon, label, badge }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100
               hover:shadow-md hover:border-blue-200 transition-all group"
  >
    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center
                    group-hover:bg-blue-600 transition-colors">
      <Icon className="w-5 h-5 text-blue-600 group-hover:text-white" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900">{label}</p>
    </div>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </Link>
)

export default function AdminDashboard() {
  const { userProfile } = useAuth()
  const currentYear = new Date().getFullYear()
  const [stats, setStats] = useState(null)
  const [recentReservations, setRecentReservations] = useState([])
  const [unreadThreads, setUnreadThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reservationService.getAllReservations(),
      messageService.getAllThreads(),
    ])
      .then(([reservRes, msgRes]) => {
        const allReservations = reservRes.data || []
        const yearReservations = allReservations.filter(r => {
          const y = r.checkInDate ? new Date(r.checkInDate).getFullYear() : null
          return y === currentYear
        })
        const totalRevenue = yearReservations
          .filter(r => r.status !== 'CANCELLED')
          .reduce((sum, r) => sum + (r.totalPrice || 0), 0)
        const totalNights = yearReservations
          .filter(r => r.status !== 'CANCELLED')
          .reduce((sum, r) => {
            const nights = r.checkInDate && r.checkOutDate
              ? Math.max(1, Math.round((new Date(r.checkOutDate) - new Date(r.checkInDate)) / 86400000))
              : 0
            return sum + nights
          }, 0)
        const confirmedCount = yearReservations.filter(r => r.status !== 'CANCELLED').length
        setStats({
          totalReservations: yearReservations.length,
          totalRevenue,
          totalNights,
          averageStayDuration: confirmedCount > 0 ? totalNights / confirmedCount : 0,
        })
        setRecentReservations(allReservations.slice(0, 5))
        setUnreadThreads(msgRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pendingReservations = recentReservations.filter(r => r.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header admin */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">MonParcImmo</span>
            <span className="text-sm text-gray-400">/ Administration</span>
          </div>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Voir le site
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {userProfile?.firstName || 'Admin'} 👋
          </h1>
          <p className="text-gray-500 mt-1">Tableau de bord - {currentYear}</p>
        </div>

        {/* Statistiques rapides */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-24 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-gray-500">Réservations {currentYear}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalReservations}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Revenus {currentYear}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.totalRevenue?.toFixed(0)} €
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Nuits louées</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.totalNights}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Séjour moyen</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {stats.averageStayDuration?.toFixed(1)} nuits
              </p>
            </div>
          </div>
        )}

        {/* Navigation principale */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <AdminNavLink to="/admin/biens" icon={Building2} label="Mes biens" />
          <AdminNavLink
            to="/admin/reservations"
            icon={Calendar}
            label="Réservations"
            badge={pendingReservations}
          />
          <AdminNavLink
            to="/admin/messages"
            icon={MessageSquare}
            label="Messages"
            badge={unreadThreads.length}
          />
          <AdminNavLink to="/admin/tarifs" icon={Euro} label="Tarifs & Saisons" />
          <AdminNavLink to="/admin/documents" icon={FileText} label="Documents" />
          <AdminNavLink to="/admin/statistiques" icon={BarChart2} label="Statistiques & Revenus" />
          <AdminNavLink to="/admin/depenses" icon={TrendingUp} label="Dépenses & Charges" />
          <AdminNavLink to="/admin/utilisateurs" icon={Users} label="Utilisateurs" />
        </div>

        {/* Dernières réservations */}
        {recentReservations.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Dernières réservations
              </h2>
              <Link to="/admin/reservations" className="text-sm text-blue-600 hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {recentReservations.map((r) => (
                <Link
                  key={r.id}
                  to={`/admin/reservations`}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.clientName}</p>
                    <p className="text-xs text-gray-500">
                      {r.checkInDate} → {r.checkOutDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{r.totalPrice} €</p>
                    <span className={`text-xs ${
                      r.status === 'CONFIRMED' ? 'text-green-600' :
                      r.status === 'PENDING' ? 'text-yellow-600' :
                      'text-gray-400'
                    }`}>
                      {r.status === 'CONFIRMED' ? 'Confirmée' :
                       r.status === 'PENDING' ? 'En attente' :
                       r.status === 'CANCELLED' ? 'Annulée' : 'Terminée'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

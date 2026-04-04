import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, Calendar, FileText, LogOut, Menu, X, Settings, BarChart2 } from 'lucide-react'

export default function Navbar() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MonParcImmo</span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Accueil
            </Link>

            {currentUser && (
              <>
                <Link
                  to="/booking"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/booking') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Réserver
                </Link>
                <Link
                  to="/mes-reservations"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/mes-reservations') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mes réservations
                </Link>
                <Link
                  to="/instructions"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/instructions') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Guide
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                <Settings className="w-4 h-4" />
                Administration
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {userProfile?.firstName || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Connexion
              </Link>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link to="/" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Accueil</Link>
          {currentUser && (
            <>
              <Link to="/booking" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Réserver</Link>
              <Link to="/mes-reservations" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Mes réservations</Link>
              <Link to="/instructions" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Guide</Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="block py-2 text-sm text-purple-600 font-medium" onClick={() => setMenuOpen(false)}>Administration</Link>
          )}
          {currentUser ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-sm text-red-600">Déconnexion</button>
          ) : (
            <Link to="/login" className="block py-2 text-sm text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Connexion</Link>
          )}
        </div>
      )}
    </nav>
  )
}

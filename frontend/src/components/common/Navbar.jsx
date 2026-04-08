import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, LogOut, Menu, X, Settings } from 'lucide-react'

export default function Navbar({ dark = false }) {
  const { currentUser, userProfile, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!dark) return
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [dark])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  /* ── Styles dynamiques selon le mode ── */
  const navBg = dark
    ? scrolled
      ? 'rgba(4,5,15,0.92)'
      : 'transparent'
    : '#ffffff'

  const navBorder = dark
    ? scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none'
    : '1px solid #f1f5f9'

  const navShadow = dark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'

  const logoText  = dark ? '#f8fafc' : '#111827'
  const linkColor = dark ? 'rgba(255,255,255,0.65)' : '#6b7280'
  const linkHover = dark ? '#ffffff' : '#111827'
  const activeColor = dark ? '#818cf8' : '#4f46e5'

  return (
    <nav
      style={{
        position: dark ? 'fixed' : 'sticky',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: navBg,
        borderBottom: navBorder,
        boxShadow: navShadow,
        backdropFilter: dark ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: dark ? 'blur(20px)' : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: dark ? '0 0 16px rgba(99,102,241,0.4)' : '0 2px 8px rgba(99,102,241,0.3)',
            }}>
              <Home style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: logoText, letterSpacing: '-0.02em' }}>
              MonParcImmo
            </span>
          </Link>

          {/* Nav links desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden-mobile">
            {[
              { to: '/', label: 'Accueil', always: true },
              { to: '/mes-reservations', label: 'Mes réservations', auth: true },
              { to: '/instructions', label: 'Guide', auth: true },
            ].filter(l => l.always || (l.auth && currentUser)).map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive(l.to) ? activeColor : linkColor,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = isActive(l.to) ? activeColor : linkHover}
                onMouseLeave={e => e.currentTarget.style.color = isActive(l.to) ? activeColor : linkColor}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 500, color: '#a78bfa', textDecoration: 'none' }}
              >
                <Settings style={{ width: 14, height: 14 }} />
                Admin
              </Link>
            )}
          </div>

          {/* Actions desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden-mobile">
            {currentUser ? (
              <>
                <span style={{ fontSize: 13, color: linkColor }}>
                  {userProfile?.firstName || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 500, color: linkColor,
                    background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = linkColor}
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  fontSize: 14, fontWeight: 600,
                  padding: '8px 20px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  background: dark
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'none' }}
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Burger mobile */}
          <button
            style={{ display: 'none', padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: linkColor }}
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div style={{
          background: dark ? 'rgba(4,5,15,0.98)' : '#ffffff',
          borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9',
          padding: '12px 24px 20px',
        }}>
          {[
            { to: '/', label: 'Accueil' },
            ...(currentUser ? [
              { to: '/mes-reservations', label: 'Mes réservations' },
              { to: '/instructions', label: 'Guide' },
            ] : []),
            ...(isAdmin ? [{ to: '/admin', label: 'Administration', special: true }] : []),
          ].map(l => (
            <Link key={l.to} to={l.to}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 0', fontSize: 15, fontWeight: 500,
                       color: l.special ? '#a78bfa' : (dark ? 'rgba(255,255,255,0.7)' : '#374151'),
                       textDecoration: 'none', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'}` }}>
              {l.label}
            </Link>
          ))}
          <div style={{ paddingTop: 12 }}>
            {currentUser ? (
              <button onClick={handleLogout}
                style={{ fontSize: 14, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                Déconnexion
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                style={{ fontSize: 14, fontWeight: 600, color: '#818cf8', textDecoration: 'none' }}>
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}

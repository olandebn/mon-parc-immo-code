import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, LogOut, Menu, X, LayoutDashboard, Calendar, BookOpen } from 'lucide-react'

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
    navigate('/')
  }

  const isActive = (path) => location.pathname.startsWith(path) && path !== '/'
    || (path === '/' && location.pathname === '/')

  /* ── Styles dynamiques ── */
  const navBg = dark
    ? scrolled ? 'rgba(8,7,6,0.94)' : 'transparent'
    : '#0e0c09'

  const navBorder = dark
    ? scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none'
    : '1px solid rgba(255,255,255,0.06)'

  const logoText  = '#f5f0ea'
  const linkColor = 'rgba(255,255,255,0.55)'
  const linkHover = '#f5f0ea'
  const activeColor = '#e0a84f'

  /* ── Liens selon le rôle ── */
  const navLinks = [
    { to: '/', label: 'Accueil', always: true },
    // Gérant → tableau de bord
    ...(isAdmin ? [
      { to: '/admin', label: 'Mon tableau de bord', icon: LayoutDashboard, adminOnly: true },
    ] : []),
    // Voyageur connecté → ses réservations + guide
    ...(!isAdmin && currentUser ? [
      { to: '/mes-reservations', label: 'Mes réservations', icon: Calendar },
      { to: '/instructions',    label: 'Guide',             icon: BookOpen  },
    ] : []),
  ]

  return (
    <nav style={{
      position: dark ? 'fixed' : 'sticky',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      background: navBg,
      borderBottom: navBorder,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      transition: 'background 0.35s ease, border-color 0.35s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #c9883a, #e0a84f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 18px rgba(201,136,58,0.35)',
            }}>
              <Home style={{ width: 16, height: 16, color: '#080706' }} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: logoText, letterSpacing: '-0.02em' }}>
              MonParcImmo
            </span>
          </Link>

          {/* Liens desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-desktop">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 14, fontWeight: 500,
                  color: isActive(l.to) ? activeColor : (l.adminOnly ? '#e0a84f' : linkColor),
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  opacity: l.adminOnly && !isActive(l.to) ? 0.85 : 1,
                }}
                onMouseEnter={e => e.currentTarget.style.color = l.adminOnly ? '#f0c87a' : (isActive(l.to) ? activeColor : linkHover)}
                onMouseLeave={e => e.currentTarget.style.color = isActive(l.to) ? activeColor : (l.adminOnly ? '#e0a84f' : linkColor)}
              >
                {l.icon && <l.icon style={{ width: 14, height: 14 }} />}
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} className="nav-desktop">
            {currentUser ? (
              <>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userProfile?.firstName
                    ? `${userProfile.firstName}${isAdmin ? ' · Gérant' : ''}`
                    : currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'color 0.2s', padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
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
                  padding: '8px 20px', borderRadius: 10,
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #c9883a, #e0a84f)',
                  color: '#080706',
                  boxShadow: '0 0 18px rgba(201,136,58,0.3)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(201,136,58,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(201,136,58,0.3)'; e.currentTarget.style.transform = 'none' }}
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="nav-mobile"
            style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: linkColor }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div style={{
          background: 'rgba(8,7,6,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 24px 20px',
        }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 0', fontSize: 15, fontWeight: 500,
                color: l.adminOnly ? '#e0a84f' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
              {l.icon && <l.icon style={{ width: 16, height: 16 }} />}
              {l.label}
            </Link>
          ))}
          <div style={{ paddingTop: 14 }}>
            {currentUser ? (
              <button onClick={handleLogout}
                style={{ fontSize: 14, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogOut style={{ width: 14, height: 14 }} /> Déconnexion
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                style={{ fontSize: 14, fontWeight: 600, color: '#e0a84f', textDecoration: 'none' }}>
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile  { display: none !important; }
          .nav-desktop { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { reservationService, messageService } from '../../services/api'
import {
  Home, Building2, Calendar, MessageSquare, BarChart2,
  TrendingUp, FileText, Euro, Users, ArrowRight,
  ChevronRight, LogOut, Bell,
} from 'lucide-react'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .adm-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes adm-fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .adm-fadein { animation: adm-fadein 0.45s ease both; }

  /* Header */
  .adm-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  /* Nav module links */
  .adm-nav-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px;
    text-decoration: none;
    display: flex; align-items: center; gap: 16px;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    position: relative; overflow: hidden;
  }
  .adm-nav-card:hover {
    background: rgba(201,136,58,0.08);
    border-color: rgba(201,136,58,0.25);
    transform: translateY(-2px);
  }
  .adm-nav-card-icon {
    width: 44px; height: 44px; flex-shrink: 0;
    border-radius: 12px;
    background: rgba(201,136,58,0.1);
    border: 1px solid rgba(201,136,58,0.2);
    display: flex; align-items: center; justify-content: center;
  }

  /* Stat cards */
  .adm-stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 22px;
  }

  /* Recent reservation rows */
  .adm-resv-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    text-decoration: none;
    color: inherit;
    transition: background 0.15s;
  }
  .adm-resv-row:last-child { border-bottom: none; }
  .adm-resv-row:hover { opacity: 0.8; }

  /* Badge */
  .adm-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    padding: 3px 8px; border-radius: 99px;
  }
  .adm-badge-pending   { background: rgba(251,191,36,0.15); color: #fbbf24; }
  .adm-badge-confirmed { background: rgba(34,197,94,0.15);  color: #4ade80; }
  .adm-badge-cancelled { background: rgba(239,68,68,0.15);  color: #f87171; }
  .adm-badge-completed { background: rgba(201,136,58,0.15); color: #e0a84f; }

  .adm-spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: adm-spin 0.8s linear infinite;
  }
  @keyframes adm-spin { to { transform: rotate(360deg); } }
`

function injectCSS() {
  if (document.getElementById('adm-css')) return
  const s = document.createElement('style')
  s.id = 'adm-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const STATUS = {
  PENDING:   { label: 'En attente', cls: 'adm-badge-pending' },
  CONFIRMED: { label: 'Confirmée',  cls: 'adm-badge-confirmed' },
  CANCELLED: { label: 'Annulée',    cls: 'adm-badge-cancelled' },
  COMPLETED: { label: 'Terminée',   cls: 'adm-badge-completed' },
}

const MODULES = [
  { to: '/admin/biens',         icon: Building2,    label: 'Mes biens',            desc: 'Gérer vos logements' },
  { to: '/admin/depenses',      icon: TrendingUp,   label: 'Charges & Dépenses',   desc: 'Électricité, impôts…' },
  { to: '/admin/statistiques',  icon: BarChart2,    label: 'Statistiques',         desc: 'Revenus & occupation' },
  { to: '/admin/reservations',  icon: Calendar,     label: 'Réservations',         desc: 'Gérer les séjours' },
  { to: '/admin/messages',      icon: MessageSquare,label: 'Messages',             desc: 'Échanges voyageurs' },
  { to: '/admin/tarifs',        icon: Euro,         label: 'Tarifs & Saisons',     desc: 'Prix & périodes' },
  { to: '/admin/documents',     icon: FileText,     label: 'Documents',            desc: 'Contrats & fichiers' },
  { to: '/admin/utilisateurs',  icon: Users,        label: 'Utilisateurs',         desc: 'Gérer les accès' },
]

export default function AdminDashboard() {
  const { userProfile, logout } = useAuth()
  const currentYear = new Date().getFullYear()
  const [stats, setStats] = useState(null)
  const [recentReservations, setRecentReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    injectCSS()
    Promise.all([
      reservationService.getAllReservations().catch(() => ({ data: [] })),
      messageService.getAllThreads().catch(() => ({ data: [] })),
    ]).then(([reservRes]) => {
      const all = reservRes.data || []
      const thisYear = all.filter(r =>
        r.checkInDate && new Date(r.checkInDate).getFullYear() === currentYear
      )
      const active = thisYear.filter(r => r.status !== 'CANCELLED')
      const revenue = active.reduce((s, r) => s + (r.totalPrice || 0), 0)
      const nights = active.reduce((s, r) => {
        if (!r.checkInDate || !r.checkOutDate) return s
        return s + Math.max(1, Math.round((new Date(r.checkOutDate) - new Date(r.checkInDate)) / 86400000))
      }, 0)
      setStats({
        total: thisYear.length,
        pending: thisYear.filter(r => r.status === 'PENDING').length,
        revenue,
        nights,
      })
      setRecentReservations(all.slice(0, 6))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="adm-root">

      {/* ── Header ── */}
      <header className="adm-header">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #c9883a, #e0a84f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={16} style={{ color: '#080706' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>MonParcImmo</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>/ Tableau de bord</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              Voir le site public
            </Link>
            <button
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Bonjour ── */}
        <div className="adm-fadein" style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: '#c9883a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Bienvenue
          </p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#f5f0ea', marginBottom: 6 }}>
            Bonjour, {userProfile?.firstName || 'Gérant'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            Tableau de bord — {currentYear}
          </p>
        </div>

        {/* ── Stats rapides ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0 48px' }}>
            <div className="adm-spinner" />
          </div>
        ) : stats && (
          <div className="adm-fadein" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
            {[
              { label: `Réservations ${currentYear}`, val: stats.total,               color: '#f5f0ea' },
              { label: 'En attente',                  val: stats.pending,             color: '#fbbf24' },
              { label: `Revenus ${currentYear}`,      val: `${stats.revenue.toFixed(0)} €`, color: '#4ade80' },
              { label: 'Nuits louées',                val: stats.nights,              color: '#e0a84f' },
            ].map(({ label, val, color }) => (
              <div key={label} className="adm-stat">
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-0.04em' }}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Modules ── */}
        <div className="adm-fadein" style={{ marginBottom: 48, animationDelay: '0.05s' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
            ✦ Gestion
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {MODULES.map(({ to, icon: Icon, label, desc }, i) => (
              <Link key={to} to={to} className="adm-nav-card adm-fadein" style={{ animationDelay: `${0.05 + i * 0.04}s` }}>
                <div className="adm-nav-card-icon">
                  <Icon size={20} style={{ color: '#e0a84f' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#f5f0ea', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: '#475569', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Dernières réservations ── */}
        <div className="adm-fadein" style={{ animationDelay: '0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ✦ Dernières réservations
            </p>
            <Link to="/admin/reservations" style={{ fontSize: 13, color: '#e0a84f', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Voir tout <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '0 20px' }}>
            {loading ? (
              <p style={{ padding: '20px 0', color: '#475569', fontSize: 14 }}>Chargement…</p>
            ) : recentReservations.length === 0 ? (
              <p style={{ padding: '28px 0', color: '#475569', fontSize: 14, textAlign: 'center' }}>
                Aucune réservation pour l'instant.
              </p>
            ) : (
              recentReservations.map(r => {
                const s = STATUS[r.status] || STATUS.PENDING
                return (
                  <Link key={r.id} to="/admin/reservations" className="adm-resv-row">
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#f5f0ea', marginBottom: 3 }}>{r.clientName || 'Voyageur'}</p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>
                        {r.checkInDate} → {r.checkOutDate}
                        {r.propertyName && <span style={{ marginLeft: 8, color: '#475569' }}>· {r.propertyName}</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {r.totalPrice > 0 && (
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#e0a84f' }}>{r.totalPrice} €</span>
                      )}
                      <span className={`adm-badge ${s.cls}`}>{s.label}</span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

      </main>
    </div>
  )
}

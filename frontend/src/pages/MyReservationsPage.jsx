import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { reservationService } from '../services/api'
import { Calendar, ChevronRight, Home, Clock, Users, Euro } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  .mrp-root {
    min-height: 100vh;
    background: #080706;
    color: #f5f0ea;
  }
  @keyframes mrp-fadein {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .mrp-fadein { animation: mrp-fadein 0.5s ease both; }
  .mrp-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 22px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    text-decoration: none;
    color: inherit;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    cursor: pointer;
  }
  .mrp-card:hover {
    background: rgba(201,136,58,0.08);
    border-color: rgba(201,136,58,0.3);
    transform: translateY(-2px);
  }
  .mrp-status-pending {
    background: rgba(251,191,36,0.12);
    border: 1px solid rgba(251,191,36,0.3);
    color: #fbbf24;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 999px;
    display: inline-block;
  }
  .mrp-status-confirmed {
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.3);
    color: #4ade80;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 999px;
    display: inline-block;
  }
  .mrp-status-cancelled {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 999px;
    display: inline-block;
  }
  .mrp-status-completed {
    background: rgba(201,136,58,0.12);
    border: 1px solid rgba(201,136,58,0.3);
    color: #818cf8;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 999px;
    display: inline-block;
  }
  .mrp-icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(201,136,58,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .mrp-empty {
    background: rgba(255,255,255,0.03);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 60px 24px;
    text-align: center;
  }
  .mrp-btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: 12px;
    background: linear-gradient(135deg, #c9883a, #6366f1);
    color: white;
    font-weight: 600;
    font-size: 15px;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .mrp-btn-primary:hover { opacity: 0.85; }
  .mrp-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: mrp-spin 0.8s linear infinite;
  }
  @keyframes mrp-spin { to { transform: rotate(360deg); } }
  .mrp-nights-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #64748b;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    padding: 3px 10px;
    border-radius: 999px;
  }
`

function injectCSS(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style')
    el.id = id
    el.textContent = css
    document.head.appendChild(el)
  }
}

const STATUS_MAP = {
  PENDING:   { label: 'En attente',  cls: 'mrp-status-pending' },
  CONFIRMED: { label: 'Confirmée',   cls: 'mrp-status-confirmed' },
  CANCELLED: { label: 'Annulée',     cls: 'mrp-status-cancelled' },
  COMPLETED: { label: 'Terminée',    cls: 'mrp-status-completed' },
}

function nightsBetween(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)))
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  injectCSS('mrp-styles', CSS)

  useEffect(() => {
    reservationService.getMyReservations()
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mrp-root">
      <Navbar dark />

      {/* Decorative blob */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '10%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,136,58,0.07) 0%, transparent 70%)',
        }} />
      </div>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px', paddingTop: '110px' }}>

        {/* Header */}
        <div className="mrp-fadein" style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '13px', color: '#c9883a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Mon espace
          </p>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
            Mes réservations
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Retrouvez ici l'historique et le suivi de tous vos séjours.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="mrp-spinner" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="mrp-empty mrp-fadein">
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(201,136,58,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Calendar size={32} style={{ color: '#c9883a' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>
              Aucune réservation pour l'instant
            </h3>
            <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '340px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              Découvrez nos logements et faites votre première demande de séjour.
            </p>
            <Link to="/" className="mrp-btn-primary">
              <Home size={18} />
              Voir les logements
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reservations.map((reservation, idx) => {
              const status = STATUS_MAP[reservation.status] || STATUS_MAP.PENDING
              const checkIn = new Date(reservation.checkInDate)
              const checkOut = new Date(reservation.checkOutDate)
              const nights = nightsBetween(reservation.checkInDate, reservation.checkOutDate)

              return (
                <Link
                  key={reservation.id}
                  to={`/reservations/${reservation.id}`}
                  className="mrp-card mrp-fadein"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Icon */}
                    <div className="mrp-icon-box">
                      <Calendar size={22} style={{ color: '#e0a84f' }} />
                    </div>

                    {/* Info */}
                    <div>
                      {/* Property name + status */}
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        {reservation.propertyName && (
                          <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '15px' }}>
                            {reservation.propertyName}
                          </span>
                        )}
                        <span className={status.cls}>{status.label}</span>
                      </div>

                      {/* Dates */}
                      <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '6px' }}>
                        {format(checkIn, 'dd MMM yyyy', { locale: fr })}
                        <span style={{ color: '#4b5563', margin: '0 8px' }}>→</span>
                        {format(checkOut, 'dd MMM yyyy', { locale: fr })}
                      </p>

                      {/* Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="mrp-nights-badge">
                          <Clock size={11} />
                          {nights} nuit{nights > 1 ? 's' : ''}
                        </span>
                        {reservation.numberOfGuests && (
                          <span className="mrp-nights-badge">
                            <Users size={11} />
                            {reservation.numberOfGuests} voyageur{reservation.numberOfGuests > 1 ? 's' : ''}
                          </span>
                        )}
                        {reservation.totalPrice && (
                          <span className="mrp-nights-badge">
                            <Euro size={11} />
                            {reservation.totalPrice} {reservation.currency || '€'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={20} style={{ color: '#4b5563', flexShrink: 0 }} />
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

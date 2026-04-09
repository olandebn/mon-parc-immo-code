import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import MessageThread from '../components/messages/MessageThread'
import ReviewForm from '../components/reviews/ReviewForm'
import { reservationService } from '../services/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar, Users, Euro, MessageSquare, Star,
  AlertTriangle, ArrowLeft, Clock, Home, Shield,
  CheckCircle2, XCircle, Hourglass, Award,
} from 'lucide-react'
import { toast } from 'react-toastify'

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  .rdp-root {
    min-height: 100vh;
    background: #080706;
    color: #e2e8f0;
  }
  @keyframes rdp-fadein {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rdp-fadein { animation: rdp-fadein 0.45s ease both; }
  /* Cards */
  .rdp-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 28px;
    backdrop-filter: blur(12px);
  }
  /* Status badge */
  .rdp-badge-pending  { background: rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.3); color:#fbbf24; }
  .rdp-badge-confirmed{ background: rgba(34,197,94,0.12);  border:1px solid rgba(34,197,94,0.3);  color:#4ade80; }
  .rdp-badge-cancelled{ background: rgba(239,68,68,0.12);  border:1px solid rgba(239,68,68,0.3);  color:#f87171; }
  .rdp-badge-completed{ background: rgba(201,136,58,0.12); border:1px solid rgba(201,136,58,0.3); color:#e0a84f; }
  .rdp-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600;
    padding: 6px 14px; border-radius: 999px;
  }
  /* Detail row */
  .rdp-detail-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .rdp-detail-row:last-child { border-bottom: none; }
  .rdp-detail-icon {
    width: 36px; height: 36px; flex-shrink: 0;
    border-radius: 10px;
    background: rgba(201,136,58,0.12);
    display: flex; align-items: center; justify-content: center;
  }
  /* Section title */
  .rdp-section-title {
    font-size: 16px; font-weight: 700; color: #e2e8f0;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 20px;
  }
  /* Spinner */
  .rdp-spinner {
    width: 44px; height: 44px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: rdp-spin 0.8s linear infinite;
  }
  @keyframes rdp-spin { to { transform: rotate(360deg); } }
  /* Danger button */
  .rdp-btn-danger {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171; border-radius: 12px;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .rdp-btn-danger:hover { background: rgba(239,68,68,0.2); }
  .rdp-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
  /* Secondary button */
  .rdp-btn-secondary {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px;
    background: rgba(201,136,58,0.1);
    border: 1px solid rgba(201,136,58,0.25);
    color: #f0c87a; border-radius: 12px;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .rdp-btn-secondary:hover { background: rgba(201,136,58,0.2); }
  /* Timeline */
  .rdp-timeline {
    display: flex;
    gap: 0;
    margin-bottom: 32px;
  }
  .rdp-timeline-step {
    flex: 1;
    text-align: center;
    position: relative;
  }
  .rdp-timeline-step::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 50%;
    right: -50%;
    height: 2px;
    background: rgba(255,255,255,0.08);
    z-index: 0;
  }
  .rdp-timeline-step:last-child::before { display: none; }
  .rdp-timeline-dot {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 8px; position: relative; z-index: 1;
    font-size: 12px; font-weight: 700;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #4b5563;
  }
  .rdp-timeline-dot.active {
    background: linear-gradient(135deg, #c9883a, #c9883a);
    border: none; color: white;
  }
  .rdp-timeline-dot.done {
    background: rgba(34,197,94,0.15);
    border: 1px solid rgba(34,197,94,0.3);
    color: #4ade80;
  }
  .rdp-timeline-dot.cancelled {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171;
  }
  .rdp-timeline-label {
    font-size: 11px; color: #4b5563; font-weight: 500;
  }
  .rdp-timeline-label.active { color: #e0a84f; }
  .rdp-timeline-label.done { color: #4ade80; }
`

function injectCSS(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style')
    el.id = id
    el.textContent = css
    document.head.appendChild(el)
  }
}

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_MAP = {
  PENDING:   { label: 'En attente de confirmation', cls: 'rdp-badge-pending',   Icon: Hourglass,      step: 0 },
  CONFIRMED: { label: 'Confirmée',                  cls: 'rdp-badge-confirmed',  Icon: CheckCircle2,   step: 1 },
  CANCELLED: { label: 'Annulée',                    cls: 'rdp-badge-cancelled',  Icon: XCircle,        step: -1 },
  COMPLETED: { label: 'Séjour terminé',             cls: 'rdp-badge-completed',  Icon: Award,          step: 2 },
}

// ─── Timeline ───────────────────────────────────────────────────────────────
function Timeline({ status }) {
  if (status === 'CANCELLED') return null
  const steps = ['En attente', 'Confirmée', 'Séjour terminé']
  const currentStep = STATUS_MAP[status]?.step ?? 0

  return (
    <div className="rdp-timeline">
      {steps.map((label, i) => {
        const isDone = i < currentStep
        const isActive = i === currentStep
        return (
          <div key={i} className="rdp-timeline-step">
            <div className={`rdp-timeline-dot${isDone ? ' done' : isActive ? ' active' : ''}`}>
              {isDone ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <div className={`rdp-timeline-label${isDone ? ' done' : isActive ? ' active' : ''}`}>
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function ReservationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  injectCSS('rdp-styles', CSS)

  useEffect(() => {
    reservationService.getReservation(id)
      .then(res => setReservation(res.data))
      .catch(() => navigate('/mes-reservations'))
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
    setCancelling(true)
    try {
      await reservationService.cancelReservation(id)
      toast.success('Réservation annulée')
      setReservation(prev => ({ ...prev, status: 'CANCELLED' }))
    } catch {
      toast.error("Erreur lors de l'annulation")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="rdp-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="rdp-spinner" />
      </div>
    )
  }

  const status = STATUS_MAP[reservation?.status] || STATUS_MAP.PENDING
  const { Icon: StatusIcon } = status
  const checkIn  = new Date(reservation.checkInDate)
  const checkOut = new Date(reservation.checkOutDate)
  const nights   = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)))

  return (
    <div className="rdp-root">
      <Navbar dark />

      {/* Decorative blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-5%', right: '-5%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,136,58,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-8%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,110,40,0.05) 0%, transparent 70%)',
        }} />
      </div>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px', paddingTop: '100px' }}>

        {/* Back link */}
        <Link
          to="/mes-reservations"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px', textDecoration: 'none', marginBottom: '28px', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={16} /> Mes réservations
        </Link>

        {/* Header */}
        <div className="rdp-fadein" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              {reservation.propertyName && (
                <p style={{ fontSize: '14px', color: '#c9883a', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Home size={14} />
                  {reservation.propertyName}
                </p>
              )}
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9' }}>
                Ma réservation
              </h1>
            </div>
            <span className={`rdp-badge ${status.cls}`}>
              <StatusIcon size={14} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="rdp-fadein" style={{ animationDelay: '0.05s' }}>
          <Timeline status={reservation.status} />
        </div>

        {/* 2-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Stay details */}
            <div className="rdp-card rdp-fadein" style={{ animationDelay: '0.1s' }}>
              <div className="rdp-section-title">
                <Calendar size={18} style={{ color: '#e0a84f' }} />
                Détails du séjour
              </div>

              {/* Date visual block */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center', gap: '12px',
                background: 'rgba(201,136,58,0.07)',
                border: '1px solid rgba(201,136,58,0.15)',
                borderRadius: '14px', padding: '18px 20px', marginBottom: '20px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Arrivée</p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
                    {format(checkIn, 'dd', { locale: fr })}
                  </p>
                  <p style={{ fontSize: '13px', color: '#e0a84f', fontWeight: 600 }}>
                    {format(checkIn, 'MMM yyyy', { locale: fr })}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {format(checkIn, 'EEEE', { locale: fr })}
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'rgba(201,136,58,0.15)', border: '1px solid rgba(201,136,58,0.25)',
                    borderRadius: '10px', padding: '8px 12px',
                  }}>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#e0a84f' }}>{nights}</p>
                    <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>NUIT{nights > 1 ? 'S' : ''}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Départ</p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
                    {format(checkOut, 'dd', { locale: fr })}
                  </p>
                  <p style={{ fontSize: '13px', color: '#e0a84f', fontWeight: 600 }}>
                    {format(checkOut, 'MMM yyyy', { locale: fr })}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {format(checkOut, 'EEEE', { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Other details */}
              <div>
                <div className="rdp-detail-row">
                  <div className="rdp-detail-icon"><Users size={16} style={{ color: '#e0a84f' }} /></div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Voyageurs</p>
                    <p style={{ fontWeight: 600, color: '#e2e8f0' }}>{reservation.numberOfGuests} personne{reservation.numberOfGuests > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="rdp-detail-row">
                  <div className="rdp-detail-icon"><Euro size={16} style={{ color: '#e0a84f' }} /></div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Prix total ({nights} nuit{nights > 1 ? 's' : ''})</p>
                    <p style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '20px' }}>
                      {reservation.totalPrice} <span style={{ fontSize: '14px', color: '#64748b' }}>{reservation.currency || 'EUR'}</span>
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={11} /> Règlement à l'arrivée — pas de paiement en ligne
                    </p>
                  </div>
                </div>
                {reservation.notes && (
                  <div className="rdp-detail-row">
                    <div className="rdp-detail-icon"><MessageSquare size={16} style={{ color: '#e0a84f' }} /></div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Votre note</p>
                      <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>"{reservation.notes}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="rdp-card rdp-fadein" style={{ animationDelay: '0.15s' }}>
              <div className="rdp-section-title">
                <MessageSquare size={18} style={{ color: '#e0a84f' }} />
                Messagerie
              </div>
              <MessageThread reservationId={id} />
            </div>

            {/* Leave a review */}
            {reservation.status === 'COMPLETED' && (
              <div className="rdp-card rdp-fadein" style={{ animationDelay: '0.2s' }}>
                <div className="rdp-section-title">
                  <Star size={18} style={{ color: '#fbbf24' }} />
                  Laisser un avis
                </div>
                {showReviewForm ? (
                  <ReviewForm reservationId={id} onSuccess={() => setShowReviewForm(false)} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                      Votre séjour est terminé — partagez votre expérience !
                    </p>
                    <button onClick={() => setShowReviewForm(true)} className="rdp-btn-secondary">
                      <Star size={16} /> Écrire un avis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Quick info card */}
            <div className="rdp-card rdp-fadein" style={{ padding: '20px', animationDelay: '0.1s' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px' }}>Récapitulatif</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: <Clock size={14} />, label: 'Durée', value: `${nights} nuit${nights > 1 ? 's' : ''}` },
                  { icon: <Users size={14} />, label: 'Voyageurs', value: `${reservation.numberOfGuests}` },
                  { icon: <Calendar size={14} />, label: 'Arrivée', value: format(checkIn, 'dd/MM/yyyy', { locale: fr }) },
                  { icon: <Calendar size={14} />, label: 'Départ', value: format(checkOut, 'dd/MM/yyyy', { locale: fr }) },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                      <span style={{ color: '#c9883a' }}>{icon}</span>
                      {label}
                    </span>
                    <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total price highlight */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(201,136,58,0.2), rgba(201,136,58,0.12))',
              border: '1px solid rgba(201,136,58,0.3)',
              borderRadius: '16px', padding: '20px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Total à régler</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9' }}>
                {reservation.totalPrice}
                <span style={{ fontSize: '16px', color: '#e0a84f', marginLeft: '4px' }}>{reservation.currency || '€'}</span>
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>À l'arrivée · Pas de paiement en ligne</p>
            </div>

            {/* Cancel */}
            {['PENDING', 'CONFIRMED'].includes(reservation.status) && (
              <div className="rdp-card rdp-fadein" style={{ padding: '18px', animationDelay: '0.15s' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>Annulation</p>
                    <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                      Contactez le propriétaire si vous avez des questions avant d'annuler.
                    </p>
                  </div>
                </div>
                <button onClick={handleCancel} disabled={cancelling} className="rdp-btn-danger">
                  <XCircle size={15} />
                  {cancelling ? 'Annulation...' : 'Annuler la réservation'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

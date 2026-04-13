import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reservationService } from '../../services/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle, MessageSquare, StickyNote, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import MessageThread from '../../components/messages/MessageThread'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .bkg-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes bkg-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .bkg-fadein { animation: bkg-fadein 0.4s ease both; }

  .bkg-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .bkg-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 20px;
  }

  .bkg-filter-pill {
    padding: 5px 14px; border-radius: 99px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #64748b; transition: all 0.15s;
  }
  .bkg-filter-pill:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }
  .bkg-filter-pill.active { background: rgba(201,136,58,0.15); border-color: rgba(201,136,58,0.35); color: #e0a84f; }

  .bkg-badge {
    display: inline-flex; align-items: center;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    padding: 3px 9px; border-radius: 99px;
  }
  .bkg-badge-pending   { background: rgba(251,191,36,0.15); color: #fbbf24; }
  .bkg-badge-confirmed { background: rgba(34,197,94,0.15);  color: #4ade80; }
  .bkg-badge-cancelled { background: rgba(239,68,68,0.15);  color: #f87171; }
  .bkg-badge-completed { background: rgba(201,136,58,0.15); color: #e0a84f; }

  .bkg-btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 8px;
    font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
  }
  .bkg-btn-primary:hover { opacity: 0.88; }

  .bkg-btn-confirm {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
    border-radius: 8px; color: #4ade80;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s;
  }
  .bkg-btn-confirm:hover { background: rgba(34,197,94,0.18); }

  .bkg-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
    border-radius: 8px; color: #64748b;
    font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
  }
  .bkg-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #f5f0ea; }

  .bkg-divider {
    border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 16px 0 0;
  }

  .bkg-note-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; font-size: 13px;
    color: #f5f0ea; font-family: inherit; outline: none; resize: vertical;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .bkg-note-input::placeholder { color: rgba(255,255,255,0.25); }
  .bkg-note-input:focus { border-color: rgba(201,136,58,0.5); }

  .bkg-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: bkg-spin 0.8s linear infinite;
  }
  @keyframes bkg-spin { to { transform: rotate(360deg); } }
`

function injectCSS() {
  if (document.getElementById('bkg-css')) return
  const s = document.createElement('style')
  s.id = 'bkg-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const STATUS = {
  PENDING:   { label: 'En attente', cls: 'bkg-badge-pending' },
  CONFIRMED: { label: 'Confirmée',  cls: 'bkg-badge-confirmed' },
  CANCELLED: { label: 'Annulée',    cls: 'bkg-badge-cancelled' },
  COMPLETED: { label: 'Terminée',   cls: 'bkg-badge-completed' },
}

const FILTERS = [
  { key: 'ALL',       label: 'Toutes' },
  { key: 'PENDING',   label: 'En attente' },
  { key: 'CONFIRMED', label: 'Confirmées' },
  { key: 'CANCELLED', label: 'Annulées' },
  { key: 'COMPLETED', label: 'Terminées' },
]

export default function AdminBookings() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [showMessages, setShowMessages] = useState(false)

  useEffect(() => { injectCSS(); loadReservations() }, [])

  const loadReservations = async () => {
    try {
      const res = await reservationService.getAllReservations()
      setReservations(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id) => {
    try {
      await reservationService.confirmReservation(id)
      toast.success('Réservation confirmée !')
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CONFIRMED' } : r))
    } catch {
      toast.error('Erreur lors de la confirmation')
    }
  }

  const handleSaveNote = async () => {
    try {
      await reservationService.addAdminNote(selectedReservation.id, noteText)
      toast.success('Note sauvegardée')
      setSelectedReservation(null)
    } catch {
      toast.error('Erreur')
    }
  }

  const filtered = filter === 'ALL' ? reservations : reservations.filter(r => r.status === filter)

  return (
    <div className="bkg-root">

      {/* ── Header ── */}
      <header className="bkg-header">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Réservations</span>
            <span style={{ fontSize: 13, color: '#475569' }}>({reservations.length})</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* ── Filtres ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: '#475569' }} />
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} className={`bkg-filter-pill ${filter === key ? 'active' : ''}`}>
              {label}
              {key !== 'ALL' && (
                <span style={{ marginLeft: 5, opacity: 0.6 }}>
                  ({reservations.filter(r => r.status === key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="bkg-spinner" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.length === 0 ? (
              <div className="bkg-card" style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
                Aucune réservation pour ce filtre
              </div>
            ) : filtered.map((reservation, i) => {
              const s = STATUS[reservation.status] || STATUS.PENDING
              const checkIn = new Date(reservation.checkInDate)
              const checkOut = new Date(reservation.checkOutDate)
              const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))

              return (
                <div key={reservation.id} className={`bkg-card bkg-fadein`} style={{ animationDelay: `${i * 0.04}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className={`bkg-badge ${s.cls}`}>{s.label}</span>
                        <span style={{ fontSize: 11, color: '#475569' }}>#{reservation.id.substring(0, 8)}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f5f0ea', marginBottom: 3 }}>{reservation.clientName}</h3>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                        {reservation.clientEmail}
                        {reservation.clientPhone && ` · ${reservation.clientPhone}`}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 3 }}>
                        {format(checkIn, 'dd MMM yyyy', { locale: fr })} → {format(checkOut, 'dd MMM yyyy', { locale: fr })}
                        <span style={{ color: '#475569', marginLeft: 6 }}>({nights} nuit{nights > 1 ? 's' : ''})</span>
                      </p>
                      <p style={{ fontSize: 13, color: '#64748b' }}>
                        {reservation.numberOfGuests} voyageur{reservation.numberOfGuests > 1 ? 's' : ''} ·{' '}
                        <span style={{ fontWeight: 800, color: '#e0a84f' }}>{reservation.totalPrice} €</span>
                      </p>
                      {reservation.notes && (
                        <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 6 }}>"{reservation.notes}"</p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {reservation.status === 'PENDING' && (
                        <button onClick={() => handleConfirm(reservation.id)} className="bkg-btn-confirm">
                          <CheckCircle size={14} /> Confirmer
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setNoteText(reservation.adminNotes || '')
                          setShowMessages(false)
                        }}
                        className="bkg-btn-ghost"
                      >
                        <StickyNote size={13} /> Note
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setShowMessages(true)
                        }}
                        className="bkg-btn-ghost"
                      >
                        <MessageSquare size={13} /> Messages
                      </button>
                    </div>
                  </div>

                  {/* Messages inline */}
                  {selectedReservation?.id === reservation.id && showMessages && (
                    <div>
                      <hr className="bkg-divider" />
                      <div style={{ paddingTop: 16 }}>
                        <MessageThread reservationId={reservation.id} />
                        <button onClick={() => setSelectedReservation(null)} className="bkg-btn-ghost" style={{ marginTop: 12, fontSize: 12 }}>
                          Fermer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Note inline */}
                  {selectedReservation?.id === reservation.id && !showMessages && (
                    <div>
                      <hr className="bkg-divider" />
                      <div style={{ paddingTop: 16 }}>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="bkg-note-input"
                          rows={3}
                          placeholder="Note interne (visible uniquement par vous)…"
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button onClick={handleSaveNote} className="bkg-btn-primary">Sauvegarder</button>
                          <button onClick={() => setSelectedReservation(null)} className="bkg-btn-ghost">Annuler</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

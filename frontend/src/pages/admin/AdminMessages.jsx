import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { messageService, reservationService } from '../../services/api'
import MessageThread from '../../components/messages/MessageThread'
import { MessageSquare, User } from 'lucide-react'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .msg-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes msg-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .msg-fadein { animation: msg-fadein 0.4s ease both; }

  .msg-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .msg-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; overflow: hidden;
    height: calc(100vh - 140px);
    display: flex; flex-direction: column;
  }

  .msg-thread-btn {
    width: 100%; text-align: left;
    padding: 12px 14px; border: none; background: transparent;
    border-radius: 10px; cursor: pointer;
    transition: background 0.15s; border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .msg-thread-btn:last-child { border-bottom: none; }
  .msg-thread-btn:hover { background: rgba(255,255,255,0.05); }
  .msg-thread-btn.active { background: rgba(201,136,58,0.1); }

  .msg-unread-badge {
    background: #e0a84f; color: #080706;
    font-size: 10px; font-weight: 800;
    min-width: 18px; height: 18px; padding: 0 5px;
    border-radius: 99px; display: flex; align-items: center; justify-content: center;
  }

  .msg-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(201,136,58,0.12);
    border: 1px solid rgba(201,136,58,0.2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .msg-spinner {
    width: 32px; height: 32px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: msg-spin 0.8s linear infinite;
  }
  @keyframes msg-spin { to { transform: rotate(360deg); } }
`

function injectCSS() {
  if (document.getElementById('msg-css')) return
  const s = document.createElement('style')
  s.id = 'msg-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

export default function AdminMessages() {
  const [threads, setThreads] = useState([])
  const [reservations, setReservations] = useState([])
  const [selectedReservationId, setSelectedReservationId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    injectCSS()
    Promise.all([
      messageService.getAllThreads(),
      reservationService.getAllReservations(),
    ])
      .then(([threadsRes, resRes]) => {
        setThreads(threadsRes.data)
        setReservations(resRes.data)
        if (threadsRes.data.length > 0) {
          setSelectedReservationId(threadsRes.data[0].reservationId)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getReservation = (id) => reservations.find(r => r.id === id)
  const unreadCount = (id) => threads.find(t => t.reservationId === id)?.unreadCount || 0
  const totalUnread = threads.reduce((s, t) => s + (t.unreadCount || 0), 0)

  return (
    <div className="msg-root">

      {/* ── Header ── */}
      <header className="msg-header">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >← Dashboard</Link>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Messages</span>
          {totalUnread > 0 && (
            <span style={{ background: '#e0a84f', color: '#080706', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>
              {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="msg-spinner" />
          </div>
        ) : (
          <div className="msg-fadein" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>

            {/* ── Colonne gauche : liste conversations ── */}
            <div className="msg-panel">
              <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Conversations
                </p>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {reservations.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: 14 }}>Aucune réservation</p>
                ) : (
                  reservations.slice(0, 20).map(reservation => {
                    const unread = unreadCount(reservation.id)
                    const isSelected = selectedReservationId === reservation.id
                    return (
                      <button
                        key={reservation.id}
                        onClick={() => setSelectedReservationId(reservation.id)}
                        className={`msg-thread-btn ${isSelected ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="msg-avatar">
                            <User size={15} style={{ color: '#c9883a' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#e0a84f' : '#f5f0ea', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {reservation.clientName}
                            </p>
                            <p style={{ fontSize: 11, color: '#64748b' }}>{reservation.checkInDate}</p>
                          </div>
                          {unread > 0 && <span className="msg-unread-badge">{unread}</span>}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* ── Colonne droite : fil de messages ── */}
            <div className="msg-panel">
              {selectedReservationId ? (
                <>
                  {(() => {
                    const res = getReservation(selectedReservationId)
                    return res ? (
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontWeight: 800, color: '#f5f0ea', fontSize: 15, marginBottom: 3 }}>{res.clientName}</p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>
                          {res.checkInDate} → {res.checkOutDate} ·{' '}
                          {res.status === 'CONFIRMED' ? '✅ Confirmée' : res.status === 'PENDING' ? '⏳ En attente' : res.status}
                        </p>
                      </div>
                    ) : null
                  })()}
                  <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px' }}>
                    <MessageThread
                      reservationId={selectedReservationId}
                      onMessageSent={() => {
                        messageService.getAllThreads().then(res => setThreads(res.data))
                      }}
                    />
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#475569' }}>
                  <MessageSquare size={40} style={{ color: 'rgba(255,255,255,0.08)' }} />
                  <p style={{ fontSize: 14 }}>Sélectionnez une conversation</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

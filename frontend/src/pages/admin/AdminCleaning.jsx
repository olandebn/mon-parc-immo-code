import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reservationService, propertyService } from '../../services/api'
import { format, addDays, isToday, isTomorrow, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle, Clock, Home, Sparkles } from 'lucide-react'

const CSS = `
  .cln-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }
  @keyframes cln-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .cln-in { animation: cln-in 0.35s ease both; }
  .cln-header { position: sticky; top: 0; z-index: 50; background: rgba(8,7,6,0.94); border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px); }
  .cln-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px 20px; transition: border-color 0.2s; }
  .cln-urgent { border-color: rgba(251,191,36,0.35) !important; background: rgba(251,191,36,0.05) !important; }
  .cln-done { opacity: 0.45; }
  .cln-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 9px; border-radius: 99px; }
  .cln-badge-today { background: rgba(251,191,36,0.2); color: #fbbf24; }
  .cln-badge-tomorrow { background: rgba(201,136,58,0.2); color: #e0a84f; }
  .cln-badge-soon { background: rgba(255,255,255,0.08); color: #64748b; }
  .cln-badge-done { background: rgba(74,222,128,0.15); color: #4ade80; }
  .cln-badge-late { background: rgba(239,68,68,0.15); color: #f87171; }
  .cln-check-btn { background: none; border: 2px solid rgba(255,255,255,0.15); border-radius: 8px; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
  .cln-check-btn:hover { border-color: #4ade80; background: rgba(74,222,128,0.1); }
  .cln-check-btn.done { border-color: #4ade80; background: rgba(74,222,128,0.15); }
  .cln-spinner { width: 36px; height: 36px; border: 3px solid rgba(201,136,58,0.2); border-top-color: #c9883a; border-radius: 50%; animation: cln-spin 0.8s linear infinite; }
  @keyframes cln-spin { to { transform: rotate(360deg); } }
`
function injectCSS() {
  if (document.getElementById('cln-css')) return
  const s = document.createElement('style'); s.id = 'cln-css'; s.textContent = CSS; document.head.appendChild(s)
}

const CLEANING_KEY = 'mpi_cleaning_done' // localStorage pour persister les ménages faits

export default function AdminCleaning() {
  const [sessions, setSessions] = useState([]) // ménages à planifier
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState({}) // {id: true}
  const [filter, setFilter] = useState('ALL') // ALL | PENDING | DONE

  useEffect(() => {
    injectCSS()
    // Charger les ménages déjà cochés
    try { setDone(JSON.parse(localStorage.getItem(CLEANING_KEY) || '{}')) } catch {}
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const [resvRes, propsRes] = await Promise.all([
        reservationService.getAllReservations(),
        propertyService.getAllProperties(),
      ])
      const reservations = resvRes.data || []
      const properties   = propsRes.data || []
      const propMap = Object.fromEntries(properties.map(p => [p.id, p]))

      // Un ménage est nécessaire le jour du check-out de chaque réservation confirmée/terminée
      const cleaning = reservations
        .filter(r => ['CONFIRMED', 'COMPLETED'].includes(r.status) && r.checkOutDate)
        .map(r => ({
          id: r.id,
          propertyId: r.propertyId,
          propertyName: propMap[r.propertyId]?.name || 'Logement inconnu',
          propertyPhoto: propMap[r.propertyId]?.mainPhotoUrls?.[0] || null,
          checkOut: r.checkOutDate,
          checkIn: r.checkInDate,
          clientName: r.clientName,
          nextClientName: null, // sera rempli ci-dessous
        }))

      // Trouver le prochain voyageur pour chaque bien
      cleaning.forEach(c => {
        const nextResv = reservations
          .filter(r => r.propertyId === c.propertyId && r.checkInDate > c.checkOut && r.status === 'CONFIRMED')
          .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate))[0]
        c.nextClientName = nextResv?.clientName || null
        c.nextCheckIn    = nextResv?.checkInDate || null
      })

      // Trier par date de ménage
      cleaning.sort((a, b) => a.checkOut.localeCompare(b.checkOut))
      setSessions(cleaning)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const toggleDone = (id) => {
    setDone(prev => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem(CLEANING_KEY, JSON.stringify(next))
      return next
    })
  }

  const getBadge = (checkOut, isDone) => {
    if (isDone) return { cls: 'cln-badge-done', label: '✓ Fait' }
    const d = new Date(checkOut)
    const today = new Date(); today.setHours(0,0,0,0)
    if (isPast(d) && !isToday(d)) return { cls: 'cln-badge-late', label: '⚠ En retard' }
    if (isToday(d)) return { cls: 'cln-badge-today', label: "Aujourd'hui" }
    if (isTomorrow(d)) return { cls: 'cln-badge-tomorrow', label: 'Demain' }
    return { cls: 'cln-badge-soon', label: format(d, 'dd MMM', { locale: fr }) }
  }

  const filtered = sessions.filter(s => {
    if (filter === 'PENDING') return !done[s.id]
    if (filter === 'DONE')    return !!done[s.id]
    return true
  })

  const pendingCount = sessions.filter(s => !done[s.id]).length

  return (
    <div className="cln-root">
      <header className="cln-header">
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', minHeight: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 10, paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Ménages & Nettoyage</span>
            {pendingCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(251,191,36,0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: 99 }}>
                {pendingCount} à faire
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'PENDING', 'DONE'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                  background: filter === f ? 'rgba(201,136,58,0.15)' : 'rgba(255,255,255,0.04)',
                  borderColor: filter === f ? 'rgba(201,136,58,0.35)' : 'rgba(255,255,255,0.08)',
                  color: filter === f ? '#e0a84f' : '#64748b' }}>
                {f === 'ALL' ? 'Tous' : f === 'PENDING' ? 'À faire' : 'Faits'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="cln-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
            <Sparkles size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 600 }}>
              {filter === 'DONE' ? 'Aucun ménage marqué comme fait.' : 'Aucun ménage planifié.'}
            </p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Les ménages apparaissent automatiquement au check-out de chaque réservation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((s, i) => {
              const isDone = !!done[s.id]
              const badge = getBadge(s.checkOut, isDone)
              const isUrgent = !isDone && (isToday(new Date(s.checkOut)) || isPast(new Date(s.checkOut)))
              return (
                <div key={s.id} className={`cln-card cln-in ${isUrgent ? 'cln-urgent' : ''} ${isDone ? 'cln-done' : ''}`} style={{ animationDelay: `${i * 0.03}s`, display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Checkbox */}
                  <button onClick={() => toggleDone(s.id)} className={`cln-check-btn ${isDone ? 'done' : ''}`}>
                    {isDone && <CheckCircle size={16} style={{ color: '#4ade80' }} />}
                  </button>

                  {/* Photo */}
                  {s.propertyPhoto ? (
                    <img src={s.propertyPhoto} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(201,136,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Home size={18} style={{ color: '#c9883a' }} />
                    </div>
                  )}

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className={`cln-badge ${badge.cls}`}>{badge.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: isDone ? '#475569' : '#f5f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.propertyName}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b' }}>
                      Départ de {s.clientName || '?'} · {format(new Date(s.checkOut), 'dd MMM yyyy', { locale: fr })}
                    </p>
                    {s.nextClientName && (
                      <p style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>
                        ↳ Prochain arrivant : {s.nextClientName} le {format(new Date(s.nextCheckIn), 'dd MMM', { locale: fr })}
                      </p>
                    )}
                  </div>

                  {/* Délai */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 12, color: '#475569' }}>Check-out</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                      {format(new Date(s.checkOut), 'dd MMM', { locale: fr })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

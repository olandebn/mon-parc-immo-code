import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { reservationService } from '../../services/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle, MessageSquare, StickyNote, Search, X, Download, CalendarDays } from 'lucide-react'
import { toast } from 'react-toastify'
import MessageThread from '../../components/messages/MessageThread'
import { exportReservationsICS } from '../../utils/exportICS'

function generateContrat(reservation) {
  const today = new Date().toLocaleDateString('fr-FR')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Contrat de location</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 48px; font-size: 13px; line-height: 1.7; max-width: 760px; margin: auto; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; border-bottom: 2px solid #c9883a; padding-bottom: 12px; }
    h2 { font-size: 14px; font-weight: 700; margin: 28px 0 10px; color: #c9883a; text-transform: uppercase; letter-spacing: 0.08em; }
    .row { display: flex; gap: 40px; margin-bottom: 6px; }
    .label { width: 200px; color: #666; flex-shrink: 0; }
    .value { font-weight: 600; }
    .box { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .sign { border-top: 1px solid #ccc; margin-top: 6px; padding-top: 6px; height: 60px; }
    .footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; }
    @media print { body { padding: 20px; } }
  </style></head><body>
  <h1>Contrat de Location Saisonnière</h1>
  <p style="color:#666;margin-bottom:24px">Établi le ${today}</p>

  <h2>1. Parties</h2>
  <div class="row"><span class="label">Bailleur (propriétaire)</span><span class="value">MonParcImmo</span></div>
  <div class="row"><span class="label">Locataire</span><span class="value">${reservation.clientName || '—'}</span></div>
  <div class="row"><span class="label">Email locataire</span><span class="value">${reservation.clientEmail || '—'}</span></div>
  <div class="row"><span class="label">Téléphone</span><span class="value">${reservation.clientPhone || '—'}</span></div>

  <h2>2. Bien loué</h2>
  <div class="row"><span class="label">Logement</span><span class="value">${reservation.propertyName || 'Logement MonParcImmo'}</span></div>

  <h2>3. Séjour</h2>
  <div class="row"><span class="label">Arrivée</span><span class="value">${reservation.checkInDate || '—'}</span></div>
  <div class="row"><span class="label">Départ</span><span class="value">${reservation.checkOutDate || '—'}</span></div>
  <div class="row"><span class="label">Nombre de voyageurs</span><span class="value">${reservation.numberOfGuests || '—'}</span></div>

  <h2>4. Prix</h2>
  <div class="box">
    <div class="row"><span class="label">Prix total du séjour</span><span class="value" style="font-size:18px;color:#c9883a">${reservation.totalPrice || 0} €</span></div>
  </div>

  <h2>5. Conditions</h2>
  <p>Le locataire s'engage à utiliser le logement en bon père de famille, à respecter le règlement intérieur fourni, et à restituer le bien dans l'état où il l'a trouvé. Toute dégradation sera facturée au locataire.</p>
  <p>Le logement est mis à disposition exclusivement pour un usage d'habitation temporaire. Sous-location interdite.</p>

  <h2>6. Signatures</h2>
  <div style="display:flex;gap:60px;margin-top:20px">
    <div style="flex:1"><p><strong>Le bailleur</strong></p><div class="sign"></div></div>
    <div style="flex:1"><p><strong>Le locataire</strong></p><div class="sign"></div></div>
  </div>

  <div class="footer">Document généré par MonParcImmo — ${today} · Réservation #${reservation.id?.substring(0,8) || '—'}</div>
  </body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.onload = () => win.print()
}

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .bkg-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }
  @keyframes bkg-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .bkg-in { animation: bkg-in 0.35s ease both; }

  .bkg-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  }

  .bkg-search {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; flex: 1; max-width: 320px;
    transition: border-color 0.2s;
  }
  .bkg-search:focus-within { border-color: rgba(201,136,58,0.5); }
  .bkg-search input { background: none; border: none; outline: none; color: #f5f0ea; font-size: 13px; width: 100%; font-family: inherit; }
  .bkg-search input::placeholder { color: rgba(255,255,255,0.3); }

  .bkg-filter-pill {
    padding: 6px 14px; border-radius: 99px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04); color: #64748b;
    transition: all 0.15s; white-space: nowrap;
  }
  .bkg-filter-pill:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }
  .bkg-filter-pill.active { background: rgba(201,136,58,0.15); border-color: rgba(201,136,58,0.35); color: #e0a84f; }

  .bkg-sort-btn {
    padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    color: #64748b; cursor: pointer; transition: all 0.15s;
  }
  .bkg-sort-btn.active { color: #e0a84f; border-color: rgba(201,136,58,0.3); background: rgba(201,136,58,0.08); }

  .bkg-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 20px;
    transition: border-color 0.2s;
  }
  .bkg-card:hover { border-color: rgba(255,255,255,0.12); }

  .bkg-badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 9px; border-radius: 99px; }
  .bkg-badge-pending   { background: rgba(251,191,36,0.15); color: #fbbf24; }
  .bkg-badge-confirmed { background: rgba(34,197,94,0.15);  color: #4ade80; }
  .bkg-badge-cancelled { background: rgba(239,68,68,0.15);  color: #f87171; }
  .bkg-badge-completed { background: rgba(201,136,58,0.15); color: #e0a84f; }

  .bkg-btn-confirm { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); border-radius: 8px; color: #4ade80; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
  .bkg-btn-confirm:hover { background: rgba(34,197,94,0.18); }
  .bkg-btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .bkg-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #f5f0ea; }

  .bkg-note-input { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 13px; color: #f5f0ea; font-family: inherit; outline: none; resize: vertical; transition: border-color 0.2s; box-sizing: border-box; }
  .bkg-note-input:focus { border-color: rgba(201,136,58,0.5); }
  .bkg-note-input::placeholder { color: rgba(255,255,255,0.25); }

  .bkg-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 18px; }

  .bkg-spinner { width: 36px; height: 36px; border: 3px solid rgba(201,136,58,0.2); border-top-color: #c9883a; border-radius: 50%; animation: bkg-spin 0.8s linear infinite; }
  @keyframes bkg-spin { to { transform: rotate(360deg); } }
`
function injectCSS() {
  if (document.getElementById('bkg-css')) return
  const s = document.createElement('style'); s.id = 'bkg-css'; s.textContent = CSS; document.head.appendChild(s)
}

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente', cls: 'bkg-badge-pending' },
  CONFIRMED: { label: 'Confirmée',  cls: 'bkg-badge-confirmed' },
  CANCELLED: { label: 'Annulée',    cls: 'bkg-badge-cancelled' },
  COMPLETED: { label: 'Terminée',   cls: 'bkg-badge-completed' },
}

const STATUS_FILTERS = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'CONFIRMED', label: 'Confirmées' },
  { key: 'CANCELLED', label: 'Annulées' },
  { key: 'COMPLETED', label: 'Terminées' },
]

export default function AdminBookings() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date_desc') // date_desc | date_asc | price_desc | name_asc
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [showMessages, setShowMessages] = useState(false)

  useEffect(() => { injectCSS(); loadReservations() }, [])

  const loadReservations = async () => {
    try { const res = await reservationService.getAllReservations(); setReservations(res.data) }
    finally { setLoading(false) }
  }

  const handleConfirm = async (id) => {
    try {
      await reservationService.confirmReservation(id)
      toast.success('Réservation confirmée !')
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CONFIRMED' } : r))
    } catch { toast.error('Erreur') }
  }

  const handleSaveNote = async () => {
    try {
      await reservationService.addAdminNote(selectedReservation.id, noteText)
      toast.success('Note sauvegardée')
      setSelectedReservation(null)
    } catch { toast.error('Erreur') }
  }

  // Export CSV
  const exportCSV = () => {
    const header = ['Nom', 'Email', 'Téléphone', 'Arrivée', 'Départ', 'Nuits', 'Voyageurs', 'Prix (€)', 'Statut', 'Notes']
    const rows = filtered.map(r => {
      const nights = r.checkInDate && r.checkOutDate
        ? Math.round((new Date(r.checkOutDate) - new Date(r.checkInDate)) / 86400000) : 0
      return [r.clientName || '', r.clientEmail || '', r.clientPhone || '',
        r.checkInDate || '', r.checkOutDate || '', nights, r.numberOfGuests || 0,
        r.totalPrice || 0, STATUS_CONFIG[r.status]?.label || r.status, r.notes || '']
    })
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `reservations_${new Date().getFullYear()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // Filtrage + recherche + tri
  const filtered = useMemo(() => {
    let list = [...reservations]
    if (statusFilter !== 'ALL') list = list.filter(r => r.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.clientName?.toLowerCase().includes(q) ||
        r.clientEmail?.toLowerCase().includes(q) ||
        r.clientPhone?.toLowerCase().includes(q) ||
        r.checkInDate?.includes(q) || r.notes?.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.checkInDate) - new Date(a.checkInDate)
      if (sortBy === 'date_asc')  return new Date(a.checkInDate) - new Date(b.checkInDate)
      if (sortBy === 'price_desc') return (b.totalPrice || 0) - (a.totalPrice || 0)
      if (sortBy === 'name_asc')  return (a.clientName || '').localeCompare(b.clientName || '')
      return 0
    })
    return list
  }, [reservations, statusFilter, search, sortBy])

  // Stats rapides
  const stats = useMemo(() => ({
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    revenue: reservations.filter(r => r.status !== 'CANCELLED').reduce((s, r) => s + (r.totalPrice || 0), 0),
  }), [reservations])

  return (
    <div className="bkg-root">
      <header className="bkg-header">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', minHeight: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 10, paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Réservations</span>
            <span style={{ fontSize: 13, color: '#475569' }}>({filtered.length}/{reservations.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Recherche */}
            <div className="bkg-search">
              <Search size={13} style={{ color: '#475569', flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, email, date…" />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}><X size={13} /></button>}
            </div>
            {/* Export */}
            {filtered.length > 0 && (
              <>
                <button onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 9, color: '#4ade80', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Download size={13} /> CSV
                </button>
                <button onClick={() => exportReservationsICS(filtered)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 9, color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }} title="Exporter vers Google Calendar / Apple Calendar">
                  <CalendarDays size={13} /> Agenda (.ics)
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Stats rapides */}
        {!loading && (
          <div className="bkg-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total',      val: stats.total,                      color: '#f5f0ea' },
              { label: 'En attente', val: stats.pending,                    color: '#fbbf24' },
              { label: 'Confirmées', val: stats.confirmed,                  color: '#4ade80' },
              { label: 'Revenus',    val: `${stats.revenue.toFixed(0)} €`,  color: '#e0a84f' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bkg-stat">
                <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: '-0.03em' }}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtres statut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)} className={`bkg-filter-pill ${statusFilter === key ? 'active' : ''}`}>
              {label}
              {key !== 'ALL' && (
                <span style={{ marginLeft: 5, opacity: 0.65 }}>({reservations.filter(r => r.status === key).length})</span>
              )}
            </button>
          ))}
          {/* Tri */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'date_desc', label: '↓ Date' },
              { key: 'date_asc',  label: '↑ Date' },
              { key: 'price_desc',label: '↓ Prix' },
              { key: 'name_asc',  label: 'A→Z' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setSortBy(key)} className={`bkg-sort-btn ${sortBy === key ? 'active' : ''}`}>{label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="bkg-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="bkg-card" style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
            {search ? `Aucun résultat pour "${search}"` : 'Aucune réservation'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((r, i) => {
              const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.PENDING
              const checkIn  = r.checkInDate ? new Date(r.checkInDate) : null
              const checkOut = r.checkOutDate ? new Date(r.checkOutDate) : null
              const nights   = checkIn && checkOut ? Math.round((checkOut - checkIn) / 86400000) : 0
              return (
                <div key={r.id} className={`bkg-card bkg-in`} style={{ animationDelay: `${i * 0.03}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className={`bkg-badge ${s.cls}`}>{s.label}</span>
                        <span style={{ fontSize: 11, color: '#475569' }}>#{r.id?.substring(0, 8)}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f5f0ea', marginBottom: 3 }}>{r.clientName}</h3>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                        {r.clientEmail}{r.clientPhone ? ` · ${r.clientPhone}` : ''}
                      </p>
                      {checkIn && checkOut && (
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 3 }}>
                          {format(checkIn, 'dd MMM yyyy', { locale: fr })} → {format(checkOut, 'dd MMM yyyy', { locale: fr })}
                          <span style={{ color: '#475569', marginLeft: 6 }}>({nights} nuit{nights > 1 ? 's' : ''})</span>
                        </p>
                      )}
                      <p style={{ fontSize: 13, color: '#64748b' }}>
                        {r.numberOfGuests} voyageur{r.numberOfGuests > 1 ? 's' : ''} ·{' '}
                        <span style={{ fontWeight: 800, color: '#e0a84f' }}>{r.totalPrice} €</span>
                      </p>
                      {r.notes && <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 5 }}>"{r.notes}"</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {r.status === 'PENDING' && (
                        <button onClick={() => handleConfirm(r.id)} className="bkg-btn-confirm">
                          <CheckCircle size={14} /> Confirmer
                        </button>
                      )}
                      {['CONFIRMED', 'COMPLETED'].includes(r.status) && (
                        <button onClick={() => generateContrat(r)} className="bkg-btn-ghost" title="Générer le contrat PDF">
                          📄 Contrat
                        </button>
                      )}
                      <button onClick={() => { setSelectedReservation(r); setNoteText(r.adminNotes || ''); setShowMessages(false) }} className="bkg-btn-ghost">
                        <StickyNote size={13} /> Note
                      </button>
                      <button onClick={() => { setSelectedReservation(r); setShowMessages(true) }} className="bkg-btn-ghost">
                        <MessageSquare size={13} /> Messages
                      </button>
                    </div>
                  </div>

                  {selectedReservation?.id === r.id && showMessages && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <MessageThread reservationId={r.id} />
                      <button onClick={() => setSelectedReservation(null)} className="bkg-btn-ghost" style={{ marginTop: 10, fontSize: 12 }}>Fermer</button>
                    </div>
                  )}
                  {selectedReservation?.id === r.id && !showMessages && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="bkg-note-input" rows={3} placeholder="Note interne (visible uniquement par vous)…" />
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button onClick={handleSaveNote} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #c9883a, #e0a84f)', border: 'none', borderRadius: 8, color: '#080706', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Sauvegarder</button>
                        <button onClick={() => setSelectedReservation(null)} className="bkg-btn-ghost">Annuler</button>
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

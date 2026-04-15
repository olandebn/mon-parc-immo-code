import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { propertyService, reservationService, expenseService } from '../../services/api'
import { TrendingUp, TrendingDown, Home, Download, Euro } from 'lucide-react'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .fin-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }
  @keyframes fin-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .fin-in { animation: fin-in 0.4s ease both; }
  .fin-header { position: sticky; top: 0; z-index: 50; background: rgba(8,7,6,0.94); border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px); }
  .fin-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 22px; }
  .fin-bien-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px; gap: 16px; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .fin-bien-row:last-child { border-bottom: none; }
  .fin-bien-row:hover { background: rgba(255,255,255,0.02); }
  .fin-th { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
  .fin-bar-track { height: 6px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; margin-top: 4px; }
  .fin-bar-fill-green { height: 6px; background: linear-gradient(90deg, #4ade80, #22c55e); border-radius: 99px; }
  .fin-bar-fill-red   { height: 6px; background: linear-gradient(90deg, #f87171, #ef4444); border-radius: 99px; }
  .fin-bar-fill-amber { height: 6px; background: linear-gradient(90deg, #c9883a, #e0a84f); border-radius: 99px; }
  .fin-spinner { width: 36px; height: 36px; border: 3px solid rgba(201,136,58,0.2); border-top-color: #c9883a; border-radius: 50%; animation: fin-spin 0.8s linear infinite; }
  @keyframes fin-spin { to { transform: rotate(360deg); } }
  .fin-positive { color: #4ade80; }
  .fin-negative { color: #f87171; }
  .fin-neutral  { color: #e0a84f; }
`
function injectCSS() {
  if (document.getElementById('fin-css')) return
  const s = document.createElement('style'); s.id = 'fin-css'; s.textContent = CSS; document.head.appendChild(s)
}

export default function AdminFinances() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [data, setData] = useState([]) // [{property, revenus, depenses, reservations, nights, occupancy}]
  const [loading, setLoading] = useState(true)

  useEffect(() => { injectCSS(); loadAll() }, [year])

  const loadAll = async () => {
    setLoading(true)
    try {
      const propsRes = await propertyService.getAllProperties()
      const properties = propsRes.data || []

      const allReservations = await reservationService.getAllReservations().then(r => r.data).catch(() => [])

      const rows = await Promise.all(properties.map(async (p) => {
        // Réservations de ce bien pour l'année
        const propResvs = allReservations.filter(r =>
          r.propertyId === p.id &&
          r.checkInDate && new Date(r.checkInDate).getFullYear() === year &&
          r.status !== 'CANCELLED'
        )
        const revenus = propResvs.reduce((s, r) => s + (r.totalPrice || 0), 0)
        const nights  = propResvs.reduce((s, r) => {
          if (!r.checkInDate || !r.checkOutDate) return s
          return s + Math.max(1, Math.round((new Date(r.checkOutDate) - new Date(r.checkInDate)) / 86400000))
        }, 0)
        const occupancy = Math.round((nights / 365) * 100)

        // Dépenses de ce bien pour l'année
        let depenses = 0
        try {
          const expRes = await expenseService.getExpenseSummary(p.id, year)
          depenses = expRes.data?.totalExpenses || 0
        } catch {}

        return {
          property: p,
          revenus,
          depenses,
          benefice: revenus - depenses,
          reservations: propResvs.length,
          nights,
          occupancy,
          marge: revenus > 0 ? ((revenus - depenses) / revenus * 100) : 0,
        }
      }))

      setData(rows.sort((a, b) => b.revenus - a.revenus))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const totals = data.reduce((acc, r) => ({
    revenus: acc.revenus + r.revenus,
    depenses: acc.depenses + r.depenses,
    benefice: acc.benefice + r.benefice,
    reservations: acc.reservations + r.reservations,
    nights: acc.nights + r.nights,
  }), { revenus: 0, depenses: 0, benefice: 0, reservations: 0, nights: 0 })

  const exportCSV = () => {
    const header = ['Bien', 'Ville', 'Réservations', 'Nuits', 'Taux occ.', 'Revenus (€)', 'Dépenses (€)', 'Bénéfice (€)', 'Marge (%)']
    const rows = data.map(r => [
      r.property.name, r.property.city || '',
      r.reservations, r.nights, `${r.occupancy}%`,
      r.revenus.toFixed(2), r.depenses.toFixed(2), r.benefice.toFixed(2), `${r.marge.toFixed(1)}%`
    ])
    rows.push(['TOTAL', '', totals.reservations, totals.nights, '',
      totals.revenus.toFixed(2), totals.depenses.toFixed(2), totals.benefice.toFixed(2), ''])
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `finances_${year}.csv`; a.click()
  }

  const maxRevenu = Math.max(...data.map(r => r.revenus), 1)

  return (
    <div className="fin-root">
      <header className="fin-header">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', minHeight: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 10, paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Vue financière globale</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={year} onChange={e => setYear(+e.target.value)}
              style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f5f0ea', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
              {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y} style={{ background: '#1a1814' }}>{y}</option>)}
            </select>
            {data.length > 0 && (
              <button onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 9, color: '#4ade80', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <Download size={13} /> Export CSV
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="fin-spinner" /></div>
        ) : data.length === 0 ? (
          <div className="fin-card fin-in" style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
            <Home size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            <p>Aucun bien trouvé. Commencez par ajouter vos logements.</p>
          </div>
        ) : (
          <>
            {/* ── Totaux ── */}
            <div className="fin-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Revenus totaux',  val: `${totals.revenus.toFixed(0)} €`,  color: '#4ade80', icon: TrendingUp },
                { label: 'Dépenses totales', val: `${totals.depenses.toFixed(0)} €`, color: '#f87171', icon: TrendingDown },
                { label: 'Bénéfice net',    val: `${totals.benefice.toFixed(0)} €`, color: totals.benefice >= 0 ? '#e0a84f' : '#f87171', icon: Euro },
                { label: 'Réservations',    val: totals.reservations,               color: '#f5f0ea', icon: null },
                { label: 'Nuits louées',    val: totals.nights,                     color: '#94a3b8', icon: null },
              ].map(({ label, val, color, icon: Icon }) => (
                <div key={label} className="fin-card">
                  <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: '-0.03em' }}>{val}</p>
                </div>
              ))}
            </div>

            {/* ── Tableau par bien ── */}
            <div className="fin-card fin-in" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.05s' }}>
              {/* En-tête tableau */}
              <div className="fin-bien-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, paddingBottom: 14 }}>
                <span className="fin-th">Logement</span>
                <span className="fin-th" style={{ textAlign: 'right' }}>Revenus</span>
                <span className="fin-th" style={{ textAlign: 'right' }}>Dépenses</span>
                <span className="fin-th" style={{ textAlign: 'right' }}>Bénéfice</span>
                <span className="fin-th" style={{ textAlign: 'right' }}>Taux occ.</span>
                <span className="fin-th" style={{ textAlign: 'center' }}>Résas</span>
              </div>

              {/* Lignes */}
              {data.map((row, i) => (
                <div key={row.property.id} className="fin-bien-row fin-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  {/* Nom + barre revenus */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      {row.property.mainPhotoUrls?.[0] ? (
                        <img src={row.property.mainPhotoUrls[0]} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,136,58,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Home size={14} style={{ color: '#c9883a' }} />
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#f5f0ea' }}>{row.property.name}</p>
                        {row.property.city && <p style={{ fontSize: 11, color: '#64748b' }}>{row.property.city}</p>}
                      </div>
                    </div>
                    {/* Barre revenus relatifs */}
                    <div className="fin-bar-track">
                      <div className="fin-bar-fill-green" style={{ width: `${(row.revenus / maxRevenu) * 100}%` }} />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: '#4ade80', fontSize: 15 }}>{row.revenus.toFixed(0)} €</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>{row.reservations} rés.</p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: '#f87171', fontSize: 15 }}>{row.depenses.toFixed(0)} €</p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, fontSize: 16, color: row.benefice >= 0 ? '#e0a84f' : '#f87171' }}>
                      {row.benefice >= 0 ? '+' : ''}{row.benefice.toFixed(0)} €
                    </p>
                    <p style={{ fontSize: 11, color: row.marge >= 0 ? '#64748b' : '#f87171' }}>
                      {row.marge.toFixed(1)}% marge
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: '#94a3b8', fontSize: 15 }}>{row.occupancy}%</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>{row.nights} nuits</p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <Link to="/admin/reservations" style={{ fontSize: 13, fontWeight: 700, color: '#e0a84f', textDecoration: 'none' }}>
                      {row.reservations}
                    </Link>
                  </div>
                </div>
              ))}

              {/* Ligne total */}
              <div className="fin-bien-row" style={{ background: 'rgba(201,136,58,0.05)', borderTop: '1px solid rgba(201,136,58,0.15)' }}>
                <p style={{ fontWeight: 800, color: '#e0a84f', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>TOTAL {data.length} biens</p>
                <p style={{ textAlign: 'right', fontWeight: 800, color: '#4ade80' }}>{totals.revenus.toFixed(0)} €</p>
                <p style={{ textAlign: 'right', fontWeight: 800, color: '#f87171' }}>{totals.depenses.toFixed(0)} €</p>
                <p style={{ textAlign: 'right', fontWeight: 800, color: totals.benefice >= 0 ? '#e0a84f' : '#f87171' }}>
                  {totals.benefice >= 0 ? '+' : ''}{totals.benefice.toFixed(0)} €
                </p>
                <p style={{ textAlign: 'right', fontWeight: 700, color: '#94a3b8' }}>{totals.nights} nuits</p>
                <p style={{ textAlign: 'center', fontWeight: 800, color: '#f5f0ea' }}>{totals.reservations}</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

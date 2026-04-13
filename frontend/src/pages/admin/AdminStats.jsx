import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { statsService } from '../../services/api'
import { TrendingUp, TrendingDown, Users, Calendar, Euro, Percent } from 'lucide-react'
import PropertySelector from '../../components/admin/PropertySelector'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .sta-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes sta-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .sta-fadein { animation: sta-fadein 0.4s ease both; }

  .sta-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .sta-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 22px;
  }

  .sta-kpi {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 22px;
  }

  .sta-bar-fill {
    border-radius: 4px 4px 0 0;
    background: linear-gradient(to top, #c9883a, #e0a84f);
    transition: height 0.3s ease;
  }

  .sta-progress-bg {
    width: 100%; background: rgba(255,255,255,0.06);
    border-radius: 99px; height: 6px; overflow: hidden;
  }
  .sta-progress-fill {
    height: 6px; border-radius: 99px;
    background: linear-gradient(90deg, #c9883a, #e0a84f);
  }

  .sta-client-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .sta-client-row:last-child { border-bottom: none; }

  .sta-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: sta-spin 0.8s linear infinite;
  }
  @keyframes sta-spin { to { transform: rotate(360deg); } }
`

function injectCSS() {
  if (document.getElementById('sta-css')) return
  const s = document.createElement('style')
  s.id = 'sta-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function AdminStats() {
  const currentYear = new Date().getFullYear()
  const [propertyId, setPropertyId] = useState(null)
  const [year, setYear] = useState(currentYear)
  const [yearly, setYearly] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [financial, setFinancial] = useState(null)
  const [occupancy, setOccupancy] = useState(null)
  const [clientsHistory, setClientsHistory] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { injectCSS() }, [])
  useEffect(() => { if (propertyId) loadStats() }, [year, propertyId])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [yearlyRes, monthlyRes, financialRes, occupancyRes, clientsRes] = await Promise.all([
        statsService.getYearlyStats(propertyId, year),
        statsService.getBookingsPerMonth(propertyId, year),
        statsService.getFinancialSummary(propertyId, year),
        statsService.getOccupancyRate(propertyId, year),
        statsService.getClientsHistory(propertyId),
      ])
      setYearly(yearlyRes.data)
      setMonthly(monthlyRes.data)
      setFinancial(financialRes.data)
      setOccupancy(occupancyRes.data)
      setClientsHistory(clientsRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const maxBookings = monthly ? Math.max(...monthly.bookingsPerMonth, 1) : 1

  return (
    <div className="sta-root">

      {/* ── Header ── */}
      <header className="sta-header">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Statistiques</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PropertySelector value={propertyId} onChange={(id) => setPropertyId(id)} required />
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
              style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, color: '#f5f0ea', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
              {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                <option key={y} value={y} style={{ background: '#1a1814' }}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 80px' }}>

        {!propertyId ? (
          <div className="sta-fadein" style={{ textAlign: 'center', padding: '100px 0', color: '#475569' }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Sélectionnez un bien pour afficher ses statistiques</p>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="sta-spinner" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── KPIs ── */}
            <div className="sta-fadein" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[
                { icon: Calendar,   label: 'Réservations',  val: yearly?.totalReservations || 0,           color: '#f5f0ea' },
                { icon: TrendingUp, label: 'Revenus bruts', val: `${yearly?.totalRevenue?.toFixed(0) || 0} €`, color: '#4ade80' },
                { icon: TrendingDown, label: 'Dépenses',    val: `${financial?.totalExpenses?.toFixed(0) || 0} €`, color: '#f87171' },
                { icon: Euro,       label: 'Revenu net',    val: `${financial?.netIncome?.toFixed(0) || 0} €`, color: (financial?.netIncome || 0) >= 0 ? '#e0a84f' : '#f87171' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="sta-kpi">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon size={15} style={{ color: '#64748b' }} />
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-0.04em' }}>{val}</p>
                </div>
              ))}
            </div>

            {/* ── Graphique réservations / mois ── */}
            {monthly && (
              <div className="sta-card sta-fadein" style={{ animationDelay: '0.05s' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                  ✦ Réservations par mois — {year}
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
                  {MONTHS.map((month, i) => {
                    const count = monthly.bookingsPerMonth[i] || 0
                    const height = maxBookings > 0 ? (count / maxBookings) * 100 : 0
                    return (
                      <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: count > 0 ? '#e0a84f' : 'transparent' }}>{count || ''}</span>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 100 }}>
                          <div
                            className="sta-bar-fill"
                            style={{ width: '100%', height: `${Math.max(height, count > 0 ? 4 : 0)}%`, minHeight: count > 0 ? 4 : 0 }}
                            title={`${count} réservation(s)`}
                          />
                        </div>
                        <span style={{ fontSize: 10, color: '#475569' }}>{month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Taux d'occupation ── */}
            {occupancy && (
              <div className="sta-card sta-fadein" style={{ animationDelay: '0.1s' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                  ✦ Taux d'occupation {year}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  <div style={{ width: 120, height: 120, position: 'relative', flexShrink: 0 }}>
                    <svg style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke="url(#occ-grad)" strokeWidth="3.5"
                        strokeDasharray={`${occupancy.occupancyRate} ${100 - occupancy.occupancyRate}`}
                        strokeLinecap="round" />
                      <defs>
                        <linearGradient id="occ-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#c9883a" />
                          <stop offset="100%" stopColor="#e0a84f" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#e0a84f' }}>
                      {occupancy.occupancyRate?.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ fontSize: 14, color: '#f5f0ea' }}>
                      <span style={{ fontWeight: 800, color: '#e0a84f' }}>{occupancy.occupiedDays}</span> nuits louées
                    </p>
                    <p style={{ fontSize: 13, color: '#64748b' }}>sur {occupancy.totalDays} jours en {year}</p>
                    {yearly?.averageStayDuration && (
                      <p style={{ fontSize: 13, color: '#64748b' }}>Séjour moyen : <span style={{ color: '#94a3b8', fontWeight: 600 }}>{yearly.averageStayDuration.toFixed(1)} nuits</span></p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Dépenses par catégorie ── */}
            {financial?.expensesByCategory && Object.keys(financial.expensesByCategory).length > 0 && (
              <div className="sta-card sta-fadein" style={{ animationDelay: '0.15s' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                  ✦ Dépenses par catégorie
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {Object.entries(financial.expensesByCategory).map(([cat, amount]) => {
                    const totalExp = financial.totalExpenses || 1
                    const pct = (amount / totalExp) * 100
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>{cat}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#f5f0ea' }}>{amount.toFixed(0)} €</span>
                        </div>
                        <div className="sta-progress-bg">
                          <div className="sta-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Historique clients ── */}
            {clientsHistory && (
              <div className="sta-card sta-fadein" style={{ animationDelay: '0.2s' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                  ✦ Clients ({clientsHistory.totalClients})
                </p>
                <div>
                  {clientsHistory.clients?.map(item => (
                    <div key={item.client.uid} className="sta-client-row">
                      <div>
                        <p style={{ fontWeight: 700, color: '#f5f0ea', fontSize: 14, marginBottom: 2 }}>
                          {item.client.firstName} {item.client.lastName}
                        </p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>{item.client.email}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f0ea', marginBottom: 2 }}>
                          {item.totalReservations} séjour{item.totalReservations > 1 ? 's' : ''}
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>{item.totalSpent?.toFixed(0)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

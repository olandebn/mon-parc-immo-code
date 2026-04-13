import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pricingService } from '../../services/api'
import { Plus, Edit2, Trash2, Sun, Snowflake } from 'lucide-react'
import { toast } from 'react-toastify'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .prc-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes prc-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .prc-fadein { animation: prc-fadein 0.4s ease both; }

  .prc-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .prc-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 20px;
    transition: border-color 0.2s;
  }
  .prc-card.inactive { opacity: 0.5; }

  .prc-form-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,136,58,0.2);
    border-radius: 16px; padding: 24px; margin-bottom: 24px;
  }

  .prc-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; font-size: 14px;
    color: #f5f0ea; font-family: inherit; outline: none;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .prc-input::placeholder { color: rgba(255,255,255,0.25); }
  .prc-input:focus { border-color: rgba(201,136,58,0.5); }
  .prc-input option { background: #1a1814; color: #f5f0ea; }

  .prc-label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }

  .prc-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
  }
  .prc-btn-primary:hover { opacity: 0.88; }
  .prc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .prc-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #94a3b8;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .prc-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #f5f0ea; }

  .prc-icon-btn {
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; border: none; cursor: pointer; background: transparent;
    color: #475569; transition: all 0.15s;
  }
  .prc-icon-btn:hover { background: rgba(255,255,255,0.08); color: #f5f0ea; }
  .prc-icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: #f87171; }

  .prc-season-icon {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  .prc-rate-chip {
    display: flex; flex-direction: column; gap: 2px;
  }

  .prc-active-toggle {
    display: flex; align-items: center; gap: 8px; cursor: pointer;
  }
  .prc-active-toggle input[type="checkbox"] { accent-color: #c9883a; width: 16px; height: 16px; cursor: pointer; }

  .prc-inactive-tag {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    padding: 3px 8px; border-radius: 99px;
    background: rgba(255,255,255,0.06); color: #475569;
  }

  .prc-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: prc-spin 0.8s linear infinite;
  }
  @keyframes prc-spin { to { transform: rotate(360deg); } }
`

function injectCSS() {
  if (document.getElementById('prc-css')) return
  const s = document.createElement('style')
  s.id = 'prc-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const emptyForm = {
  name: '', type: 'HIGH_SEASON',
  startDate: '', endDate: '',
  nightlyRate: '', weekendRate: '', weeklyRate: '',
  active: true, notes: ''
}

export default function AdminPricing() {
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { injectCSS(); loadSeasons() }, [])

  const loadSeasons = async () => {
    try {
      const res = await pricingService.getAllSeasons()
      setSeasons(res.data)
    } finally { setLoading(false) }
  }

  const handleEdit = (season) => {
    setForm({
      name: season.name || '', type: season.type || 'HIGH_SEASON',
      startDate: season.startDate || '', endDate: season.endDate || '',
      nightlyRate: season.nightlyRate || '', weekendRate: season.weekendRate || '',
      weeklyRate: season.weeklyRate || '', active: season.active !== false,
      notes: season.notes || '',
    })
    setEditingId(season.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        nightlyRate: parseFloat(form.nightlyRate) || 0,
        weekendRate: parseFloat(form.weekendRate) || 0,
        weeklyRate: parseFloat(form.weeklyRate) || 0,
      }
      if (editingId) {
        await pricingService.updateSeason(editingId, data)
        toast.success('Saison mise à jour')
      } else {
        await pricingService.createSeason(data)
        toast.success('Saison créée')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      loadSeasons()
    } catch {
      toast.error('Erreur')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette saison ?')) return
    try {
      await pricingService.deleteSeason(id)
      toast.success('Saison supprimée')
      setSeasons(prev => prev.filter(s => s.id !== id))
    } catch { toast.error('Erreur') }
  }

  const F = ({ label, children, hint }) => (
    <div>
      <label className="prc-label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{hint}</p>}
    </div>
  )

  return (
    <div className="prc-root">

      {/* ── Header ── */}
      <header className="prc-header">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Tarifs & Saisons</span>
          </div>
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }} className="prc-btn-primary">
            <Plus size={15} /> Nouvelle saison
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* ── Formulaire ── */}
        {showForm && (
          <div className="prc-form-card prc-fadein">
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f5f0ea', marginBottom: 20, letterSpacing: '-0.02em' }}>
              {editingId ? '✏️ Modifier la saison' : '✦ Nouvelle saison de tarif'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <F label="Nom de la saison *">
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="prc-input" placeholder="Haute saison été 2025" />
                </F>
                <F label="Type">
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="prc-input">
                    <option value="HIGH_SEASON">☀️ Haute saison</option>
                    <option value="LOW_SEASON">❄️ Basse saison</option>
                  </select>
                </F>
                <F label="Date de début *">
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required className="prc-input" />
                </F>
                <F label="Date de fin *">
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required className="prc-input" />
                </F>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
                <F label="Prix / nuit (€) *">
                  <input type="number" value={form.nightlyRate} min="0" onChange={(e) => setForm({ ...form, nightlyRate: e.target.value })} required className="prc-input" placeholder="0" />
                </F>
                <F label="Prix week-end (€)" hint="Ven. soir → Dim. (optionnel)">
                  <input type="number" value={form.weekendRate} min="0" onChange={(e) => setForm({ ...form, weekendRate: e.target.value })} className="prc-input" placeholder="0" />
                </F>
                <F label="Prix / semaine (€)" hint="7 nuits (optionnel)">
                  <input type="number" value={form.weeklyRate} min="0" onChange={(e) => setForm({ ...form, weeklyRate: e.target.value })} className="prc-input" placeholder="0" />
                </F>
              </div>

              <div style={{ marginBottom: 20 }}>
                <F label="Notes internes">
                  <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="prc-input" placeholder="Ex: Prix négociés pour l'été" />
                </F>
              </div>

              <label className="prc-active-toggle" style={{ marginBottom: 20 }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Saison active</span>
              </label>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="submit" disabled={saving} className="prc-btn-primary">
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="prc-btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Liste ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="prc-spinner" />
          </div>
        ) : seasons.length === 0 ? (
          <div className="prc-card prc-fadein" style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
            Aucune saison configurée. Créez votre première saison de tarifs.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {seasons.map((season, i) => (
              <div key={season.id} className={`prc-card prc-fadein ${!season.active ? 'inactive' : ''}`} style={{ animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div className="prc-season-icon" style={{ background: season.type === 'HIGH_SEASON' ? 'rgba(201,136,58,0.12)' : 'rgba(147,197,253,0.08)', border: season.type === 'HIGH_SEASON' ? '1px solid rgba(201,136,58,0.2)' : '1px solid rgba(147,197,253,0.15)' }}>
                      {season.type === 'HIGH_SEASON'
                        ? <Sun size={20} style={{ color: '#e0a84f' }} />
                        : <Snowflake size={20} style={{ color: '#93c5fd' }} />
                      }
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f5f0ea', letterSpacing: '-0.02em' }}>{season.name}</h3>
                        {!season.active && <span className="prc-inactive-tag">Inactive</span>}
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                        {season.startDate} → {season.endDate}
                      </p>
                      <div style={{ display: 'flex', gap: 20 }}>
                        <div className="prc-rate-chip">
                          <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nuit</span>
                          <span style={{ fontSize: 18, fontWeight: 800, color: '#e0a84f', letterSpacing: '-0.03em' }}>{season.nightlyRate} €</span>
                        </div>
                        {season.weekendRate > 0 && (
                          <div className="prc-rate-chip">
                            <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Week-end</span>
                            <span style={{ fontSize: 18, fontWeight: 800, color: '#f5f0ea', letterSpacing: '-0.03em' }}>{season.weekendRate} €</span>
                          </div>
                        )}
                        {season.weeklyRate > 0 && (
                          <div className="prc-rate-chip">
                            <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semaine</span>
                            <span style={{ fontSize: 18, fontWeight: 800, color: '#f5f0ea', letterSpacing: '-0.03em' }}>{season.weeklyRate} €</span>
                          </div>
                        )}
                      </div>
                      {season.notes && <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 8 }}>{season.notes}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleEdit(season)} className="prc-icon-btn" title="Modifier">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(season.id)} className="prc-icon-btn danger" title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

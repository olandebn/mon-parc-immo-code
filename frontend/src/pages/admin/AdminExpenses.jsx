import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { expenseService } from '../../services/api'
import { Plus, Edit2, Trash2, Filter, Download, Printer } from 'lucide-react'
import { toast } from 'react-toastify'
import PropertySelector from '../../components/admin/PropertySelector'

/* ── Helpers export ──────────────────────────────────────────────────────── */
function exportCSV(expenses, year, propertyName) {
  const CATS = {
    RENOVATION: 'Travaux / Rénovation', FURNITURE: 'Meubles / Équipements',
    TAXES: 'Impôts / Taxes', WATER_ELECTRICITY: 'Eau + Électricité',
    SYNDICATE_CHARGES: 'Charges de syndic', INSURANCE: 'Assurance', OTHER: 'Autre',
  }
  const FREQS = { ONE_TIME: 'Ponctuelle', MONTHLY: 'Mensuelle', ANNUAL: 'Annuelle' }

  const header = ['Date', 'Catégorie', 'Description', 'Fréquence', 'Montant (€)', 'Notes']
  const rows = expenses.map(e => [
    e.date || '',
    CATS[e.category] || e.category,
    e.label || '',
    FREQS[e.frequency] || e.frequency,
    (e.amount || 0).toFixed(2),
    e.notes || '',
  ])

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  rows.push([]) // ligne vide
  rows.push(['', '', '', 'TOTAL', total.toFixed(2), ''])

  const csv = [header, ...rows]
    .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `depenses_${propertyName || 'bien'}_${year}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function printPDF(expenses, year, propertyName, summary) {
  const CATS = {
    RENOVATION: '🔨 Travaux', FURNITURE: '🛋️ Meubles', TAXES: '📋 Impôts',
    WATER_ELECTRICITY: '⚡ Eau + Électricité', SYNDICATE_CHARGES: '🏢 Syndic',
    INSURANCE: '🛡️ Assurance', OTHER: '📦 Autre',
  }
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const rows = expenses.map(e => `
    <tr>
      <td>${e.date || '—'}</td>
      <td>${CATS[e.category] || e.category}</td>
      <td>${e.label || '—'}</td>
      <td>${e.notes || ''}</td>
      <td style="text-align:right;font-weight:600;color:#c0392b">${(e.amount || 0).toFixed(2)} €</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Dépenses ${year} — ${propertyName}</title>
    <style>
      body { font-family: 'Helvetica Neue', sans-serif; color: #1a1a1a; padding: 32px; font-size: 13px; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .sub { color: #666; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f4f4f4; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
      td { padding: 8px 10px; border-bottom: 1px solid #eee; }
      .total-row td { background: #fafafa; font-weight: 700; border-top: 2px solid #ddd; }
      .total-row td:last-child { color: #c0392b; font-size: 16px; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h1>Charges & Dépenses — ${year}</h1>
    <p class="sub">Bien : ${propertyName} &nbsp;|&nbsp; Total : <strong>${total.toFixed(2)} €</strong></p>
    <table>
      <thead><tr><th>Date</th><th>Catégorie</th><th>Description</th><th>Notes</th><th style="text-align:right">Montant</th></tr></thead>
      <tbody>${rows}
        <tr class="total-row"><td colspan="4">TOTAL</td><td style="text-align:right">${total.toFixed(2)} €</td></tr>
      </tbody>
    </table>
    <p style="margin-top:32px;font-size:11px;color:#999">Exporté le ${new Date().toLocaleDateString('fr-FR')} depuis MonParcImmo</p>
    </body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.onload = () => win.print()
}

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .exp-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes exp-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .exp-fadein { animation: exp-fadein 0.4s ease both; }

  .exp-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .exp-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 20px;
  }

  .exp-form-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,136,58,0.2);
    border-radius: 16px; padding: 24px;
    margin-bottom: 24px;
  }

  .exp-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; font-size: 14px;
    color: #f5f0ea; font-family: inherit; outline: none;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .exp-input::placeholder { color: rgba(255,255,255,0.25); }
  .exp-input:focus { border-color: rgba(201,136,58,0.5); }
  .exp-input option { background: #1a1814; color: #f5f0ea; }

  .exp-label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }

  .exp-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
  }
  .exp-btn-primary:hover { opacity: 0.88; }
  .exp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .exp-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #94a3b8;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .exp-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #f5f0ea; }

  .exp-filter-pill {
    padding: 5px 14px; border-radius: 99px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #64748b; transition: all 0.15s;
  }
  .exp-filter-pill:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }
  .exp-filter-pill.active { background: rgba(201,136,58,0.15); border-color: rgba(201,136,58,0.35); color: #e0a84f; }

  .exp-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .exp-row:last-child { border-bottom: none; }

  .exp-cat-chip {
    display: inline-flex; align-items: center;
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
    padding: 3px 9px; border-radius: 99px;
    background: rgba(255,255,255,0.06); color: #64748b;
  }

  .exp-icon-btn {
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; border: none; cursor: pointer;
    background: transparent; color: #475569; transition: all 0.15s;
  }
  .exp-icon-btn:hover { background: rgba(255,255,255,0.08); color: #f5f0ea; }
  .exp-icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: #f87171; }

  .exp-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: exp-spin 0.8s linear infinite;
  }
  @keyframes exp-spin { to { transform: rotate(360deg); } }

  .exp-stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 20px;
  }
`

function injectCSS() {
  if (document.getElementById('exp-css')) return
  const s = document.createElement('style')
  s.id = 'exp-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const CATEGORIES = {
  RENOVATION:        'Travaux / Rénovation',
  FURNITURE:         'Meubles / Équipements',
  TAXES:             'Impôts / Taxes',
  WATER_ELECTRICITY: 'Eau + Électricité',
  SYNDICATE_CHARGES: 'Charges de syndic',
  INSURANCE:         'Assurance',
  OTHER:             'Autre',
}

const CAT_ICONS = {
  RENOVATION: '🔨', FURNITURE: '🛋️', TAXES: '📋',
  WATER_ELECTRICITY: '⚡', SYNDICATE_CHARGES: '🏢', INSURANCE: '🛡️', OTHER: '📦',
}

const FREQUENCIES = {
  ONE_TIME: 'Ponctuelle',
  MONTHLY:  'Mensuelle',
  ANNUAL:   'Annuelle',
}

const emptyForm = {
  category: 'OTHER', label: '', amount: '',
  frequency: 'ONE_TIME', date: new Date().toISOString().split('T')[0],
  year: new Date().getFullYear(), notes: ''
}

export default function AdminExpenses() {
  const currentYear = new Date().getFullYear()
  const [propertyId, setPropertyId] = useState(null)
  const [propertyName, setPropertyName] = useState('')
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(currentYear)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('ALL')

  useEffect(() => { injectCSS() }, [])
  useEffect(() => { if (propertyId) loadData() }, [year, propertyId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [expRes, sumRes] = await Promise.all([
        expenseService.getExpensesByYear(propertyId, year),
        expenseService.getExpenseSummary(propertyId, year),
      ])
      setExpenses(expRes.data)
      setSummary(sumRes.data)
    } finally { setLoading(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, amount: parseFloat(form.amount) || 0, year, propertyId }
      if (editingId) {
        await expenseService.updateExpense(editingId, data)
        toast.success('Dépense mise à jour')
      } else {
        await expenseService.addExpense(propertyId, data)
        toast.success('Dépense ajoutée')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      loadData()
    } catch {
      toast.error('Erreur')
    } finally { setSaving(false) }
  }

  const handleEdit = (expense) => {
    setForm({
      category: expense.category || 'OTHER',
      label: expense.label || '',
      amount: expense.amount || '',
      frequency: expense.frequency || 'ONE_TIME',
      date: expense.date || new Date().toISOString().split('T')[0],
      year: expense.year || currentYear,
      notes: expense.notes || '',
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette dépense ?')) return
    try {
      await expenseService.deleteExpense(id)
      toast.success('Dépense supprimée')
      loadData()
    } catch { toast.error('Erreur') }
  }

  const filtered = filterCat === 'ALL' ? expenses : expenses.filter(e => e.category === filterCat)
  const total = filtered.reduce((sum, e) => sum + (e.amount || 0), 0)

  const F = ({ label, children }) => (
    <div>
      <label className="exp-label">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="exp-root">

      {/* ── Header ── */}
      <header className="exp-header">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Charges & Dépenses</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <PropertySelector value={propertyId} onChange={(id, prop) => { setPropertyId(id); setPropertyName(prop?.name || '') }} required />
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
              style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, color: '#f5f0ea', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
              {[currentYear, currentYear - 1, currentYear - 2].map(y =>
                <option key={y} value={y} style={{ background: '#1a1814' }}>{y}</option>
              )}
            </select>
            {propertyId && expenses.length > 0 && (
              <>
                <button
                  onClick={() => exportCSV(filtered, year, propertyName)}
                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px', background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.25)', borderRadius:10, color:'#4ade80', fontSize:13, fontWeight:600, cursor:'pointer' }}
                >
                  <Download size={14} /> Excel
                </button>
                <button
                  onClick={() => printPDF(filtered, year, propertyName, summary)}
                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.25)', borderRadius:10, color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer' }}
                >
                  <Printer size={14} /> PDF
                </button>
              </>
            )}
            {propertyId && (
              <button
                onClick={() => { setForm({ ...emptyForm, year }); setEditingId(null); setShowForm(true) }}
                className="exp-btn-primary"
              >
                <Plus size={14} /> Ajouter
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* ── Aucun bien sélectionné ── */}
        {!propertyId && (
          <div className="exp-fadein" style={{ textAlign: 'center', padding: '100px 0', color: '#475569' }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Sélectionnez un bien pour gérer ses dépenses</p>
          </div>
        )}

        {propertyId && (
          <>
            {/* ── Résumé ── */}
            {summary && (
              <div className="exp-fadein" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
                <div className="exp-stat" style={{ gridColumn: 'span 2' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Total {year}</p>
                  <p style={{ fontSize: 30, fontWeight: 900, color: '#f87171', letterSpacing: '-0.04em' }}>
                    {summary.totalExpenses?.toFixed(2)} €
                  </p>
                </div>
                {Object.entries(summary.byCategory || {}).slice(0, 2).map(([cat, amount]) => (
                  <div key={cat} className="exp-stat">
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>{CAT_ICONS[cat]} {CATEGORIES[cat] || cat}</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#f5f0ea', letterSpacing: '-0.03em' }}>{amount?.toFixed(0)} €</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Formulaire ── */}
            {showForm && (
              <div className="exp-form-card exp-fadein">
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f5f0ea', marginBottom: 20, letterSpacing: '-0.02em' }}>
                  {editingId ? '✏️ Modifier la dépense' : '➕ Nouvelle dépense'}
                </h2>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    <F label="Catégorie">
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="exp-input">
                        {Object.entries(CATEGORIES).map(([key, label]) => (
                          <option key={key} value={key}>{CAT_ICONS[key]} {label}</option>
                        ))}
                      </select>
                    </F>
                    <F label="Description *">
                      <input type="text" value={form.label} required onChange={(e) => setForm({ ...form, label: e.target.value })} className="exp-input" placeholder="Ex: Facture EDF janvier" />
                    </F>
                    <F label="Montant (€) *">
                      <input type="number" value={form.amount} min="0" step="0.01" required onChange={(e) => setForm({ ...form, amount: e.target.value })} className="exp-input" placeholder="0.00" />
                    </F>
                    <F label="Fréquence">
                      <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="exp-input">
                        {Object.entries(FREQUENCIES).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </F>
                    <F label="Date">
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="exp-input" />
                    </F>
                    <F label="Notes">
                      <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="exp-input" placeholder="Optionnel" />
                    </F>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" disabled={saving} className="exp-btn-primary">
                      {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="exp-btn-ghost">Annuler</button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Filtres ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <Filter size={14} style={{ color: '#475569' }} />
              <button onClick={() => setFilterCat('ALL')} className={`exp-filter-pill ${filterCat === 'ALL' ? 'active' : ''}`}>
                Toutes
              </button>
              {Object.entries(CATEGORIES).map(([key, label]) =>
                expenses.some(e => e.category === key) && (
                  <button key={key} onClick={() => setFilterCat(key)} className={`exp-filter-pill ${filterCat === key ? 'active' : ''}`}>
                    {CAT_ICONS[key]} {label}
                  </button>
                )
              )}
            </div>

            {/* ── Liste ── */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                <div className="exp-spinner" />
              </div>
            ) : (
              <>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '0 20px' }}>
                  {filtered.length === 0 ? (
                    <p style={{ padding: '28px 0', textAlign: 'center', color: '#475569', fontSize: 14 }}>Aucune dépense pour {year}</p>
                  ) : (
                    filtered.map(expense => (
                      <div key={expense.id} className="exp-row">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <span className="exp-cat-chip">{CAT_ICONS[expense.category]} {CATEGORIES[expense.category] || expense.category}</span>
                            <span style={{ fontSize: 11, color: '#475569' }}>{FREQUENCIES[expense.frequency]}</span>
                          </div>
                          <p style={{ fontWeight: 600, color: '#f5f0ea', fontSize: 14, marginBottom: 2 }}>{expense.label}</p>
                          <p style={{ fontSize: 12, color: '#64748b' }}>{expense.date}</p>
                          {expense.notes && <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 2 }}>{expense.notes}</p>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#f87171', letterSpacing: '-0.02em' }}>{expense.amount?.toFixed(2)} €</span>
                          <button onClick={() => handleEdit(expense)} className="exp-icon-btn" title="Modifier">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(expense.id)} className="exp-icon-btn danger" title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {filtered.length > 0 && (
                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#f5f0ea' }}>
                      Total affiché : <span style={{ color: '#f87171' }}>{total.toFixed(2)} €</span>
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

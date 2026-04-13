import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { documentService } from '../../services/api'
import { Plus, Edit2, Trash2, Eye, EyeOff, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .doc-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes doc-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .doc-fadein { animation: doc-fadein 0.4s ease both; }

  .doc-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .doc-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    transition: border-color 0.2s;
  }
  .doc-card.hidden { opacity: 0.55; }

  .doc-form-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,136,58,0.2);
    border-radius: 16px; padding: 24px; margin-bottom: 24px;
  }

  .doc-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; font-size: 14px;
    color: #f5f0ea; font-family: inherit; outline: none;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .doc-input::placeholder { color: rgba(255,255,255,0.25); }
  .doc-input:focus { border-color: rgba(201,136,58,0.5); }
  .doc-input option { background: #1a1814; color: #f5f0ea; }

  .doc-label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }

  .doc-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
  }
  .doc-btn-primary:hover { opacity: 0.88; }
  .doc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .doc-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #94a3b8;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .doc-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #f5f0ea; }

  .doc-icon-btn {
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; border: none; cursor: pointer; background: transparent;
    color: #475569; transition: all 0.15s; text-decoration: none;
  }
  .doc-icon-btn:hover { background: rgba(255,255,255,0.08); color: #f5f0ea; }
  .doc-icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: #f87171; }

  .doc-type-chip {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    color: #64748b;
  }

  .doc-hidden-tag {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    padding: 2px 8px; border-radius: 99px;
    background: rgba(255,255,255,0.05); color: #475569;
  }

  .doc-toggle {
    display: flex; align-items: center; gap: 8px; cursor: pointer;
  }
  .doc-toggle input[type="checkbox"] { accent-color: #c9883a; width: 16px; height: 16px; cursor: pointer; }

  .doc-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: doc-spin 0.8s linear infinite;
  }
  @keyframes doc-spin { to { transform: rotate(360deg); } }
`

function injectCSS() {
  if (document.getElementById('doc-css')) return
  const s = document.createElement('style')
  s.id = 'doc-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const DOC_TYPES = {
  ARRIVAL_INSTRUCTIONS:   'Consignes d\'arrivée',
  DEPARTURE_INSTRUCTIONS: 'Consignes de départ',
  HOUSE_RULES:            'Règlement intérieur',
  OTHER:                  'Autre document',
}
const DOC_EMOJI = {
  ARRIVAL_INSTRUCTIONS: '🚪', DEPARTURE_INSTRUCTIONS: '🏃', HOUSE_RULES: '📋', OTHER: '📄',
}

const emptyForm = { title: '', type: 'HOUSE_RULES', fileUrl: '', fileName: '', visibleToClients: true, notes: '' }

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { injectCSS(); loadDocuments() }, [])

  const loadDocuments = async () => {
    try {
      const res = await documentService.getAllDocuments()
      setDocuments(res.data)
    } finally { setLoading(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await documentService.updateDocument(editingId, form)
        toast.success('Document mis à jour')
      } else {
        await documentService.addDocument(form)
        toast.success('Document ajouté')
      }
      setShowForm(false); setEditingId(null); setForm(emptyForm); loadDocuments()
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const handleEdit = (doc) => {
    setForm({ title: doc.title || '', type: doc.type || 'OTHER', fileUrl: doc.fileUrl || '', fileName: doc.fileName || '', visibleToClients: doc.visibleToClients !== false, notes: doc.notes || '' })
    setEditingId(doc.id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce document ?')) return
    try { await documentService.deleteDocument(id); toast.success('Document supprimé'); setDocuments(prev => prev.filter(d => d.id !== id)) }
    catch { toast.error('Erreur') }
  }

  const toggleVisibility = async (doc) => {
    try {
      await documentService.updateDocument(doc.id, { ...doc, visibleToClients: !doc.visibleToClients })
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, visibleToClients: !d.visibleToClients } : d))
    } catch { toast.error('Erreur') }
  }

  const F = ({ label, children, hint }) => (
    <div>
      <label className="doc-label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{hint}</p>}
    </div>
  )

  return (
    <div className="doc-root">

      {/* ── Header ── */}
      <header className="doc-header">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Documents</span>
          </div>
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }} className="doc-btn-primary">
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
          Les documents marqués "Visible" sont accessibles aux clients depuis la page Guide. Collez l'URL Firebase Storage ou un lien direct.
        </p>

        {/* ── Formulaire ── */}
        {showForm && (
          <div className="doc-form-card doc-fadein">
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f5f0ea', marginBottom: 20, letterSpacing: '-0.02em' }}>
              {editingId ? '✏️ Modifier le document' : '➕ Ajouter un document'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <F label="Titre *">
                  <input type="text" value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })} className="doc-input" placeholder="Consignes d'arrivée" />
                </F>
                <F label="Type">
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="doc-input">
                    {Object.entries(DOC_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{DOC_EMOJI[key]} {label}</option>
                    ))}
                  </select>
                </F>
              </div>
              <div style={{ marginBottom: 16 }}>
                <F label="URL du fichier" hint="Uploadez d'abord sur Firebase Storage et collez l'URL ici.">
                  <input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className="doc-input" placeholder="https://firebasestorage.googleapis.com/…" />
                </F>
              </div>
              <label className="doc-toggle" style={{ marginBottom: 20 }}>
                <input type="checkbox" checked={form.visibleToClients} onChange={(e) => setForm({ ...form, visibleToClients: e.target.checked })} />
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Visible par les clients connectés</span>
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} className="doc-btn-primary">
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="doc-btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Liste ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="doc-spinner" />
          </div>
        ) : documents.length === 0 ? (
          <div className="doc-fadein" style={{ textAlign: 'center', padding: '60px 0' }}>
            <FileText size={40} style={{ color: 'rgba(255,255,255,0.08)', margin: '0 auto 16px' }} />
            <p style={{ color: '#475569', fontSize: 14 }}>Aucun document. Ajoutez le règlement intérieur, les consignes d'arrivée, etc.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {documents.map((doc, i) => (
              <div key={doc.id} className={`doc-card doc-fadein ${!doc.visibleToClients ? 'hidden' : ''}`} style={{ animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(201,136,58,0.08)', border: '1px solid rgba(201,136,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {DOC_EMOJI[doc.type]}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f5f0ea' }}>{doc.title}</h3>
                      {!doc.visibleToClients && <span className="doc-hidden-tag">Masqué</span>}
                    </div>
                    <p className="doc-type-chip">{DOC_TYPES[doc.type]}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="doc-icon-btn" title="Ouvrir">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button onClick={() => toggleVisibility(doc)} className="doc-icon-btn" title={doc.visibleToClients ? 'Masquer' : 'Afficher'}>
                    {doc.visibleToClients ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => handleEdit(doc)} className="doc-icon-btn" title="Modifier">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="doc-icon-btn danger" title="Supprimer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

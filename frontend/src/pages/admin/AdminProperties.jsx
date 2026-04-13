import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { propertyService } from '../../services/api'
import { Plus, Edit2, Trash2, Home, MapPin, Users, Maximize2, Image, Save, X } from 'lucide-react'
import { toast } from 'react-toastify'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .prp-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes prp-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .prp-fadein { animation: prp-fadein 0.4s ease both; }

  .prp-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .prp-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    overflow: hidden;
  }

  .prp-form-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,136,58,0.2);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 24px;
  }

  .prp-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    font-size: 14px;
    color: #f5f0ea;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .prp-input::placeholder { color: rgba(255,255,255,0.25); }
  .prp-input:focus { border-color: rgba(201,136,58,0.5); }
  .prp-input option { background: #1a1814; color: #f5f0ea; }

  .prp-label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }

  .prp-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: opacity 0.2s;
  }
  .prp-btn-primary:hover { opacity: 0.88; }
  .prp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .prp-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #94a3b8;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .prp-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #f5f0ea; }

  .prp-btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px; color: #f87171;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.2s;
  }
  .prp-btn-danger:hover { background: rgba(239,68,68,0.15); }

  .prp-btn-amber {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 12px;
    background: rgba(201,136,58,0.08);
    border: 1px solid rgba(201,136,58,0.2);
    border-radius: 8px; color: #e0a84f;
    font-size: 12px; font-weight: 500; cursor: pointer;
    transition: background 0.2s;
  }
  .prp-btn-amber:hover { background: rgba(201,136,58,0.16); }

  .prp-section-title {
    font-size: 11px; font-weight: 700; color: #c9883a;
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;
  }

  .prp-chip {
    font-size: 12px; color: #64748b;
    display: inline-flex; align-items: center; gap: 4px;
  }

  .prp-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: prp-spin 0.8s linear infinite;
  }
  @keyframes prp-spin { to { transform: rotate(360deg); } }
`

function injectCSS() {
  if (document.getElementById('prp-css')) return
  const s = document.createElement('style')
  s.id = 'prp-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const emptyForm = {
  name: '', description: '', address: '', city: '',
  country: 'France', surfaceArea: '', numberOfRooms: '',
  maxGuests: '', wifiName: '', wifiPassword: '',
  checkInTime: '15:00', checkOutTime: '11:00',
  houseRules: '', checkInInstructions: '',
}

export default function AdminProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [addingPhoto, setAddingPhoto] = useState(null)

  useEffect(() => { injectCSS(); loadProperties() }, [])

  const loadProperties = async () => {
    try {
      const res = await propertyService.getAllProperties()
      setProperties(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        surfaceArea: parseFloat(form.surfaceArea) || 0,
        numberOfRooms: parseInt(form.numberOfRooms) || 0,
        maxGuests: parseInt(form.maxGuests) || 0,
      }
      if (editingId) {
        await propertyService.updateProperty(editingId, data)
        toast.success('Bien mis à jour !')
      } else {
        await propertyService.createProperty(data)
        toast.success('Bien créé !')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      loadProperties()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally { setSaving(false) }
  }

  const handleEdit = (p) => {
    setForm({
      name: p.name || '', description: p.description || '',
      address: p.address || '', city: p.city || '',
      country: p.country || 'France',
      surfaceArea: p.surfaceArea || '', numberOfRooms: p.numberOfRooms || '',
      maxGuests: p.maxGuests || '', wifiName: p.wifiName || '',
      wifiPassword: p.wifiPassword || '', checkInTime: p.checkInTime || '15:00',
      checkOutTime: p.checkOutTime || '11:00', houseRules: p.houseRules || '',
      checkInInstructions: p.checkInInstructions || '',
    })
    setEditingId(p.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return
    try {
      await propertyService.deleteProperty(id)
      toast.success('Bien supprimé')
      loadProperties()
    } catch { toast.error('Erreur') }
  }

  const handleAddPhoto = async (propertyId, type) => {
    if (!photoUrl.trim()) return
    try {
      if (type === 'main') {
        await propertyService.addMainPhoto(propertyId, photoUrl)
      } else {
        await propertyService.addSurroundingPhoto(propertyId, photoUrl)
      }
      toast.success('Photo ajoutée !')
      setPhotoUrl('')
      setAddingPhoto(null)
      loadProperties()
    } catch { toast.error('Erreur') }
  }

  const F = ({ label, children }) => (
    <div>
      <label className="prp-label">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="prp-root">

      {/* ── Header ── */}
      <header className="prp-header">
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Mes biens</span>
            <span style={{ fontSize: 13, color: '#475569' }}>({properties.length})</span>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="prp-btn-primary"
          >
            <Plus size={15} /> Ajouter un bien
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* ── Formulaire ── */}
        {showForm && (
          <div className="prp-form-card prp-fadein">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f5f0ea', letterSpacing: '-0.02em' }}>
                {editingId ? '✏️ Modifier le bien' : '🏠 Nouveau bien'}
              </h2>
              <button onClick={() => setShowForm(false)} className="prp-btn-ghost" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Infos générales */}
              <p className="prp-section-title">✦ Informations générales</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <F label="Nom du bien *">
                  <input className="prp-input" value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Villa les Pins, Mas Provençal…" />
                </F>
                <F label="Ville *">
                  <input className="prp-input" value={form.city} required onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Nice" />
                </F>
                <F label="Adresse">
                  <input className="prp-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="12 avenue des Fleurs" />
                </F>
                <F label="Pays">
                  <input className="prp-input" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="France" />
                </F>
              </div>
              <div style={{ marginBottom: 20 }}>
                <F label="Description">
                  <textarea className="prp-input" style={{ minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Décrivez votre bien : situation, caractéristiques, ambiance…" />
                </F>
              </div>

              {/* Capacité */}
              <p className="prp-section-title">✦ Capacité & surface</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                <F label="Voyageurs max">
                  <input className="prp-input" type="number" min="1" value={form.maxGuests} onChange={e => setForm({ ...form, maxGuests: e.target.value })} placeholder="6" />
                </F>
                <F label="Nombre de pièces">
                  <input className="prp-input" type="number" min="1" value={form.numberOfRooms} onChange={e => setForm({ ...form, numberOfRooms: e.target.value })} placeholder="4" />
                </F>
                <F label="Surface (m²)">
                  <input className="prp-input" type="number" min="1" value={form.surfaceArea} onChange={e => setForm({ ...form, surfaceArea: e.target.value })} placeholder="85" />
                </F>
              </div>

              {/* Check-in / Check-out */}
              <p className="prp-section-title">✦ Arrivée & départ</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <F label="Heure d'arrivée (check-in)">
                  <input className="prp-input" type="time" value={form.checkInTime} onChange={e => setForm({ ...form, checkInTime: e.target.value })} />
                </F>
                <F label="Heure de départ (check-out)">
                  <input className="prp-input" type="time" value={form.checkOutTime} onChange={e => setForm({ ...form, checkOutTime: e.target.value })} />
                </F>
                <F label="Wi-Fi — Nom du réseau">
                  <input className="prp-input" value={form.wifiName} onChange={e => setForm({ ...form, wifiName: e.target.value })} placeholder="MonWifi_5G" />
                </F>
                <F label="Wi-Fi — Mot de passe">
                  <input className="prp-input" value={form.wifiPassword} onChange={e => setForm({ ...form, wifiPassword: e.target.value })} placeholder="MotDePasse123" />
                </F>
              </div>

              {/* Instructions & règles */}
              <p className="prp-section-title">✦ Instructions & règles</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                <F label="Instructions d'arrivée">
                  <textarea className="prp-input" style={{ minHeight: 100, resize: 'vertical' }} value={form.checkInInstructions} onChange={e => setForm({ ...form, checkInInstructions: e.target.value })} placeholder="Code de la porte : 1234, clés dans la boîte…" />
                </F>
                <F label="Règlement de la maison">
                  <textarea className="prp-input" style={{ minHeight: 100, resize: 'vertical' }} value={form.houseRules} onChange={e => setForm({ ...form, houseRules: e.target.value })} placeholder="Non fumeur, pas d'animaux, déchets à sortir…" />
                </F>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} className="prp-btn-primary">
                  <Save size={15} />
                  {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer le bien'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="prp-btn-ghost">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Liste des biens ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="prp-spinner" />
          </div>
        ) : properties.length === 0 ? (
          <div className="prp-fadein" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 72, height: 72, background: 'rgba(201,136,58,0.08)', border: '1px solid rgba(201,136,58,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Home size={36} style={{ color: 'rgba(201,136,58,0.5)' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f5f0ea', marginBottom: 8 }}>Aucun bien ajouté</h3>
            <p style={{ color: '#475569', marginBottom: 24, fontSize: 14 }}>Créez votre premier logement pour commencer à gérer vos réservations.</p>
            <button onClick={() => setShowForm(true)} className="prp-btn-primary">
              <Plus size={15} /> Ajouter un bien
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {properties.map((p, i) => (
              <div key={p.id} className={`prp-card prp-fadein`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex' }}>
                  {/* Photo principale */}
                  <div style={{ width: 160, flexShrink: 0, background: 'rgba(255,255,255,0.03)', position: 'relative', minHeight: 130 }}>
                    {p.mainPhotoUrls?.[0] ? (
                      <img src={p.mainPhotoUrls[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', minHeight: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Home size={40} style={{ color: 'rgba(255,255,255,0.1)' }} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: 99 }}>
                      {p.mainPhotoUrls?.length || 0} photo{(p.mainPhotoUrls?.length || 0) > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, padding: '20px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f5f0ea', marginBottom: 4, letterSpacing: '-0.02em' }}>{p.name}</h3>
                        {p.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b' }}>
                            <MapPin size={12} />
                            {p.city}{p.country ? `, ${p.country}` : ''}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleEdit(p)} className="prp-btn-ghost">
                          <Edit2 size={13} /> Modifier
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="prp-btn-danger">
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Specs */}
                    <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
                      {p.maxGuests > 0 && <span className="prp-chip"><Users size={12} />{p.maxGuests} pers.</span>}
                      {p.numberOfRooms > 0 && <span className="prp-chip">🛏 {p.numberOfRooms} pièces</span>}
                      {p.surfaceArea > 0 && <span className="prp-chip"><Maximize2 size={12} />{p.surfaceArea} m²</span>}
                      {p.checkInTime && <span className="prp-chip">🔑 Arrivée {p.checkInTime}</span>}
                      {p.checkOutTime && <span className="prp-chip">🚪 Départ {p.checkOutTime}</span>}
                    </div>

                    {/* Ajout photos */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {addingPhoto === p.id + '-main' ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
                          <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="URL photo principale (https://…)" className="prp-input" style={{ flex: 1, fontSize: 12, padding: '7px 10px' }} />
                          <button onClick={() => handleAddPhoto(p.id, 'main')} className="prp-btn-amber" style={{ whiteSpace: 'nowrap' }}>OK</button>
                          <button onClick={() => { setAddingPhoto(null); setPhotoUrl('') }} className="prp-btn-ghost" style={{ padding: '6px 10px' }}>✕</button>
                        </div>
                      ) : addingPhoto === p.id + '-surr' ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
                          <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="URL photo des environs (https://…)" className="prp-input" style={{ flex: 1, fontSize: 12, padding: '7px 10px' }} />
                          <button onClick={() => handleAddPhoto(p.id, 'surrounding')} className="prp-btn-amber" style={{ whiteSpace: 'nowrap' }}>OK</button>
                          <button onClick={() => { setAddingPhoto(null); setPhotoUrl('') }} className="prp-btn-ghost" style={{ padding: '6px 10px' }}>✕</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => { setAddingPhoto(p.id + '-main'); setPhotoUrl('') }} className="prp-btn-amber">
                            <Image size={12} /> + Photo principale
                          </button>
                          <button onClick={() => { setAddingPhoto(p.id + '-surr'); setPhotoUrl('') }} className="prp-btn-ghost" style={{ fontSize: 12 }}>
                            <Image size={12} /> + Photo environs
                          </button>
                          <Link to={`/biens/${p.id}`} target="_blank" className="prp-btn-ghost" style={{ textDecoration: 'none', fontSize: 12 }}>
                            👁 Voir page publique
                          </Link>
                        </>
                      )}
                    </div>
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

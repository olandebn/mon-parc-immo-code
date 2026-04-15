import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { propertyService } from '../../services/api'
import {
  Plus, Edit2, Trash2, Home, MapPin, Users, Maximize2,
  X, ChevronRight, Image, Eye, Wifi, Clock, BookOpen,
  Info, Camera, GripVertical, CheckCircle, ExternalLink, Link2
} from 'lucide-react'
import { toast } from 'react-toastify'
import PhotoUploader from '../../components/admin/PhotoUploader'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .prp-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes prp-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .prp-in { animation: prp-in 0.35s ease both; }

  .prp-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  }

  /* ── Onglets ── */
  .prp-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 18px; font-size: 13px; font-weight: 600;
    background: none; border: none; cursor: pointer; color: #64748b;
    border-bottom: 2px solid transparent; transition: all 0.15s;
    white-space: nowrap;
  }
  .prp-tab.active { color: #e0a84f; border-bottom-color: #e0a84f; }
  .prp-tab:hover:not(.active) { color: #94a3b8; }
  .prp-tab-badge { font-size: 10px; background: rgba(201,136,58,0.2); color: #e0a84f; padding: 1px 6px; border-radius: 99px; }

  /* ── Inputs ── */
  .prp-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; font-size: 14px;
    color: #f5f0ea; font-family: inherit; outline: none;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .prp-input::placeholder { color: rgba(255,255,255,0.25); }
  .prp-input:focus { border-color: rgba(201,136,58,0.5); background: rgba(255,255,255,0.08); }
  .prp-input option { background: #1a1814; color: #f5f0ea; }
  .prp-label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── Boutons ── */
  .prp-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 800; cursor: pointer; transition: opacity 0.2s;
  }
  .prp-btn-primary:hover { opacity: 0.88; }
  .prp-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .prp-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #94a3b8;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s;
  }
  .prp-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #f5f0ea; }

  .prp-btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18);
    border-radius: 8px; color: #f87171;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s;
  }
  .prp-btn-danger:hover { background: rgba(239,68,68,0.15); }

  /* ── Cards ── */
  .prp-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; }
  .prp-section { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,136,58,0.18); border-radius: 14px; padding: 20px; }
  .prp-section-title { font-size: 11px; font-weight: 800; color: #c9883a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; display: flex; align-items: center; gap: 7px; }

  /* ── Photos ── */
  .prp-photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .prp-photo-item {
    position: relative; border-radius: 12px; overflow: hidden;
    aspect-ratio: 4/3;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer; transition: border-color 0.2s;
  }
  .prp-photo-item:hover { border-color: rgba(201,136,58,0.3); }
  .prp-photo-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .prp-photo-del {
    position: absolute; top: 6px; right: 6px;
    width: 26px; height: 26px;
    background: rgba(0,0,0,0.75); border: none; border-radius: 6px;
    color: #f87171; cursor: pointer; display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s; font-size: 13px;
  }
  .prp-photo-item:hover .prp-photo-del { opacity: 1; }
  .prp-photo-cover { position: absolute; bottom: 5px; left: 5px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 7px; border-radius: 4px; background: rgba(201,136,58,0.85); color: #080706; }
  .prp-photo-add {
    border-radius: 12px; aspect-ratio: 4/3;
    background: rgba(201,136,58,0.05); border: 2px dashed rgba(201,136,58,0.25);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: all 0.2s; color: #64748b;
  }
  .prp-photo-add:hover { background: rgba(201,136,58,0.1); border-color: rgba(201,136,58,0.45); color: #e0a84f; }

  /* ── URL preview ── */
  .prp-url-preview { width: 100%; height: 140px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-top: 10px; }
  .prp-url-preview-placeholder { width: 100%; height: 140px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; margin-top: 10px; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 12px; }

  /* ── Biens cards ── */
  .prp-bien-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; transition: border-color 0.2s; }
  .prp-bien-card:hover { border-color: rgba(201,136,58,0.2); }

  /* ── Spinner ── */
  .prp-spinner { width: 36px; height: 36px; border: 3px solid rgba(201,136,58,0.2); border-top-color: #c9883a; border-radius: 50%; animation: prp-spin 0.8s linear infinite; }
  @keyframes prp-spin { to { transform: rotate(360deg); } }

  /* ── Règles tag ── */
  .prp-rule-tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 99px; font-size: 13px; color: #94a3b8; }
  .prp-rule-tag.active { background: rgba(201,136,58,0.1); border-color: rgba(201,136,58,0.25); color: #e0a84f; }
`

function injectCSS() {
  if (document.getElementById('prp-css')) return
  const s = document.createElement('style'); s.id = 'prp-css'; s.textContent = CSS; document.head.appendChild(s)
}

/* ── Données initiales ── */
const emptyForm = {
  name: '', description: '', address: '', city: '', country: 'France',
  surfaceArea: '', numberOfRooms: '', maxGuests: '',
  wifiName: '', wifiPassword: '', electricMeterLocation: '', waterMeterLocation: '',
  parkingInfo: '', trashInfo: '',
  checkInTime: '15:00', checkOutTime: '11:00',
  checkInInstructions: '', checkOutInstructions: '',
  houseRules: '', additionalNotes: '',
}

const TABS = [
  { id: 'infos',    icon: Info,     label: 'Informations' },
  { id: 'photos',   icon: Camera,   label: 'Photos' },
  { id: 'regles',   icon: BookOpen, label: 'Règlement' },
  { id: 'pratique', icon: Wifi,     label: 'Infos pratiques' },
]

/* ── Composant champ ── */
function F({ label, children, span }) {
  return (
    <div style={span ? { gridColumn: `span ${span}` } : {}}>
      {label && <label className="prp-label">{label}</label>}
      {children}
    </div>
  )
}

export default function AdminProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProp, setEditingProp] = useState(null) // null = liste, obj = édition
  const [form, setForm] = useState(emptyForm)
  const [activeTab, setActiveTab] = useState('infos')
  const [saving, setSaving] = useState(false)

  // Photo states
  const [mainPhotos, setMainPhotos]     = useState([])  // urls actuelles
  const [surrPhotos, setSurrPhotos]     = useState([])
  const [newPhotoUrl, setNewPhotoUrl]   = useState('')
  const [newPhotoType, setNewPhotoType] = useState('main') // 'main' | 'surr'
  const [photoPreviewOk, setPhotoPreviewOk] = useState(false)
  const [addingPhoto, setAddingPhoto]   = useState(false)

  // Quick rules toggles
  const [rulesToggled, setRulesToggled] = useState({
    noSmoking: false, noPets: false, noParties: false, quietHours: false,
  })

  useEffect(() => { injectCSS(); loadProperties() }, [])

  const loadProperties = async () => {
    setLoading(true)
    try {
      const res = await propertyService.getAllProperties()
      setProperties(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  /* ── Ouvrir formulaire ── */
  const openNew = () => {
    setForm(emptyForm)
    setEditingProp({ id: null }) // nouvelle fiche
    setMainPhotos([]); setSurrPhotos([])
    setActiveTab('infos')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEdit = (p) => {
    setForm({
      name: p.name || '', description: p.description || '',
      address: p.address || '', city: p.city || '', country: p.country || 'France',
      surfaceArea: p.surfaceArea || '', numberOfRooms: p.numberOfRooms || '',
      maxGuests: p.maxGuests || '',
      wifiName: p.wifiName || '', wifiPassword: p.wifiPassword || '',
      electricMeterLocation: p.electricMeterLocation || '',
      waterMeterLocation: p.waterMeterLocation || '',
      parkingInfo: p.parkingInfo || '', trashInfo: p.trashInfo || '',
      checkInTime: p.checkInTime || '15:00', checkOutTime: p.checkOutTime || '11:00',
      checkInInstructions: p.checkInInstructions || '',
      checkOutInstructions: p.checkOutInstructions || '',
      houseRules: p.houseRules || '', additionalNotes: p.additionalNotes || '',
    })
    setMainPhotos(p.mainPhotoUrls || [])
    setSurrPhotos(p.surroundingPhotoUrls || [])
    setEditingProp(p)
    setActiveTab('infos')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeForm = () => { setEditingProp(null); setNewPhotoUrl(''); setPhotoPreviewOk(false) }

  /* ── Sauvegarder ── */
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        surfaceArea: parseFloat(form.surfaceArea) || 0,
        numberOfRooms: parseInt(form.numberOfRooms) || 0,
        maxGuests: parseInt(form.maxGuests) || 0,
        mainPhotoUrls: mainPhotos,
        surroundingPhotoUrls: surrPhotos,
      }
      if (editingProp?.id) {
        await propertyService.updateProperty(editingProp.id, data)
        toast.success('Bien mis à jour !')
      } else {
        await propertyService.createProperty(data)
        toast.success('Bien créé !')
      }
      closeForm()
      loadProperties()
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.code === 'ERR_NETWORK' ? 'Backend inaccessible — démarrez le serveur Spring Boot.' : null)
        || `Erreur ${err.response?.status || ''} : ${err.message}`
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer "${name}" ? Irréversible.`)) return
    try {
      await propertyService.deleteProperty(id)
      toast.success('Bien supprimé')
      loadProperties()
    } catch { toast.error('Erreur') }
  }

  /* ── Photos ── */
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim() || !photoPreviewOk) return
    if (newPhotoType === 'main') {
      setMainPhotos(prev => [...prev, newPhotoUrl.trim()])
    } else {
      setSurrPhotos(prev => [...prev, newPhotoUrl.trim()])
    }
    setNewPhotoUrl(''); setPhotoPreviewOk(false); setAddingPhoto(false)
  }

  const handleRemoveMainPhoto = (url) => setMainPhotos(prev => prev.filter(u => u !== url))
  const handleRemoveSurrPhoto = (url) => setSurrPhotos(prev => prev.filter(u => u !== url))

  const handleMoveFirst = (url) => {
    setMainPhotos(prev => [url, ...prev.filter(u => u !== url)])
  }

  /* ── Rendu ── */

  if (editingProp !== null) {
    return <PropertyForm
      form={form} setForm={setForm}
      editingProp={editingProp}
      activeTab={activeTab} setActiveTab={setActiveTab}
      mainPhotos={mainPhotos} surrPhotos={surrPhotos}
      handleRemoveMainPhoto={handleRemoveMainPhoto}
      handleRemoveSurrPhoto={handleRemoveSurrPhoto}
      handleMoveFirst={handleMoveFirst}
      newPhotoUrl={newPhotoUrl} setNewPhotoUrl={setNewPhotoUrl}
      newPhotoType={newPhotoType} setNewPhotoType={setNewPhotoType}
      photoPreviewOk={photoPreviewOk} setPhotoPreviewOk={setPhotoPreviewOk}
      addingPhoto={addingPhoto} setAddingPhoto={setAddingPhoto}
      handleAddPhoto={handleAddPhoto}
      saving={saving}
      onSave={handleSave}
      onClose={closeForm}
    />
  }

  return (
    <div className="prp-root">
      <header className="prp-header">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Mes biens</span>
            <span style={{ fontSize: 13, color: '#475569' }}>({properties.length})</span>
          </div>
          <button onClick={openNew} className="prp-btn-primary">
            <Plus size={15} /> Ajouter un bien
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="prp-spinner" />
          </div>
        ) : properties.length === 0 ? (
          <div className="prp-in" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 72, height: 72, background: 'rgba(201,136,58,0.08)', border: '1px solid rgba(201,136,58,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Home size={36} style={{ color: 'rgba(201,136,58,0.5)' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aucun bien ajouté</h3>
            <p style={{ color: '#475569', marginBottom: 24, fontSize: 14 }}>Créez votre premier logement pour commencer.</p>
            <button onClick={openNew} className="prp-btn-primary"><Plus size={15} /> Ajouter un bien</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {properties.map((p, i) => <PropertyCard key={p.id} p={p} i={i} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </main>
    </div>
  )
}

/* ── Carte bien ── */
function PropertyCard({ p, i, onEdit, onDelete }) {
  const photo = p.mainPhotoUrls?.[0]
  return (
    <div className={`prp-bien-card prp-in`} style={{ animationDelay: `${i * 0.05}s`, display: 'flex' }}>
      {/* Photo */}
      <div style={{ width: 180, flexShrink: 0, background: 'rgba(255,255,255,0.03)', position: 'relative', minHeight: 130 }}>
        {photo
          ? <img src={photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', minHeight: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={40} style={{ color: 'rgba(255,255,255,0.08)' }} />
            </div>
        }
        {p.mainPhotoUrls?.length > 0 && (
          <span style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: 99 }}>
            {p.mainPhotoUrls.length} photo{p.mainPhotoUrls.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f5f0ea', marginBottom: 4, letterSpacing: '-0.02em' }}>{p.name}</h3>
              {p.city && <p style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{p.city}{p.country ? `, ${p.country}` : ''}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(p)} className="prp-btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>
                <Edit2 size={13} /> Modifier
              </button>
              <button onClick={() => onDelete(p.id, p.name)} className="prp-btn-danger" style={{ padding: '7px 14px', fontSize: 13 }}>
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
            {p.maxGuests > 0 && <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} />{p.maxGuests} pers.</span>}
            {p.numberOfRooms > 0 && <span style={{ fontSize: 12, color: '#64748b' }}>🛏 {p.numberOfRooms} pièces</span>}
            {p.surfaceArea > 0 && <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Maximize2 size={11} />{p.surfaceArea} m²</span>}
            {p.checkInTime && <span style={{ fontSize: 12, color: '#64748b' }}>🔑 Arrivée {p.checkInTime}</span>}
            {p.checkOutTime && <span style={{ fontSize: 12, color: '#64748b' }}>🚪 Départ {p.checkOutTime}</span>}
          </div>
        </div>

        {/* Actions bas */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <Link to={`/biens/${p.id}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12, color: '#64748b', textDecoration: 'none' }}>
            <ExternalLink size={12} /> Page publique
          </Link>
          {p.houseRules && <span style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Règlement</span>}
          {p.checkInInstructions && <span style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Instructions</span>}
          {p.wifiPassword && <span style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Wi-Fi</span>}
        </div>
      </div>
    </div>
  )
}

/* ── Formulaire complet ── */
function PropertyForm({
  form, setForm, editingProp, activeTab, setActiveTab,
  mainPhotos, surrPhotos,
  handleRemoveMainPhoto, handleRemoveSurrPhoto, handleMoveFirst,
  newPhotoUrl, setNewPhotoUrl, newPhotoType, setNewPhotoType,
  photoPreviewOk, setPhotoPreviewOk, addingPhoto, setAddingPhoto, handleAddPhoto,
  saving, onSave, onClose
}) {
  const isNew = !editingProp?.id
  const f = (field) => ({ value: form[field], onChange: e => setForm(s => ({ ...s, [field]: e.target.value })) })
  const ta = (field, rows = 4) => ({ value: form[field], rows, onChange: e => setForm(s => ({ ...s, [field]: e.target.value })) })

  return (
    <div className="prp-root">
      {/* Header */}
      <header className="prp-header">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Mes biens</button>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {isNew ? '✨ Nouveau bien' : `✏️ ${editingProp.name || 'Modifier le bien'}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="prp-btn-ghost">Annuler</button>
            <button onClick={onSave} disabled={saving} className="prp-btn-primary">
              {saving ? 'Enregistrement…' : isNew ? '✓ Créer le bien' : '✓ Enregistrer'}
            </button>
          </div>
        </div>
      </header>

      {/* Onglets */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0 }}>
          {TABS.map(({ id, icon: Icon, label }) => {
            let badge = null
            if (id === 'photos') badge = mainPhotos.length + surrPhotos.length || null
            return (
              <button key={id} onClick={() => setActiveTab(id)} className={`prp-tab ${activeTab === id ? 'active' : ''}`}>
                <Icon size={14} /> {label}
                {badge ? <span className="prp-tab-badge">{badge}</span> : null}
              </button>
            )
          })}
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
        <form onSubmit={onSave}>

          {/* ───────── ONGLET INFOS ───────── */}
          {activeTab === 'infos' && (
            <div className="prp-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="prp-section">
                <p className="prp-section-title"><Info size={13} /> Identité du bien</p>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                  <F label="Nom du bien *">
                    <input className="prp-input" {...f('name')} required placeholder="Villa les Pins, Appartement Marais…" />
                  </F>
                  <F label="Ville *">
                    <input className="prp-input" {...f('city')} required placeholder="Nice" />
                  </F>
                  <F label="Adresse" span={1}>
                    <input className="prp-input" {...f('address')} placeholder="12 avenue des Fleurs" />
                  </F>
                  <F label="Pays">
                    <input className="prp-input" {...f('country')} placeholder="France" />
                  </F>
                  <F label="Description" span={2}>
                    <textarea className="prp-input" {...ta('description', 3)} style={{ resize: 'vertical' }} placeholder="Décrivez votre bien : situation, ambiance, points forts…" />
                  </F>
                </div>
              </div>

              <div className="prp-section">
                <p className="prp-section-title"><Maximize2 size={13} /> Capacité & surface</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  <F label="Voyageurs max">
                    <input className="prp-input" type="number" min="1" {...f('maxGuests')} placeholder="6" />
                  </F>
                  <F label="Nombre de pièces">
                    <input className="prp-input" type="number" min="1" {...f('numberOfRooms')} placeholder="4" />
                  </F>
                  <F label="Surface (m²)">
                    <input className="prp-input" type="number" min="1" {...f('surfaceArea')} placeholder="85" />
                  </F>
                </div>
              </div>

              <div className="prp-section">
                <p className="prp-section-title"><Clock size={13} /> Horaires d'accueil</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <F label="Heure d'arrivée (check-in)">
                    <input className="prp-input" type="time" {...f('checkInTime')} />
                  </F>
                  <F label="Heure de départ (check-out)">
                    <input className="prp-input" type="time" {...f('checkOutTime')} />
                  </F>
                </div>
              </div>
            </div>
          )}

          {/* ───────── ONGLET PHOTOS ───────── */}
          {activeTab === 'photos' && (
            <div className="prp-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Photos principales */}
              <div className="prp-section">
                <p className="prp-section-title"><Camera size={13} /> Photos principales</p>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                  La première photo sera la couverture. Cliquez sur ⭐ pour la mettre en avant.
                </p>

                {/* Galerie existante */}
                {mainPhotos.length > 0 && (
                  <div className="prp-photo-grid" style={{ marginBottom: 16 }}>
                    {mainPhotos.map((url, i) => (
                      <div key={url} className="prp-photo-item">
                        <img src={url} alt={`Photo ${i + 1}`} onError={e => { e.currentTarget.style.display = 'none' }} />
                        {i === 0 && <span className="prp-photo-cover">⭐ Couverture</span>}
                        {i > 0 && (
                          <button type="button" onClick={() => handleMoveFirst(url)}
                            style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: 6, color: '#e0a84f', fontSize: 12, padding: '3px 7px', cursor: 'pointer' }}>
                            ⭐
                          </button>
                        )}
                        <button type="button" className="prp-photo-del" onClick={() => handleRemoveMainPhoto(url)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload depuis le PC */}
                <PhotoUploader
                  folder={`properties/${editingProp?.id || 'new'}/main`}
                  label="Ajouter des photos depuis votre PC"
                  onUploaded={url => setMainPhotos(prev => [...prev, url])}
                />

                {/* OU par URL */}
                <details style={{ marginTop: 12 }}>
                  <summary style={{ fontSize: 12, color: '#64748b', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Link2 size={12} /> Ou ajouter par URL
                  </summary>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <input
                      className="prp-input"
                      value={newPhotoType === 'main' ? newPhotoUrl : ''}
                      onChange={e => { setNewPhotoType('main'); setNewPhotoUrl(e.target.value); setPhotoPreviewOk(false) }}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <button type="button" onClick={handleAddPhoto}
                      disabled={!(newPhotoType === 'main' && photoPreviewOk)}
                      className="prp-btn-primary" style={{ whiteSpace: 'nowrap' }}>
                      + Ajouter
                    </button>
                  </div>
                  {newPhotoType === 'main' && newPhotoUrl && (
                    <>
                      <img src={newPhotoUrl} className="prp-url-preview" alt="Aperçu"
                        onLoad={() => setPhotoPreviewOk(true)} onError={() => setPhotoPreviewOk(false)}
                        style={{ display: photoPreviewOk ? 'block' : 'none' }} />
                      {!photoPreviewOk && <div className="prp-url-preview-placeholder">⚠️ URL invalide ou image inaccessible</div>}
                    </>
                  )}
                </details>
              </div>

              {/* Photos des alentours */}
              <div className="prp-section">
                <p className="prp-section-title"><Image size={13} /> Photos des environs</p>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Quartier, vue depuis le balcon, parking, façade…</p>

                {surrPhotos.length > 0 && (
                  <div className="prp-photo-grid" style={{ marginBottom: 16 }}>
                    {surrPhotos.map((url, i) => (
                      <div key={url} className="prp-photo-item">
                        <img src={url} alt={`Env. ${i + 1}`} onError={e => { e.currentTarget.style.display = 'none' }} />
                        <button type="button" className="prp-photo-del" onClick={() => handleRemoveSurrPhoto(url)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <PhotoUploader
                  folder={`properties/${editingProp?.id || 'new'}/surrounding`}
                  label="Ajouter des photos des environs"
                  onUploaded={url => setSurrPhotos(prev => [...prev, url])}
                />

                <details style={{ marginTop: 12 }}>
                  <summary style={{ fontSize: 12, color: '#64748b', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Link2 size={12} /> Ou ajouter par URL
                  </summary>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <input
                      className="prp-input"
                      value={newPhotoType === 'surr' ? newPhotoUrl : ''}
                      onChange={e => { setNewPhotoType('surr'); setNewPhotoUrl(e.target.value); setPhotoPreviewOk(false) }}
                      placeholder="https://example.com/quartier.jpg"
                    />
                    <button type="button" onClick={handleAddPhoto}
                      disabled={!(newPhotoType === 'surr' && photoPreviewOk)}
                      className="prp-btn-primary" style={{ whiteSpace: 'nowrap' }}>
                      + Ajouter
                    </button>
                  </div>
                  {newPhotoType === 'surr' && newPhotoUrl && (
                    <>
                      <img src={newPhotoUrl} className="prp-url-preview" alt="Aperçu"
                        onLoad={() => setPhotoPreviewOk(true)} onError={() => setPhotoPreviewOk(false)}
                        style={{ display: photoPreviewOk ? 'block' : 'none' }} />
                      {!photoPreviewOk && <div className="prp-url-preview-placeholder">⚠️ URL invalide ou image inaccessible</div>}
                    </>
                  )}
                </details>
              </div>
            </div>
          )}

          {/* ───────── ONGLET RÈGLEMENT ───────── */}
          {activeTab === 'regles' && (
            <div className="prp-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div className="prp-section">
                <p className="prp-section-title">🚪 Instructions d'arrivée</p>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  Comment accéder au logement, code de la porte, emplacement des clés…
                </p>
                <textarea className="prp-input" {...ta('checkInInstructions', 6)} style={{ resize: 'vertical', lineHeight: 1.7 }}
                  placeholder="Ex : Code de la porte : 4821&#10;Les clés sont dans la boîte à clés sur la gauche de la porte d'entrée.&#10;Composez le code B-4-2-1.&#10;&#10;Parking : Place n°12 au sous-sol, badge dans le tiroir de la cuisine." />
              </div>

              <div className="prp-section">
                <p className="prp-section-title">🏃 Instructions de départ</p>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  Ce qu'on attend des voyageurs avant de partir.
                </p>
                <textarea className="prp-input" {...ta('checkOutInstructions', 5)} style={{ resize: 'vertical', lineHeight: 1.7 }}
                  placeholder="Ex : Veuillez laisser les clés sur la table basse.&#10;Sortez les poubelles bleues et jaunes.&#10;Laissez la machine à laver tourner si elle est pleine.&#10;Éteignez tous les appareils et fermez les volets." />
              </div>

              <div className="prp-section">
                <p className="prp-section-title">📋 Règlement intérieur</p>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                  Règles à respecter pendant le séjour.
                </p>

                {/* Toggles rapides */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[
                    { key: 'noSmoking', label: '🚭 Non-fumeur' },
                    { key: 'noPets', label: '🐾 Pas d\'animaux' },
                    { key: 'noParties', label: '🎉 Pas de fêtes' },
                    { key: 'quietHours', label: '🌙 Calme après 22h' },
                  ].map(({ key, label }) => (
                    <button key={key} type="button"
                      onClick={() => {
                        const isOn = !form.houseRules?.includes(label.slice(2))
                        const current = form.houseRules || ''
                        const rule = label.slice(2) // sans l'emoji
                        const newRules = isOn
                          ? (current ? current + '\n• ' + rule : '• ' + rule)
                          : current.split('\n').filter(l => !l.includes(rule)).join('\n')
                        setForm(s => ({ ...s, houseRules: newRules }))
                      }}
                      className="prp-rule-tag"
                      style={{ background: form.houseRules?.includes(label.slice(2)) ? 'rgba(201,136,58,0.1)' : 'rgba(255,255,255,0.05)', borderColor: form.houseRules?.includes(label.slice(2)) ? 'rgba(201,136,58,0.25)' : 'rgba(255,255,255,0.09)', color: form.houseRules?.includes(label.slice(2)) ? '#e0a84f' : '#94a3b8' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <textarea className="prp-input" {...ta('houseRules', 7)} style={{ resize: 'vertical', lineHeight: 1.7 }}
                  placeholder="• Non-fumeur à l'intérieur&#10;• Pas d'animaux de compagnie&#10;• Respectez les voisins, pas de bruit après 22h&#10;• Pas de fête ou événement&#10;• Laissez le logement dans l'état où vous l'avez trouvé" />
              </div>

              <div className="prp-section">
                <p className="prp-section-title">📝 Notes complémentaires</p>
                <textarea className="prp-input" {...ta('additionalNotes', 4)} style={{ resize: 'vertical', lineHeight: 1.7 }}
                  placeholder="Informations supplémentaires, recommandations de restaurants, activités à proximité…" />
              </div>
            </div>
          )}

          {/* ───────── ONGLET INFOS PRATIQUES ───────── */}
          {activeTab === 'pratique' && (
            <div className="prp-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="prp-section">
                <p className="prp-section-title"><Wifi size={13} /> Connexion Wi-Fi</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <F label="Nom du réseau (SSID)">
                    <input className="prp-input" {...f('wifiName')} placeholder="MonWifi_5G" />
                  </F>
                  <F label="Mot de passe Wi-Fi">
                    <input className="prp-input" {...f('wifiPassword')} placeholder="MotDePasse123!" />
                  </F>
                </div>
              </div>

              <div className="prp-section">
                <p className="prp-section-title">🏠 Équipements & emplacements</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <F label="Compteur électrique">
                    <input className="prp-input" {...f('electricMeterLocation')} placeholder="Cellier à droite en entrant" />
                  </F>
                  <F label="Compteur d'eau">
                    <input className="prp-input" {...f('waterMeterLocation')} placeholder="Sous l'évier de la cuisine" />
                  </F>
                  <F label="Parking / stationnement">
                    <input className="prp-input" {...f('parkingInfo')} placeholder="Place n°12 au sous-sol, badge dans le tiroir" />
                  </F>
                  <F label="Poubelles / tri sélectif">
                    <input className="prp-input" {...f('trashInfo')} placeholder="Bleue : papiers, Jaune : plastiques, Verte : verre" />
                  </F>
                </div>
              </div>

              <div style={{ padding: '16px 20px', background: 'rgba(201,136,58,0.06)', border: '1px solid rgba(201,136,58,0.15)', borderRadius: 12, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                💡 Ces informations apparaissent dans la section <strong style={{ color: '#e0a84f' }}>Guide du logement</strong> accessible aux voyageurs connectés depuis la page Guide.
              </div>
            </div>
          )}

        </form>

        {/* Nav bas entre onglets */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => {
              const idx = TABS.findIndex(t => t.id === activeTab)
              if (idx > 0) setActiveTab(TABS[idx - 1].id)
            }}
            className="prp-btn-ghost"
            disabled={activeTab === TABS[0].id}
            style={{ opacity: activeTab === TABS[0].id ? 0.3 : 1 }}
          >
            ← Précédent
          </button>
          <button onClick={onSave} disabled={saving} className="prp-btn-primary">
            {saving ? 'Enregistrement…' : activeTab === TABS[TABS.length - 1].id
              ? (editingProp?.id ? '✓ Enregistrer' : '✓ Créer le bien')
              : 'Enregistrer & continuer →'}
          </button>
        </div>
      </main>
    </div>
  )
}

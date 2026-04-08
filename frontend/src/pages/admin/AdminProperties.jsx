import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { propertyService } from '../../services/api'
import { Plus, Edit2, Trash2, Home, MapPin, Users, Maximize2, Image, Save, X } from 'lucide-react'
import { toast } from 'react-toastify'

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
  const [addingPhoto, setAddingPhoto] = useState(null) // 'main' | 'surrounding'

  useEffect(() => { loadProperties() }, [])

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
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, color: '#111827',
    outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none' }}>← Dashboard</Link>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Mes biens</span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>({properties.length})</span>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <Plus style={{ width: 15, height: 15 }} /> Ajouter un bien
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>

        {/* ─── Formulaire ─── */}
        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 28, marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
                {editingId ? '✏️ Modifier le bien' : '🏠 Nouveau bien'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Infos générales */}
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5', marginBottom: 14 }}>Informations générales</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <F label="Nom du bien *">
                  <input style={inputStyle} value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Villa les Pins, Mas Provençal..." />
                </F>
                <F label="Ville *">
                  <input style={inputStyle} value={form.city} required onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Nice" />
                </F>
                <F label="Adresse">
                  <input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="12 avenue des Fleurs" />
                </F>
                <F label="Pays">
                  <input style={inputStyle} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="France" />
                </F>
              </div>
              <div style={{ marginBottom: 20 }}>
                <F label="Description">
                  <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Décrivez votre bien : situation, caractéristiques, ambiance..." />
                </F>
              </div>

              {/* Capacité */}
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5', marginBottom: 14 }}>Capacité & surface</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                <F label="Voyageurs max">
                  <input style={inputStyle} type="number" min="1" value={form.maxGuests} onChange={e => setForm({ ...form, maxGuests: e.target.value })} placeholder="6" />
                </F>
                <F label="Nombre de pièces">
                  <input style={inputStyle} type="number" min="1" value={form.numberOfRooms} onChange={e => setForm({ ...form, numberOfRooms: e.target.value })} placeholder="4" />
                </F>
                <F label="Surface (m²)">
                  <input style={inputStyle} type="number" min="1" value={form.surfaceArea} onChange={e => setForm({ ...form, surfaceArea: e.target.value })} placeholder="85" />
                </F>
              </div>

              {/* Check-in / Check-out */}
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5', marginBottom: 14 }}>Arrivée & départ</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <F label="Heure d'arrivée (check-in)">
                  <input style={inputStyle} type="time" value={form.checkInTime} onChange={e => setForm({ ...form, checkInTime: e.target.value })} />
                </F>
                <F label="Heure de départ (check-out)">
                  <input style={inputStyle} type="time" value={form.checkOutTime} onChange={e => setForm({ ...form, checkOutTime: e.target.value })} />
                </F>
                <F label="Wi-Fi — Nom du réseau">
                  <input style={inputStyle} value={form.wifiName} onChange={e => setForm({ ...form, wifiName: e.target.value })} placeholder="MonWifi_5G" />
                </F>
                <F label="Wi-Fi — Mot de passe">
                  <input style={inputStyle} value={form.wifiPassword} onChange={e => setForm({ ...form, wifiPassword: e.target.value })} placeholder="MotDePasse123" />
                </F>
              </div>

              {/* Instructions & règles */}
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5', marginBottom: 14 }}>Instructions & règles</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <F label="Instructions d'arrivée">
                  <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.checkInInstructions} onChange={e => setForm({ ...form, checkInInstructions: e.target.value })} placeholder="Code de la porte : 1234, clés dans la boîte..." />
                </F>
                <F label="Règlement de la maison">
                  <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.houseRules} onChange={e => setForm({ ...form, houseRules: e.target.value })} placeholder="Non fumeur, pas d'animaux, déchets à sortir..." />
                </F>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                  <Save style={{ width: 15, height: 15 }} />
                  {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer le bien'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Liste des biens ─── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 72, height: 72, background: '#f0f0ff', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Home style={{ width: 36, height: 36, color: '#a5b4fc' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Aucun bien ajouté</h3>
            <p style={{ color: '#9ca3af', marginBottom: 20 }}>Créez votre premier logement pour commencer à gérer vos réservations.</p>
            <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              + Ajouter un bien
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {properties.map(p => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: 0 }}>
                  {/* Photo principale */}
                  <div style={{ width: 160, flexShrink: 0, background: '#f3f4f6', position: 'relative' }}>
                    {p.mainPhotoUrls?.[0] ? (
                      <img src={p.mainPhotoUrls[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Home style={{ width: 40, height: 40, color: '#d1d5db' }} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 7px', borderRadius: 99 }}>
                      {p.mainPhotoUrls?.length || 0} photo{(p.mainPhotoUrls?.length || 0) > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{p.name}</h3>
                        {p.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6b7280' }}>
                            <MapPin style={{ width: 12, height: 12 }} />
                            {p.city}{p.country ? `, ${p.country}` : ''}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(p)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#f0f0ff', color: '#4f46e5', border: '1px solid #e0e7ff', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                          <Edit2 style={{ width: 13, height: 13 }} /> Modifier
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#fff5f5', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                          <Trash2 style={{ width: 13, height: 13 }} /> Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Specs */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      {p.maxGuests > 0 && <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}><Users style={{ width: 12, height: 12 }} />{p.maxGuests} pers.</span>}
                      {p.numberOfRooms > 0 && <span style={{ fontSize: 12, color: '#6b7280' }}>🛏 {p.numberOfRooms} pièces</span>}
                      {p.surfaceArea > 0 && <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}><Maximize2 style={{ width: 12, height: 12 }} />{p.surfaceArea} m²</span>}
                      {p.checkInTime && <span style={{ fontSize: 12, color: '#6b7280' }}>🔑 Arrivée {p.checkInTime}</span>}
                      {p.checkOutTime && <span style={{ fontSize: 12, color: '#6b7280' }}>🚪 Départ {p.checkOutTime}</span>}
                    </div>

                    {/* Ajout photos */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {addingPhoto === p.id + '-main' ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
                          <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="URL de la photo principale (ex: https://...)" style={{ ...inputStyle, flex: 1, fontSize: 12, padding: '6px 10px' }} />
                          <button onClick={() => handleAddPhoto(p.id, 'main')} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>OK</button>
                          <button onClick={() => { setAddingPhoto(null); setPhotoUrl('') }} style={{ padding: '6px 10px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : addingPhoto === p.id + '-surr' ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
                          <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="URL photo des environs (ex: https://...)" style={{ ...inputStyle, flex: 1, fontSize: 12, padding: '6px 10px' }} />
                          <button onClick={() => handleAddPhoto(p.id, 'surrounding')} style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>OK</button>
                          <button onClick={() => { setAddingPhoto(null); setPhotoUrl('') }} style={{ padding: '6px 10px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => { setAddingPhoto(p.id + '-main'); setPhotoUrl('') }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#f0f0ff', color: '#4f46e5', border: '1px solid #e0e7ff', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                            <Image style={{ width: 12, height: 12 }} /> + Photo principale
                          </button>
                          <button onClick={() => { setAddingPhoto(p.id + '-surr'); setPhotoUrl('') }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                            <Image style={{ width: 12, height: 12 }} /> + Photo environs
                          </button>
                          <Link to={`/biens/${p.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#f8fafc', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, textDecoration: 'none' }}>
                            👁 Voir la page publique
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

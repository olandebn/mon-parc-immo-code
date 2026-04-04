import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pricingService } from '../../services/api'
import { Plus, Edit2, Trash2, Sun, Snowflake } from 'lucide-react'
import { toast } from 'react-toastify'

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

  useEffect(() => { loadSeasons() }, [])

  const loadSeasons = async () => {
    try {
      const res = await pricingService.getAllSeasons()
      setSeasons(res.data)
    } finally { setLoading(false) }
  }

  const handleEdit = (season) => {
    setForm({
      name: season.name || '',
      type: season.type || 'HIGH_SEASON',
      startDate: season.startDate || '',
      endDate: season.endDate || '',
      nightlyRate: season.nightlyRate || '',
      weekendRate: season.weekendRate || '',
      weeklyRate: season.weeklyRate || '',
      active: season.active !== false,
      notes: season.notes || '',
    })
    setEditingId(season.id)
    setShowForm(true)
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
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900">Tarifs & Saisons</h1>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Nouvelle saison
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Formulaire */}
        {showForm && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Modifier la saison' : 'Nouvelle saison de tarif'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="input-field"
                    placeholder="Ex: Haute saison été 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="HIGH_SEASON">Haute saison</option>
                    <option value="LOW_SEASON">Basse saison</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input type="date" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input type="date" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix / nuit (€)
                  </label>
                  <input type="number" value={form.nightlyRate} min="0"
                    onChange={(e) => setForm({ ...form, nightlyRate: e.target.value })}
                    required className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix week-end (€)
                  </label>
                  <input type="number" value={form.weekendRate} min="0"
                    onChange={(e) => setForm({ ...form, weekendRate: e.target.value })}
                    className="input-field" placeholder="0" />
                  <p className="text-xs text-gray-400 mt-0.5">Ven. soir → Dim. (optionnel)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix / semaine (€)
                  </label>
                  <input type="number" value={form.weeklyRate} min="0"
                    onChange={(e) => setForm({ ...form, weeklyRate: e.target.value })}
                    className="input-field" placeholder="0" />
                  <p className="text-xs text-gray-400 mt-0.5">7 nuits (optionnel)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes internes
                </label>
                <input type="text" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field" placeholder="Ex: Prix négociés pour l'été" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded" />
                <span className="text-sm text-gray-700">Saison active</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des saisons */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {seasons.length === 0 && (
              <div className="card text-center py-10 text-gray-400">
                Aucune saison configurée. Créez votre première saison de tarifs.
              </div>
            )}
            {seasons.map((season) => (
              <div key={season.id} className={`card ${!season.active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      season.type === 'HIGH_SEASON' ? 'bg-amber-50' : 'bg-blue-50'
                    }`}>
                      {season.type === 'HIGH_SEASON'
                        ? <Sun className="w-5 h-5 text-amber-500" />
                        : <Snowflake className="w-5 h-5 text-blue-400" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{season.name}</h3>
                        {!season.active && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {season.startDate} → {season.endDate}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-xs text-gray-400">Nuit</p>
                          <p className="font-semibold text-gray-900">{season.nightlyRate} €</p>
                        </div>
                        {season.weekendRate > 0 && (
                          <div>
                            <p className="text-xs text-gray-400">Week-end</p>
                            <p className="font-semibold text-gray-900">{season.weekendRate} €</p>
                          </div>
                        )}
                        {season.weeklyRate > 0 && (
                          <div>
                            <p className="text-xs text-gray-400">Semaine</p>
                            <p className="font-semibold text-gray-900">{season.weeklyRate} €</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(season)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(season.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
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

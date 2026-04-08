import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { expenseService } from '../../services/api'
import { Plus, Edit2, Trash2, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import PropertySelector from '../../components/admin/PropertySelector'

const CATEGORIES = {
  RENOVATION: 'Travaux / Rénovation',
  FURNITURE: 'Meubles / Équipements',
  TAXES: 'Impôts / Taxes d\'habitation',
  WATER_ELECTRICITY: 'Eau + Électricité',
  SYNDICATE_CHARGES: 'Charges de syndic',
  INSURANCE: 'Assurance',
  OTHER: 'Autre',
}

const FREQUENCIES = {
  ONE_TIME: 'Ponctuelle',
  MONTHLY: 'Mensuelle',
  ANNUAL: 'Annuelle',
}

const emptyForm = {
  category: 'OTHER', label: '', amount: '',
  frequency: 'ONE_TIME', date: new Date().toISOString().split('T')[0],
  year: new Date().getFullYear(), notes: ''
}

export default function AdminExpenses() {
  const currentYear = new Date().getFullYear()
  const [propertyId, setPropertyId] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(currentYear)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('ALL')

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

  const filtered = filterCat === 'ALL'
    ? expenses
    : expenses.filter(e => e.category === filterCat)

  const total = filtered.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900">Dépenses</h1>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <PropertySelector value={propertyId} onChange={(id) => setPropertyId(id)} required />
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
              className="input-field w-auto text-sm">
              {[currentYear, currentYear-1, currentYear-2].map(y =>
                <option key={y} value={y}>{y}</option>
              )}
            </select>
            {propertyId && (
              <button
                onClick={() => { setForm({ ...emptyForm, year }); setEditingId(null); setShowForm(true) }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {!propertyId && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Sélectionnez un bien pour gérer ses dépenses</p>
          </div>
        )}
        {/* Résumé */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card col-span-2">
              <p className="text-sm text-gray-500">Total des dépenses {year}</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {summary.totalExpenses?.toFixed(2)} €
              </p>
            </div>
            {Object.entries(summary.byCategory || {}).slice(0, 2).map(([cat, amount]) => (
              <div key={cat} className="card">
                <p className="text-xs text-gray-500">{CATEGORIES[cat] || cat}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{amount?.toFixed(0)} €</p>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Modifier la dépense' : 'Nouvelle dépense'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field">
                    {Object.entries(CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" value={form.label} required
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="input-field" placeholder="Ex: Facture EDF janvier" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                  <input type="number" value={form.amount} min="0" step="0.01" required
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                  <select value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="input-field">
                    {Object.entries(FREQUENCIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input type="text" value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field" placeholder="Optionnel" />
                </div>
              </div>
              <div className="flex gap-3">
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

        {/* Filtre par catégorie */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <button onClick={() => setFilterCat('ALL')}
            className={`px-3 py-1 rounded-full text-sm ${filterCat === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Toutes
          </button>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            expenses.some(e => e.category === key) && (
              <button key={key} onClick={() => setFilterCat(key)}
                className={`px-3 py-1 rounded-full text-sm ${filterCat === key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {label}
              </button>
            )
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="card text-center py-8 text-gray-400">
                  Aucune dépense pour {year}
                </div>
              ) : (
                filtered.map((expense) => (
                  <div key={expense.id} className="card flex items-center justify-between py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {CATEGORIES[expense.category] || expense.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {FREQUENCIES[expense.frequency]}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mt-0.5">{expense.label}</p>
                      <p className="text-xs text-gray-400">{expense.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-red-600">{expense.amount?.toFixed(2)} €</span>
                      <button onClick={() => handleEdit(expense)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(expense.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {filtered.length > 0 && (
              <div className="mt-4 text-right">
                <span className="font-semibold text-gray-900">
                  Total : {total.toFixed(2)} €
                </span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

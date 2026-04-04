import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { documentService } from '../../services/api'
import { Plus, Edit2, Trash2, Eye, EyeOff, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'

const DOC_TYPES = {
  ARRIVAL_INSTRUCTIONS: 'Consignes d\'arrivée',
  DEPARTURE_INSTRUCTIONS: 'Consignes de départ',
  HOUSE_RULES: 'Règlement intérieur',
  OTHER: 'Autre document',
}

const emptyForm = {
  title: '', type: 'HOUSE_RULES',
  fileUrl: '', fileName: '',
  visibleToClients: true, notes: ''
}

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadDocuments() }, [])

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
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      loadDocuments()
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const handleEdit = (doc) => {
    setForm({
      title: doc.title || '',
      type: doc.type || 'OTHER',
      fileUrl: doc.fileUrl || '',
      fileName: doc.fileName || '',
      visibleToClients: doc.visibleToClients !== false,
      notes: doc.notes || '',
    })
    setEditingId(doc.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce document ?')) return
    try {
      await documentService.deleteDocument(id)
      toast.success('Document supprimé')
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch { toast.error('Erreur') }
  }

  const toggleVisibility = async (doc) => {
    try {
      await documentService.updateDocument(doc.id, { ...doc, visibleToClients: !doc.visibleToClients })
      setDocuments(prev =>
        prev.map(d => d.id === doc.id ? { ...d, visibleToClients: !d.visibleToClients } : d)
      )
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-6">
          Les documents marqués "Visible" sont accessibles aux clients connectés depuis la page Guide.
          Vous pouvez ajouter des URL Firebase Storage ou des liens externes.
        </p>

        {/* Formulaire */}
        {showForm && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Modifier le document' : 'Ajouter un document'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input type="text" value={form.title} required
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field" placeholder="Ex: Consignes d'arrivée" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field">
                    {Object.entries(DOC_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL du fichier (Firebase Storage ou lien direct)
                  </label>
                  <input type="url" value={form.fileUrl}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://firebasestorage.googleapis.com/..." />
                  <p className="text-xs text-gray-400 mt-1">
                    Uploadez d'abord le fichier sur Firebase Storage et collez l'URL ici.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.visibleToClients}
                  onChange={(e) => setForm({ ...form, visibleToClients: e.target.checked })}
                  className="rounded" />
                <span className="text-sm text-gray-700">
                  Visible par les clients connectés
                </span>
              </label>

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

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {documents.length === 0 && (
              <div className="card text-center py-10">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">Aucun document. Ajoutez le règlement intérieur,
                les consignes d'arrivée, etc.</p>
              </div>
            )}
            {documents.map((doc) => (
              <div key={doc.id} className={`card flex items-center justify-between ${
                !doc.visibleToClients ? 'opacity-70' : ''
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl">
                    {doc.type === 'ARRIVAL_INSTRUCTIONS' ? '🚪' :
                     doc.type === 'DEPARTURE_INSTRUCTIONS' ? '🏃' :
                     doc.type === 'HOUSE_RULES' ? '📋' : '📄'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      {!doc.visibleToClients && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Masqué
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{DOC_TYPES[doc.type]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => toggleVisibility(doc)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                    title={doc.visibleToClients ? 'Masquer' : 'Afficher'}>
                    {doc.visibleToClients ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(doc)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
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

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../../services/api'
import { Plus, UserX, Mail, Clock } from 'lucide-react'
import { toast } from 'react-toastify'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '' })
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [usersRes, invRes] = await Promise.all([
        userService.getAllUsers(),
        userService.getAllInvitations(),
      ])
      setUsers(usersRes.data)
      setInvitations(invRes.data)
    } finally { setLoading(false) }
  }

  const handleSendInvitation = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await userService.createInvitation(inviteForm)
      toast.success(`Invitation envoyée à ${inviteForm.email} !`)
      setShowInviteForm(false)
      setInviteForm({ firstName: '', lastName: '', email: '' })
      loadData()
    } catch {
      toast.error('Erreur lors de l\'envoi de l\'invitation')
    } finally { setSending(false) }
  }

  const handleDeactivate = async (uid, name) => {
    if (!window.confirm(`Désactiver le compte de ${name} ?`)) return
    try {
      await userService.deactivateUser(uid)
      toast.success('Compte désactivé')
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, active: false } : u))
    } catch { toast.error('Erreur') }
  }

  const statusInvitation = {
    PENDING: { label: 'En attente', color: 'text-yellow-600 bg-yellow-50' },
    ACCEPTED: { label: 'Acceptée', color: 'text-green-600 bg-green-50' },
    EXPIRED: { label: 'Expirée', color: 'text-red-600 bg-red-50' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900">Utilisateurs</h1>
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Inviter
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Formulaire d'invitation */}
        {showInviteForm && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Envoyer une invitation
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Un email sera envoyé avec un lien pour créer un compte. Le lien est valable 72h.
            </p>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" value={inviteForm.firstName} required
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    className="input-field" placeholder="Jean" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" value={inviteForm.lastName} required
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    className="input-field" placeholder="Dupont" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={inviteForm.email} required
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="input-field" placeholder="jean.dupont@email.com" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={sending} className="btn-primary">
                  {sending ? 'Envoi...' : '📧 Envoyer l\'invitation'}
                </button>
                <button type="button" onClick={() => setShowInviteForm(false)} className="btn-secondary">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Onglets */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Comptes ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invitations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Invitations ({invitations.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">Aucun client inscrit</div>
            ) : (
              users.map((user) => (
                <div key={user.uid} className={`card flex items-center justify-between ${
                  !user.active ? 'opacity-60' : ''
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      {!user.active && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          Désactivé
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  {user.active && (
                    <button
                      onClick={() => handleDeactivate(user.uid, `${user.firstName} ${user.lastName}`)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Désactiver"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">Aucune invitation envoyée</div>
            ) : (
              invitations.map((invitation) => {
                const status = statusInvitation[invitation.status] || statusInvitation.PENDING
                return (
                  <div key={invitation.id} className="card flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {invitation.firstName} {invitation.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{invitation.email}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Expire : {invitation.expiresAt}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../../services/api'
import { Plus, UserX, Mail, Clock } from 'lucide-react'
import { toast } from 'react-toastify'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .usr-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes usr-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .usr-fadein { animation: usr-fadein 0.4s ease both; }

  .usr-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,7,6,0.94);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .usr-form-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,136,58,0.2);
    border-radius: 16px; padding: 24px; margin-bottom: 24px;
  }

  .usr-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; font-size: 14px;
    color: #f5f0ea; font-family: inherit; outline: none;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .usr-input::placeholder { color: rgba(255,255,255,0.25); }
  .usr-input:focus { border-color: rgba(201,136,58,0.5); }

  .usr-label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }

  .usr-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
  }
  .usr-btn-primary:hover { opacity: 0.88; }
  .usr-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .usr-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #94a3b8;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .usr-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #f5f0ea; }

  .usr-tab {
    padding: 8px 18px; font-size: 13px; font-weight: 600;
    background: none; border: none; cursor: pointer; color: #64748b;
    border-bottom: 2px solid transparent; transition: all 0.15s;
  }
  .usr-tab.active { color: #e0a84f; border-bottom-color: #e0a84f; }
  .usr-tab:hover:not(.active) { color: #94a3b8; }

  .usr-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .usr-card.inactive { opacity: 0.5; }

  .usr-deactivated-tag {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    padding: 3px 9px; border-radius: 99px;
    background: rgba(239,68,68,0.1); color: #f87171;
  }

  .usr-inv-badge {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    padding: 3px 9px; border-radius: 99px;
  }
  .usr-inv-pending  { background: rgba(251,191,36,0.12); color: #fbbf24; }
  .usr-inv-accepted { background: rgba(34,197,94,0.12);  color: #4ade80; }
  .usr-inv-expired  { background: rgba(239,68,68,0.12);  color: #f87171; }

  .usr-icon-btn {
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; border: none; cursor: pointer; background: transparent;
    color: #475569; transition: all 0.15s;
  }
  .usr-icon-btn:hover { background: rgba(239,68,68,0.1); color: #f87171; }

  .usr-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: usr-spin 0.8s linear infinite;
  }
  @keyframes usr-spin { to { transform: rotate(360deg); } }
`

function injectCSS() {
  if (document.getElementById('usr-css')) return
  const s = document.createElement('style')
  s.id = 'usr-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const INV_STATUS = {
  PENDING:  { label: 'En attente', cls: 'usr-inv-pending' },
  ACCEPTED: { label: 'Acceptée',   cls: 'usr-inv-accepted' },
  EXPIRED:  { label: 'Expirée',    cls: 'usr-inv-expired' },
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '' })
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => { injectCSS(); loadData() }, [])

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

  const F = ({ label, children }) => (
    <div>
      <label className="usr-label">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="usr-root">

      {/* ── Header ── */}
      <header className="usr-header">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Utilisateurs</span>
          </div>
          <button onClick={() => setShowInviteForm(true)} className="usr-btn-primary">
            <Plus size={15} /> Inviter un voyageur
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* ── Formulaire d'invitation ── */}
        {showInviteForm && (
          <div className="usr-form-card usr-fadein">
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f5f0ea', marginBottom: 6, letterSpacing: '-0.02em' }}>
              📧 Envoyer une invitation
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Un email sera envoyé avec un lien pour créer un compte. Valable 72h.
            </p>
            <form onSubmit={handleSendInvitation}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <F label="Prénom *">
                  <input type="text" value={inviteForm.firstName} required onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })} className="usr-input" placeholder="Jean" />
                </F>
                <F label="Nom *">
                  <input type="text" value={inviteForm.lastName} required onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })} className="usr-input" placeholder="Dupont" />
                </F>
              </div>
              <div style={{ marginBottom: 20 }}>
                <F label="Email *">
                  <input type="email" value={inviteForm.email} required onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} className="usr-input" placeholder="jean.dupont@email.com" />
                </F>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={sending} className="usr-btn-primary">
                  {sending ? 'Envoi…' : '📧 Envoyer l\'invitation'}
                </button>
                <button type="button" onClick={() => setShowInviteForm(false)} className="usr-btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Onglets ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
          <button onClick={() => setActiveTab('users')} className={`usr-tab ${activeTab === 'users' ? 'active' : ''}`}>
            Comptes ({users.length})
          </button>
          <button onClick={() => setActiveTab('invitations')} className={`usr-tab ${activeTab === 'invitations' ? 'active' : ''}`}>
            Invitations ({invitations.length})
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="usr-spinner" />
          </div>
        ) : activeTab === 'users' ? (
          <div className="usr-fadein" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.length === 0 ? (
              <div className="usr-card" style={{ justifyContent: 'center', color: '#475569', fontSize: 14 }}>Aucun client inscrit</div>
            ) : users.map((user, i) => (
              <div key={user.uid} className={`usr-card usr-fadein ${!user.active ? 'inactive' : ''}`} style={{ animationDelay: `${i * 0.04}s` }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#f5f0ea' }}>{user.firstName} {user.lastName}</p>
                    {!user.active && <span className="usr-deactivated-tag">Désactivé</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                    <Mail size={13} />
                    <span>{user.email}</span>
                  </div>
                </div>
                {user.active && (
                  <button
                    onClick={() => handleDeactivate(user.uid, `${user.firstName} ${user.lastName}`)}
                    className="usr-icon-btn"
                    title="Désactiver le compte"
                  >
                    <UserX size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="usr-fadein" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {invitations.length === 0 ? (
              <div className="usr-card" style={{ justifyContent: 'center', color: '#475569', fontSize: 14 }}>Aucune invitation envoyée</div>
            ) : invitations.map((invitation, i) => {
              const s = INV_STATUS[invitation.status] || INV_STATUS.PENDING
              return (
                <div key={invitation.id} className={`usr-card usr-fadein`} style={{ animationDelay: `${i * 0.04}s` }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#f5f0ea', marginBottom: 3 }}>
                      {invitation.firstName} {invitation.lastName}
                    </p>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{invitation.email}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
                      <Clock size={12} />
                      <span>Expire : {invitation.expiresAt}</span>
                    </div>
                  </div>
                  <span className={`usr-inv-badge ${s.cls}`}>{s.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { userService } from '../services/api'
import { Home, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

const CSS = `
  .inv-root {
    min-height: 100vh; background: #080706; color: #f5f0ea;
    font-family: 'Inter', -apple-system, sans-serif;
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .inv-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px; padding: 40px; width: 100%; max-width: 420px;
  }
  .inv-input {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; font-size: 14px;
    color: #f5f0ea; font-family: inherit; outline: none;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .inv-input::placeholder { color: rgba(255,255,255,0.25); }
  .inv-input:focus { border-color: rgba(201,136,58,0.5); }
  .inv-label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .inv-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 12px;
    font-size: 15px; font-weight: 800; cursor: pointer; transition: opacity 0.2s;
  }
  .inv-btn:hover { opacity: 0.88; }
  .inv-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .inv-email-chip {
    padding: 10px 14px; border-radius: 10px;
    background: rgba(201,136,58,0.08); border: 1px solid rgba(201,136,58,0.2);
    font-size: 13px; color: #e0a84f; font-weight: 600; margin-bottom: 20px;
  }
  .inv-spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a; border-radius: 50%;
    animation: inv-spin 0.8s linear infinite;
    margin: 0 auto;
  }
  @keyframes inv-spin { to { transform: rotate(360deg); } }
`
function injectCSS() {
  if (document.getElementById('inv-css')) return
  const s = document.createElement('style'); s.id = 'inv-css'; s.textContent = CSS; document.head.appendChild(s)
}

export default function InvitationPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { injectCSS(); validateToken() }, [token])

  const validateToken = async () => {
    try {
      const res = await userService.validateInvitation(token)
      setInvitation(res.data)
    } catch (err) {
      setError(err.response?.data?.message || "Ce lien d'invitation est invalide ou a expiré.")
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return }
    if (password.length < 8) { toast.error('Minimum 8 caractères'); return }
    setSubmitting(true)
    try {
      await userService.acceptInvitation(token, password)
      setSuccess(true)
      toast.success('Compte créé avec succès !')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du compte')
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="inv-root">
        <div className="inv-spinner" />
      </div>
    )
  }

  return (
    <div className="inv-root">
      <div className="inv-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #c9883a, #e0a84f)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Home size={26} style={{ color: '#080706' }} />
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#f5f0ea', letterSpacing: '-0.02em' }}>MonParcImmo</p>
          </Link>
        </div>

        {error ? (
          <div style={{ textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: '#f87171', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Lien invalide</h2>
            <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>{error}</p>
            <Link to="/login" style={{ display: 'inline-flex', padding: '10px 24px', background: 'linear-gradient(135deg, #c9883a, #e0a84f)', color: '#080706', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
              Retour à la connexion
            </Link>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={40} style={{ color: '#4ade80', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Compte créé !</h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>Redirection vers la page de connexion…</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
              Bienvenue, {invitation?.firstName} !
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
              Créez votre mot de passe pour accéder à votre espace.
            </p>

            <div className="inv-email-chip">📧 {invitation?.email}</div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="inv-label">Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="inv-input" placeholder="Minimum 8 caractères" />
              </div>
              <div>
                <label className="inv-label">Confirmer le mot de passe</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="inv-input" placeholder="Répétez le mot de passe" />
              </div>
              <button type="submit" disabled={submitting} className="inv-btn" style={{ marginTop: 8 }}>
                {submitting ? 'Création…' : 'Créer mon compte'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

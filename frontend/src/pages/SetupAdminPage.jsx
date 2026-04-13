import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CSS = `
  .setup-root {
    min-height: 100vh; background: #080706; color: #f5f0ea;
    font-family: 'Inter', -apple-system, sans-serif;
    display: flex; align-items: center; justify-content: center;
  }
  .setup-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,136,58,0.25);
    border-radius: 24px; padding: 48px;
    max-width: 480px; width: 90%; text-align: center;
  }
  .setup-icon {
    width: 72px; height: 72px; border-radius: 20px;
    background: linear-gradient(135deg, #c9883a, #e0a84f);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px; font-size: 32px;
  }
  .setup-btn {
    width: 100%; padding: 14px 24px;
    background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; border: none; border-radius: 12px;
    font-size: 16px; font-weight: 800; cursor: pointer;
    transition: opacity 0.2s; margin-top: 28px;
  }
  .setup-btn:hover { opacity: 0.88; }
  .setup-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .setup-error {
    margin-top: 16px; padding: 12px; border-radius: 10px;
    background: rgba(239,68,68,0.1); color: #f87171; font-size: 13px;
  }
  .setup-success {
    margin-top: 16px; padding: 12px; border-radius: 10px;
    background: rgba(34,197,94,0.1); color: #4ade80; font-size: 14px; font-weight: 600;
  }
`

function injectCSS() {
  if (document.getElementById('setup-css')) return
  const s = document.createElement('style')
  s.id = 'setup-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

export default function SetupAdminPage() {
  const { currentUser, isAdmin, becomeAdmin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  injectCSS()

  if (!currentUser) {
    return (
      <div className="setup-root">
        <div className="setup-card">
          <div className="setup-icon">🔒</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Connexion requise</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Connectez-vous d'abord pour accéder à cette page.</p>
          <button className="setup-btn" onClick={() => navigate('/login')}>Se connecter</button>
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="setup-root">
        <div className="setup-card">
          <div className="setup-icon">✅</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Déjà Gérant</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Votre compte a déjà le rôle Gérant.</p>
          <button className="setup-btn" onClick={() => navigate('/admin')}>Accéder au dashboard →</button>
        </div>
      </div>
    )
  }

  const handleBecomeAdmin = async () => {
    setLoading(true)
    setError('')
    try {
      await becomeAdmin()
      setDone(true)
      setTimeout(() => navigate('/admin'), 1800)
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur — le backend est peut-être éteint.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="setup-root">
      <div className="setup-card">
        <div className="setup-icon">🏠</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>
          Passer en mode Gérant
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
          Votre compte <strong style={{ color: '#94a3b8' }}>{currentUser.email}</strong> est actuellement en mode Voyageur.
          Cliquez ci-dessous pour obtenir les droits de gérant et accéder à votre tableau de bord.
        </p>

        {done ? (
          <div className="setup-success">✅ Rôle Gérant activé ! Redirection…</div>
        ) : (
          <>
            <button
              className="setup-btn"
              onClick={handleBecomeAdmin}
              disabled={loading}
            >
              {loading ? 'Mise à jour…' : '🏠 Devenir Gérant'}
            </button>
            {error && <div className="setup-error">{error}</div>}
          </>
        )}

        <p style={{ marginTop: 20, fontSize: 12, color: '#475569' }}>
          Cette action met à jour votre profil en base de données.
        </p>
      </div>
    </div>
  )
}

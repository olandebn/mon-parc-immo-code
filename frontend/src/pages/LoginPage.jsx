import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { Home, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'

/* ── Styles ── */
const injectCSS = () => {
  if (document.getElementById('login-css')) return
  const s = document.createElement('style')
  s.id = 'login-css'
  s.textContent = `
    @keyframes loginFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes loginGlow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50%       { opacity: 0.65; transform: scale(1.06); }
    }
    .lp-fadeup { animation: loginFadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }
    .lp-input {
      width: 100%; padding: 12px 14px 12px 44px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      color: #f1f5f9; font-size: 14px; outline: none;
      transition: border-color 0.2s, background 0.2s;
      font-family: inherit;
    }
    .lp-input::placeholder { color: #475569; }
    .lp-input:focus {
      border-color: rgba(99,102,241,0.5);
      background: rgba(99,102,241,0.04);
    }
    .lp-tab {
      flex: 1; padding: 10px; font-size: 14px; font-weight: 600;
      border: none; background: none; cursor: pointer;
      border-radius: 10px; transition: all 0.2s;
      font-family: inherit;
    }
    .lp-tab.active {
      background: rgba(99,102,241,0.15);
      color: #a5b4fc;
    }
    .lp-tab:not(.active) { color: #475569; }
    .lp-tab:not(.active):hover { color: #94a3b8; }
    .lp-btn {
      width: 100%; padding: 13px;
      border-radius: 12px; border: none; cursor: pointer;
      font-size: 15px; font-weight: 600; font-family: inherit;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      box-shadow: 0 0 24px rgba(99,102,241,0.35);
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .lp-btn:hover:not(:disabled) {
      box-shadow: 0 0 40px rgba(99,102,241,0.5);
      transform: translateY(-1px);
    }
    .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .lp-link {
      color: #818cf8; font-weight: 500; text-decoration: none;
      font-size: 13px; transition: color 0.2s;
    }
    .lp-link:hover { color: #a5b4fc; }
    .lp-error {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px; padding: 10px 14px;
      color: #fca5a5; font-size: 13px;
    }
  `
  document.head.appendChild(s)
}

/* ── Champ de formulaire ── */
function Field({ icon: Icon, type, value, onChange, placeholder, label, rightSlot }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#475569', pointerEvents: 'none' }} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="lp-input"
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Page ── */
export default function LoginPage() {
  React.useEffect(() => { injectCSS() }, [])

  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Champs connexion
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Champs inscription
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')

  const { login, register, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const FIREBASE_ERRORS = {
    'auth/user-not-found':     'Aucun compte trouvé avec cet email.',
    'auth/wrong-password':     'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
    'auth/weak-password':      'Le mot de passe doit faire au moins 6 caractères.',
    'auth/invalid-email':      'Adresse email invalide.',
    'auth/too-many-requests':  'Trop de tentatives. Réessayez dans quelques minutes.',
  }

  const getErrorMessage = (code) => FIREBASE_ERRORS[code] || 'Une erreur est survenue. Réessayez.'

  /* Connexion */
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  /* Inscription */
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (regPassword !== regPasswordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (regPassword.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    setLoading(true)
    try {
      await register(regEmail, regPassword, firstName, lastName)
      toast.success(`Bienvenue, ${firstName} ! Votre compte a été créé.`)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  /* Mot de passe oublié */
  const handleReset = async () => {
    if (!loginEmail) {
      setError('Entrez votre email ci-dessus puis cliquez sur "Mot de passe oublié".')
      return
    }
    setLoading(true)
    try {
      await resetPassword(loginEmail)
      setResetSent(true)
      toast.success('Email de réinitialisation envoyé !')
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  /* ── Render ── */
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#04050f', fontFamily: "'Inter', -apple-system, sans-serif", padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Orbes fond */}
      <div style={{ position: 'absolute', width: 600, height: 600, top: -200, left: -200, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(1px)', pointerEvents: 'none', animation: 'loginGlow 7s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, bottom: -100, right: -100, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(1px)', pointerEvents: 'none', animation: 'loginGlow 9s ease-in-out infinite 3s' }} />

      <div className="lp-fadeup" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 0 28px rgba(99,102,241,0.4)' }}>
              <Home style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
              MonParcImmo
            </span>
          </Link>
          <p style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>
            {tab === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte gratuitement'}
          </p>
        </div>

        {/* Carte */}
        <div style={{
          background: 'rgba(10,11,24,0.9)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Onglets */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: 24 }}>
            <button className={`lp-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>
              Connexion
            </button>
            <button className={`lp-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError('') }}>
              Inscription
            </button>
          </div>

          {/* Message d'erreur */}
          {error && <div className="lp-error" style={{ marginBottom: 16 }}>{error}</div>}

          {/* ─── Formulaire Connexion ─── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field icon={Mail} type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                     placeholder="votre@email.com" label="Email" />
              <Field icon={Lock} type={showPassword ? 'text' : 'password'} value={loginPassword}
                     onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" label="Mot de passe"
                     rightSlot={
                       <button type="button" onClick={() => setShowPassword(!showPassword)}
                               style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>
                         {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                       </button>
                     } />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
                <button type="button" onClick={handleReset} className="lp-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  {resetSent ? '✓ Email envoyé !' : 'Mot de passe oublié ?'}
                </button>
              </div>

              <button type="submit" disabled={loading} className="lp-btn" style={{ marginTop: 4 }}>
                {loading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Connexion...</>
                  : <><ArrowRight style={{ width: 16, height: 16 }} /> Se connecter</>
                }
              </button>
            </form>
          )}

          {/* ─── Formulaire Inscription ─── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field icon={User} type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                       placeholder="Prénom" label="Prénom" />
                <Field icon={User} type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                       placeholder="Nom" label="Nom" />
              </div>
              <Field icon={Mail} type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                     placeholder="votre@email.com" label="Email" />
              <Field icon={Lock} type={showPassword ? 'text' : 'password'} value={regPassword}
                     onChange={e => setRegPassword(e.target.value)} placeholder="Minimum 6 caractères" label="Mot de passe"
                     rightSlot={
                       <button type="button" onClick={() => setShowPassword(!showPassword)}
                               style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>
                         {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                       </button>
                     } />
              <Field icon={Lock} type={showPassword ? 'text' : 'password'} value={regPasswordConfirm}
                     onChange={e => setRegPasswordConfirm(e.target.value)} placeholder="Confirmez le mot de passe" label="Confirmer le mot de passe" />

              <button type="submit" disabled={loading} className="lp-btn" style={{ marginTop: 4 }}>
                {loading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Création...</>
                  : <><ArrowRight style={{ width: 16, height: 16 }} /> Créer mon compte</>
                }
              </button>

              <p style={{ fontSize: 12, color: '#334155', textAlign: 'center', marginTop: 4, lineHeight: 1.6 }}>
                En créant un compte vous acceptez d'être contacté par le propriétaire
                dans le cadre de votre réservation.
              </p>
            </form>
          )}
        </div>

        {/* Retour */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" className="lp-link">← Retour à l'accueil</Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

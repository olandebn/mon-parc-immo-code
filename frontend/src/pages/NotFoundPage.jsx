import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const { currentUser, isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', background: '#080706', color: '#f5f0ea',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
    }}>
      {/* Numéro 404 décoratif */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <p style={{
          fontSize: 'clamp(100px, 20vw, 180px)', fontWeight: 900,
          letterSpacing: '-0.06em', lineHeight: 1,
          background: 'linear-gradient(135deg, rgba(201,136,58,0.15), rgba(201,136,58,0.05))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          userSelect: 'none',
        }}>404</p>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #c9883a, #e0a84f)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Home size={30} style={{ color: '#080706' }} />
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>
        Page introuvable
      </h1>
      <p style={{ fontSize: 15, color: '#64748b', maxWidth: 360, lineHeight: 1.6, marginBottom: 36 }}>
        Cette page n'existe pas ou a été déplacée. Retourne à l'accueil pour reprendre la navigation.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '11px 22px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={15} /> Retour
        </button>

        <Link
          to={isAdmin ? '/admin' : '/'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '11px 22px',
            background: 'linear-gradient(135deg, #c9883a, #e0a84f)',
            borderRadius: 12, color: '#080706', fontSize: 14, fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          <Home size={15} /> {isAdmin ? 'Dashboard' : 'Accueil'}
        </Link>
      </div>
    </div>
  )
}

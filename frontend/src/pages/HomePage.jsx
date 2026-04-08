import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { propertyService } from '../services/api'
import Navbar from '../components/common/Navbar'
import { MapPin, Users, Maximize2, ArrowRight, Home, ArrowUpRight, Star } from 'lucide-react'

/* ──────────────────────────────────────────────
   CSS injecté une seule fois
────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes glow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50%       { opacity: 0.8; transform: scale(1.05); }
  }
  @keyframes float1 {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50%       { transform: translateY(-12px) rotate(0deg); }
  }
  @keyframes float2 {
    0%, 100% { transform: translateY(0) rotate(2deg); }
    50%       { transform: translateY(-16px) rotate(-1deg); }
  }
  @keyframes float3 {
    0%, 100% { transform: translateY(-6px) rotate(-1deg); }
    50%       { transform: translateY(6px) rotate(1deg); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes gradShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes counterUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(99,102,241,0.2); }
    50%       { border-color: rgba(139,92,246,0.5); }
  }

  .hp-fadeup  { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
  .hp-fadein  { animation: fadeIn 0.8s ease both; }
  .hp-float1  { animation: float1 7s ease-in-out infinite; }
  .hp-float2  { animation: float2 9s ease-in-out infinite; }
  .hp-float3  { animation: float3 11s ease-in-out infinite; }

  .hp-glow-orb {
    animation: glow 6s ease-in-out infinite;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    position: absolute;
  }

  .hp-hero-title {
    font-size: clamp(3.2rem, 7.5vw, 7rem);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.04em;
    color: #f8fafc;
  }

  .hp-grad-text {
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #60a5fa 100%);
    background-size: 200% 200%;
    animation: gradShift 4s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hp-card {
    background: rgba(12,13,26,0.85);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.45s cubic-bezier(.22,1,.36,1),
                box-shadow 0.45s ease,
                border-color 0.3s ease;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  }
  .hp-card:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 24px 60px rgba(99,102,241,0.18), 0 8px 40px rgba(0,0,0,0.6);
    border-color: rgba(99,102,241,0.3);
  }
  .hp-card:hover .hp-card-img { transform: scale(1.06); }
  .hp-card-img { transition: transform 0.6s cubic-bezier(.22,1,.36,1); }

  .hp-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 500;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.2);
    color: #a5b4fc;
  }

  .hp-feat-card {
    background: rgba(10,11,22,0.8);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px;
    transition: border-color 0.3s ease, transform 0.3s ease;
  }
  .hp-feat-card:hover {
    border-color: rgba(99,102,241,0.25);
    transform: translateY(-4px);
  }

  .hp-cta-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: none;
  }
  .hp-cta-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 0 0 0 rgba(99,102,241,0.4);
  }
  .hp-cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(99,102,241,0.45);
  }
  .hp-cta-ghost {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.1) !important;
  }
  .hp-cta-ghost:hover {
    background: rgba(255,255,255,0.09);
    transform: translateY(-2px);
    color: #fff;
  }

  .hp-divider {
    width: 100%; height: 1px;
    background: linear-gradient(to right, transparent, rgba(99,102,241,0.35), transparent);
  }

  .hp-marquee-track {
    display: flex; gap: 40px;
    animation: marquee 28s linear infinite;
    width: max-content;
  }
  .hp-marquee-track:hover { animation-play-state: paused; }
  .hp-marquee-track2 {
    display: flex; gap: 40px;
    animation: marquee 20s linear infinite reverse;
    width: max-content;
  }
  .hp-dest-tag {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    border-radius: 99px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    font-size: 13px; font-weight: 500; color: #94a3b8;
    cursor: pointer; white-space: nowrap;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
  }
  .hp-dest-tag:hover {
    background: rgba(99,102,241,0.1);
    border-color: rgba(99,102,241,0.3);
    color: #c7d2fe;
    transform: translateY(-2px);
  }

  .hp-hero-card {
    background: rgba(12,14,28,0.9);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    animation: borderGlow 4s ease-in-out infinite;
  }
  .hp-stat-val {
    font-size: 2.6rem;
    font-weight: 900;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #f8fafc, #a5b4fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Grille responsive */
  @media (max-width: 1024px) {
    .hp-hero-grid { grid-template-columns: 1fr !important; }
    .hp-hero-right { display: none !important; }
    .hp-hero-title { font-size: clamp(2.8rem, 10vw, 4.5rem) !important; }
  }
  @media (max-width: 640px) {
    .hp-props-grid { grid-template-columns: 1fr !important; }
  }
`

function injectCSS() {
  if (document.getElementById('hp-css')) return
  const s = document.createElement('style')
  s.id = 'hp-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

/* ──────────────────────────────────────────────
   Mini-card décorative dans le hero
────────────────────────────────────────────── */
function HeroDecorCard({ name, location, guests, price, imgColor, delay, floatClass }) {
  return (
    <div className={`hp-hero-card ${floatClass}`}
         style={{ width: 220, animationDelay: `${delay}ms`, flexShrink: 0 }}>
      <div style={{ height: 120, background: imgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Home style={{ width: 32, height: 32, color: 'rgba(255,255,255,0.25)' }} />
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b', marginBottom: 10 }}>
          <MapPin style={{ width: 10, height: 10 }} />
          {location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>{guests} voyageurs</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{price}/nuit</span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Skeleton
────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="hp-card" style={{ pointerEvents: 'none' }}>
      <div style={{ height: 200, background: 'rgba(255,255,255,0.03)', animation: 'fadeIn 1s ease infinite alternate' }} />
      <div style={{ padding: 20 }}>
        {[70, 50, 90, 60].map((w, i) => (
          <div key={i} style={{ height: 12, marginBottom: 10, borderRadius: 6, width: `${w}%`, background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Property Card
────────────────────────────────────────────── */
function PropertyCard({ property, delay }) {
  const photo = property.mainPhotoUrls?.[0]
  const unavailable = property.available === false

  return (
    <Link to={`/biens/${property.id}`} style={{ textDecoration: 'none' }}>
      <div className="hp-card hp-fadeup" style={{ animationDelay: `${delay}ms` }}>
        {/* Photo */}
        <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: 'rgba(99,102,241,0.05)' }}>
          {photo ? (
            <img src={photo} alt={property.name} className="hp-card-img"
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))' }}>
              <Home style={{ width: 48, height: 48, color: 'rgba(99,102,241,0.2)' }} />
            </div>
          )}
          {/* Overlay gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,6,20,0.9) 0%, rgba(5,6,20,0.2) 45%, transparent 70%)' }} />

          {/* Badge ville */}
          {property.city && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 5,
                          padding: '5px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: 'rgba(4,5,15,0.75)', backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
              <MapPin style={{ width: 10, height: 10, color: '#818cf8' }} />
              {property.city}{property.country ? `, ${property.country}` : ''}
            </div>
          )}

          {unavailable && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
              <span style={{ padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                             background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)' }}>
                Non disponible
              </span>
            </div>
          )}
        </div>

        {/* Infos */}
        <div style={{ padding: '18px 20px 20px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 12, letterSpacing: '-0.02em' }}>
            {property.name}
          </h3>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {property.maxGuests > 0 && (
              <span className="hp-pill">
                <Users style={{ width: 11, height: 11 }} />
                {property.maxGuests} pers.
              </span>
            )}
            {property.numberOfRooms > 0 && (
              <span className="hp-pill">🛏 {property.numberOfRooms} pièces</span>
            )}
            {property.surfaceArea > 0 && (
              <span className="hp-pill">
                <Maximize2 style={{ width: 11, height: 11 }} />
                {property.surfaceArea} m²
              </span>
            )}
          </div>

          {property.description && (
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 18,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {property.description}
            </p>
          )}

          {/* Footer card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14,
                        borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 4 }}>
              Voir le logement <ArrowRight style={{ width: 13, height: 13 }} />
            </span>
            <div style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <ArrowUpRight style={{ width: 14, height: 14, color: '#818cf8' }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ──────────────────────────────────────────────
   Feature
────────────────────────────────────────────── */
function Feature({ emoji, title, desc, delay }) {
  return (
    <div className="hp-feat-card hp-fadeup" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ fontSize: 28, marginBottom: 16 }}>{emoji}</div>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h4>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{desc}</p>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Page principale
────────────────────────────────────────────── */
export default function HomePage() {
  const { currentUser } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    injectCSS()
    propertyService.getAllProperties()
      .then(r => setProperties(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const ROOT = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: '#04050f',
    color: '#f8fafc',
    minHeight: '100vh',
    overflowX: 'hidden',
  }

  return (
    <div style={ROOT}>
      {/* Navbar transparente sur le hero */}
      <Navbar dark />

      {/* ════════════════════════════════════
          HERO — layout éditorial 2 colonnes
      ════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 64 }}>

        {/* Orbes de fond */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="hp-glow-orb"
               style={{ width: 800, height: 800, top: -300, left: -300, animationDelay: '0s',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)' }} />
          <div className="hp-glow-orb"
               style={{ width: 600, height: 600, top: '10%', right: '-200px', animationDelay: '2s',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
          <div className="hp-glow-orb"
               style={{ width: 400, height: 400, bottom: '5%', left: '30%', animationDelay: '4s',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />
          {/* Grille */}
          <div style={{ position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)',
                        backgroundSize: '64px 64px' }} />
        </div>

        <div className="hp-hero-grid" style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1200, margin: '0 auto', padding: '80px 24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
          alignItems: 'center', width: '100%',
        }}>
          {/* ── Colonne gauche : texte ── */}
          <div>
            {/* Badge */}
            <div className="hp-pill hp-fadeup" style={{ marginBottom: 28, animationDelay: '0ms' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', flexShrink: 0,
                             animation: 'glow 2s ease-in-out infinite' }} />
              Location privée · Zéro commission
            </div>

            {/* Titre */}
            <h1 className="hp-hero-title hp-fadeup" style={{ animationDelay: '80ms', marginBottom: 28 }}>
              Séjournez<br />
              <span className="hp-grad-text">autrement.</span>
            </h1>

            {/* Sous-titre */}
            <p className="hp-fadeup" style={{
              animationDelay: '160ms',
              fontSize: 17, color: '#94a3b8', lineHeight: 1.75, maxWidth: 420, marginBottom: 40,
            }}>
              Des logements d'exception, en accès privé.
              Réservez en direct — sans commission, sans intermédiaire.
            </p>

            {/* CTA */}
            <div className="hp-fadeup" style={{ animationDelay: '240ms', display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
              <a href="#biens" className="hp-cta-btn hp-cta-primary">
                Explorer les logements
                <ArrowRight style={{ width: 16, height: 16 }} />
              </a>
              {!currentUser && (
                <Link to="/login" className="hp-cta-btn hp-cta-ghost">
                  Se connecter
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="hp-fadeup" style={{
              animationDelay: '320ms',
              display: 'flex', gap: 36, paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {[
                { val: loading ? '—' : String(properties.length || 0), label: 'Logements' },
                { val: '0€', label: 'Commission' },
                { val: '24h', label: 'Réponse garantie' },
              ].map(s => (
                <div key={s.label}>
                  <div className="hp-stat-val">{s.val}</div>
                  <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne droite : cards déco ── */}
          <div className="hp-hero-right" style={{ position: 'relative', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Card 1 — fond en haut à gauche */}
            <div className="hp-float1" style={{ position: 'absolute', top: 0, left: 0 }}>
              <HeroDecorCard name="Villa Côte d'Azur" location="Nice, France" guests="6" price="180€"
                imgColor="linear-gradient(135deg, #1e3a5f, #2d5a8e)" delay={0} floatClass="" />
            </div>
            {/* Card 2 — avant-plan à droite */}
            <div className="hp-float2" style={{ position: 'absolute', top: 80, right: 0, zIndex: 2 }}>
              <HeroDecorCard name="Chalet Montagne" location="Chamonix, France" guests="8" price="240€"
                imgColor="linear-gradient(135deg, #1a3a2e, #2d6a4f)" delay={200} floatClass="" />
            </div>
            {/* Card 3 — bas centre */}
            <div className="hp-float3" style={{ position: 'absolute', bottom: 20, left: 60, zIndex: 1 }}>
              <HeroDecorCard name="Mas Provençal" location="Aix-en-Provence" guests="4" price="120€"
                imgColor="linear-gradient(135deg, #3d1a1a, #6b2d2d)" delay={400} floatClass="" />
            </div>

            {/* Badge flottant "Réservation confirmée" */}
            <div className="hp-float2" style={{
              position: 'absolute', top: 30, right: -10, zIndex: 3,
              background: 'rgba(12,14,28,0.95)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 14, padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', gap: 8, animationDelay: '600ms',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(34,197,94,0.15)',
                            border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>✓</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>Réservation confirmée</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Arrivée dim. 15 juin</div>
              </div>
            </div>

            {/* Badge flottant "Avis" */}
            <div className="hp-float1" style={{
              position: 'absolute', bottom: 40, right: 10, zIndex: 3,
              background: 'rgba(12,14,28,0.95)', border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 14, padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', gap: 8, animationDelay: '800ms',
            }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} style={{ width: 12, height: 12, color: '#fbbf24', fill: '#fbbf24' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>4.9 · 128 avis</div>
            </div>
          </div>
        </div>

        {/* Fade vers le bas */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, pointerEvents: 'none',
                      background: 'linear-gradient(to bottom, transparent, #04050f)' }} />
      </section>

      {/* ════════════════════════════════════
          BANDE DE TRANSITION
      ════════════════════════════════════ */}

      {/* Marquee ligne 1 */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)',
                    padding: '16px 0', background: 'rgba(6,8,20,0.7)' }}>
        <div className="hp-marquee-track">
          {[...Array(2)].map((_, rep) =>
            ['🏡 Réservation directe', '✦', '💬 Contact propriétaire', '✦', '🔒 Accès privé', '✦',
             '📅 Disponibilités en temps réel', '✦', '🌿 Logements premium', '✦', '⚡ Confirmation rapide', '✦',
             '🎯 Zéro commission', '✦', '📍 Partout en France', '✦'].map((t, i) => (
              <span key={`${rep}-${i}`} style={{
                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0,
                letterSpacing: '0.01em',
                color: t === '✦' ? 'rgba(99,102,241,0.4)' : 'rgba(148,163,184,0.7)',
              }}>{t}</span>
            ))
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background: 'rgba(8,9,22,0.85)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 0, flexWrap: 'wrap' }}>
          {[
            { emoji: '🏠', val: loading ? '—' : String(properties.length || 0), label: 'logements' },
            { emoji: '🎯', val: '0€', label: 'de commission' },
            { emoji: '⚡', val: '< 24h', label: 'de réponse' },
            { emoji: '🌟', val: '100%', label: 'propriétaires directs' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.06)', margin: '0 32px', flexShrink: 0 }} />
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, marginBottom: 4 }}>{s.emoji}</div>
                <div style={{
                  fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #a5b4fc 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{s.val}</div>
                <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Tags destinations */}
      <div style={{
        background: 'rgba(5,6,18,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 0',
        overflow: 'hidden',
      }}>
        {/* Label */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 14px',
                      display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
                         color: '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>
            ✦ Destinations
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(99,102,241,0.2), transparent)' }} />
        </div>

        {/* Défilement inverse */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', gap: 10,
            animation: 'marquee 25s linear infinite reverse',
            width: 'max-content',
            paddingLeft: 24,
          }}>
            {[...Array(2)].map((_, rep) =>
              [
                { emoji: '🌊', label: "Côte d'Azur" },
                { emoji: '🏔️', label: 'Alpes' },
                { emoji: '🌻', label: 'Provence' },
                { emoji: '🍷', label: 'Bordeaux' },
                { emoji: '🗼', label: 'Paris' },
                { emoji: '🏖️', label: 'Bretagne' },
                { emoji: '🌲', label: 'Dordogne' },
                { emoji: '🏄', label: 'Biarritz' },
                { emoji: '🌺', label: 'Corse' },
                { emoji: '🍋', label: 'Normandie' },
                { emoji: '⛷️', label: 'Pyrénées' },
                { emoji: '🏰', label: 'Loire' },
              ].map((d, i) => (
                <div key={`${rep}-${i}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 13, fontWeight: 500,
                  color: '#94a3b8',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  cursor: 'default',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 15 }}>{d.emoji}</span>
                  {d.label}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          FEATURES
      ════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div className="hp-pill hp-fadeup" style={{ marginBottom: 16, display: 'inline-flex' }}>Pourquoi MonParcImmo ?</div>
          <h2 className="hp-fadeup" style={{ animationDelay: '80ms', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                                             fontWeight: 900, letterSpacing: '-0.03em', color: '#f1f5f9' }}>
            Simple, direct,{' '}
            <span className="hp-grad-text">sans frictions.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Feature delay={0}   emoji="🏡" title="Logements soigneusement sélectionnés"
                   desc="Chaque bien est géré directement par son propriétaire, pour une expérience authentique et personnalisée." />
          <Feature delay={80}  emoji="💬" title="Contact direct & réactif"
                   desc="Échangez en temps réel avec le propriétaire. Plus de bots, plus d'intermédiaires inutiles." />
          <Feature delay={160} emoji="🔒" title="Accès sur invitation"
                   desc="Système d'invitation privé : votre sécurité et celle du propriétaire sont notre priorité." />
          <Feature delay={240} emoji="📅" title="Calendrier en temps réel"
                   desc="Consultez les disponibilités instantanément et soumettez votre demande en quelques clics." />
        </div>
      </section>

      {/* ════════════════════════════════════
          GRILLE DE BIENS
      ════════════════════════════════════ */}
      <section id="biens" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>

        <div style={{ marginBottom: 48 }}>
          <div className="hp-divider" style={{ marginBottom: 48 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="hp-fadeup" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em',
                                                color: '#6366f1', fontWeight: 600, marginBottom: 10 }}>
                Nos logements
              </p>
              <h2 className="hp-fadeup" style={{ animationDelay: '80ms', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                                                  fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.1 }}>
                Votre prochain<br />
                <span className="hp-grad-text">coup de cœur</span>
              </h2>
            </div>
            {!loading && properties.length > 0 && (
              <div className="hp-pill" style={{ fontSize: 13, padding: '8px 16px' }}>
                {properties.length} bien{properties.length > 1 ? 's' : ''} disponible{properties.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="hp-props-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(99,102,241,0.06)',
                          border: '1px solid rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', margin: '0 auto 20px' }}>
              <Home style={{ width: 36, height: 36, color: 'rgba(99,102,241,0.3)' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Aucun logement pour l'instant
            </h3>
            <p style={{ color: '#1e293b' }}>De nouveaux biens arrivent bientôt !</p>
          </div>
        ) : (
          <div className="hp-props-grid"
               style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} delay={i * 70} />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(3,4,12,0.9)', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home style={{ width: 14, height: 14, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>MonParcImmo</span>
          </div>
          <p style={{ fontSize: 12, color: '#1e293b' }}>
            © {new Date().getFullYear()} MonParcImmo — Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  )
}

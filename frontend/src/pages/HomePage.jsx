import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import { ArrowRight, Home, TrendingUp, FileText, BarChart2, Star, Zap, Shield } from 'lucide-react'

/* ──────────────────────────────────────────────
   Palette ambre chaud — inchangée
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
    50%       { opacity: 0.85; transform: scale(1.06); }
  }
  @keyframes float1 {
    0%, 100% { transform: translateY(0) rotate(-1.5deg); }
    50%       { transform: translateY(-14px) rotate(0deg); }
  }
  @keyframes float2 {
    0%, 100% { transform: translateY(0) rotate(2deg); }
    50%       { transform: translateY(-18px) rotate(-1deg); }
  }
  @keyframes float3 {
    0%, 100% { transform: translateY(-5px) rotate(-1deg); }
    50%       { transform: translateY(7px) rotate(1deg); }
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
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(201,136,58,0.2); }
    50%       { border-color: rgba(224,168,79,0.5); }
  }
  @keyframes barGrow {
    from { width: 0; }
    to   { width: var(--w); }
  }

  .hp-fadeup { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
  .hp-fadein { animation: fadeIn 0.8s ease both; }
  .hp-float1 { animation: float1 7s ease-in-out infinite; }
  .hp-float2 { animation: float2 9s ease-in-out infinite; }
  .hp-float3 { animation: float3 11s ease-in-out infinite; }

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
    color: #f5f0ea;
  }
  .hp-grad-text {
    background: linear-gradient(135deg, #e0a84f 0%, #f0c87a 50%, #c9883a 100%);
    background-size: 200% 200%;
    animation: gradShift 5s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hp-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 99px;
    font-size: 12px; font-weight: 500;
    background: rgba(201,136,58,0.1);
    border: 1px solid rgba(201,136,58,0.2);
    color: #e0a84f;
  }

  /* Cards dashboard déco */
  .hp-dash-card {
    background: rgba(14,11,8,0.95);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 18px 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    animation: borderGlow 4s ease-in-out infinite;
  }

  /* Feature cards */
  .hp-feat-card {
    background: rgba(12,9,6,0.85);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px;
    transition: border-color 0.3s, transform 0.3s;
  }
  .hp-feat-card:hover {
    border-color: rgba(201,136,58,0.25);
    transform: translateY(-4px);
  }

  /* CTA */
  .hp-cta-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 14px;
    font-size: 15px; font-weight: 600;
    background: linear-gradient(135deg, #c9883a, #e0a84f);
    color: #080706; text-decoration: none; border: none; cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(201,136,58,0.3);
  }
  .hp-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,136,58,0.45); }

  .hp-cta-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 14px;
    font-size: 15px; font-weight: 500;
    background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7);
    text-decoration: none; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .hp-cta-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }

  /* Marquee */
  .hp-marquee-track {
    display: flex; gap: 40px;
    animation: marquee 30s linear infinite;
    width: max-content;
  }
  .hp-marquee-track:hover { animation-play-state: paused; }

  /* Step */
  .hp-step {
    display: flex; gap: 20px;
    padding: 24px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .hp-step:last-child { border-bottom: none; }

  .hp-stat-val {
    font-size: 2.4rem; font-weight: 900; letter-spacing: -0.04em;
    background: linear-gradient(135deg, #f5f0ea 0%, #e0a84f 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  @media (max-width: 1024px) {
    .hp-hero-grid { grid-template-columns: 1fr !important; }
    .hp-hero-right { display: none !important; }
    .hp-hero-title { font-size: clamp(2.8rem, 10vw, 4.5rem) !important; }
    .hp-2col { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 640px) {
    .hp-feat-grid { grid-template-columns: 1fr !important; }
  }
`

function injectCSS() {
  if (document.getElementById('hp-css')) return
  const s = document.createElement('style')
  s.id = 'hp-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

/* ── Mini-dashboard décoratif (hero droite) ──────────────────────────────── */
function DashboardPreview() {
  return (
    <div style={{ position: 'relative', height: 520 }}>

      {/* Card principale — revenus */}
      <div className="hp-dash-card hp-float2"
           style={{ position: 'absolute', top: 0, right: 20, width: 240 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={12} style={{ color: '#e0a84f' }} /> Revenus — 2024
        </div>
        {[
          { mois: 'Oct', val: 75 }, { mois: 'Nov', val: 55 }, { mois: 'Déc', val: 90 },
        ].map(({ mois, val }) => (
          <div key={mois} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
              <span>{mois}</span>
              <span style={{ color: '#e0a84f', fontWeight: 600 }}>{val * 12} €</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${val}%`, background: 'linear-gradient(90deg, #c9883a, #e0a84f)', borderRadius: 99, transition: 'width 1s' }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Total</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#f0c87a' }}>2 640 €</span>
        </div>
      </div>

      {/* Card dépenses */}
      <div className="hp-dash-card hp-float1"
           style={{ position: 'absolute', top: 100, left: 0, width: 210 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={12} style={{ color: '#e0a84f' }} /> Charges du mois
        </div>
        {[
          { label: 'Électricité', val: '142 €' },
          { label: 'Impôts fonciers', val: '210 €' },
          { label: 'Assurance', val: '68 €' },
        ].map(({ label, val }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>-{val}</span>
          </div>
        ))}
      </div>

      {/* Card bien */}
      <div className="hp-dash-card hp-float3"
           style={{ position: 'absolute', bottom: 30, right: 10, width: 230 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Home size={12} style={{ color: '#e0a84f' }} /> Villa des Pins
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Statut', val: '🟢 Louée' },
            { label: 'Taux occ.', val: '78%' },
            { label: 'Nuits', val: '14' },
            { label: 'Note', val: '4.8 ★' },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f5f0ea' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge notification */}
      <div className="hp-float2" style={{
        position: 'absolute', top: 20, left: 50, zIndex: 3,
        background: 'rgba(14,11,8,0.96)', border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: 14, padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', gap: 8, animationDelay: '500ms',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
                      boxShadow: '0 0 8px rgba(74,222,128,0.6)' }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f5f0ea' }}>Nouvelle réservation</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>15 → 22 jan. · 3 pers.</div>
        </div>
      </div>
    </div>
  )
}

/* ── Feature card ────────────────────────────────────────────────────────── */
function Feature({ icon: Icon, title, desc, delay, accent }) {
  return (
    <div className="hp-feat-card hp-fadeup" style={{ animationDelay: `${delay}ms` }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, marginBottom: 18,
        background: accent || 'rgba(201,136,58,0.1)',
        border: `1px solid ${accent ? 'rgba(201,136,58,0.3)' : 'rgba(201,136,58,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} style={{ color: '#e0a84f' }} />
      </div>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f5f0ea', marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h4>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { currentUser, isAdmin } = useAuth()

  useEffect(() => { injectCSS() }, [])

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, sans-serif",
      background: '#080706', color: '#f5f0ea',
      minHeight: '100vh', overflowX: 'hidden',
    }}>
      <Navbar dark />

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 64 }}>

        {/* Orbes */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="hp-glow-orb" style={{ width: 800, height: 800, top: -300, left: -300,
            background: 'radial-gradient(circle, rgba(201,136,58,0.14) 0%, transparent 70%)' }} />
          <div className="hp-glow-orb" style={{ width: 600, height: 600, top: '10%', right: '-200px', animationDelay: '2s',
            background: 'radial-gradient(circle, rgba(224,168,79,0.09) 0%, transparent 70%)' }} />
          <div className="hp-glow-orb" style={{ width: 400, height: 400, bottom: '5%', left: '30%', animationDelay: '4s',
            background: 'radial-gradient(circle, rgba(180,110,40,0.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(201,136,58,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,136,58,0.025) 1px, transparent 1px)',
            backgroundSize: '64px 64px' }} />
        </div>

        <div className="hp-hero-grid" style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1200, margin: '0 auto', padding: '80px 24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
          alignItems: 'center', width: '100%',
        }}>
          {/* Gauche */}
          <div>
            <div className="hp-pill hp-fadeup" style={{ marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e0a84f', animation: 'glow 2s ease-in-out infinite' }} />
              Gestion · Charges · Location
            </div>

            <h1 className="hp-hero-title hp-fadeup" style={{ animationDelay: '80ms', marginBottom: 28 }}>
              Gérez vos<br />
              <span className="hp-grad-text">logements.</span>
            </h1>

            <p className="hp-fadeup" style={{
              animationDelay: '160ms',
              fontSize: 17, color: '#94a3b8', lineHeight: 1.75, maxWidth: 420, marginBottom: 40,
            }}>
              Suivez vos charges, vos revenus et vos impôts. Et si vous voulez louer
              votre bien, publiez une annonce en quelques clics — sans commission.
            </p>

            <div className="hp-fadeup" style={{ animationDelay: '240ms', display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
              {currentUser && isAdmin ? (
                <Link to="/admin" className="hp-cta-primary">
                  Mon tableau de bord <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hp-cta-primary">
                    Créer mon espace <ArrowRight size={16} />
                  </Link>
                  {!currentUser && (
                    <Link to="/login" className="hp-cta-ghost">Se connecter</Link>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="hp-fadeup" style={{
              animationDelay: '320ms',
              display: 'flex', gap: 36, paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {[
                { val: '0€', label: 'Commission' },
                { val: '100%', label: 'Privé & sécurisé' },
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

          {/* Droite — dashboard preview */}
          <div className="hp-hero-right">
            <DashboardPreview />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, pointerEvents: 'none',
                      background: 'linear-gradient(to bottom, transparent, #080706)' }} />
      </section>

      {/* ════════════════════════════════════
          MARQUEE
      ════════════════════════════════════ */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 0', background: 'rgba(10,8,6,0.7)' }}>
        <div className="hp-marquee-track">
          {[...Array(2)].map((_, rep) =>
            ['🏠 Gestion multi-biens', '✦', '📊 Suivi des revenus', '✦', '💡 Charges & électricité', '✦',
             '🧾 Impôts fonciers', '✦', '📅 Calendrier de réservations', '✦', '📋 Publication d\'annonce', '✦',
             '🔒 Données privées', '✦', '💸 Zéro commission', '✦'].map((t, i) => (
              <span key={`${rep}-${i}`} style={{
                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.01em',
                color: t === '✦' ? 'rgba(201,136,58,0.4)' : 'rgba(148,163,184,0.7)',
              }}>{t}</span>
            ))
          )}
        </div>
      </div>

      {/* ════════════════════════════════════
          STATS BAR
      ════════════════════════════════════ */}
      <div style={{ background: 'rgba(10,8,6,0.85)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
          {[
            { emoji: '🏠', val: 'Multi-biens', label: 'tous vos logements' },
            { emoji: '📊', val: 'Temps réel', label: 'stats & revenus' },
            { emoji: '💡', val: 'Centralisé', label: 'charges & impôts' },
            { emoji: '📋', val: 'En option', label: 'annonce de location' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.06)', margin: '0 32px', flexShrink: 0 }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, marginBottom: 4 }}>{s.emoji}</div>
                <div style={{
                  fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #f5f0ea 0%, #e0a84f 100%)',
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

      {/* ════════════════════════════════════
          FEATURES
      ════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px' }}>
        <div style={{ marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9883a', marginBottom: 10 }}>
            ✦ Ce que vous pouvez faire
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, color: '#f5f0ea', letterSpacing: '-0.03em' }}>
            Tout ce dont un propriétaire a besoin
          </h2>
        </div>

        <div className="hp-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          <Feature icon={Home}      title="Gestion de biens"      delay={0}   desc="Ajoutez tous vos logements, photos, descriptions, règles — tout au même endroit." />
          <Feature icon={FileText}  title="Suivi des charges"     delay={80}  desc="Électricité, eau, assurance, impôts fonciers — enregistrez chaque dépense par bien." />
          <Feature icon={BarChart2} title="Statistiques & revenus" delay={160} desc="Visualisez vos revenus, taux d'occupation et rentabilité par bien et par année." />
          <Feature icon={TrendingUp} title="Location en direct"   delay={240} desc="Publiez une annonce, gérez les réservations et échangez avec vos locataires. Zéro commission." />
        </div>
      </section>

      {/* ════════════════════════════════════
          COMMENT ÇA MARCHE
      ════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(7,6,5,0.9)', padding: '90px 24px' }}>
        <div className="hp-2col" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9883a', marginBottom: 14 }}>
              ✦ Comment ça marche
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#f5f0ea', lineHeight: 1.15, marginBottom: 20 }}>
              Opérationnel en quelques minutes.
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.75, maxWidth: 380 }}>
              Pas de configuration complexe. Vous créez votre compte, ajoutez vos biens,
              et commencez à suivre vos finances immédiatement.
            </p>
          </div>

          <div>
            {[
              { n: '01', title: 'Créez votre compte gérant', desc: "Inscription gratuite. Vous choisissez le rôle Gérant et accédez à votre tableau de bord." },
              { n: '02', title: 'Ajoutez vos logements', desc: "Nom, adresse, photos, capacité — renseignez chaque bien en quelques minutes." },
              { n: '03', title: 'Suivez charges et revenus', desc: "Saisissez vos dépenses (électricité, impôts…) et consultez vos statistiques en temps réel." },
              { n: '04', title: 'Louez si vous le souhaitez', desc: "Activez la publication pour que des voyageurs puissent trouver et réserver votre bien." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="hp-step">
                <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(201,136,58,0.5)', letterSpacing: '0.06em', flexShrink: 0, paddingTop: 3, width: 22 }}>{n}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 5 }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 300, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(201,136,58,0.1) 0%, transparent 65%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🏠</div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f5f0ea', marginBottom: 16, lineHeight: 1.1 }}>
            Prêt à gérer votre patrimoine ?
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, marginBottom: 36 }}>
            Créez votre compte gratuitement et commencez à piloter vos logements en quelques minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {currentUser && isAdmin ? (
              <Link to="/admin" className="hp-cta-primary">
                Mon tableau de bord <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="hp-cta-primary">
                  Créer mon espace gratuit <ArrowRight size={16} />
                </Link>
                {!currentUser && (
                  <Link to="/login" className="hp-cta-ghost">Se connecter</Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px',
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #c9883a, #e0a84f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={15} style={{ color: '#080706' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#f5f0ea', letterSpacing: '-0.02em' }}>MonParcImmo</span>
        </div>
        <p style={{ fontSize: 12, color: '#334155' }}>
          Gestion immobilière · Charges & revenus · Location en direct
        </p>
      </footer>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { propertyService, reviewService } from '../services/api'
import Navbar from '../components/common/Navbar'
import {
  MapPin, Users, Maximize2, Star, Calendar, ChevronRight,
  ArrowLeft, Wifi, Clock, Shield, Home, ChevronLeft,
} from 'lucide-react'

// ─── CSS injection ────────────────────────────────────────────────────────────
const CSS = `
  .pp-root {
    min-height: 100vh;
    background: #080706;
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
  }
  /* Gallery */
  .pp-gallery {
    position: relative;
    width: 100%;
    height: 480px;
    overflow: hidden;
    border-radius: 20px;
  }
  .pp-gallery img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.6s ease;
  }
  .pp-gallery img.hidden { opacity: 0; }
  .pp-gallery img.visible { opacity: 1; }
  .pp-gallery-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
  }
  .pp-gallery-btn:hover { background: rgba(255,255,255,0.25); }
  .pp-gallery-btn.left { left: 16px; }
  .pp-gallery-btn.right { right: 16px; }
  .pp-gallery-dots {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
    z-index: 10;
  }
  .pp-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    transition: background 0.3s, transform 0.3s;
  }
  .pp-dot.active { background: white; transform: scale(1.4); }
  /* Glass card */
  .pp-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 28px;
    backdrop-filter: blur(12px);
  }
  /* Stat chips */
  .pp-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(201,136,58,0.12);
    border: 1px solid rgba(201,136,58,0.25);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 13px;
    color: #f0c87a;
  }
  /* Status badge */
  .pp-badge-confirmed {
    background: rgba(34,197,94,0.15);
    border: 1px solid rgba(34,197,94,0.3);
    color: #4ade80;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 999px;
  }
  /* CTA booking block */
  .pp-cta {
    background: linear-gradient(135deg, rgba(201,136,58,0.18), rgba(180,110,40,0.12));
    border: 1px solid rgba(201,136,58,0.3);
    border-radius: 20px;
    padding: 28px;
    position: sticky;
    top: 100px;
    backdrop-filter: blur(16px);
  }
  .pp-btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    background: linear-gradient(135deg, #c9883a, #c9883a);
    color: white;
    font-weight: 600;
    font-size: 15px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
  }
  .pp-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .pp-btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.14);
    color: #e2e8f0;
    font-weight: 500;
    font-size: 15px;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s;
  }
  .pp-btn-secondary:hover { background: rgba(255,255,255,0.1); }
  /* Reviews */
  .pp-review {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 20px;
  }
  /* Amenity */
  .pp-amenity {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    font-size: 14px;
    color: #94a3b8;
  }
  /* Section title */
  .pp-section-title {
    font-size: 20px;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pp-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(201,136,58,0.4), transparent);
  }
  /* Gradient text */
  .pp-gradient-text {
    background: linear-gradient(135deg, #e0a84f, #e0a84f);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  /* Surround grid */
  .pp-surround-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  @media (max-width: 640px) {
    .pp-surround-grid { grid-template-columns: repeat(2, 1fr); }
    .pp-gallery { height: 280px; }
  }
  .pp-surround-img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    border-radius: 12px;
    transition: transform 0.3s;
  }
  .pp-surround-img:hover { transform: scale(1.03); }
  /* Star */
  .pp-stars { display: flex; gap: 2px; }
  .pp-star { color: #fbbf24; }
  .pp-star.empty { color: rgba(255,255,255,0.15); }
  /* Loading spinner */
  .pp-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: pp-spin 0.8s linear infinite;
  }
  @keyframes pp-spin { to { transform: rotate(360deg); } }
  /* Fade in */
  @keyframes pp-fadein {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .pp-fadein { animation: pp-fadein 0.5s ease both; }
`

function injectCSS(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style')
    el.id = id
    el.textContent = css
    document.head.appendChild(el)
  }
}

// ─── Gallery Component ────────────────────────────────────────────────────────
function Gallery({ photos }) {
  const [index, setIndex] = useState(0)
  if (!photos || photos.length === 0) return null

  const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex(i => (i + 1) % photos.length)

  return (
    <div className="pp-gallery">
      {photos.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`Photo ${i + 1}`}
          className={i === index ? 'visible' : 'hidden'}
        />
      ))}
      {photos.length > 1 && (
        <>
          <button className="pp-gallery-btn left" onClick={prev}>
            <ChevronLeft size={20} />
          </button>
          <button className="pp-gallery-btn right" onClick={next}>
            <ChevronRight size={20} />
          </button>
          <div className="pp-gallery-dots">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`pp-dot${i === index ? ' active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Stars Component ──────────────────────────────────────────────────────────
function Stars({ rating, max = 5 }) {
  return (
    <span className="pp-stars">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.round(rating) ? 'pp-star' : 'pp-star empty'}
          fill={i < Math.round(rating) ? '#fbbf24' : 'transparent'}
        />
      ))}
    </span>
  )
}

// ─── Amenities ────────────────────────────────────────────────────────────────
function AmenitiesSection({ property }) {
  const items = []
  if (property.maxGuests > 0) items.push({ icon: '👥', label: `Jusqu'à ${property.maxGuests} voyageurs` })
  if (property.numberOfRooms > 0) items.push({ icon: '🛏️', label: `${property.numberOfRooms} pièce${property.numberOfRooms > 1 ? 's' : ''}` })
  if (property.surfaceArea > 0) items.push({ icon: '📐', label: `${property.surfaceArea} m²` })
  if (property.wifiName) items.push({ icon: '📶', label: `WiFi : ${property.wifiName}` })
  if (property.checkInTime) items.push({ icon: '🕐', label: `Arrivée à partir de ${property.checkInTime}` })
  if (property.checkOutTime) items.push({ icon: '🕙', label: `Départ avant ${property.checkOutTime}` })

  if (items.length === 0) return null
  return (
    <div>
      <p className="pp-section-title">Équipements & infos</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {items.map((item, i) => (
          <div key={i} className="pp-amenity">
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertyPage() {
  const { propertyId } = useParams()
  const { currentUser } = useAuth()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  injectCSS('pp-styles', CSS)

  useEffect(() => {
    Promise.all([
      propertyService.getProperty(propertyId),
      reviewService.getPublicReviews(propertyId).catch(() => ({ data: [] })),
      reviewService.getReviewSummary(propertyId).catch(() => ({ data: null })),
    ])
      .then(([propRes, reviewsRes, summaryRes]) => {
        setProperty(propRes.data)
        setReviews(reviewsRes.data)
        setReviewSummary(summaryRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [propertyId])

  if (loading) {
    return (
      <div className="pp-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pp-spinner" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="pp-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Home size={48} style={{ color: '#4b5563' }} />
        <p style={{ color: '#94a3b8', fontSize: '18px' }}>Logement introuvable</p>
        <Link to="/" className="pp-btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const avgRating = reviewSummary?.averageRating || 0
  const totalReviews = reviewSummary?.totalReviews || 0

  return (
    <div className="pp-root">
      <Navbar dark />

      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,136,58,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '-8%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,110,40,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px', paddingTop: '100px' }}>

        {/* Breadcrumb */}
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#94a3b8', fontSize: '14px', textDecoration: 'none',
            marginBottom: '28px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          <ArrowLeft size={16} />
          Tous les logements
        </Link>

        {/* Hero header */}
        <div className="pp-fadein" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.15 }}>
              {property.name}
            </h1>
            {totalReviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '999px', padding: '6px 14px' }}>
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '15px' }}>{avgRating.toFixed(1)}</span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>({totalReviews} avis)</span>
              </div>
            )}
          </div>
          {property.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '15px' }}>
              <MapPin size={16} style={{ color: '#e0a84f' }} />
              {property.address ? `${property.address}, ` : ''}{property.city}
              {property.country ? `, ${property.country}` : ''}
            </div>
          )}
        </div>

        {/* Gallery */}
        {property.mainPhotoUrls?.length > 0 && (
          <div className="pp-fadein" style={{ marginBottom: '40px', animationDelay: '0.1s' }}>
            <Gallery photos={property.mainPhotoUrls} />
          </div>
        )}

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

            {/* Quick stat chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {property.maxGuests > 0 && <span className="pp-chip"><Users size={13} /> {property.maxGuests} voyageurs</span>}
              {property.numberOfRooms > 0 && <span className="pp-chip">🛏️ {property.numberOfRooms} pièce{property.numberOfRooms > 1 ? 's' : ''}</span>}
              {property.surfaceArea > 0 && <span className="pp-chip"><Maximize2 size={13} /> {property.surfaceArea} m²</span>}
              {property.wifiName && <span className="pp-chip"><Wifi size={13} /> WiFi inclus</span>}
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <p className="pp-section-title">À propos</p>
                <div className="pp-card" style={{ padding: '24px' }}>
                  <p style={{ color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '15px' }}>
                    {property.description}
                  </p>
                </div>
              </div>
            )}

            {/* Amenities */}
            <AmenitiesSection property={property} />

            {/* House rules */}
            {property.houseRules && (
              <div>
                <p className="pp-section-title">Règlement intérieur</p>
                <div className="pp-card" style={{ padding: '20px', display: 'flex', gap: '14px' }}>
                  <Shield size={20} style={{ color: '#e0a84f', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '14px', whiteSpace: 'pre-line' }}>
                    {property.houseRules}
                  </p>
                </div>
              </div>
            )}

            {/* Surroundings */}
            {property.surroundingPhotoUrls?.length > 0 && (
              <div>
                <p className="pp-section-title">Les alentours</p>
                <div className="pp-surround-grid">
                  {property.surroundingPhotoUrls.map((url, i) => (
                    <img key={i} src={url} alt={`Alentour ${i + 1}`} className="pp-surround-img" />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <p className="pp-section-title">Avis des voyageurs</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {reviews.slice(0, 6).map((review, i) => (
                    <div key={review.id || i} className="pp-review">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #c9883a, #c9883a)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '14px',
                          }}>
                            {review.guestName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>{review.guestName || 'Voyageur'}</p>
                            {review.createdAt && (
                              <p style={{ color: '#64748b', fontSize: '12px' }}>
                                {new Date(review.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                        <Stars rating={review.rating} />
                      </div>
                      {review.comment && (
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, fontStyle: 'italic' }}>
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Booking CTA */}
          <div>
            <div className="pp-cta">
              {/* Price indication */}
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Tarif sur demande</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9' }}>Disponibilités</p>
                {totalReviews > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                    <Stars rating={avgRating} />
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{avgRating.toFixed(1)} · {totalReviews} avis</span>
                  </div>
                )}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0 20px' }} />

              {currentUser ? (
                <Link to={`/biens/${propertyId}/reserver`} className="pp-btn-primary">
                  <Calendar size={18} />
                  Voir les disponibilités
                </Link>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
                    Créez un compte gratuit ou connectez-vous pour accéder aux disponibilités et faire une demande de séjour.
                  </p>
                  <Link
                    to={`/login?redirect=/biens/${propertyId}/reserver`}
                    className="pp-btn-primary"
                  >
                    <Calendar size={18} />
                    Réserver ce logement
                  </Link>
                  <Link to="/login" className="pp-btn-secondary">
                    J'ai déjà un compte
                    <ChevronRight size={16} />
                  </Link>
                </div>
              )}

              {/* Trust signals */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '13px' }}>
                  <Shield size={15} style={{ color: '#e0a84f' }} />
                  Pas de paiement en ligne — règlement à l'arrivée
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '13px' }}>
                  <Clock size={15} style={{ color: '#e0a84f' }} />
                  Réponse rapide du propriétaire
                </div>
              </div>
            </div>

            {/* Check-in info card */}
            {(property.checkInTime || property.checkOutTime) && (
              <div className="pp-card" style={{ marginTop: '16px', padding: '18px' }}>
                <p style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '12px', fontSize: '14px' }}>Horaires</p>
                {property.checkInTime && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#64748b' }}>Arrivée</span>
                    <span style={{ color: '#f0c87a', fontWeight: 600 }}>à partir de {property.checkInTime}</span>
                  </div>
                )}
                {property.checkOutTime && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0' }}>
                    <span style={{ color: '#64748b' }}>Départ</span>
                    <span style={{ color: '#f0c87a', fontWeight: 600 }}>avant {property.checkOutTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import { documentService, propertyService } from '../services/api'
import { FileText, ExternalLink, Image, Zap, Droplets, Wifi } from 'lucide-react'

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  .guide-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes guide-fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .guide-fadein { animation: guide-fadein 0.4s ease both; }

  .guide-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 24px;
  }

  .guide-info-chip {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
  }

  .guide-doc-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 22px;
    transition: border-color 0.2s;
  }
  .guide-doc-card:hover { border-color: rgba(201,136,58,0.2); }

  .guide-download-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px;
    background: rgba(201,136,58,0.1);
    border: 1px solid rgba(201,136,58,0.25);
    border-radius: 9px; color: #e0a84f;
    font-size: 13px; font-weight: 600;
    text-decoration: none; transition: background 0.15s;
  }
  .guide-download-btn:hover { background: rgba(201,136,58,0.18); }

  .guide-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: guide-spin 0.8s linear infinite;
  }
  @keyframes guide-spin { to { transform: rotate(360deg); } }

  .guide-photo-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .guide-photo-grid a img {
    width: 100%; height: 110px; object-fit: cover;
    border-radius: 10px; border: 1px solid rgba(255,255,255,0.07);
    transition: opacity 0.15s;
  }
  .guide-photo-grid a img:hover { opacity: 0.85; }
`

function injectCSS() {
  if (document.getElementById('guide-css')) return
  const s = document.createElement('style')
  s.id = 'guide-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const docTypeIcon  = { ARRIVAL_INSTRUCTIONS: '🚪', DEPARTURE_INSTRUCTIONS: '🏃', HOUSE_RULES: '📋', OTHER: '📄' }
const docTypeLabel = { ARRIVAL_INSTRUCTIONS: "Consignes d'arrivée", DEPARTURE_INSTRUCTIONS: 'Consignes de départ', HOUSE_RULES: 'Règlement intérieur', OTHER: 'Document' }
const sortOrder    = ['ARRIVAL_INSTRUCTIONS', 'DEPARTURE_INSTRUCTIONS', 'HOUSE_RULES', 'OTHER']

export default function InstructionsPage() {
  const [documents, setDocuments] = useState([])
  const [property,  setProperty]  = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    injectCSS()
    Promise.all([
      documentService.getClientDocuments(),
      propertyService.getProperty(),
    ])
      .then(([docsRes, propRes]) => {
        setDocuments(docsRes.data)
        setProperty(propRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const sortedDocs = [...documents].sort((a, b) => sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type))

  return (
    <div className="guide-root">
      <Navbar />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── En-tête ── */}
        <div className="guide-fadein" style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>✦ Guide</p>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 8 }}>Guide du logement</h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>Toutes les informations utiles pour votre séjour.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="guide-spinner" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Infos pratiques ── */}
            {property && (
              <div className="guide-card guide-fadein" style={{ animationDelay: '0.05s' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
                  ✦ Informations pratiques
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {property.wifiPassword && (
                    <div className="guide-info-chip">
                      <Wifi size={17} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Wi-Fi</p>
                        <p style={{ fontSize: 14, color: '#f5f0ea' }}>{property.wifiPassword}</p>
                        {property.wifiName && <p style={{ fontSize: 12, color: '#64748b' }}>Réseau : {property.wifiName}</p>}
                      </div>
                    </div>
                  )}
                  {property.electricMeterLocation && (
                    <div className="guide-info-chip">
                      <Zap size={17} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Compteur électrique</p>
                        <p style={{ fontSize: 14, color: '#f5f0ea' }}>{property.electricMeterLocation}</p>
                      </div>
                    </div>
                  )}
                  {property.waterMeterLocation && (
                    <div className="guide-info-chip">
                      <Droplets size={17} style={{ color: '#38bdf8', flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Compteur eau</p>
                        <p style={{ fontSize: 14, color: '#f5f0ea' }}>{property.waterMeterLocation}</p>
                      </div>
                    </div>
                  )}
                  {property.parkingInfo && (
                    <div className="guide-info-chip">
                      <span style={{ fontSize: 18, flexShrink: 0 }}>🚗</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Parking</p>
                        <p style={{ fontSize: 14, color: '#f5f0ea' }}>{property.parkingInfo}</p>
                      </div>
                    </div>
                  )}
                  {property.trashInfo && (
                    <div className="guide-info-chip">
                      <span style={{ fontSize: 18, flexShrink: 0 }}>🗑️</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Poubelles</p>
                        <p style={{ fontSize: 14, color: '#f5f0ea' }}>{property.trashInfo}</p>
                      </div>
                    </div>
                  )}
                  {/* Check-in / Check-out */}
                  {(property.checkInTime || property.checkOutTime) && (
                    <div className="guide-info-chip">
                      <span style={{ fontSize: 18, flexShrink: 0 }}>🔑</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Horaires</p>
                        {property.checkInTime  && <p style={{ fontSize: 13, color: '#f5f0ea' }}>Arrivée à partir de <strong>{property.checkInTime}</strong></p>}
                        {property.checkOutTime && <p style={{ fontSize: 13, color: '#f5f0ea' }}>Départ avant <strong>{property.checkOutTime}</strong></p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Instructions d'arrivée inline ── */}
            {property?.checkInInstructions && (
              <div className="guide-card guide-fadein" style={{ animationDelay: '0.1s' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  🚪 Instructions d'arrivée
                </p>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{property.checkInInstructions}</p>
              </div>
            )}

            {/* ── Règlement ── */}
            {property?.houseRules && (
              <div className="guide-card guide-fadein" style={{ animationDelay: '0.15s' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  📋 Règlement de la maison
                </p>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{property.houseRules}</p>
              </div>
            )}

            {/* ── Documents ── */}
            {sortedDocs.length === 0 && !property ? (
              <div className="guide-fadein" style={{ textAlign: 'center', padding: '60px 0' }}>
                <FileText size={40} style={{ color: 'rgba(255,255,255,0.08)', margin: '0 auto 16px' }} />
                <p style={{ color: '#475569', fontSize: 14 }}>Aucun document disponible pour l'instant.</p>
              </div>
            ) : sortedDocs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  📎 Documents
                </p>
                {sortedDocs.map((doc, i) => (
                  <div key={doc.id} className={`guide-doc-card guide-fadein`} style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: doc.photoUrls?.length > 0 ? 16 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(201,136,58,0.08)', border: '1px solid rgba(201,136,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          {docTypeIcon[doc.type] || '📄'}
                        </div>
                        <div>
                          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#f5f0ea', marginBottom: 3, letterSpacing: '-0.02em' }}>{doc.title}</h2>
                          <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{docTypeLabel[doc.type]}</p>
                        </div>
                      </div>
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="guide-download-btn">
                          <ExternalLink size={13} /> Ouvrir
                        </a>
                      )}
                    </div>

                    {/* Photos associées */}
                    {doc.photoUrls?.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <Image size={13} style={{ color: '#64748b' }} />
                          <p style={{ fontSize: 12, color: '#64748b' }}>Photos de référence</p>
                        </div>
                        <div className="guide-photo-grid">
                          {doc.photoUrls.map((url, idx) => (
                            <a href={url} target="_blank" rel="noopener noreferrer" key={idx}>
                              <img src={url} alt={`Référence ${idx + 1}`} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

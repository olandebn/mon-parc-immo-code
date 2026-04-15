import React, { useState } from 'react'
import { QrCode, X, ExternalLink } from 'lucide-react'

/**
 * QRCodeGuide — Affiche un bouton qui ouvre un QR code vers le guide du logement.
 * Utilise l'API gratuite qrserver.com (pas de lib externe nécessaire).
 */
export default function QRCodeGuide({ propertyId, frontendUrl = window.location.origin }) {
  const [open, setOpen] = useState(false)
  const guideUrl = `${frontendUrl}/instructions`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&format=svg&color=f5f0ea&bgcolor=080706&data=${encodeURIComponent(guideUrl)}`

  const downloadQR = () => {
    const img = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodeURIComponent(guideUrl)}`
    const a = document.createElement('a')
    a.href = img; a.download = 'qr-guide-logement.png'; a.target = '_blank'; a.click()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 18px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, color: '#94a3b8', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#f5f0ea'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      >
        <QrCode size={15} /> QR Code Guide
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: '#111009', border: '1px solid rgba(201,136,58,0.25)',
            borderRadius: 20, padding: 32, maxWidth: 340, width: '100%', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16 }}>QR Code — Guide du logement</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                <X size={18} />
              </button>
            </div>

            {/* QR Code */}
            <div style={{ background: '#080706', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 16, display: 'inline-block' }}>
              <img src={qrUrl} alt="QR Code Guide" width={220} height={220} style={{ display: 'block' }} />
            </div>

            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              Imprimez ce QR code et placez-le dans votre logement.<br/>
              Vos voyageurs accèdent directement au guide.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={downloadQR} style={{
                flex: 1, padding: '10px', background: 'linear-gradient(135deg, #c9883a, #e0a84f)',
                border: 'none', borderRadius: 10, color: '#080706', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              }}>
                ⬇ Télécharger
              </button>
              <a href={guideUrl} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#94a3b8', fontSize: 13, textDecoration: 'none',
              }}>
                <ExternalLink size={13} /> Tester
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

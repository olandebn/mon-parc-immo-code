import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import AvailabilityCalendar from '../components/booking/AvailabilityCalendar'
import BookingForm from '../components/booking/BookingForm'
import { reservationService, pricingService, propertyService } from '../services/api'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'

const CSS = `
  .book-root { min-height: 100vh; background: #080706; color: #f5f0ea; font-family: 'Inter', -apple-system, sans-serif; }

  @keyframes book-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .book-fadein { animation: book-fadein 0.4s ease both; }

  .book-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 24px;
  }

  .book-legend-dot { width: 10px; height: 10px; border-radius: 50%; }

  .book-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(201,136,58,0.2);
    border-top-color: #c9883a;
    border-radius: 50%;
    animation: book-spin 0.8s linear infinite;
  }
  @keyframes book-spin { to { transform: rotate(360deg); } }
`
function injectCSS() {
  if (document.getElementById('book-css')) return
  const s = document.createElement('style'); s.id = 'book-css'; s.textContent = CSS; document.head.appendChild(s)
}

export default function BookingPage() {
  const navigate = useNavigate()
  const { propertyId } = useParams()
  const [property, setProperty] = useState(null)
  const [unavailableDates, setUnavailableDates] = useState([])
  const [selectedDates, setSelectedDates] = useState({ checkIn: null, checkOut: null })
  const [priceInfo, setPriceInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    injectCSS()
    if (!propertyId) return
    Promise.all([
      propertyService.getProperty(propertyId),
      reservationService.getUnavailableDates(propertyId),
    ])
      .then(([propRes, datesRes]) => {
        setProperty(propRes.data)
        setUnavailableDates(datesRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [propertyId])

  useEffect(() => {
    if (selectedDates.checkIn && selectedDates.checkOut) calculatePrice()
  }, [selectedDates])

  const calculatePrice = async () => {
    setCalculating(true)
    try {
      const checkIn = selectedDates.checkIn.toISOString().split('T')[0]
      const checkOut = selectedDates.checkOut.toISOString().split('T')[0]
      const res = await pricingService.calculatePrice(propertyId, checkIn, checkOut)
      setPriceInfo(res.data)
    } catch { setPriceInfo(null) }
    finally { setCalculating(false) }
  }

  const handleBooking = async (formData) => {
    try {
      const checkIn = selectedDates.checkIn.toISOString().split('T')[0]
      const checkOut = selectedDates.checkOut.toISOString().split('T')[0]
      await reservationService.createReservation(propertyId, {
        checkInDate: checkIn, checkOutDate: checkOut,
        numberOfGuests: formData.numberOfGuests,
        notes: formData.notes,
        totalPrice: priceInfo?.totalPrice || 0,
        pricingType: priceInfo?.pricingType || 'NIGHTLY',
      })
      toast.success('Demande de réservation envoyée ! Vous recevrez une confirmation par email.')
      navigate('/mes-reservations')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réservation')
    }
  }

  return (
    <div className="book-root">
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Retour */}
        {propertyId && (
          <Link to={`/biens/${propertyId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', marginBottom: 24 }}
            onMouseEnter={e => e.currentTarget.style.color = '#e0a84f'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            <ArrowLeft size={14} />
            Retour au logement{property ? ` — ${property.name}` : ''}
          </Link>
        )}

        <div className="book-fadein">
          <p style={{ fontSize: 12, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>✦ Réservation</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>
            {property ? property.name : 'Réserver le logement'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 36 }}>Sélectionnez vos dates de séjour sur le calendrier.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Calendrier */}
          <div className="book-card book-fadein" style={{ animationDelay: '0.05s' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#c9883a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              ✦ Disponibilités
            </p>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
                <div className="book-spinner" />
              </div>
            ) : (
              <AvailabilityCalendar
                unavailableDates={unavailableDates}
                selectedDates={selectedDates}
                onDatesChange={setSelectedDates}
              />
            )}

            {/* Légende */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { color: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', label: 'Disponible' },
                { color: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', label: 'Indisponible' },
                { color: '#c9883a', border: '1px solid #c9883a', label: 'Sélectionné' },
              ].map(({ color, border, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="book-legend-dot" style={{ background: color, border }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire / placeholder */}
          <div className="book-fadein" style={{ animationDelay: '0.1s' }}>
            {selectedDates.checkIn && selectedDates.checkOut ? (
              <BookingForm
                selectedDates={selectedDates}
                priceInfo={priceInfo}
                calculating={calculating}
                onSubmit={handleBooking}
                onClear={() => { setSelectedDates({ checkIn: null, checkOut: null }); setPriceInfo(null) }}
              />
            ) : (
              <div className="book-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 280 }}>
                <div style={{ width: 64, height: 64, background: 'rgba(201,136,58,0.08)', border: '1px solid rgba(201,136,58,0.15)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>
                  📅
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f5f0ea', marginBottom: 8 }}>Choisissez vos dates</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                  Cliquez d'abord sur votre date d'arrivée, puis sur votre date de départ.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

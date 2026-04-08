import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import AvailabilityCalendar from '../components/booking/AvailabilityCalendar'
import BookingForm from '../components/booking/BookingForm'
import { reservationService, pricingService, propertyService } from '../services/api'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'

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
    if (selectedDates.checkIn && selectedDates.checkOut) {
      calculatePrice()
    }
  }, [selectedDates])

  const calculatePrice = async () => {
    setCalculating(true)
    try {
      const checkIn = selectedDates.checkIn.toISOString().split('T')[0]
      const checkOut = selectedDates.checkOut.toISOString().split('T')[0]
      const res = await pricingService.calculatePrice(propertyId, checkIn, checkOut)
      setPriceInfo(res.data)
    } catch (error) {
      setPriceInfo(null)
    } finally {
      setCalculating(false)
    }
  }

  const handleBooking = async (formData) => {
    try {
      const checkIn = selectedDates.checkIn.toISOString().split('T')[0]
      const checkOut = selectedDates.checkOut.toISOString().split('T')[0]

      await reservationService.createReservation(propertyId, {
        checkInDate: checkIn,
        checkOutDate: checkOut,
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Retour vers le bien */}
        {propertyId && (
          <Link
            to={`/biens/${propertyId}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au logement{property ? ` — ${property.name}` : ''}
          </Link>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {property ? `Réserver — ${property.name}` : 'Réserver le logement'}
        </h1>
        <p className="text-gray-500 mb-8">Sélectionnez vos dates de séjour sur le calendrier</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendrier */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Disponibilités</h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <AvailabilityCalendar
                unavailableDates={unavailableDates}
                selectedDates={selectedDates}
                onDatesChange={setSelectedDates}
              />
            )}
          </div>

          {/* Formulaire de réservation */}
          <div>
            {selectedDates.checkIn && selectedDates.checkOut ? (
              <BookingForm
                selectedDates={selectedDates}
                priceInfo={priceInfo}
                calculating={calculating}
                onSubmit={handleBooking}
                onClear={() => {
                  setSelectedDates({ checkIn: null, checkOut: null })
                  setPriceInfo(null)
                }}
              />
            ) : (
              <div className="card flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Choisissez vos dates
                </h3>
                <p className="text-gray-500 text-sm">
                  Cliquez d'abord sur votre date d'arrivée, puis sur votre date de départ.
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-white border border-gray-300" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-100" />
                    <span>Indisponible</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>Sélectionné</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

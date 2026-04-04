import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { reservationService } from '../services/api'
import { Calendar, ChevronRight, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const statusLabel = {
  PENDING: { label: 'En attente', class: 'badge-pending' },
  CONFIRMED: { label: 'Confirmée', class: 'badge-confirmed' },
  CANCELLED: { label: 'Annulée', class: 'badge-cancelled' },
  COMPLETED: { label: 'Terminée', class: 'badge-completed' },
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reservationService.getMyReservations()
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes réservations</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore effectué de réservation.</p>
            <Link to="/booking" className="btn-primary">Réserver maintenant</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const status = statusLabel[reservation.status] || statusLabel.PENDING
              const checkIn = new Date(reservation.checkInDate)
              const checkOut = new Date(reservation.checkOutDate)

              return (
                <Link
                  key={reservation.id}
                  to={`/reservations/${reservation.id}`}
                  className="card flex items-center justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={status.class}>{status.label}</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {format(checkIn, 'dd MMMM yyyy', { locale: fr })} →{' '}
                        {format(checkOut, 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {reservation.numberOfGuests} voyageur(s) •{' '}
                        {reservation.totalPrice} {reservation.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-600">
                    <MessageSquare className="w-4 h-4" />
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

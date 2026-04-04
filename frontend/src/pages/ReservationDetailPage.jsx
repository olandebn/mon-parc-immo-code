import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import MessageThread from '../components/messages/MessageThread'
import ReviewForm from '../components/reviews/ReviewForm'
import { reservationService } from '../services/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Users, Euro, MessageSquare, Star, AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'

const statusLabel = {
  PENDING: { label: 'En attente de confirmation', class: 'badge-pending' },
  CONFIRMED: { label: 'Confirmée', class: 'badge-confirmed' },
  CANCELLED: { label: 'Annulée', class: 'badge-cancelled' },
  COMPLETED: { label: 'Terminée', class: 'badge-completed' },
}

export default function ReservationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    reservationService.getReservation(id)
      .then(res => setReservation(res.data))
      .catch(() => navigate('/mes-reservations'))
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
    setCancelling(true)
    try {
      await reservationService.cancelReservation(id)
      toast.success('Réservation annulée')
      setReservation(prev => ({ ...prev, status: 'CANCELLED' }))
    } catch (error) {
      toast.error('Erreur lors de l\'annulation')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  const status = statusLabel[reservation?.status] || statusLabel.PENDING
  const checkIn = new Date(reservation.checkInDate)
  const checkOut = new Date(reservation.checkOutDate)
  const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ma réservation</h1>
          <span className={status.class}>{status.label}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du séjour</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Arrivée</p>
                    <p className="font-medium">{format(checkIn, 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Départ</p>
                    <p className="font-medium">{format(checkOut, 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Voyageurs</p>
                    <p className="font-medium">{reservation.numberOfGuests} personne(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Prix total ({nights} nuit{nights > 1 ? 's' : ''})</p>
                    <p className="font-medium text-lg">{reservation.totalPrice} {reservation.currency}</p>
                    <p className="text-xs text-gray-400">Règlement à l'arrivée — pas de paiement en ligne</p>
                  </div>
                </div>
              </div>

              {reservation.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Note du voyageur</p>
                  <p className="text-sm text-gray-700">{reservation.notes}</p>
                </div>
              )}
            </div>

            {/* Messagerie */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
              <MessageThread reservationId={id} />
            </div>

            {/* Laisser un avis (si séjour terminé) */}
            {reservation.status === 'COMPLETED' && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Laisser un avis</h2>
                </div>
                {showReviewForm ? (
                  <ReviewForm reservationId={id} onSuccess={() => setShowReviewForm(false)} />
                ) : (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="btn-secondary w-full"
                  >
                    Écrire un avis
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Annulation */}
            {['PENDING', 'CONFIRMED'].includes(reservation.status) && (
              <div className="card">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Annuler la réservation</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Contactez l'administrateur si vous souhaitez annuler.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="btn-danger w-full text-sm"
                >
                  {cancelling ? 'Annulation...' : 'Annuler la réservation'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reservationService } from '../../services/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle, MessageSquare, StickyNote, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import MessageThread from '../../components/messages/MessageThread'

const statusConfig = {
  PENDING: { label: 'En attente', class: 'badge-pending' },
  CONFIRMED: { label: 'Confirmée', class: 'badge-confirmed' },
  CANCELLED: { label: 'Annulée', class: 'badge-cancelled' },
  COMPLETED: { label: 'Terminée', class: 'badge-completed' },
}

export default function AdminBookings() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [showMessages, setShowMessages] = useState(false)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      const res = await reservationService.getAllReservations()
      setReservations(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id) => {
    try {
      await reservationService.confirmReservation(id)
      toast.success('Réservation confirmée !')
      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'CONFIRMED' } : r)
      )
    } catch {
      toast.error('Erreur lors de la confirmation')
    }
  }

  const handleSaveNote = async () => {
    try {
      await reservationService.addAdminNote(selectedReservation.id, noteText)
      toast.success('Note sauvegardée')
      setSelectedReservation(null)
    } catch {
      toast.error('Erreur')
    }
  }

  const filtered = filter === 'ALL'
    ? reservations
    : reservations.filter(r => r.status === filter)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900">Réservations</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtres */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {status === 'ALL' ? 'Toutes' :
               status === 'PENDING' ? 'En attente' :
               status === 'CONFIRMED' ? 'Confirmées' :
               status === 'CANCELLED' ? 'Annulées' : 'Terminées'}
              {status !== 'ALL' && (
                <span className="ml-1 text-xs opacity-70">
                  ({reservations.filter(r => r.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((reservation) => {
              const status = statusConfig[reservation.status]
              const checkIn = new Date(reservation.checkInDate)
              const checkOut = new Date(reservation.checkOutDate)
              const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))

              return (
                <div key={reservation.id} className="card">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={status.class}>{status.label}</span>
                        <span className="text-xs text-gray-400">#{reservation.id.substring(0, 8)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{reservation.clientName}</h3>
                      <p className="text-sm text-gray-500">{reservation.clientEmail} • {reservation.clientPhone}</p>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {format(checkIn, 'dd MMM yyyy', { locale: fr })} →{' '}
                        {format(checkOut, 'dd MMM yyyy', { locale: fr })}
                        <span className="text-gray-400 ml-1">({nights} nuit{nights > 1 ? 's' : ''})</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {reservation.numberOfGuests} voyageur(s) •{' '}
                        <span className="font-semibold text-gray-900">{reservation.totalPrice} €</span>
                      </p>
                      {reservation.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">"{reservation.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {reservation.status === 'PENDING' && (
                        <button
                          onClick={() => handleConfirm(reservation.id)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white
                                     text-sm px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirmer
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setNoteText(reservation.adminNotes || '')
                          setShowMessages(false)
                        }}
                        className="flex items-center gap-1 btn-secondary text-sm px-3 py-1.5"
                      >
                        <StickyNote className="w-4 h-4" />
                        Note
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setShowMessages(true)
                        }}
                        className="flex items-center gap-1 btn-secondary text-sm px-3 py-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Messages
                      </button>
                    </div>
                  </div>

                  {/* Messages inline */}
                  {selectedReservation?.id === reservation.id && showMessages && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <MessageThread reservationId={reservation.id} />
                      <button
                        onClick={() => setSelectedReservation(null)}
                        className="mt-3 text-sm text-gray-400 hover:text-gray-600"
                      >
                        Fermer
                      </button>
                    </div>
                  )}

                  {/* Note inline */}
                  {selectedReservation?.id === reservation.id && !showMessages && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="input-field text-sm"
                        rows={3}
                        placeholder="Note interne (visible uniquement par l'admin)..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={handleSaveNote} className="btn-primary text-sm px-4 py-1.5">
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setSelectedReservation(null)}
                          className="btn-secondary text-sm px-4 py-1.5"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="card text-center py-10 text-gray-400">
                Aucune réservation pour ce filtre
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

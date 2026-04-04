import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { messageService, reservationService } from '../../services/api'
import MessageThread from '../../components/messages/MessageThread'
import { MessageSquare, User, Clock } from 'lucide-react'

export default function AdminMessages() {
  const [threads, setThreads] = useState([])
  const [reservations, setReservations] = useState([])
  const [selectedReservationId, setSelectedReservationId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      messageService.getAllThreads(),
      reservationService.getAllReservations(),
    ])
      .then(([threadsRes, resRes]) => {
        setThreads(threadsRes.data)
        setReservations(resRes.data)
        // Sélectionner le premier fil avec des messages non lus
        if (threadsRes.data.length > 0) {
          setSelectedReservationId(threadsRes.data[0].reservationId)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getReservationInfo = (reservationId) => {
    return reservations.find(r => r.id === reservationId)
  }

  const unreadCount = (reservationId) => {
    const thread = threads.find(t => t.reservationId === reservationId)
    return thread?.unreadCount || 0
  }

  // Toutes les réservations avec messages
  const allReservationsWithMessages = [
    ...threads.map(t => t.reservationId),
    ...(selectedReservationId && !threads.find(t => t.reservationId === selectedReservationId)
      ? [selectedReservationId] : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/admin" className="text-gray-400 hover:text-gray-600">← Dashboard</Link>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          {threads.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)} non lus
            </span>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des conversations */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                  Conversations
                </h2>

                {reservations.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Aucune réservation
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reservations.slice(0, 20).map((reservation) => {
                      const unread = unreadCount(reservation.id)
                      const isSelected = selectedReservationId === reservation.id
                      return (
                        <button
                          key={reservation.id}
                          onClick={() => setSelectedReservationId(reservation.id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {reservation.clientName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {reservation.checkInDate}
                                </p>
                              </div>
                            </div>
                            {unread > 0 && (
                              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                                {unread}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Fil de messages */}
            <div className="lg:col-span-2">
              {selectedReservationId ? (
                <div className="card">
                  {(() => {
                    const reservation = getReservationInfo(selectedReservationId)
                    return reservation ? (
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">{reservation.clientName}</h3>
                        <p className="text-sm text-gray-500">
                          {reservation.checkInDate} → {reservation.checkOutDate} •{' '}
                          {reservation.status === 'CONFIRMED' ? '✅ Confirmée' :
                           reservation.status === 'PENDING' ? '⏳ En attente' : reservation.status}
                        </p>
                      </div>
                    ) : null
                  })()}
                  <MessageThread
                    reservationId={selectedReservationId}
                    onMessageSent={() => {
                      // Rafraîchir les threads non lus
                      messageService.getAllThreads().then(res => setThreads(res.data))
                    }}
                  />
                </div>
              ) : (
                <div className="card flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
                  <p className="text-gray-500">Sélectionnez une conversation</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

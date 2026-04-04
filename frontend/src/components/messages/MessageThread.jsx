import React, { useState, useEffect, useRef } from 'react'
import { messageService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Send } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function MessageThread({ reservationId, onMessageSent }) {
  const { userProfile, isAdmin } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadMessages()
  }, [reservationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    try {
      const res = await messageService.getMessages(reservationId)
      setMessages(res.data)
      // Marquer comme lu
      await messageService.markAsRead(reservationId)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const res = await messageService.sendMessage(reservationId, newMessage.trim())
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
      onMessageSent?.()
    } catch (error) {
      console.error('Erreur envoi message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Zone messages */}
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Aucun message. Posez une question au propriétaire !
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderUid === userProfile?.uid
            const isAdminMsg = message.senderRole === 'ADMIN'

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : isAdminMsg
                      ? 'bg-purple-100 text-purple-900 rounded-bl-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {isAdminMsg ? '🏠 Propriétaire' : message.senderName}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                    {message.sentAt
                      ? format(new Date(message.sentAt), 'dd MMM, HH:mm', { locale: fr })
                      : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Zone saisie */}
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="input-field flex-1 text-sm"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="btn-primary px-4 py-2 flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
          {sending ? '...' : 'Envoyer'}
        </button>
      </form>
    </div>
  )
}

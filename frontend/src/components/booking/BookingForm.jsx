import React, { useState } from 'react'
import { Users, Calendar, Euro, Info, X } from 'lucide-react'

export default function BookingForm({ selectedDates, priceInfo, calculating, onSubmit, onClear }) {
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const nights = selectedDates.checkIn && selectedDates.checkOut
    ? Math.round((selectedDates.checkOut - selectedDates.checkIn) / (1000 * 60 * 60 * 24))
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) return
    setSubmitting(true)
    try {
      await onSubmit({ numberOfGuests, notes })
    } finally {
      setSubmitting(false)
    }
  }

  const pricingTypeLabel = {
    NIGHTLY: 'par nuit',
    WEEKEND: 'week-end',
    WEEKLY: 'à la semaine',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Votre séjour</h2>
        <button onClick={onClear} className="p-1 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Récapitulatif des dates */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-gray-600">
            {selectedDates.checkIn?.toLocaleDateString('fr-FR')} →{' '}
            {selectedDates.checkOut?.toLocaleDateString('fr-FR')}
          </span>
          <span className="text-gray-400">({nights} nuit{nights > 1 ? 's' : ''})</span>
        </div>
      </div>

      {/* Prix calculé */}
      {calculating ? (
        <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          Calcul du tarif...
        </div>
      ) : priceInfo ? (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          {priceInfo.totalPrice ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  Tarif {pricingTypeLabel[priceInfo.pricingType]} — {priceInfo.seasonName}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Euro className="w-5 h-5 text-blue-700" />
                <span className="text-2xl font-bold text-blue-700">
                  {priceInfo.totalPrice?.toFixed(2)}
                </span>
                <span className="text-blue-600 text-sm">€ total</span>
              </div>
              <div className="flex gap-3 mt-1 text-xs text-blue-600">
                {priceInfo.nightlyRate > 0 && <span>{priceInfo.nightlyRate}€/nuit</span>}
                {priceInfo.weekendRate > 0 && <span>{priceInfo.weekendRate}€ week-end</span>}
                {priceInfo.weeklyRate > 0 && <span>{priceInfo.weeklyRate}€/semaine</span>}
              </div>
            </>
          ) : (
            <p className="text-sm text-blue-700">{priceInfo.message}</p>
          )}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre de voyageurs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de voyageurs
          </label>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              min="1"
              max="20"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
              className="input-field w-24"
            />
            <span className="text-sm text-gray-400">personne(s)</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            <Info className="inline w-3 h-3 mr-0.5" />
            Indication uniquement — le prix ne change pas selon le nombre de voyageurs
          </p>
        </div>

        {/* Message / Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message pour le propriétaire (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Présentez-vous, indiquez l'heure approximative d'arrivée..."
          />
        </div>

        {/* Pas de paiement en ligne */}
        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
          <strong>Pas de paiement en ligne.</strong> Le règlement s'effectuera directement
          auprès du propriétaire à votre arrivée.
        </div>

        {/* Accord */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded"
          />
          <span className="text-sm text-gray-600">
            J'ai pris connaissance des informations et je confirme ma demande de réservation.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting || !agreed || !priceInfo?.totalPrice}
          className="btn-primary w-full py-3 text-base"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Envoi de la demande...
            </span>
          ) : 'Envoyer la demande de réservation'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Votre réservation sera confirmée par le propriétaire par email.
        </p>
      </form>
    </div>
  )
}

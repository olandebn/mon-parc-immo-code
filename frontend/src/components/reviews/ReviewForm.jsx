import React, { useState } from 'react'
import { reviewService } from '../../services/api'
import { Star } from 'lucide-react'
import { toast } from 'react-toastify'

function StarInput({ label, value, onChange }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hover || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-200 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ReviewForm({ reservationId, onSuccess }) {
  const [form, setForm] = useState({
    overallRating: 0,
    cleanlinessRating: 0,
    comfortRating: 0,
    locationRating: 0,
    communicationRating: 0,
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.overallRating === 0) {
      toast.error('Veuillez donner une note globale')
      return
    }
    setSubmitting(true)
    try {
      await reviewService.submitReview({ ...form, reservationId })
      toast.success('Merci pour votre avis !')
      onSuccess?.()
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'avis')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <StarInput
          label="Note globale *"
          value={form.overallRating}
          onChange={(v) => setForm({ ...form, overallRating: v })}
        />
        <StarInput
          label="Propreté"
          value={form.cleanlinessRating}
          onChange={(v) => setForm({ ...form, cleanlinessRating: v })}
        />
        <StarInput
          label="Confort"
          value={form.comfortRating}
          onChange={(v) => setForm({ ...form, comfortRating: v })}
        />
        <StarInput
          label="Emplacement"
          value={form.locationRating}
          onChange={(v) => setForm({ ...form, locationRating: v })}
        />
        <StarInput
          label="Communication"
          value={form.communicationRating}
          onChange={(v) => setForm({ ...form, communicationRating: v })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Votre commentaire
        </label>
        <textarea
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="input-field"
          rows={4}
          placeholder="Partagez votre expérience pour aider les futurs voyageurs..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting || form.overallRating === 0}
        className="btn-primary w-full"
      >
        {submitting ? 'Envoi...' : 'Publier mon avis'}
      </button>
    </form>
  )
}

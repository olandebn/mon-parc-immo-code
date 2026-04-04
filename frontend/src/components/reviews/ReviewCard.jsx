import React from 'react'
import { Star } from 'lucide-react'

function StarRating({ value, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function ReviewCard({ review }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="card">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-gray-900">{review.clientName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(review.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating value={review.overallRating} />
          <span className="text-sm font-semibold text-gray-700">
            {review.overallRating}/5
          </span>
        </div>
      </div>

      {/* Notes détaillées */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {review.cleanlinessRating > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Propreté</span>
            <StarRating value={review.cleanlinessRating} />
          </div>
        )}
        {review.comfortRating > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Confort</span>
            <StarRating value={review.comfortRating} />
          </div>
        )}
        {review.locationRating > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Emplacement</span>
            <StarRating value={review.locationRating} />
          </div>
        )}
        {review.communicationRating > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Communication</span>
            <StarRating value={review.communicationRating} />
          </div>
        )}
      </div>

      {/* Commentaire */}
      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      )}

      {/* Réponse admin */}
      {review.adminResponse && (
        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
          <p className="text-xs font-semibold text-purple-700 mb-1">
            🏠 Réponse du propriétaire
          </p>
          <p className="text-sm text-purple-800">{review.adminResponse}</p>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { propertyService, reviewService } from '../services/api'
import Navbar from '../components/common/Navbar'
import PhotoGallery from '../components/property/PhotoGallery'
import RoomCard from '../components/property/RoomCard'
import ReviewCard from '../components/reviews/ReviewCard'
import { MapPin, Users, Maximize2, Star, Calendar, ChevronRight, ArrowLeft } from 'lucide-react'

export default function PropertyPage() {
  const { propertyId } = useParams()
  const { currentUser } = useAuth()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      propertyService.getProperty(propertyId),
      reviewService.getPublicReviews(propertyId),
      reviewService.getReviewSummary(propertyId),
    ])
      .then(([propRes, reviewsRes, summaryRes]) => {
        setProperty(propRes.data)
        setReviews(reviewsRes.data)
        setReviewSummary(summaryRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [propertyId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Bien introuvable</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Retour */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Tous les logements
        </Link>

        {/* Galerie */}
        {property.mainPhotoUrls?.length > 0 && (
          <PhotoGallery photos={property.mainPhotoUrls} />
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>

            {property.address && (
              <div className="flex items-center gap-1 mt-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.city}</span>
              </div>
            )}

            {/* Caractéristiques */}
            <div className="flex flex-wrap gap-4 mt-4">
              {property.maxGuests > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Jusqu'à {property.maxGuests} voyageurs</span>
                </div>
              )}
              {property.numberOfRooms > 0 && (
                <span className="text-sm text-gray-600">🛏️ {property.numberOfRooms} pièces</span>
              )}
              {property.surfaceArea > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Maximize2 className="w-4 h-4" />
                  <span>{property.surfaceArea} m²</span>
                </div>
              )}
              {reviewSummary?.totalReviews > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{reviewSummary.averageRating}/5 ({reviewSummary.totalReviews} avis)</span>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">À propos</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Pièces */}
            {property.rooms?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Les pièces</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.rooms.map((room, i) => <RoomCard key={i} room={room} />)}
                </div>
              </div>
            )}

            {/* Alentours */}
            {property.surroundingPhotoUrls?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Les alentours</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.surroundingPhotoUrls.map((url, i) => (
                    <img key={i} src={url} alt={`Alentour ${i + 1}`}
                      className="w-full h-40 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {/* Avis */}
            {reviews.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Avis des voyageurs</h2>
                  {reviewSummary && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{reviewSummary.averageRating}</span>
                      <span className="text-gray-400">({reviewSummary.totalReviews})</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.slice(0, 6).map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar réservation */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Réserver ce logement</h3>

              {currentUser ? (
                <Link
                  to={`/biens/${propertyId}/reserver`}
                  className="btn-primary w-full text-center py-3 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Voir les disponibilités
                </Link>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Pour réserver, vous devez être invité par le propriétaire.
                    Connectez-vous si vous avez déjà un compte.
                  </p>
                  <Link to="/login" className="btn-primary w-full text-center py-3 flex items-center justify-center gap-2">
                    Se connecter
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <p className="text-xs text-gray-400 text-center mt-3">
                Pas de paiement en ligne — règlement à l'arrivée
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

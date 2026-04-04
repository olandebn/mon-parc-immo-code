import React, { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import { documentService } from '../services/api'
import { FileText, ExternalLink, Image, Zap, Droplets, Wifi } from 'lucide-react'
import { propertyService } from '../services/api'

const docTypeIcon = {
  ARRIVAL_INSTRUCTIONS: '🚪',
  DEPARTURE_INSTRUCTIONS: '🏃',
  HOUSE_RULES: '📋',
  OTHER: '📄',
}

const docTypeLabel = {
  ARRIVAL_INSTRUCTIONS: 'Consignes d\'arrivée',
  DEPARTURE_INSTRUCTIONS: 'Consignes de départ',
  HOUSE_RULES: 'Règlement intérieur',
  OTHER: 'Document',
}

export default function InstructionsPage() {
  const [documents, setDocuments] = useState([])
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      documentService.getClientDocuments(),
      propertyService.getProperty(),
    ])
      .then(([docsRes, propRes]) => {
        setDocuments(docsRes.data)
        setProperty(propRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  // Trier les documents par type (arrivée en premier)
  const sortOrder = ['ARRIVAL_INSTRUCTIONS', 'DEPARTURE_INSTRUCTIONS', 'HOUSE_RULES', 'OTHER']
  const sortedDocs = [...documents].sort(
    (a, b) => sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Guide du logement</h1>
        <p className="text-gray-500 mb-8">
          Toutes les informations utiles pour votre séjour.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Infos pratiques */}
            {property && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations pratiques</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.wifiPassword && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Wifi className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Wi-Fi</p>
                        <p className="text-sm text-gray-600">{property.wifiPassword}</p>
                      </div>
                    </div>
                  )}
                  {property.electricMeterLocation && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Compteur électrique</p>
                        <p className="text-sm text-gray-600">{property.electricMeterLocation}</p>
                      </div>
                    </div>
                  )}
                  {property.waterMeterLocation && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Droplets className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Compteur eau</p>
                        <p className="text-sm text-gray-600">{property.waterMeterLocation}</p>
                      </div>
                    </div>
                  )}
                  {property.parkingInfo && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg mt-0.5">🚗</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Parking</p>
                        <p className="text-sm text-gray-600">{property.parkingInfo}</p>
                      </div>
                    </div>
                  )}
                  {property.trashInfo && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg mt-0.5">🗑️</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Poubelles</p>
                        <p className="text-sm text-gray-600">{property.trashInfo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {sortedDocs.length === 0 ? (
              <div className="card text-center py-8">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun document disponible pour l'instant.</p>
              </div>
            ) : (
              sortedDocs.map((doc) => (
                <div key={doc.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{docTypeIcon[doc.type] || '📄'}</span>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{doc.title}</h2>
                        <p className="text-sm text-gray-500">{docTypeLabel[doc.type]}</p>
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Télécharger
                      </a>
                    )}
                  </div>

                  {/* Photos associées au document */}
                  {doc.photoUrls?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Image className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-500">Photos de référence</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {doc.photoUrls.map((url, index) => (
                          <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                            <img
                              src={url}
                              alt={`Référence ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

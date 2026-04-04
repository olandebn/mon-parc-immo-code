import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const roomTypeEmoji = {
  BEDROOM: '🛏️',
  LIVING_ROOM: '🛋️',
  KITCHEN: '🍳',
  BATHROOM: '🚿',
  TOILET: '🚽',
  TERRACE: '🌿',
  GARAGE: '🚗',
  OTHER: '🏠',
}

export default function RoomCard({ room }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Photo principale de la pièce */}
      {room.photoUrls?.length > 0 && (
        <img
          src={room.photoUrls[0]}
          alt={room.name}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{roomTypeEmoji[room.type] || '🏠'}</span>
          <h3 className="font-semibold text-gray-900">{room.name}</h3>
          {room.floor > 0 && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              Étage {room.floor}
            </span>
          )}
        </div>

        {room.description && (
          <p className="text-sm text-gray-500 mb-3">{room.description}</p>
        )}

        {/* Équipements */}
        {room.equipment?.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {room.equipment.length} équipement{room.equipment.length > 1 ? 's' : ''}
            </button>

            {expanded && (
              <div className="mt-2 flex flex-wrap gap-1">
                {room.equipment.map((item, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

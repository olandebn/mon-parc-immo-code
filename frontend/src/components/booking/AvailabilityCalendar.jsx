import React, { useState } from 'react'

function isBetween(date, start, end) {
  return date > start && date < end
}

function isDisabled(date, unavailableDates) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date < today) return true

  return unavailableDates.some(range => {
    const start = new Date(range.checkIn)
    const end = new Date(range.checkOut)
    return date >= start && date < end
  })
}

function sameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function AvailabilityCalendar({ unavailableDates, selectedDates, onDatesChange }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [hoverDate, setHoverDate] = useState(null)
  const [selectingCheckout, setSelectingCheckout] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  // Construire la grille du mois
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Décaler pour commencer le lundi (1 = lundi en JS, mais getDay() renvoie 0=dim)
  const startOffset = (firstDay.getDay() + 6) % 7

  const days = []
  for (let i = 0; i < startOffset; i++) {
    days.push(null)
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  const handleDayClick = (date) => {
    if (!date || isDisabled(date, unavailableDates)) return

    if (!selectedDates.checkIn || selectingCheckout === false) {
      // Premier clic = arrivée
      onDatesChange({ checkIn: date, checkOut: null })
      setSelectingCheckout(true)
    } else {
      // Deuxième clic = départ
      if (date <= selectedDates.checkIn) {
        // Si on clique avant l'arrivée, on recommence
        onDatesChange({ checkIn: date, checkOut: null })
        return
      }
      // Vérifier qu'aucune date indisponible n'est dans la plage
      const hasConflict = unavailableDates.some(range => {
        const start = new Date(range.checkIn)
        const end = new Date(range.checkOut)
        return start < date && end > selectedDates.checkIn
      })
      if (hasConflict) {
        onDatesChange({ checkIn: date, checkOut: null })
        return
      }
      onDatesChange({ checkIn: selectedDates.checkIn, checkOut: date })
      setSelectingCheckout(false)
    }
  }

  const getDayClass = (date) => {
    if (!date) return ''
    const disabled = isDisabled(date, unavailableDates)
    const isCheckIn = sameDay(date, selectedDates.checkIn)
    const isCheckOut = sameDay(date, selectedDates.checkOut)
    const isInRange = selectedDates.checkIn && selectedDates.checkOut &&
      isBetween(date, selectedDates.checkIn, selectedDates.checkOut)
    const isHovered = hoverDate && selectedDates.checkIn && !selectedDates.checkOut &&
      isBetween(date, selectedDates.checkIn, hoverDate)

    let base = 'relative flex items-center justify-center w-9 h-9 text-sm cursor-pointer rounded-full transition-all mx-auto '

    if (disabled) return base + 'text-red-300 bg-red-50 cursor-not-allowed'
    if (isCheckIn || isCheckOut) return base + 'bg-blue-600 text-white font-semibold'
    if (isInRange || isHovered) return base + 'bg-blue-100 text-blue-800 rounded-none'
    return base + 'text-gray-700 hover:bg-gray-100'
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  return (
    <div className="select-none">
      {/* Navigation du mois */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          disabled={viewDate <= new Date(today.getFullYear(), today.getMonth(), 1)}
        >
          ‹
        </button>
        <h3 className="text-base font-semibold text-gray-900">
          {MONTHS_FR[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          ›
        </button>
      </div>

      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((date, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(date)}
            onMouseEnter={() => date && setHoverDate(date)}
            onMouseLeave={() => setHoverDate(null)}
          >
            {date && (
              <div className={getDayClass(date)}>
                {date.getDate()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span>Sélectionné</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-100" />
          <span>Non disponible</span>
        </div>
      </div>

      {/* Dates sélectionnées */}
      {selectedDates.checkIn && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <p className="text-blue-700">
            <strong>Arrivée :</strong> {selectedDates.checkIn.toLocaleDateString('fr-FR')}
          </p>
          {selectedDates.checkOut ? (
            <p className="text-blue-700">
              <strong>Départ :</strong> {selectedDates.checkOut.toLocaleDateString('fr-FR')}
            </p>
          ) : (
            <p className="text-blue-500 text-xs mt-1">Cliquez sur la date de départ...</p>
          )}
        </div>
      )}
    </div>
  )
}

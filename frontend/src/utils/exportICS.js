/**
 * Génère et télécharge un fichier .ics (iCalendar)
 * Compatible Google Calendar, Apple Calendar, Outlook
 */
export function exportReservationsICS(reservations, calendarName = 'MonParcImmo — Réservations') {
  const escape = (str) => (str || '').replace(/[\\;,\n]/g, '\\$&').replace(/\r/g, '')
  const toICSDate = (dateStr) => dateStr ? dateStr.replace(/-/g, '') : ''

  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

  const events = reservations
    .filter(r => r.checkInDate && r.checkOutDate && r.status !== 'CANCELLED')
    .map(r => {
      const uid = `${r.id || Math.random().toString(36).slice(2)}@monparcimmo`
      const summary = `${r.clientName || 'Voyageur'} — ${r.propertyName || 'Logement'}`
      const description = [
        r.clientEmail ? `Email : ${r.clientEmail}` : '',
        r.clientPhone ? `Tél : ${r.clientPhone}` : '',
        r.numberOfGuests ? `Voyageurs : ${r.numberOfGuests}` : '',
        r.totalPrice ? `Prix : ${r.totalPrice} €` : '',
        r.status ? `Statut : ${r.status}` : '',
      ].filter(Boolean).join('\\n')

      const checkIn  = toICSDate(r.checkInDate)
      const checkOut = toICSDate(r.checkOutDate)

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${checkIn}`,
        `DTEND;VALUE=DATE:${checkOut}`,
        `SUMMARY:${escape(summary)}`,
        `DESCRIPTION:${description}`,
        r.status === 'CONFIRMED' ? 'STATUS:CONFIRMED' : 'STATUS:TENTATIVE',
        'END:VEVENT',
      ].join('\r\n')
    }).join('\r\n')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MonParcImmo//FR',
    `X-WR-CALNAME:${escape(calendarName)}`,
    'X-WR-TIMEZONE:Europe/Paris',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `reservations_monparcimmo.ics`
  a.click()
  URL.revokeObjectURL(a.href)
}

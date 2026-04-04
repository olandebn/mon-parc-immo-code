import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { statsService } from '../../services/api'
import { TrendingUp, TrendingDown, Users, Calendar, Euro, Percent } from 'lucide-react'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function AdminStats() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [yearly, setYearly] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [financial, setFinancial] = useState(null)
  const [occupancy, setOccupancy] = useState(null)
  const [clientsHistory, setClientsHistory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [year])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [yearlyRes, monthlyRes, financialRes, occupancyRes, clientsRes] = await Promise.all([
        statsService.getYearlyStats(year),
        statsService.getBookingsPerMonth(year),
        statsService.getFinancialSummary(year),
        statsService.getOccupancyRate(year),
        statsService.getClientsHistory(),
      ])
      setYearly(yearlyRes.data)
      setMonthly(monthlyRes.data)
      setFinancial(financialRes.data)
      setOccupancy(occupancyRes.data)
      setClientsHistory(clientsRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const maxBookings = monthly ? Math.max(...monthly.bookingsPerMonth, 1) : 1

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900">Statistiques</h1>
          </div>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs principaux */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Réservations</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{yearly?.totalReservations || 0}</p>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Revenus bruts</span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {yearly?.totalRevenue?.toFixed(0) || 0} €
                </p>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">Dépenses</span>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {financial?.totalExpenses?.toFixed(0) || 0} €
                </p>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Euro className="w-4 h-4" />
                  <span className="text-sm">Revenu net</span>
                </div>
                <p className={`text-3xl font-bold ${
                  (financial?.netIncome || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {financial?.netIncome?.toFixed(0) || 0} €
                </p>
              </div>
            </div>

            {/* Graphique réservations par mois */}
            {monthly && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Réservations par mois - {year}
                </h2>
                <div className="flex items-end gap-2 h-40">
                  {MONTHS.map((month, i) => {
                    const count = monthly.bookingsPerMonth[i] || 0
                    const height = maxBookings > 0 ? (count / maxBookings) * 100 : 0
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-gray-700">{count || ''}</span>
                        <div
                          className="w-full bg-blue-600 rounded-t-sm transition-all"
                          style={{ height: `${Math.max(height, count > 0 ? 5 : 0)}%` }}
                          title={`${count} réservation(s)`}
                        />
                        <span className="text-xs text-gray-400">{month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Taux d'occupation */}
            {occupancy && (
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Taux d'occupation {year}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 relative flex items-center justify-center">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke="#e5e7eb" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke="#2563eb" strokeWidth="3.5"
                        strokeDasharray={`${occupancy.occupancyRate} ${100 - occupancy.occupancyRate}`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-2xl font-bold text-blue-600">
                      {occupancy.occupancyRate?.toFixed(0)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">
                      <span className="font-semibold">{occupancy.occupiedDays}</span> nuits louées
                    </p>
                    <p className="text-gray-400 text-sm">
                      sur {occupancy.totalDays} jours en {year}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Séjour moyen : {yearly?.averageStayDuration?.toFixed(1)} nuits
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dépenses par catégorie */}
            {financial?.expensesByCategory && Object.keys(financial.expensesByCategory).length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dépenses par catégorie</h2>
                <div className="space-y-3">
                  {Object.entries(financial.expensesByCategory).map(([cat, amount]) => {
                    const total = financial.totalExpenses || 1
                    const pct = (amount / total) * 100
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{cat}</span>
                          <span className="font-medium">{amount.toFixed(0)} €</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Historique clients */}
            {clientsHistory && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Clients ({clientsHistory.totalClients})
                  </h2>
                </div>
                <div className="space-y-3">
                  {clientsHistory.clients?.map((item) => (
                    <div key={item.client.uid}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.client.firstName} {item.client.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{item.client.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {item.totalReservations} séjour{item.totalReservations > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-green-600">{item.totalSpent?.toFixed(0)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

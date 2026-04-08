import React, { useState, useEffect } from 'react'
import { propertyService } from '../../services/api'
import { Home, ChevronDown } from 'lucide-react'

/**
 * Sélecteur de bien réutilisable pour les pages admin.
 *
 * Props :
 *  - value       : propertyId sélectionné
 *  - onChange    : (propertyId, property) => void
 *  - placeholder : texte par défaut (défaut : "Tous les biens")
 *  - required    : si true, force la sélection d'un bien
 */
export default function PropertySelector({ value, onChange, placeholder = 'Tous les biens', required = false }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    propertyService.getAllProperties()
      .then(res => {
        setProperties(res.data)
        // Si required et un seul bien : sélection auto
        if (required && res.data.length === 1 && !value) {
          onChange(res.data[0].id, res.data[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const selected = properties.find(p => p.id === value)

  const handleChange = (e) => {
    const id = e.target.value
    const prop = properties.find(p => p.id === id) || null
    onChange(id || null, prop)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8,
                    fontSize: 14, color: '#9ca3af' }}>
        <Home style={{ width: 15, height: 15 }} />
        Chargement...
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <Home style={{ position: 'absolute', left: 10, width: 15, height: 15, color: '#6b7280', pointerEvents: 'none', zIndex: 1 }} />
      <select
        value={value || ''}
        onChange={handleChange}
        required={required}
        style={{
          appearance: 'none', WebkitAppearance: 'none',
          padding: '8px 36px 8px 32px',
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 8, fontSize: 14, fontWeight: 500, color: value ? '#111827' : '#6b7280',
          cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
          minWidth: 200,
        }}
      >
        {!required && <option value="">{placeholder}</option>}
        {required && !value && <option value="" disabled>— Choisir un bien —</option>}
        {properties.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}{p.city ? ` · ${p.city}` : ''}
          </option>
        ))}
      </select>
      <ChevronDown style={{ position: 'absolute', right: 10, width: 14, height: 14, color: '#6b7280', pointerEvents: 'none' }} />
    </div>
  )
}

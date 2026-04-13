import React, { useState, useEffect } from 'react'
import { propertyService } from '../../services/api'
import { Home, ChevronDown } from 'lucide-react'

/**
 * Sélecteur de bien réutilisable pour les pages admin.
 * Thème dark amber.
 */
export default function PropertySelector({ value, onChange, placeholder = 'Tous les biens', required = false }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    propertyService.getAllProperties()
      .then(res => {
        setProperties(res.data)
        if (required && res.data.length === 1 && !value) {
          onChange(res.data[0].id, res.data[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const id = e.target.value
    const prop = properties.find(p => p.id === id) || null
    onChange(id || null, prop)
  }

  const baseStyle = {
    appearance: 'none', WebkitAppearance: 'none',
    padding: '9px 36px 9px 34px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, fontSize: 13, fontWeight: 500,
    color: value ? '#f5f0ea' : 'rgba(255,255,255,0.35)',
    cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
    minWidth: 200, transition: 'border-color 0.2s',
  }

  if (loading) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, fontSize: 13, color: '#475569' }}>
        <Home size={14} style={{ color: '#475569' }} />
        Chargement…
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <Home size={14} style={{ position: 'absolute', left: 11, color: '#64748b', pointerEvents: 'none', zIndex: 1 }} />
      <select
        value={value || ''}
        onChange={handleChange}
        required={required}
        style={baseStyle}
        onFocus={e => e.target.style.borderColor = 'rgba(201,136,58,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      >
        {!required && <option value="" style={{ background: '#1a1814', color: '#f5f0ea' }}>{placeholder}</option>}
        {required && !value && <option value="" disabled style={{ background: '#1a1814', color: '#475569' }}>— Choisir un bien —</option>}
        {properties.map(p => (
          <option key={p.id} value={p.id} style={{ background: '#1a1814', color: '#f5f0ea' }}>
            {p.name}{p.city ? ` · ${p.city}` : ''}
          </option>
        ))}
      </select>
      <ChevronDown size={13} style={{ position: 'absolute', right: 10, color: '#64748b', pointerEvents: 'none' }} />
    </div>
  )
}

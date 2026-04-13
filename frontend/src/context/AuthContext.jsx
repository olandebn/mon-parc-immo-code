import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import api from '../services/api'

const AuthContext = createContext(null)

const ROLE_KEY = 'mpi_role' // clé localStorage pour le rôle mis en cache

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]   = useState(null)
  const [userProfile, setUserProfile]   = useState(null)
  const [isAdmin,     setIsAdmin]       = useState(false)
  const [loading,     setLoading]       = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser)

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          // ── 1. Essayer de charger le profil depuis le backend ──────────────
          try {
            const profileResponse = await api.get('/users/me')
            const profile = profileResponse.data
            setUserProfile(profile)

            const admin = profile?.role === 'ADMIN'
            setIsAdmin(admin)
            // Mise en cache du rôle — résiste aux redémarrages / backend down
            localStorage.setItem(ROLE_KEY, profile?.role || 'CLIENT')

          } catch {
            // ── 2. Backend down ou profil inexistant → on utilise le cache ──
            const cached = localStorage.getItem(ROLE_KEY)
            setIsAdmin(cached === 'ADMIN')
            setUserProfile(null)
          }

        } catch (error) {
          console.error('Erreur auth :', error)
        }
      } else {
        delete api.defaults.headers.common['Authorization']
        setUserProfile(null)
        setIsAdmin(false)
        localStorage.removeItem(ROLE_KEY)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Connexion
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Inscription publique
  const register = async (email, password, firstName, lastName, role = 'CLIENT') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const token = await userCredential.user.getIdToken()
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Mise en cache immédiate du rôle choisi
    localStorage.setItem(ROLE_KEY, role)

    try {
      await api.post('/auth/register', { firstName, lastName, email, role }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (backendErr) {
      console.warn('Profil backend non créé (sera retenté) :', backendErr?.message)
    }

    return userCredential
  }

  const logout = async () => {
    localStorage.removeItem(ROLE_KEY)
    await signOut(auth)
  }

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const refreshToken = async () => {
    if (currentUser) {
      const token = await currentUser.getIdToken(true)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return token
    }
  }

  // Passer son propre compte en mode Gérant (ADMIN)
  const becomeAdmin = async () => {
    await api.post('/users/me/become-admin')
    setIsAdmin(true)
    localStorage.setItem(ROLE_KEY, 'ADMIN')
    setUserProfile(prev => prev ? { ...prev, role: 'ADMIN' } : prev)
  }

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    login,
    register,
    logout,
    resetPassword,
    refreshToken,
    becomeAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return context
}

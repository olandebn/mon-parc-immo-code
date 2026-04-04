import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase/config'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser)

      if (firebaseUser) {
        try {
          // Récupérer le token pour les appels API
          const token = await firebaseUser.getIdToken()
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          // Vérifier si admin via les custom claims
          const tokenResult = await firebaseUser.getIdTokenResult()
          setIsAdmin(!!tokenResult.claims.admin)

          // Charger le profil utilisateur
          const profileResponse = await api.get('/users/me')
          setUserProfile(profileResponse.data)
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error)
        }
      } else {
        delete api.defaults.headers.common['Authorization']
        setUserProfile(null)
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential
  }

  const logout = async () => {
    await signOut(auth)
  }

  // Rafraîchir le token Firebase (à appeler avant les requêtes importantes)
  const refreshToken = async () => {
    if (currentUser) {
      const token = await currentUser.getIdToken(true)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return token
    }
  }

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    login,
    logout,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

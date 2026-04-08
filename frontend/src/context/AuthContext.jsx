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
          const token = await firebaseUser.getIdToken()
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          const tokenResult = await firebaseUser.getIdTokenResult()
          setIsAdmin(!!tokenResult.claims.admin)

          // Charger le profil — peut ne pas encore exister juste après l'inscription
          try {
            const profileResponse = await api.get('/users/me')
            setUserProfile(profileResponse.data)
          } catch (profileError) {
            // Profil pas encore créé (inscription en cours) — pas bloquant
            setUserProfile(null)
          }
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

  // Connexion
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Inscription publique
  const register = async (email, password, firstName, lastName) => {
    // 1. Créer le compte Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // 2. Obtenir le token immédiatement
    const token = await userCredential.user.getIdToken()

    // 3. Créer le profil dans Firestore via le backend
    await api.post('/auth/register', { firstName, lastName, email }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // 4. Mettre à jour le header pour les appels suivants
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    return userCredential
  }

  // Déconnexion
  const logout = async () => {
    await signOut(auth)
  }

  // Mot de passe oublié
  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  // Rafraîchir le token Firebase
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
    register,
    logout,
    resetPassword,
    refreshToken,
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

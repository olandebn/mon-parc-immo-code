import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuration Firebase
// À remplacer avec ta vraie config depuis Firebase Console
// Firebase Console > Paramètres du projet > Tes applications > SDK Firebase
const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "mon-parc-immo.firebaseapp.com",
  projectId: "mon-parc-immo",
  storageBucket: "mon-parc-immo.appspot.com",
  messagingSenderId: "TON_MESSAGING_SENDER_ID",
  appId: "TON_APP_ID"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

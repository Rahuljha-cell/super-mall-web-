import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"
import { getFunctions } from "firebase/functions"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2Ze_CKmoZ6q6YTwaFQ5uVss_upULW0lA",
  authDomain: "supermallwebapp-e0aba.firebaseapp.com",
  projectId: "supermallwebapp-e0aba",
  storageBucket: "supermallwebapp-e0aba.appspot.com",
  messagingSenderId: "478107406057",
  appId: "1:478107406057:web:301119e64b399f657eea78",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)
const functions = getFunctions(app)

export { app, db, storage, auth, functions }


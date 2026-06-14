import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';

const firebaseConfig = {
  apiKey: "AIzaSyDdMEocfdhlskp6yAQ7HYKI934Vxn44_Ds",
  authDomain: "semana5db.firebaseapp.com",
  projectId: "semana5db",
  storageBucket: "semana5db.firebasestorage.app",
  messagingSenderId: "241602209671",
  appId: "1:241602209671:web:184b6ca32968d872039522",
  databaseURL: "https://semana5db-default-rtdb.firebaseio.com/"
};

// INICIA FIREBASE
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// AUTENTICACIÓN CON PERSISTENCIA
// getReactNativePersistence se importa con require para compatibilidad con Firebase
let _auth: Auth;
try {
  const { getReactNativePersistence } = require('firebase/auth');
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch {
  _auth = getAuth(app);
}
export const auth = _auth;

// BASE DE DATOS EN TIEMPO REAL
export const db = getDatabase(app);

// ALMACENAMIENTO DE ARCHIVOS
export const storage = getStorage(app);

// FIRESTORE (favoritos de recetas)
export const firestore = getFirestore(app);

export const WEB_CLIENT_ID = "128956149429-29802abc93ef3b5c0fd8fc.apps.googleusercontent.com";
export const REDIRECT_URI = AuthSession.makeRedirectUri();

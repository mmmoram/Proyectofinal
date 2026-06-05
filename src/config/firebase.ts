import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';

// ✅ CONFIGURACIÓN CORRECTA Y COMPLETA
const firebaseConfig = {
  apiKey: "AIzaSyAFsJ-SYJjjhBD46oM1foKAYQxzX9eLy4g",
  authDomain: "base-1b77f.firebaseapp.com",
  databaseURL: "https://base-1b77f.firebaseio.com",
  projectId: "base-1b77f",
  storageBucket: "base-1b77f.firebasestorage.app",
  messagingSenderId: "128956149429",
  appId: "1:128956149429:web:29802abc93ef3b5c0fd8fc"
};

// ✅ INICIALIZAR FIREBASE
export const app = initializeApp(firebaseConfig);

// ✅ AUTENTICACIÓN CON PERSISTENCIA (FUNCIONA EN EXPO)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// ✅ BASE DE DATOS EN TIEMPO REAL
export const db = getDatabase(app);

// ✅ ALMACENAMIENTO DE ARCHIVOS
export const storage = getStorage(app);
export const WEB_CLIENT_ID = "128956149429-29802abc93ef3b5c0fd8fc.apps.googleusercontent.com";
export const REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: true // 👈 EL MISMO NOMBRE DE ARRIBA
} as any);

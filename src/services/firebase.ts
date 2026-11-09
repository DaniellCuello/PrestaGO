import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence es provisto en tiempo de ejecución por @firebase/auth en React Native
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: 'AIzaSyCVp-pyfljijp49RK9jZu0P3WqcOYI6Xis',
  authDomain: 'prestago-2002.firebaseapp.com',
  projectId: 'prestago-2002',
  storageBucket: 'prestago-2002.firebasestorage.app',
  messagingSenderId: '448318812436',
  appId: '1:448318812436:web:b69a18cb8c757fd0329201',
  measurementId: 'G-JESLR4BGY9',
};

// Inicializar Firebase App de forma singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Configuración de autenticación con persistencia en AsyncStorage
let authInstance: any;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
export const db = getFirestore(app);

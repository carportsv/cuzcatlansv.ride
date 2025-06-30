// services/userFirestore.ts

import firestore from '@react-native-firebase/firestore';

const db = firestore();

// Obtiene los datos del usuario por su ID
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      console.warn('No se encontraron datos para el usuario:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    return null;
  }
};

// Guarda o actualiza datos del usuario
export const saveUserData = async (userId: string, data: any) => {
  try {
    await db.collection('users').doc(userId).set(data, { merge: true });
  } catch (error) {
    console.error('Error al guardar los datos del usuario:', error);
  }
};

// Obtiene el rol del usuario por su UID
export const getUserRoleFromFirestore = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    const data = userDoc.data();
    return data?.role || null;
  } catch (error) {
    console.error('Error al obtener el rol del usuario desde Firestore:', error);
    return null;
  }
};

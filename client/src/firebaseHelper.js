import { ref, set, onValue } from 'firebase/database';
import { database } from './firebase-config';

// Simpan teks ke Firebase
export const saveTextToFirebase = async (path, text) => {
  const textRef = ref(database, path);
  await set(textRef, text);
};

// Dengarkan perubahan teks di Firebase
export const listenToFirebaseText = (path, onSuccess, onError) => {
  const textRef = ref(database, path);
  const unsubscribe = onValue(
    textRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onSuccess(data);
      }
    },
    (error) => {
      onError(error);
    }
  );

  return unsubscribe;
};


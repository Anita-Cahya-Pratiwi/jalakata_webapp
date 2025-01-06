import { ref, set, onValue, off, get, update } from 'firebase/database';
import { database } from './firebase-config';

// Simpan teks ke Firebase
export const saveTextToFirebase = async (path, rawContent) => {
  try {
    const textRef = ref(database, path);
    await set(textRef, rawContent);
  } catch (error) {
    console.error("Gagal menyimpan ke Firebase:", error);
    throw new Error('Gagal menyimpan teks ke Firebase.');
  }
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
      } else {
        // Kirim data default jika tidak ada data valid
        onSuccess({
          blocks: [],
          entityMap: {}
        });
      }
    },
    (error) => {
      console.error("Kesalahan Firebase:", error);
      onError(error);
    }
  );

  // Kembalikan fungsi untuk menghentikan listener
  return () => {
    off(textRef, 'value');
  };
};

// Fungsi untuk memperbarui daftar pengguna aktif
export const updateActiveUsers = async (path, userId, isActive) => {
  try {
    const activeUsersRef = ref(database, `${path}/activeUsers`);
    const snapshot = await get(activeUsersRef);

    let activeUsers = snapshot.val() || {};

    if (isActive) {
      // Tandai pengguna sebagai aktif
      activeUsers[userId] = Date.now(); // Menyimpan waktu pengguna aktif
    } else {
      // Hapus pengguna dari daftar jika tidak aktif
      delete activeUsers[userId];
    }

    // Perbarui data pengguna aktif
    await update(activeUsersRef, activeUsers);

  } catch (error) {
    console.error('Gagal memperbarui pengguna aktif:', error);
    throw error;
  }
};

// Fungsi untuk mendengarkan perubahan pada daftar pengguna aktif
export const listenToActiveUsers = (path, callback, errorCallback) => {
  const activeUsersRef = ref(database, `${path}/activeUsers`);
  const unsubscribe = onValue(
    activeUsersRef,
    (snapshot) => {
      const activeUsers = snapshot.val() || {};

      // Filter pengguna aktif berdasarkan waktu (misalnya, aktif dalam 5 menit terakhir)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const filteredActiveUsers = Object.entries(activeUsers).reduce(
        (result, [userId, timestamp]) => {
          if (timestamp > fiveMinutesAgo) {
            result[userId] = timestamp;
          }
          return result;
        },
        {}
      );

      callback(filteredActiveUsers);
    },
    (error) => {
      console.error('Gagal memuat pengguna aktif:', error);
      errorCallback(error);
    }
  );

  // Kembalikan fungsi untuk menghentikan listener
  return () => {
    off(activeUsersRef, 'value');
  };
};

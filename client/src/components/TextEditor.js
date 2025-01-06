import React, { useState, useEffect } from 'react';
import { saveTextToFirebase, listenToFirebaseText } from '../firebaseHelper';

const TextEditor = () => {
  const [text, setText] = useState(''); // State untuk menyimpan teks
  const [error, setError] = useState(null); // State untuk pesan error

  // Fungsi untuk menangani perubahan teks
  const handleTextChange = (event) => {
    const newText = event.target.value; // Mendapatkan teks terbaru
    setText(newText); // Update state teks

    // Simpan teks ke Firebase
    saveTextToFirebase('documents/jalakata', newText).catch((err) => {
      setError('Gagal menyimpan teks ke server.');
      console.error(err);
    });
  };

  // Menggunakan useEffect untuk mendengarkan perubahan teks di Firebase
  useEffect(() => {
    // Listener untuk teks di Firebase
    const unsubscribe = listenToFirebaseText(
      'documents/jalakata',
      (newText) => {
        setText(newText); // Update state teks
      },
      (err) => {
        setError('Gagal memuat teks dari server.');
        console.error(err);
      }
    );

    // Bersihkan listener saat komponen di-unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Jalakata</h1>
      {error && <p className="error-message">{error}</p>} 
      {(
        <textarea
          value={text} // Menampilkan teks dari state
          onChange={handleTextChange} // Menyimpan teks ke Firebase saat ada perubahan
          rows="10"
          cols="50"
        />
      )}
    </div>
  );
};

export default TextEditor;

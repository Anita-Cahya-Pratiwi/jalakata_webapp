import React, { useState, useEffect } from 'react';
import { database, ref, set } from '../firebase-config'; 
import { onValue } from 'firebase/database';  

const TextEditor = () => {
  const [text, setText] = useState(''); 

  // Fungsi untuk menangani perubahan teks di textarea
  const handleTextChange = (event) => {
    const newText = event.target.value; // Mendapatkan teks yang baru
    setText(newText); // Update state teks 

    // Kirimkan teks baru ke Firebase secara langsung
    const textRef = ref(database, 'textEditorData'); // Menentukan path di Firebase
    set(textRef, { text: newText }); // Menyimpan teks ke Firebase
  };

  // Menggunakan useEffect untuk mendengarkan perubahan teks di Firebase
  useEffect(() => {
    const textRef = ref(database, 'textEditorData'); // Mendefinisikan referensi yang sama di Firebase
    const unsubscribe = onValue(textRef, (snapshot) => {
      const data = snapshot.val(); // Mendapatkan data terbaru dari Firebase
      if (data && data.text) {
        setText(data.text);  // Update state teks jika ada perubahan
      }
    });

    // Hentikan listener saat komponen di-unmount
    return () => {
      unsubscribe(); // Menghentikan listener ketika komponen dihapus
    };
  }, []); // useEffect hanya dijalankan sekali saat pertama kali dimuat

  return (
    <div>
      <h1>Jalakata</h1>
      <textarea
        value={text} // Menampilkan teks dari state
        onChange={handleTextChange} // Mengupdate teks dan mengirimkan ke Firebase
        rows="10"
        cols="50"
      />
    </div>
  );
};

export default TextEditor;

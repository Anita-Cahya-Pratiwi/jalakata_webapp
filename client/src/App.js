import React, { useEffect, useState } from "react";
import Auth from "./components/Auth";
import TextEditor from "./components/TextEditor";
import { auth } from './firebase-config';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Fungsi logout 
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null); //status pengguna menjadi null setelah logout
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("User status berubah: ", user); 
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <h1>Dokumen Kolaboratif Jalakata</h1>
      {!user && <Auth setUser={setUser} />}
       {user && (
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}
      {user ? <TextEditor user={user} /> : <p>Silakan masuk untuk mengakses halaman teks editor.</p>}
    </div>
  );
}

export default App;

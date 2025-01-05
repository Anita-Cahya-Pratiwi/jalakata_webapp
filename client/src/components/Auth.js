import React, { useState, useEffect } from 'react';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import './login.css';

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(''); // Reset pesan error
    } catch (error) {
      // Tangani pesan error berdasarkan kode error dari Firebase
      if (error.code === 'auth/user-not-found') {
        setError('Pengguna tidak terdaftar.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Password salah.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else {
        setError('Terjadi kesalahan, Silakan coba lagi.');
      }
      console.error("Error logging in: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set pengguna jika sudah login
    });
    return () => unsubscribe();
  }, [setUser]);

  return (
    <div>
      <div className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Auth;

import React, { useEffect, useState } from 'react';
import ChatRoom from './ChatRoom';
import UserContext from './UserContext';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FiLoader } from 'react-icons/fi';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null);
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign-in error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <FiLoader className="animate-spin" size={48} />
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="app-container">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
              aria-label="Close"
            />
          </div>
        )}

        {user ? (
          <ChatRoom />
        ) : (
          <div className="auth-container d-flex justify-content-center align-items-center vh-100">
            <div className="auth-card p-5 rounded shadow-sm text-center">
              <h2 className="mb-4">Welcome to ChatApp</h2>
              <p className="text-muted mb-4">
                Sign in with your Google account to start chatting
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleSignIn}
                disabled={loading}
              >
                Sign in with Google
              </button>
            </div>
          </div>
        )}
      </div>
    </UserContext.Provider>
  );
};

export default App;
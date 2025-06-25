import React, { useEffect, useState } from 'react';
import ChatRoom from './ChatRoom';
import UserContext from './UserContext';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="container mt-4 text-center">
        {user ? (
          <>
            <button className="btn btn-danger mb-3" onClick={handleSignOut}>Sign Out</button>
            <ChatRoom />
          </>
        ) : (
          <>
            <h3>Welcome to Firebase Chat App</h3>
            <button className="btn btn-primary" onClick={handleSignIn}>Sign in with Google</button>
          </>
        )}
      </div>
    </UserContext.Provider>
  );
};

export default App;

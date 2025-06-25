import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCEZbcTJl8ggsGfxAf3T59m41OPeOze6jU",
  authDomain: "chat-app-8d1f5.firebaseapp.com",
  databaseURL: "https://chat-app-8d1f5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-app-8d1f5",
  storageBucket: "chat-app-8d1f5.appspot.com",
  messagingSenderId: "203139913976",
  appId: "1:203139913976:web:0fd929bd0996271a46c30d",
  measurementId: "G-11CTN5PMZK"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };

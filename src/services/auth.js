import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export const adminLogin = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const adminLogout = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

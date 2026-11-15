'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'elderly' | 'caretaker' | 'family';
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserProfile(firebaseUser: User) {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile({ uid: firebaseUser.uid, ...data });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function getIdToken(): Promise<string> {
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  }

  async function signInWithGoogle() {
    if (!auth || !googleProvider) throw new Error('Auth not initialized');
    const result = await signInWithPopup(auth, googleProvider);
    await fetchUserProfile(result.user);
  }

  async function signInWithEmail(email: string, password: string) {
    if (!auth) throw new Error('Auth not initialized');
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserProfile(result.user);
  }

  async function signUpWithEmail(email: string, password: string, name: string, role: string) {
    if (!auth) throw new Error('Auth not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, role }),
    });
    await fetchUserProfile(result.user);
  }

  async function signOut() {
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

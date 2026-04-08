import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, role: UserRole, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setRole: (role: UserRole, schoolId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const superAdminEmail = "digitalsoutien@gmail.com";
        
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          // Auto-upgrade to admin if email matches super admin
          if (profile.email === superAdminEmail && profile.role !== 'admin') {
            const updatedProfile = { ...profile, role: 'admin' as const };
            await setDoc(doc(db, 'users', firebaseUser.uid), updatedProfile, { merge: true });
            setUserProfile(updatedProfile);
          } else {
            setUserProfile(profile);
          }
        } else {
          // Default profile
          const isSuperAdmin = firebaseUser.email === superAdminEmail;
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: isSuperAdmin ? 'admin' : 'personal',
            createdAt: Timestamp.now(),
            preferences: {
              theme: 'light',
              language: 'fr',
              consentStatus: false,
            },
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signupWithEmail = async (email: string, pass: string, role: UserRole, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    
    await updateFirebaseProfile(firebaseUser, { displayName });

    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: displayName,
      role: role,
      createdAt: Timestamp.now(),
      preferences: {
        theme: 'light',
        language: 'fr',
        consentStatus: false,
      },
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
    setUserProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    const newProfile = { ...userProfile, ...updates } as UserProfile;
    await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
    setUserProfile(newProfile);
  };

  const setRole = async (role: UserRole, schoolId?: string) => {
    if (!user || !userProfile) return;
    const updates: Partial<UserProfile> = { role };
    if (schoolId) updates.schoolId = schoolId;
    await updateProfile(updates);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      loginWithGoogle, 
      loginWithEmail,
      signupWithEmail,
      logout, 
      updateProfile,
      setRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

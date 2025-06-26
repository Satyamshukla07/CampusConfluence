import { useState, useEffect, createContext, useContext } from 'react';
import { User, onAuthStateChange, signInWithGoogle, signOutUser } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  userRole: 'admin' | 'master_trainer' | 'college_admin' | 'recruiter' | 'student' | null;
  collegeId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'master_trainer' | 'college_admin' | 'recruiter' | 'student' | null>(null);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user role and college from backend
        try {
          const response = await fetch(`/api/auth/user-profile?email=${firebaseUser.email}`);
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
            setCollegeId(userData.collegeId);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserRole(null);
        setCollegeId(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    userRole,
    collegeId,
  };
};

export { AuthContext };
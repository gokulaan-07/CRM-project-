import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password?: string; role?: string; phone?: string; department?: string }) => Promise<void>;
  logout: () => void;
  switchUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  loading: boolean;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const refreshUsers = async () => {
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);
      return fetchedUsers;
    } catch (err) {
      console.error('Failed to load users:', err);
      return [];
    }
  };

  const initAuth = async () => {
    setLoading(true);
    try {
      await refreshUsers();

      // Check if there is an active session or profile with stored token
      const me = await api.getMe();
      if (me) {
        setCurrentUser(me);
      } else {
        // Not authenticated - require login
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await api.login(email, password);
      setCurrentUser(user);
      await refreshUsers();
      showToast(`Welcome back, ${user.name}! (${user.role === 'admin' ? 'Admin / Manager' : 'Sales Representative'})`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData: { name: string; email: string; password?: string; role?: string; phone?: string; department?: string }) => {
    try {
      const { user } = await api.register(userData);
      setCurrentUser(user);
      await refreshUsers();
      showToast(`Account created for ${user.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  };

  const switchUser = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);
      showToast(`Switched active user to ${res.user.name} (${res.user.role === 'admin' ? 'Admin / Manager' : 'Sales Rep'})`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch user', 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAdmin: currentUser?.role === 'admin',
        login,
        register,
        logout,
        switchUser,
        refreshUsers,
        loading,
        toast,
        showToast
      }}
    >
      {children}
      {toast && (
        <div
          id="global-toast-notification"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold transition-all transform animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-600 text-emerald-100 shadow-emerald-950/40'
              : toast.type === 'error'
              ? 'bg-rose-950/95 border-rose-600 text-rose-100 shadow-rose-950/40'
              : 'bg-indigo-950/95 border-indigo-600 text-indigo-100 shadow-indigo-950/40'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-rose-400' : 'bg-indigo-400'
          }`} />
          <span>{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

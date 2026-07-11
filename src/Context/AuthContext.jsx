import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getToken,
  saveToken,
  clearToken,
  getSessionUser,
  saveSessionUser,
  clearSessionUser,
  deleteUserAccount,
} from '../Utils/secureAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSignOut, setIsSignOut] = useState(false);

  // Initialize auth state — token from secure keystore, profile from local store
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await getToken();
        const storedUser = await getSessionUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          const storedStars = await AsyncStorage.getItem(`stars_${storedUser.id}`);
          setStars(storedStars ? parseInt(storedStars, 10) : 0);
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginSuccess = useCallback(async (userData, accessToken) => {
    setIsSignOut(false);
    setUser(userData);
    setToken(accessToken);
    await saveToken(accessToken);
    await saveSessionUser(userData);

    const storedStars = await AsyncStorage.getItem(`stars_${userData.id}`);
    setStars(storedStars ? parseInt(storedStars, 10) : 0);
  }, []);

  const logout = useCallback(async () => {
    setIsSignOut(true);
    setUser(null);
    setToken(null);
    setStars(0);
    await clearToken();
    await clearSessionUser();
  }, []);

  // Permanently removes the account + all associated on-device data.
  const deleteAccount = useCallback(async () => {
    const current = user;
    setIsSignOut(true);
    setUser(null);
    setToken(null);
    setStars(0);
    if (current?.id) {
      await deleteUserAccount(current.id);
    } else {
      await clearToken();
      await clearSessionUser();
    }
  }, [user]);

  const addStars = useCallback((count) => {
    if (!user) return;
    // Functional update so rapid successive awards (e.g. a game match plus
    // its win bonus) can't clobber each other via a stale `stars` closure.
    setStars((prev) => {
      const nextStars = prev + count;
      AsyncStorage.setItem(`stars_${user.id}`, nextStars.toString()).catch((error) => {
        console.warn('Failed to save stars:', error);
      });
      return nextStars;
    });
  }, [user]);

  const value = {
    user,
    token,
    stars,
    loading,
    isSignOut,
    isAuthenticated: !!user,
    loginSuccess,
    logout,
    deleteAccount,
    addStars,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

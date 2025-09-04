'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { deleteAccessTokenCookie } from '@/app/actions/auth'; // Import the server action

// Define the shape of your user object
interface User {
  id: string;
  role: 'VOLUNTEER' | 'ADMIN';
  contact: string;
  consent_face_qr: boolean;
  // Add other user-related fields as needed
}

// Define the shape of your authentication context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (newToken: string) => Promise<void>;
  logout: () => void;
  // Add other auth-related functions/states
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define your backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch user data from the backend /auth/me endpoint
  const fetchUser = async (userToken: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // If token is invalid or expired, log out
        console.error('Failed to fetch user data:', response.statusText);
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function: stores token and fetches user data
  const login = async (newToken: string) => {
    localStorage.setItem('accessToken', newToken);
    setToken(newToken);
    await fetchUser(newToken);
  };

  // Logout function: clears token and user data
  const logout = async () => { // Made async to await deleteAccessTokenCookie
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false); // Ensure loading is false on logout
    await deleteAccessTokenCookie(); // Delete the cookie
  };

  // Effect to load token from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false); // No token, so not loading auth state
    }
  }, []);

  // Provide the auth context values to children
  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

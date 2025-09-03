'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: { username: string; role: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    setToken(storedToken);
    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({ username: userData.contact, role: userData.role }); // Assuming backend returns contact and role
      } else {
        console.error("Failed to fetch user data after login.", response.statusText);
        logout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
    fetchUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    // Redirect to login page after logout (optional)
    // window.location.href = "/auth/sign-in";
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

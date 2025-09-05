'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth'; // Renamed and imported as logoutAction
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'; // Import axios and types

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
  token: string | null; // This will be the access token
  isAuthenticated: boolean;
  isLoading: boolean; // Renamed 'loading' to 'isLoading' for consistency
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  axiosInstance: AxiosInstance; // Expose axios instance for API calls
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define your backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null); // Renamed 'token' to 'accessToken'
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Renamed 'loading' to 'isLoading'

  // Create an Axios instance
  const axiosInstance: AxiosInstance = axios.create({
    baseURL: BACKEND_API_URL,
    withCredentials: true, // Crucial for sending HttpOnly cookies
  });

  // Function to fetch user data from the backend /auth/me endpoint
  const fetchUser = useCallback(async (tokenToUse: string) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
        },
      });

      if (response.status === 200) {
        const userData: User = response.data;
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.error('Failed to fetch user data:', response.statusText);
        await logout(); // Use the local logout function
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      await logout(); // Use the local logout function
    } finally {
      setIsLoading(false);
    }
  }, [axiosInstance]); // Depend on axiosInstance

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await axiosInstance.post('/auth/refresh');
      if (response.status === 200) {
        const newAccessToken = response.data.access_token;
        setAccessToken(newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout(); // Use the local logout function
      return null;
    }
  }, [axiosInstance]);

  // Axios request interceptor
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        if (!accessToken) {
          // If no access token, try to refresh
          const newToken = await refreshAccessToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          } else {
            // If refresh fails, reject the request and logout
            return Promise.reject(new AxiosError('No access token available.', 'AUTH_ERROR', config, null, { status: 401 } as AxiosResponse));
          }
        } else {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, [accessToken, axiosInstance, refreshAccessToken]);

  // Axios response interceptor for handling expired access tokens
  useEffect(() => {
    const errorInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and it's not the refresh token endpoint itself
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true; // Mark request as retried
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest); // Retry the original request with the new token
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(errorInterceptor);
    };
  }, [axiosInstance, refreshAccessToken]);


  // Login function: stores access token and fetches user data
  const login = useCallback(async (newAccessToken: string) => {
    setAccessToken(newAccessToken);
    await fetchUser(newAccessToken);
  }, [fetchUser]);

  // Logout function: calls backend logout and clears local state
  const logout = useCallback(async () => {
    try {
      await logoutAction(); // Call the server action to clear cookie and DB entry
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/sign-in'); // Redirect to login page
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);


  // Effect to perform initial authentication check (try to refresh token)
  useEffect(() => {
    const initialAuthCheck = async () => {
      setIsLoading(true);
      const newAccessToken = await refreshAccessToken(); // This will try to use the HttpOnly refresh token
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        await fetchUser(newAccessToken);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
      }
      setIsLoading(false);
    };

    initialAuthCheck();
  }, [fetchUser, refreshAccessToken]); // Only run once on mount


  // Provide the auth context values to children
  return (
    <AuthContext.Provider value={{ user, token: accessToken, isAuthenticated, isLoading, login, logout, axiosInstance }}>
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

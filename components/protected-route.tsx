"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'VOLUNTEER' | 'ADMIN';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to sign-in page if not authenticated
        router.push('/auth/sign-in');
      } else if (requiredRole && user?.role !== requiredRole) {
        // Redirect to home or an unauthorized page if role doesn't match
        console.warn(`Access denied: User role "${user?.role}" does not match required role "${requiredRole}"`);
        router.push('/'); // Or a dedicated /unauthorized page
      }
    }
  }, [isAuthenticated, loading, user, requiredRole, router]);

  if (loading || !isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    // Optionally render a loading spinner or a message
    return <div className="flex h-screen items-center justify-center">Loading or redirecting...</div>;
  }

  return <>{children}</>;
};

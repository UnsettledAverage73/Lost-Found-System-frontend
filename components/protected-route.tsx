"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Optional: specify a role required to access this route
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/sign-in'); // Redirect unauthenticated users
    } else if (!loading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push('/'); // Redirect users with incorrect roles
    }
  }, [isAuthenticated, loading, router, requiredRole, user]);

  if (loading || (!isAuthenticated && !loading) || (isAuthenticated && requiredRole && user?.role !== requiredRole)) {
    return <div>Loading authentication...</div>; // Or a more elaborate loading/redirecting indicator
  }

  return <>{children}</>;
};

export default ProtectedRoute;

"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('seeker' | 'recruiter' | 'admin')[];
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireOnboarding = false
}: ProtectedRouteProps) {
  const { user, hasHydrated, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated() || !user) {
      // If local storage is missing but cookie exists, we are in an infinite loop.
      // Force clear the server cookie before redirecting to login.
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        router.replace('/login');
      });
      return;
    }

    if (requireOnboarding && !user.onboardingCompleted && pathname !== '/onboarding') {
      router.replace('/onboarding');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role as 'seeker' | 'recruiter' | 'admin')) {
      const redirectPath = user.role === 'admin' 
        ? '/dashboard/admin' 
        : user.role === 'recruiter' 
          ? '/dashboard/recruiter' 
          : '/dashboard';
      
      if (pathname !== redirectPath) {
        router.replace(redirectPath);
      }
    }
  }, [hasHydrated, isAuthenticated, user, router, requireOnboarding, allowedRoles, pathname]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Prevent flash of protected content while redirecting
  if (!isAuthenticated() || !user) return null;
  if (requireOnboarding && !user.onboardingCompleted && pathname !== '/onboarding') return null;
  if (allowedRoles && !allowedRoles.includes(user.role as 'seeker' | 'recruiter' | 'admin')) return null;

  return <>{children}</>;
}

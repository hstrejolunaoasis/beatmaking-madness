'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';

interface DevModeProviderProps {
  children: React.ReactNode;
}

// Helper function to set a cookie for server-side checking
function setCookie(name: string, value: string, days: number) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

export function DevModeProvider({ children }: DevModeProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  
  // Check if we're in development mode
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  
  useEffect(() => {
    // Check if dev session is active from localStorage
    const storedDevMode = localStorage.getItem('dev-mode') === 'true';
    setDevModeEnabled(storedDevMode);
    
    // If dev mode is enabled in localStorage, also ensure the cookie is set
    if (storedDevMode) {
      setCookie('dev-mode', 'true', 1); // 1 day expiry
    }
  }, []);
  
  useEffect(() => {
    // Handle dev session query param
    if (isDevMode && searchParams.has('dev-session')) {
      // Create a new URL without the dev-session param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('dev-session');
      
      // Push new URL without the param
      const newPathname = newParams.toString() 
        ? `${pathname}?${newParams.toString()}`
        : pathname;
          
      toast.success('Dev Mode Enabled', {
        description: 'You now have access to the dashboard with a mock user session.',
      });
      
      // Store in localStorage and set cookie
      localStorage.setItem('dev-mode', 'true');
      setCookie('dev-mode', 'true', 1); // 1 day expiry
      setDevModeEnabled(true);
      router.replace(newPathname);
    }
  }, [isDevMode, searchParams, pathname, router]);
  
  const toggleDevMode = () => {
    if (devModeEnabled) {
      // Disable dev mode
      localStorage.removeItem('dev-mode');
      setCookie('dev-mode', '', -1); // Delete the cookie
      setDevModeEnabled(false);
      toast.info('Dev Mode Disabled', {
        description: 'Mock user session removed.',
      });
      
      // Redirect away from protected routes
      if (pathname.startsWith('/dashboard')) {
        router.push('/');
      }
    } else {
      // Enable dev mode
      localStorage.setItem('dev-mode', 'true');
      setCookie('dev-mode', 'true', 1); // 1 day expiry
      setDevModeEnabled(true);
      toast.success('Dev Mode Enabled', {
        description: 'You now have access to the dashboard with a mock user session.',
      });
    }
  };
  
  if (!isDevMode) {
    return <>{children}</>;
  }
  
  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2 items-center">
        {devModeEnabled && (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Dev Mode
          </Badge>
        )}
        <Button
          size="sm"
          variant={devModeEnabled ? "destructive" : "default"}
          onClick={toggleDevMode}
          className="shadow-md"
        >
          {devModeEnabled ? "Disable" : "Enable"} Dev Mode
        </Button>
      </div>
      <Toaster />
    </>
  );
} 
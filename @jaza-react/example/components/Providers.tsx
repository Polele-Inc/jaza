'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  JazaProvider,
  type InitResult,
} from '@jazadev/react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppPrefsProvider, useAppPrefs } from '@/lib/app-prefs';
import { apiFetch } from '@/lib/api';

/** Neutral shell — avoid theme/OS branching on the first paint (hydration-safe). */
function BootShell({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f7f9f8',
        color: '#006b5f',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {label}
    </div>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading, signOut, setAuthError } = useAuth();
  const { themePreference, locale } = useAppPrefs();
  const pathname = usePathname();
  const router = useRouter();
  // Defer auth-dependent tree until after mount so SSR HTML always matches
  // the first client render (session lives in localStorage only).
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const onSignInRoute = pathname === '/';

  useEffect(() => {
    if (!ready || loading) return;
    if (!session && !onSignInRoute) {
      router.replace('/');
    } else if (session && onSignInRoute) {
      router.replace('/home');
    }
  }, [ready, session, loading, onSignInRoute, router]);

  const getSession = useCallback(async (): Promise<InitResult> => {
    if (!session) throw new Error('Not signed in');
    const res = await apiFetch('/api/jaza/init', {
      method: 'POST',
      userId: session.userId,
    });
    const data = (await res.json().catch(() => ({}))) as InitResult & {
      message?: string;
    };
    if (!res.ok) {
      throw new Error(data.message ?? 'Jaza init failed');
    }
    return data;
  }, [session]);

  const onAuthError = useCallback(
    (error: Error) => {
      console.warn('[jaza] session auth failed', error.message);
      setAuthError(
        error.message ||
          'Jaza session failed. If you switched sandbox/live keys, sign in again to remint the customer.',
      );
      router.replace('/');
      void signOut();
    },
    [router, setAuthError, signOut],
  );

  if (!ready || loading) {
    return <BootShell />;
  }

  if (!session) {
    if (!onSignInRoute) {
      return <BootShell />;
    }
    return <>{children}</>;
  }

  return (
    <JazaProvider
      publishableKey={process.env.NEXT_PUBLIC_JAZA_PUBLISHABLE_KEY!}
      apiBaseUrl={process.env.NEXT_PUBLIC_JAZA_API_BASE_URL}
      getSession={getSession}
      onAuthError={onAuthError}
      theme={themePreference}
      locale={locale}
    >
      {children}
    </JazaProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppPrefsProvider>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </AppPrefsProvider>
  );
}

import type { ReactNode } from 'react';
import { Providers } from '@/components/Providers';
import '@jazadev/react/styles.css';

export const metadata = {
  title: 'Jaza React example',
  description: 'Next.js sample for @jazadev/react with local BFF routes',
  icons: {
    icon: [
      { url: '/icon.svg' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
  },
};

/** suppressHydrationWarning on html/body: extensions (Grammarly, etc.) inject attrs. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          margin: 0,
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

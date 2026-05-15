'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { Providers } from "@/components/Providers";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Providers>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </Providers>
    </GoogleOAuthProvider>
  );
}
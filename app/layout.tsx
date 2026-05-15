'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bookstore - Your Literary Haven",
  description: "Khám phá những cuốn sách tuyệt vời với giá cả hợp lý",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={googleClientId}>  {/* Wrap xung quanh */}
          <Providers>
            <AuthProvider>
              <LanguageProvider>
                {children}
              </LanguageProvider>
            </AuthProvider>
          </Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}


import { NextResponse } from 'next/server';

export async function GET() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=missing_google_client_id`
    );
  }

  // Cấu hình OAuth parameters
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
  
  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  console.log('Redirecting to Google OAuth:', googleAuthUrl);
  
  return NextResponse.redirect(googleAuthUrl);
}
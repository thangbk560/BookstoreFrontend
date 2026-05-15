import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Log để debug
  console.log('Google callback received:', {
    hasCode: !!code,
    error: error,
    allParams: Object.fromEntries(searchParams.entries())
  });

  // Xử lý lỗi từ Google
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=google_${error}`
    );
  }

  if (!code) {
    console.error('No code received from Google');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=no_code`
    );
  }

  try {
    // Gửi code sang backend NestJS để lấy user info và token
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const backendCallbackUrl = `${backendUrl}/api/auth/google/callback?code=${code}`;
    
    console.log('Calling backend:', backendCallbackUrl);
    
    const response = await fetch(backendCallbackUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response:', { hasToken: !!data.access_token });

    if (!data.access_token || !data.refresh_token) {
      throw new Error('Invalid response from backend');
    }

    // Redirect về frontend callback page với token
    const frontendCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?access_token=${data.access_token}&refresh_token=${data.refresh_token}`;
    
    return NextResponse.redirect(frontendCallbackUrl);
    
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=auth_failed`
    );
  }
}
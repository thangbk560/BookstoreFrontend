import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL;
  
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: googleClientId!,
    redirect_uri: redirectUri!,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
  });
  
  res.redirect(googleAuthUrl);
}
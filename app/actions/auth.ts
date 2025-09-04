// frontend/app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';

export async function setAccessTokenCookie(token: string) {
  cookies().set('accessToken', token, {
    httpOnly: true, // Recommended for security
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function deleteAccessTokenCookie() {
  cookies().delete('accessToken');
}

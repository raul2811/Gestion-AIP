import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: Request) {
  // Clear the session cookie by setting its maxAge to 0 (expires immediately)
  const serialized = serialize('sessionToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Immediately expire the cookie
    path: '/',
  });

  return new NextResponse(JSON.stringify({ message: 'Sesión cerrada exitosamente' }), {
    status: 200,
    headers: { 'Set-Cookie': serialized },
  });
}
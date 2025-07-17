// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Import your authentication utility

export async function GET() {
  try {
    const session = await auth(); // Attempt to authenticate the user based on cookie

    if (!session) {
      // If no valid session is found, return 401 Unauthorized
      return NextResponse.json({ message: 'No autenticado o sesión inválida.' }, { status: 401 });
    }

    // If session is valid, return the user ID and roles
    return NextResponse.json({ userId: session.userId, roles: session.roles });

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    // Return a generic server error message
    return NextResponse.json({ message: 'Error interno del servidor al verificar la sesión.' }, { status: 500 });
  }
}
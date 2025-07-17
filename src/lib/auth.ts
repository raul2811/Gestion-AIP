import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';

export async function auth() {
  const cookieStore = await cookies(); // <-- CORREGIDO
  const sessionCookie = cookieStore.get('sessionToken');
  if (!sessionCookie || !sessionCookie.value) return null;

  const token = sessionCookie.value;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Type guard para JwtPayload
    if (typeof decoded === 'object' && decoded !== null) {
      return {
        user: {
          userId: (decoded as JwtPayload).userId ?? null,
          rol: (decoded as JwtPayload).rol ?? null,
        }
      };
    }
    return null;
  } catch (err) {
    console.error('JWT error:', err);
    return null;
  }
}
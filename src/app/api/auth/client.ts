// src/lib/auth/client.ts
'use client';

export async function getClientSession() {
  const response = await fetch('/api/auth/session');
  return await response.json();
}
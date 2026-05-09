import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request) {
  try {
    const { response: authResponse } = await requireAuth();

    if (authResponse) {
      return authResponse;
    }

    const response = NextResponse.json({
      message: 'Logged out successfully',
    });

    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('__Host-next-auth.csrf-token');
    response.cookies.delete('next-auth.callback-url');
    response.cookies.delete('__Secure-next-auth.callback-url');

    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

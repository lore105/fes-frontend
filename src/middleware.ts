import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('fes_token')?.value;
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        // If already logged in redirect to dashboard
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Protect all other routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
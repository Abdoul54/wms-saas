import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']
const DEFAULT_REDIRECT = '/'

export async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const { nextUrl } = req
    const isLoggedIn = !!token
    const isPublic = PUBLIC_ROUTES.includes(nextUrl.pathname)

    // ✅ Must be first — a broken token should not count as "logged in"
    if (token?.error === 'RefreshTokenError') {
        if (isPublic) return NextResponse.next() // already on login, let through
        const loginUrl = new URL('/login', nextUrl.origin)
        loginUrl.searchParams.set('error', 'SessionExpired')
        return NextResponse.redirect(loginUrl)
    }

    if (!isLoggedIn && !isPublic) {
        const loginUrl = new URL('/login', nextUrl.origin)
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (isLoggedIn && isPublic) {
        return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl.origin))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
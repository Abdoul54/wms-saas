import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']
const DEFAULT_REDIRECT = '/'

export default withAuth(
    function proxy(req) {
        const token = req.nextauth.token
        const { nextUrl } = req
        const isPublic = PUBLIC_ROUTES.includes(nextUrl.pathname)
        const isLoggedIn = !!token

        // Broken session — redirect to login regardless of route
        if (token?.error === 'RefreshTokenError') {
            if (isPublic) return NextResponse.next()
            const url = new URL('/login', nextUrl.origin)
            url.searchParams.set('error', 'SessionExpired')
            return NextResponse.redirect(url)
        }

        // Logged-in user hitting a public route — send to dashboard
        if (isLoggedIn && isPublic) {
            return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl.origin))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            // withAuth handles the unauthenticated → /login redirect via this callback
            authorized({ token, req }) {
                const isPublic = PUBLIC_ROUTES.includes(req.nextUrl.pathname)
                return isPublic || !!token
            },
        },
    }
)

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
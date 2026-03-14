import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']
const DEFAULT_REDIRECT = '/'

// NextAuth sets different cookie names depending on whether the connection is
// secure (HTTPS) or not (HTTP / local dev).
const SESSION_COOKIES = [
    'next-auth.session-token',           // HTTP / local
    '__Secure-next-auth.session-token',  // HTTPS / production
]

function signOutRedirect(destination: URL): NextResponse {
    const res = NextResponse.redirect(destination)

    SESSION_COOKIES.forEach(name =>
        res.cookies.set(name, '', {
            maxAge: 0,          // expire immediately
            path: '/',
        })
    )

    return res
}

export default withAuth(
    function proxy(req) {
        const token = req.nextauth.token
        const { nextUrl } = req
        const isPublic = PUBLIC_ROUTES.includes(nextUrl.pathname)
        const isLoggedIn = !!token

        // Broken session — clear cookies and force a clean login
        if (token?.error === 'RefreshTokenError') {
            if (isPublic) return NextResponse.next()
            const url = new URL('/login', nextUrl.origin)
            url.searchParams.set('error', 'SessionExpired')
            return signOutRedirect(url)
        }

        // Logged-in user hitting a public route — send to dashboard
        if (isLoggedIn && isPublic) {
            return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl.origin))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
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
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

// Server-side only — internal Docker URL (e.g. http://nginx/api/wms)
const API_URL = process.env.API_URL

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function apiFetch(path: string, init: RequestInit): Promise<any> {
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(init.headers ?? {}),
        },
    })

    const contentType = res.headers.get('content-type') ?? ''

    if (!contentType.includes('application/json')) {
        const text = await res.text()
        throw new Error(`Non-JSON response ${res.status}: ${text.slice(0, 200)}`)
    }

    const json = await res.json()

    if (!res.ok || !json.success) {
        throw new Error(json.message ?? `Request failed with status ${res.status}`)
    }

    return json.data
}

// ─────────────────────────────────────────────
// Auth options
// ─────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required.')
                }

                const data = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                })

                const { user, access_token, refresh_token, expires_in } = data

                return {
                    id: String(user.id),
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    roles: user.roles,
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    // Proactively refresh 1 min before actual expiry
                    expiresAt: Date.now() + (expires_in - 60) * 1000,
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // Initial sign in — persist user data into the JWT
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    roles: user.roles,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    expiresAt: user.expiresAt,
                }
            }

            // Token still valid — return as-is
            if (Date.now() < token.expiresAt) {
                return token
            }

            // Token window has passed — refresh (access token is still accepted
            // by Sanctum because we set expiresAt 1 min before real expiry)
            try {
                const data = await apiFetch('/auth/refresh', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token.accessToken}` },
                    body: JSON.stringify({ refresh_token: token.refreshToken }),
                })

                return {
                    ...token,
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
                    error: undefined,
                }
            } catch {
                return { ...token, error: 'RefreshTokenError' as const }
            }
        },

        async session({ session, token }) {
            session.user.id = token.id
            session.user.username = token.username
            session.user.firstname = token.firstname
            session.user.lastname = token.lastname
            session.user.roles = token.roles
            session.accessToken = token.accessToken
            session.error = token.error

            return session
        },
    },

    events: {
        // Best-effort — destroys server-side tokens on logout.
        // The session is cleared on our side regardless of whether this succeeds.
        async signOut({ token }: any) {
            if (!token?.accessToken) return

            await apiFetch('/auth/logout', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token.accessToken}` },
            }).catch(() => { })
        },
    },

    pages: {
        signIn: '/login',
    },

    session: {
        strategy: 'jwt',
    },
}
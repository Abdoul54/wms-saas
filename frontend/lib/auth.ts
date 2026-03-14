import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

const API_URL = process.env.API_URL

async function parseJson(res: Response) {
    const contentType = res.headers.get('content-type') ?? ''

    if (!contentType.includes('application/json')) {
        const text = await res.text()
        throw new Error(`Expected JSON but got: ${res.status} ${res.statusText} — ${text.slice(0, 200)}`)
    }

    return res.json()
}

async function refreshAccessToken(refreshToken: string, accessToken: string) {
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const json = await parseJson(res)

    if (!res.ok || !json.success) {
        throw new Error(JSON.stringify({ message: json.message ?? 'Login failed.' }))
    }

    return json.data
}

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

                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                })

                const json = await parseJson(res)

                if (!res.ok || !json.success) {
                    throw new Error(json.message ?? 'Login failed.')
                }

                const { user, access_token, refresh_token, expires_in } = json.data

                return {
                    id: String(user.id),
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    roles: user.roles,
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    expiresAt: Date.now() + expires_in * 1000,
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
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

            if (Date.now() < token.expiresAt) {
                return token
            }

            try {
                const refreshed = await refreshAccessToken(token.refreshToken, token.accessToken)

                return {
                    ...token,
                    accessToken: refreshed.access_token,
                    refreshToken: refreshed.refresh_token,
                    expiresAt: Date.now() + refreshed.expires_in * 1000,
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

    pages: {
        signIn: '/login',
    },

    session: {
        strategy: 'jwt',
    },
}
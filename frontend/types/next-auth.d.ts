import { DefaultSession } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            username: string
            firstname: string
            lastname: string
            roles: string[]
        } & DefaultSession['user']
        accessToken: string
        error?: 'RefreshTokenError'
    }

    interface User {
        id: string
        username: string
        firstname: string
        lastname: string
        roles: string[]
        accessToken: string
        refreshToken: string
        expiresAt: number
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string
        username: string
        firstname: string
        lastname: string
        roles: string[]
        accessToken: string
        refreshToken: string
        expiresAt: number
        error?: 'RefreshTokenError'
    }
}
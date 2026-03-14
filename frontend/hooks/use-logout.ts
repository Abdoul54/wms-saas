'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

export function useLogout() {
    const [loading, setLoading] = useState(false)

    async function logout() {
        setLoading(true)
        try {
            await signOut({ callbackUrl: '/login' })
        } catch {
            setLoading(false)
        }
    }

    return { logout, loading }
}
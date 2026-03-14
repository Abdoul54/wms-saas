// hooks/use-logout.ts
'use client'

import { useApi } from '@/hooks/use-api'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useLogout() {
    const { instance } = useApi(true)
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    console.log('log out..')
    async function logout() {
        setLoading(true)
        try {
            await instance.post('/api/wms/auth/logout')
        } catch {
        } finally {
            await signOut({ redirect: false })
            router.push('/login')
        }
    }
    return { logout, loading }
}
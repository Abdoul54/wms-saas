'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import type { Session } from 'next-auth'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DirectionProvider } from '@base-ui/react'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
    children: React.ReactNode
    session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    )

    return (
        <SessionProvider session={session}>
            <QueryClientProvider client={queryClient}>
                <DirectionProvider direction="ltr">
                    <TooltipProvider>
                        {children}
                        <Toaster />
                    </TooltipProvider>
                </DirectionProvider>
            </QueryClientProvider>
        </SessionProvider>
    )
}
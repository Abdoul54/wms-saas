'use client'

import { useSession } from 'next-auth/react'
import axios, { type AxiosRequestConfig } from 'axios'
import { useMemo } from 'react'

// Browser-side — goes through Nginx reverse proxy
const BASE_URL = process.env.NEXT_PUBLIC_API_URL // e.g. /api/wms

export function useApi() {
    const { data: session } = useSession()

    const instance = useMemo(() => {
        const api = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        })

        api.interceptors.request.use((config) => {
            if (session?.accessToken) {
                config.headers.Authorization = `Bearer ${session.accessToken}`
            }
            return config
        })

        return api
    }, [session?.accessToken])

    /**
     * queryFn factory for TanStack Query.
     * @example queryFn: queryFn('/users')
     */
    function queryFn<T>(url: string, config?: AxiosRequestConfig) {
        return async (): Promise<T> => {
            const { data } = await instance.get<{ data: T }>(url, config)
            return data.data
        }
    }

    /**
     * mutationFn factory for TanStack Query.
     * @example mutationFn: mutationFn('post', '/users')
     */
    function mutationFn<TData, TVariables>(
        method: 'post' | 'put' | 'patch' | 'delete',
        url: string,
        config?: AxiosRequestConfig
    ) {
        return async (variables: TVariables): Promise<TData> => {
            const { data } = await instance[method]<{ data: TData }>(url, variables, config)
            return data.data
        }
    }

    return { instance, queryFn, mutationFn }
}
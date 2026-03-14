'use client'

import { useSession } from 'next-auth/react'
import axios, { AxiosRequestConfig } from 'axios'
import { useMemo } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export function useApi(authenticated: boolean = true) {
    const { data: session } = useSession()

    const instance = useMemo(() => {
        const api = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        })

        if (authenticated && session?.accessToken) {
            api.interceptors.request.use((config) => {
                config.headers.Authorization = `Bearer ${session.accessToken}`
                return config
            })
        }

        return api
    }, [authenticated, session?.accessToken])

    /**
     * Creates a queryFn for TanStack Query.
     * Usage: queryFn: queryFn('/users')
     */
    function queryFn<T>(url: string, config?: AxiosRequestConfig) {
        return async (): Promise<T> => {
            const { data } = await instance.get<{ data: T }>(url, config)
            return data.data
        }
    }

    /**
     * Creates a mutationFn for TanStack Query.
     * Usage: mutationFn: mutationFn('post', '/users')
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
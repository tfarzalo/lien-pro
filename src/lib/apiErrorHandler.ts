import { logError, getUserFriendlyMessage } from './errorLogger'
import { toast } from 'sonner' // You can replace with your toast library

export class APIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public code?: string,
        public details?: any
    ) {
        super(message)
        this.name = 'APIError'
    }
}

/**
 * Handle API errors consistently across the application
 */
export async function handleAPIError(
    error: unknown,
    context?: string,
    options?: {
        silent?: boolean
        showToast?: boolean
        logError?: boolean
    }
): Promise<void> {
    const {
        silent = false,
        showToast = true,
        logError: shouldLog = true
    } = options || {}

    let errorObj: Error
    let message = 'An unexpected error occurred'
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'

    // Convert unknown error to Error object
    if (error instanceof APIError) {
        errorObj = error
        message = error.message
        severity = error.statusCode && error.statusCode >= 500 ? 'high' : 'medium'
    } else if (error instanceof Error) {
        errorObj = error
        message = getUserFriendlyMessage(error)
    } else {
        errorObj = new Error(String(error))
    }

    // Log the error
    if (shouldLog) {
        await logError(errorObj, {
            context,
            severity,
            apiError: true
        })
    }

    // Show user notification
    if (!silent && showToast) {
        toast.error(message, {
            description: context,
            duration: 5000
        })
    }
}

/**
 * Wrap API calls with automatic error handling
 */
export function wrapAPICall<T>(
    promise: Promise<T>,
    context?: string,
    options?: {
        silent?: boolean
        showToast?: boolean
    }
): Promise<T> {
    return promise.catch(error => {
        handleAPIError(error, context, options)
        throw error // Re-throw so caller can handle if needed
    })
}

/**
 * Parse Supabase error into APIError
 */
export function parseSupabaseError(error: any): APIError {
    if (!error) {
        return new APIError('An unknown error occurred')
    }

    // Supabase errors have specific structure
    const message = error.message || 'Database error'
    const code = error.code || 'UNKNOWN'
    const details = error.details || error.hint

    // Map common Supabase error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
        '23505': 'This record already exists',
        '23503': 'Cannot delete: record is referenced by other data',
        '42P01': 'Table not found',
        'PGRST116': 'Row not found',
        'PGRST301': 'Invalid JSON',
    }

    const userMessage = errorMessages[code] || message

    return new APIError(userMessage, 400, code, details)
}

/**
 * Retry failed API calls with exponential backoff
 */
export async function retryAPICall<T>(
    fn: () => Promise<T>,
    options?: {
        maxRetries?: number
        initialDelay?: number
        maxDelay?: number
        shouldRetry?: (error: any) => boolean
    }
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        shouldRetry = (error: any) => {
            // Retry on network errors and 5xx status codes
            return (
                error.message?.includes('network') ||
                error.message?.includes('fetch') ||
                (error.statusCode && error.statusCode >= 500)
            )
        }
    } = options || {}

    let lastError: any
    let delay = initialDelay

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error

            // Don't retry if this is the last attempt or error is not retryable
            if (attempt === maxRetries || !shouldRetry(error)) {
                throw error
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay))

            // Exponential backoff
            delay = Math.min(delay * 2, maxDelay)
        }
    }

    throw lastError
}

/**
 * Timeout wrapper for API calls
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 30000,
    timeoutMessage: string = 'Request timed out'
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new APIError(timeoutMessage, 408, 'TIMEOUT'))
        }, timeoutMs)
    })

    try {
        const result = await Promise.race([promise, timeoutPromise])
        if (timeoutId) clearTimeout(timeoutId)
        return result
    } catch (error) {
        if (timeoutId) clearTimeout(timeoutId)
        throw error
    }
}

/**
 * Batch multiple API calls and handle errors for each
 */
export async function batchAPIcalls<T>(
    calls: Array<() => Promise<T>>,
    options?: {
        concurrency?: number
        continueOnError?: boolean
    }
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
    const {
        concurrency = 5,
        continueOnError = true
    } = options || {}

    const results: Array<{ success: boolean; data?: T; error?: Error }> = []
    const executing: Promise<void>[] = []

    for (const call of calls) {
        const promise = (async () => {
            try {
                const data = await call()
                results.push({ success: true, data })
            } catch (error) {
                results.push({
                    success: false,
                    error: error instanceof Error ? error : new Error(String(error))
                })
                if (!continueOnError) {
                    throw error
                }
            }
        })()

        executing.push(promise)

        if (executing.length >= concurrency) {
            await Promise.race(executing)
            executing.splice(
                executing.findIndex(p => p === promise),
                1
            )
        }
    }

    await Promise.all(executing)
    return results
}

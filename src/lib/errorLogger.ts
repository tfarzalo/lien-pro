import { supabase } from './supabaseClient'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

interface ErrorContext {
  userId?: string
  page?: string
  action?: string
  component?: string
  severity?: ErrorSeverity
  [key: string]: any
}

interface ErrorLogEntry {
  message: string
  name: string
  stack?: string
  severity: ErrorSeverity
  user_id?: string
  page: string
  user_agent: string
  context: Record<string, any>
  timestamp: string
}

/**
 * Log an error to the database and external services
 */
export async function logError(
  error: Error,
  context: ErrorContext = {}
): Promise<void> {
  // Always log to console in development
  if (import.meta.env.DEV) {
    console.error('Error logged:', {
      error,
      context,
      stack: error.stack
    })
  }

  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Prepare sanitized error data
    const errorData: ErrorLogEntry = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: sanitizeStackTrace(error.stack),
      severity: context.severity || 'medium',
      user_id: user?.id || context.userId,
      page: context.page || window.location.pathname,
      user_agent: navigator.userAgent,
      context: sanitizeContext(context),
      timestamp: new Date().toISOString()
    }

    // Log to database (if table exists)
    // Silently fail if table doesn't exist yet
    await supabase
      .from('error_logs')
      .insert(errorData)
      .then(({ error: dbError }) => {
        if (dbError && import.meta.env.DEV) {
          console.warn('Could not save error to database:', dbError)
        }
      })

    // In production, send critical errors to external service
    if (import.meta.env.PROD) {
      if (context.severity === 'critical' || context.severity === 'high') {
        // TODO: Send to Sentry, LogRocket, or similar
        // Sentry.captureException(error, {
        //   extra: errorData
        // })
      }
    }
  } catch (loggingError) {
    // Never let error logging break the app
    console.error('Failed to log error:', loggingError)
  }
}

/**
 * Log a user action for analytics/debugging
 */
export async function logUserAction(
  action: string,
  details?: Record<string, any>
): Promise<void> {
  if (import.meta.env.DEV) {
    console.log('User action:', action, details)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('user_actions')
      .insert({
        user_id: user?.id,
        action,
        details: sanitizeContext(details || {}),
        timestamp: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error && import.meta.env.DEV) {
          console.warn('Could not log user action:', error)
        }
      })
  } catch (error) {
    // Silently fail - user actions are not critical
    console.warn('Failed to log user action:', error)
  }
}

/**
 * Remove absolute file paths and sensitive information from stack trace
 */
function sanitizeStackTrace(stack?: string): string {
  if (!stack) return ''
  
  return stack
    .split('\n')
    .map(line => {
      // Remove absolute file paths
      let sanitized = line.replace(/file:\/\/\/.*?\//, '')
      sanitized = sanitized.replace(/http:\/\/localhost:\d+\//, '')
      sanitized = sanitized.replace(/https:\/\/[^/]+\//, '')
      return sanitized
    })
    .join('\n')
}

/**
 * Remove sensitive data from context object
 */
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized = { ...context }
  
  // List of sensitive field names to remove
  const sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'ssn',
    'creditCard',
    'credit_card',
    'cvv',
    'pin',
    'bankAccount',
    'bank_account',
    'routingNumber',
    'routing_number'
  ]

  // Recursively remove sensitive fields
  function removeSensitiveData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => removeSensitiveData(item))
    }

    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Check if key is sensitive
      const isSensitive = sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )

      if (isSensitive) {
        result[key] = '[REDACTED]'
      } else {
        result[key] = removeSensitiveData(value)
      }
    }

    return result
  }

  return removeSensitiveData(sanitized)
}

/**
 * Create a formatted error message for display to users
 */
export function getUserFriendlyMessage(error: Error): string {
  // Map technical errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'Network request failed': 'Unable to connect. Please check your internet connection.',
    'Failed to fetch': 'Unable to connect to the server. Please try again.',
    'Unauthorized': 'Your session has expired. Please log in again.',
    'Not Found': 'The requested resource was not found.',
    'Internal Server Error': 'A server error occurred. Please try again later.',
  }

  // Check if error message matches any known patterns
  for (const [technical, friendly] of Object.entries(errorMap)) {
    if (error.message.includes(technical)) {
      return friendly
    }
  }

  // Return a generic message for unknown errors
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      new Error(event.reason),
      {
        severity: 'high',
        type: 'unhandled_rejection'
      }
    )
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    logError(
      event.error || new Error(event.message),
      {
        severity: 'high',
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    )
  })
}

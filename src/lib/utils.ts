import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Design system utility functions
export const spacing = {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
} as const

export const colors = {
    brand: {
        primary: 'text-brand-600',
        primaryHover: 'hover:text-brand-700',
        primaryBg: 'bg-brand-600',
        primaryBgHover: 'hover:bg-brand-700',
    },
    status: {
        success: 'text-success-600',
        warning: 'text-warning-600',
        danger: 'text-danger-600',
        successBg: 'bg-success-50',
        warningBg: 'bg-warning-50',
        dangerBg: 'bg-danger-50',
    },
    text: {
        primary: 'text-slate-900',
        secondary: 'text-slate-600',
        tertiary: 'text-slate-500',
        inverse: 'text-white',
    }
} as const

export const typography = {
    display: {
        '2xl': 'text-display-2xl',
        xl: 'text-display-xl',
        lg: 'text-display-lg',
        md: 'text-display-md',
        sm: 'text-display-sm',
    },
    body: {
        lg: 'text-lg leading-relaxed',
        md: 'text-base leading-relaxed',
        sm: 'text-sm leading-normal',
        xs: 'text-xs leading-normal',
    },
    legal: {
        body: 'text-legal-body',
        caption: 'text-legal-caption',
        label: 'text-legal-label',
    }
} as const

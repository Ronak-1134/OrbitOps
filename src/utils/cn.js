// src/utils/cn.js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes safely, resolving conflicts
 * Usage: cn('px-4 py-2', condition && 'bg-pulsar', className)
 */
export const cn = (...inputs) => twMerge(clsx(inputs))
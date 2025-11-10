'use client'

import React, { useState } from 'react'
import clsx from 'clsx'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  icon?: React.ReactNode
  suffix?: string
  inputSize?: 'small' | 'medium' | 'large'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, suffix, inputSize = 'medium', className, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const sizeStyles = {
      small: 'h-10 text-sm',
      medium: 'h-12 text-base',
      large: 'h-14 text-lg',
    }

    const inputType = type === 'password' && showPassword ? 'text' : type

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'w-full px-4 bg-bg-medium border rounded-lg text-white placeholder-text-disabled transition-all',
              'focus:outline-none focus:border-primary-gold focus:shadow-[0_0_8px_rgba(255,215,0,0.5)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-error focus:border-error focus:shadow-[0_0_8px_rgba(239,68,68,0.5)]',
              !error && 'border-border',
              icon && 'pl-12',
              suffix && 'pr-20',
              type === 'password' && 'pr-12',
              sizeStyles[inputSize],
              className
            )}
            {...props}
          />

          {suffix && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-medium">
              {suffix}
            </div>
          )}

          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-error flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

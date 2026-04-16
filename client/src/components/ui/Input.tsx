import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-10 px-4
            bg-surface text-text-primary
            border rounded-[var(--radius-md)]
            transition-all duration-[var(--duration-fast)]
            ease-[var(--ease-out)]
            placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error' : 'border-border'}
            ${className}
          `}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? 'var(--color-error)' : 'var(--color-border-visible)',
            color: 'var(--color-text-primary)',
          }}
          {...props}
        />
        {error && (
          <p
            className="mt-1.5 text-xs"
            style={{ color: 'var(--color-error)' }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

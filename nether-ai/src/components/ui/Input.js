'use client';

import React from 'react';

const Input = React.forwardRef(({ id, label, type = 'text', className, error, helperText, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        ref={ref}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={`
          block w-full appearance-none rounded-xl border bg-white/5 
          px-4 py-3 text-white placeholder-transparent transition-colors duration-300 
          peer focus:outline-none focus:ring-1 
          ${error ? 'border-red-400/70 focus:ring-red-400 focus:border-red-400/70' : 'border-white/20 focus:ring-peachSoft focus:border-peachSoft'}
          ${className || ''}
        `}
        {...props}
      />
      <label
        htmlFor={id}
        className="
          absolute top-3.5 left-4 text-gray-400 transition-all duration-300 
          pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
          peer-focus:-top-6 peer-focus:left-3 peer-focus:text-xs peer-focus:text-peachSoft 
          peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:left-3 
          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-peachSoft 
          px-1
        "
      >
        {label}
      </label>
      {(error || helperText) && (
        <p
          id={error ? `${id}-error` : `${id}-helper`}
          className={`mt-1 text-xs ${error ? 'text-red-300' : 'text-white/60'}`}
          role={error ? 'alert' : undefined}
          aria-live={error ? 'assertive' : 'polite'}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

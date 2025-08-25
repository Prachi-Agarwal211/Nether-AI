'use client';

import React from 'react';

const Input = React.forwardRef(({ id, label, type = 'text', className, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        ref={ref}
        placeholder=" "
        className={`
          block w-full appearance-none rounded-xl border border-white/20 bg-white/5 
          px-4 py-3 text-white placeholder-transparent transition-colors duration-300 
          peer focus:border-peachSoft focus:outline-none focus:ring-1 focus:ring-peachSoft 
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
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

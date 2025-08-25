'use client';

import React from 'react';

const Button = React.forwardRef(({ className, variant = 'primary', children, ...props }, ref) => {
  const baseClasses = "font-semibold transition-transform duration-200 ease-in-out active:scale-95";
  
  const variantClasses = {
    primary: 'primary-button',
    secondary: 'secondary-button'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

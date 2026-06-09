import React from 'react';
import { CircularProgress } from '@mui/material';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  onClick, 
  className = '',
  fullWidth = false,
  icon: Icon
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
    ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
    >
      {isLoading ? (
        <CircularProgress size={20} color="inherit" className="mr-2" />
      ) : Icon ? (
        <Icon className="mr-2 h-5 w-5" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;

import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  className = '',
  required = false,
  disabled = false,
  icon: Icon,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2
            dark:bg-gray-800 dark:border-gray-700 dark:text-white
            ${Icon ? 'pl-10' : ''}
            ${
              error && touched
                ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
                : 'border-gray-300 focus:border-primary focus:ring-primary/20 dark:border-gray-600'
            }
            ${disabled ? 'cursor-not-allowed opacity-60' : ''}
          `}
        />
      </div>
      {error && touched && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default Input;

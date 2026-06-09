import React from 'react';

const Card = ({ children, title, subtitle, icon: Icon, className = '', footer }) => {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {(title || subtitle || Icon) && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {Icon && <div className="p-2 bg-primary/10 rounded-lg text-primary"><Icon size={20} /></div>}
        </div>
      )}
      <div className="flex-1 p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

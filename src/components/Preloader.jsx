import React from 'react';

export default function Preloader({ size = 'md', color = 'indigo' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4'
  };

  const colors = {
    indigo: 'border-indigo-500',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full ${sizes[size]} ${colors[color]} border-t-transparent`}
      />
    </div>
  );
}
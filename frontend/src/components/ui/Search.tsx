import React, { InputHTMLAttributes } from 'react';
import { SearchIcon } from 'lucide-react';

interface SearchProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Search: React.FC<SearchProps> = ({ className = '', ...props }) => {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
    </div>
  );
};

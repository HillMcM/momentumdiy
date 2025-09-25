
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

export const Header: React.FC = () => {
  return (
    <header className="p-4 sm:p-6 border-b border-gray-700/50">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
        <LogoIcon className="h-8 w-8 text-indigo-400" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          AI Social Graphic Generator
        </h1>
      </div>
    </header>
  );
};

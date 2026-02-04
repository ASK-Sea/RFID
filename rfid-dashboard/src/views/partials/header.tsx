import React from 'react';
import clbLogo from '../../assets/CLB_letterhead.png';

const Header: React.FC = () => {
  return (
    <header className="w-screen relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
      {/* 1. Removed mx-auto to stop centering the container */}
      <div className="max-w-7xl px-4 sm:px-6">
        {/* 2. Changed items-left to items-center (vertical alignment) */}
        <div className="relative z-10 flex items-center justify-start py-6">
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Logo with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50"></div>
              <img
                src={clbLogo}
                alt="CLB Logo"
                className="relative h-24 w-24 sm:h-18 sm:w-18 object-contain bg-white/90 rounded-2xl shadow-lg border-2 border-white/30"
              />
            </div>
            {/* Brand Text */}
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg tracking-tight">
                CLB Holdings Berhad
              </span>
              <span className="hidden sm:flex text-xs sm:text-sm text-blue-100 font-medium mt-1 items-center gap-2">
                <span className="bi bi-thermometer-snow"></span>
                Tag Management System
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

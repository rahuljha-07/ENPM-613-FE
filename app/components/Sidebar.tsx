// components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-16 lg:w-48 h-full bg-gray-800 text-white p-4 flex flex-col items-center lg:items-start space-y-6" style={{ boxSizing: 'content-box' }}>
      {/* Logo */}
      <div className="text-2xl font-bold mb-8 lg:ml-2">iLIM</div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-6 w-full" style={{ boxSizing: 'content-box' }}>
        <Link href="/course-details">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full" style={{ boxSizing: 'content-box' }}>
            <span className="text-xl">🏠</span>
            <span className="hidden lg:inline lg:ml-2">Home</span>
          </button>
        </Link>
        <Link href="/purchased-courses">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full" style={{ boxSizing: 'content-box' }}>
            <span className="text-xl">📚</span>
            <span className="hidden lg:inline lg:ml-2">Dashboard</span>
          </button>
        </Link>
        <Link href="/profile">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full" style={{ boxSizing: 'content-box' }}>
            <span className="text-xl">👤</span>
            <span className="hidden lg:inline lg:ml-2">Profile</span>
          </button>
        </Link>
        <Link href="/admin">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full">
            <span className="text-xl">🛡️</span> {/* Admin Icon */}
            <span className="hidden lg:inline lg:ml-2">Admin</span>
          </button>
        </Link>
        <Link href="/support">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full" style={{ boxSizing: 'content-box' }}>
            <span className="text-xl">❓</span>
            <span className="hidden lg:inline lg:ml-2">Support</span>
          </button>
        </Link>
        <Link href="/about">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full" style={{ boxSizing: 'content-box' }}>
            <span className="text-xl">📝</span>
            <span className="hidden lg:inline lg:ml-2">About</span>
          </button>
        </Link>
        <Link href="/settings">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full" style={{ boxSizing: 'content-box' }}>
            <span className="text-xl">⚙️</span>
            <span className="hidden lg:inline lg:ml-2">Settings</span>
          </button>
        </Link>
        <Link href="/upload-course">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full" style={{ boxSizing: 'content-box' }}>
            <span className="text-xl">🗂️</span>
            <span className="hidden lg:inline lg:ml-2">Manage Courses</span>
          </button>
        </Link>
        <Link href="/">
          <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded w-full" style={{ boxSizing: 'content-box' }}>
            <span className="text-xl">🚪</span>
            <span className="hidden lg:inline lg:ml-2">Logout</span>
          </button>
        </Link>
      </nav>
    </div>
  );
}

// components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Book, User, HelpCircle, Settings, LogOut, FileText, Upload } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-20 lg:w-60 h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white flex flex-col items-center lg:items-start p-4">
      {/* Logo */}
      <div className="text-2xl font-extrabold mb-10 lg:ml-2 text-center lg:text-left text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        iLIM
      </div>

      {/* Navigation */}
      <nav className="space-y-3 lg:w-full w-20 flex flex-col items-center lg:items-start">
        <NavItem href="/course-details" label="Home" icon={<Home className="w-5 h-5 lg:w-6 lg:h-6" />} />
        <NavItem href="/purchased-courses" label="Dashboard" icon={<Book className="w-5 h-5 lg:w-6 lg:h-6" />} />
        <NavItem href="/profile" label="Profile" icon={<User className="w-5 h-5 lg:w-6 lg:h-6" />} />
        <NavItem href="/admin" label="Admin" icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6" />} />
        <NavItem href="/support" label="Support" icon={<HelpCircle className="w-5 h-5 lg:w-6 lg:h-6" />} />
        <NavItem href="/about" label="About" icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6" />} />
        <NavItem href="/settings" label="Settings" icon={<Settings className="w-5 h-5 lg:w-6 lg:h-6" />} />
        <NavItem href="/upload-course" label="Manage Courses" icon={<Upload className="w-5 h-5 lg:w-6 lg:h-6" />} />
        <NavItem href="/" label="Logout" icon={<LogOut className="w-5 h-5 lg:w-6 lg:h-6" />} />
      </nav>
    </div>
  );
}

// Individual Nav Item Component
const NavItem = ({ href, label, icon }) => (
  <Link href={href}>
    <Button
      variant="ghost"
      className="flex items-center space-x-2 text-white w-full justify-center lg:justify-start lg:px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500"
    >
      {icon}
      <span className="hidden lg:inline lg:ml-3 text-sm font-semibold">{label}</span>
    </Button>
  </Link>
);

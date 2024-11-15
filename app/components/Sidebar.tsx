"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Book, User, HelpCircle, LogOut, FileText, Upload, ChevronDown, UserPlus } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isManageCoursesOpen, setIsManageCoursesOpen] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  // Function to handle logout logic
  const handleLogout = (e) => {
    e.preventDefault(); // Prevent the default link behavior
    localStorage.clear(); // Clear local storage
    router.push('/'); // Redirect to the homepage
  };

  // Toggle Admin dropdown visibility
  const toggleAdminDropdown = () => setIsAdminOpen((prev) => !prev);
  const toggleManageCourses = () => setIsManageCoursesOpen((prev) => !prev);

  return (
    <div className="w-20 lg:w-60 h-screen fixed top-0 left-0 bg-gradient-to-br from-gray-800 to-gray-900 text-white flex flex-col items-center lg:items-start p-4 overflow-y-auto">
      {/* Logo */}
      <div className="text-2xl font-extrabold mb-10 lg:ml-2 text-center lg:text-left text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        iLIM
      </div>

      {/* Navigation */}
      <nav className="space-y-3 lg:w-full w-20 flex flex-col items-center lg:items-start">
        {/* All courses */}
        <NavItem href="/course-details" label="All courses" icon={<Home className="w-5 h-5 lg:w-6 lg:h-6" />} />

        {/* Purchased Course (for INSTRUCTOR and STUDENT) */}
        {(role === 'INSTRUCTOR' || role === 'STUDENT') && (
          <NavItem href="/purchased-courses" label="Purchased Course" icon={<Book className="w-5 h-5 lg:w-6 lg:h-6" />} />
        )}

        {/* Profile */}
        <NavItem href="/profile" label="Profile" icon={<User className="w-5 h-5 lg:w-6 lg:h-6" />} />

        {/* Admin (for ADMIN only) */}
        {role === 'ADMIN' && (
          <>
            <Button
              variant="ghost"
              onClick={toggleAdminDropdown}
              className="flex items-center space-x-2 text-white w-full justify-center lg:justify-start lg:px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500"
            >
              <FileText className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="hidden lg:inline lg:ml-3 text-sm font-semibold">Admin</span>
              <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 transform ${isAdminOpen ? 'rotate-180' : 'rotate-0'}`} />
            </Button>
            {isAdminOpen && (
              <div className="mt-2 space-y-2 lg:pl-6">
                <DropdownItem href="/admin/instructor-management" label="Instructor Management" />
                <DropdownItem href="/admin/user-management" label="User Management" />
                <DropdownItem href="/admin/course-management" label="Course Management" />
              </div>
            )}
          </>
        )}

        {/* Support */}
        <NavItem href="/support" label="Support" icon={<HelpCircle className="w-5 h-5 lg:w-6 lg:h-6" />} />

        {/* Manage Courses (for INSTRUCTOR only) */}
        {role === 'INSTRUCTOR' && (
          <>
            <Button
              variant="ghost"
              onClick={toggleManageCourses}
              className="flex items-center space-x-2 text-white w-full justify-center lg:justify-start lg:px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500"
            >
              <Upload className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="hidden lg:inline lg:ml-3 text-sm font-semibold">Manage Courses</span>
              <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 transform ${isManageCoursesOpen ? 'rotate-180' : 'rotate-0'}`} />
            </Button>
            {isManageCoursesOpen && (
              <div className="mt-2 space-y-2 lg:pl-6">
                <DropdownItem href="/manage-courses/course-management" label="Course Management" />
                <DropdownItem href="/manage-courses/upload-course" label="Upload Course" />
              </div>
            )}
          </>
        )}

        {/* About */}
        <NavItem href="/about" label="About" icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6" />} />

        {/* Become Instructor (for STUDENT only) */}
        {role === 'STUDENT' && (
          <NavItem href="/instructor-application" label="Become Instructor" icon={<UserPlus className="w-5 h-5 lg:w-6 lg:h-6" />} />
        )}

        {/* Logout */}
        <NavItem href="/" label="Logout" icon={<LogOut className="w-5 h-5 lg:w-6 lg:h-6" />} onClick={handleLogout} />
      </nav>
    </div>
  );
}

// Individual Nav Item Component
const NavItem = ({ href, label, icon, onClick }) => (
  <Link href={href} onClick={onClick && label === "Logout" ? onClick : undefined}>
    <Button
      variant="ghost"
      className="flex items-center space-x-2 text-white w-full justify-center lg:justify-start lg:px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500"
    >
      {icon}
      <span className="hidden lg:inline lg:ml-3 text-sm font-semibold">{label}</span>
    </Button>
  </Link>
);

// Dropdown item component
const DropdownItem = ({ href, label }) => (
  <Link
    href={href}
    className="block text-sm font-semibold text-gray-300 hover:text-white pl-4 py-1 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-md"
  >
    {label}
  </Link>
);

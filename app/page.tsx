// app/landing/page.tsx
"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="text-center p-8 bg-white bg-opacity-10 rounded-lg shadow-lg max-w-md w-full">
        {/* App Title */}
        <h1 className="text-4xl font-bold mb-4">Welcome to iLIM</h1>

        {/* Brief Description */}
        <p className="mb-8 text-lg">
          Discover a world of knowledge with interactive courses. Join us and start learning something new today!
        </p>

        {/* Sign In and Sign Up Buttons with Separator */}
        <div className="flex items-center justify-center space-x-4">
          <Link href="/auth/signin">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </Link>

          {/* Separator */}
          <div className="h-8 border-r-2 border-gray-300"></div>

          <Link href="/auth/signup">
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Footer / Additional Links */}
        <div className="mt-8 text-sm text-gray-200">
          <p>By signing up, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.</p>
        </div>
      </div>
    </div>
  );
}

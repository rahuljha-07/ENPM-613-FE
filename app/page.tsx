// app/landing/page.tsx
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="max-w-3xl w-full text-center p-8 rounded-lg bg-white bg-opacity-10 backdrop-blur-lg shadow-2xl">
        
        {/* App Title */}
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-400">
          Welcome to iLIM
        </h1>

        {/* Subtitle / Tagline */}
        <p className="mb-8 text-lg text-gray-200">
          Discover a world of knowledge with interactive and engaging courses. 
          Join us to start your learning journey today!
        </p>

        {/* Buttons for Sign In and Sign Up with Separator */}
        <div className="flex items-center justify-center space-x-8 mt-6">
          <Link href="/auth/signin">
            <Button className="w-40 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 transform hover:scale-105 shadow-md">
              Sign In
            </Button>
          </Link>

          {/* Separator */}
          <div className="h-10 border-r-2 border-gray-300"></div>

          <Link href="/auth/signup">
            <Button className="w-40 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 transform hover:scale-105 shadow-md">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Footer / Additional Links */}
        <div className="mt-12 text-sm text-gray-300">
          <p>
            By signing up, you agree to our{" "}
            <Link href="/TOS" className="text-blue-200 underline hover:text-blue-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacypolicy" className="text-blue-200 underline hover:text-blue-300">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

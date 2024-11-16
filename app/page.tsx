"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [showTOS, setShowTOS] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  // Animation variants for the modals
  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="max-w-3xl w-full text-center p-10 rounded-lg bg-white bg-opacity-10 backdrop-blur-lg shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* App Title */}
        <motion.h1
          className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-400"
          animate={{ y: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          iLIM
        </motion.h1>

        {/* Subtitle / Tagline */}
        <motion.p
          className="mb-10 text-lg text-gray-200 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Discover a world of knowledge with interactive and engaging courses. 
          Join us to start your learning journey today!
        </motion.p>

        {/* Buttons for Sign In and Sign Up with Separator */}
        <motion.div
          className="flex items-center justify-center space-x-10 mt-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 1, duration: 1 } },
          }}
        >
          <Link href="/auth/signin">
            <Button className="w-40 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 transform hover:scale-105 shadow-lg">
              Sign In
            </Button>
          </Link>

          {/* Separator */}
          <div className="h-10 border-r-2 border-gray-400"></div>

          <Link href="/auth/signup">
            <Button className="w-40 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 transform hover:scale-105 shadow-lg">
              Sign Up
            </Button>
          </Link>
        </motion.div>

        {/* Footer / Additional Links */}
        <motion.div
          className="mt-12 text-sm text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <p>
            By signing up, you agree to our{" "}
            <button onClick={() => setShowTOS(true)} className="text-blue-200 underline hover:text-blue-300">
              Terms of Service
            </button>{" "}
            and{" "}
            <button onClick={() => setShowPrivacyPolicy(true)} className="text-blue-200 underline hover:text-blue-300">
              Privacy Policy
            </button>.
          </p>
        </motion.div>
      </motion.div>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTOS && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-8 w-11/12 max-w-lg relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setShowTOS(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Terms of Service</h2>
              <p className="text-gray-700 mb-6">
                Welcome to iLIM! By using our services, you agree to comply with our Terms of Service. Please review the terms carefully to understand your responsibilities and our commitment to providing a safe and educational environment.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Respect the community and other users.</li>
                <li>Avoid sharing misleading or inaccurate information.</li>
                <li>Follow all applicable laws and regulations.</li>
                <li>Do not misuse or abuse the resources available on iLIM.</li>
              </ul>
              <p className="text-gray-700 mt-6">
                For more details, contact our support team or continue to explore iLIM’s guidelines.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyPolicy && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-8 w-11/12 max-w-lg relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Privacy Policy</h2>
              <p className="text-gray-700 mb-6">
                At iLIM, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines the types of data we collect, how we use it, and your rights regarding your information.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>We collect information to improve our services and user experience.</li>
                <li>Your data is kept secure and used only for educational and community purposes.</li>
                <li>You have the right to access, modify, or delete your personal data.</li>
                <li>For questions, contact our privacy team for further assistance.</li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

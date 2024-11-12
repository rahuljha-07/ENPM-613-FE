// app/settings/page.tsx

"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveChanges = () => {
    alert("Settings saved!");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 space-y-8">
        <h1 className="text-2xl font-bold text-center">Settings</h1>

        {/* Personal Information Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="mr-2"
              />
              <label htmlFor="darkMode" className="text-gray-700">
                Enable Dark Mode
              </label>
            </div>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                className="mr-2"
              />
              <label htmlFor="notifications" className="text-gray-700">
                Enable Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
          <p className="text-gray-600 text-sm mb-4">
            Manage your privacy preferences for data sharing and personal
            information.
          </p>
          <button className="bg-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-300">
            Manage Privacy Settings
          </button>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSaveChanges}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

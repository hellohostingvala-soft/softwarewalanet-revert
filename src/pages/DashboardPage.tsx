/**
 * Dashboard Page - univercel-tech-forge
 * Simple dashboard for universal routing
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <ul className="space-y-2">
              <li className="text-blue-600 hover:text-blue-800 cursor-pointer">View Profile</li>
              <li className="text-blue-600 hover:text-blue-800 cursor-pointer">Settings</li>
              <li className="text-blue-600 hover:text-blue-800 cursor-pointer">Help</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Statistics</h3>
            <div className="space-y-2">
              <p><strong>Projects:</strong> 12</p>
              <p><strong>Tasks:</strong> 48</p>
              <p><strong>Messages:</strong> 5</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Updated profile</p>
              <p>Completed task</p>
              <p>Joined team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

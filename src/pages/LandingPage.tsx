/**
 * Landing Page - univercel-tech-forge
 * Simple landing page for universal routing
 */

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to univercel-tech-forge
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Universal Technology Forge Platform
          </p>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/dashboard" 
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

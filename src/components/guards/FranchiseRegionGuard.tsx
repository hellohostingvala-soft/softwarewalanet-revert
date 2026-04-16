// Franchise Region Guard
// Protects routes with region-based RBAC

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkRegionAccess } from '@/services/franchiseRegionRBACService';

interface FranchiseRegionGuardProps {
  children: React.ReactNode;
}

const FranchiseRegionGuard = ({ children }: FranchiseRegionGuardProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const verifyAccess = () => {
      // Get current user's region from context or localStorage
      const userRegion = JSON.parse(localStorage.getItem('userRegion') || '{}');
      
      const access = checkRegionAccess('current-user-id', userRegion);
      setHasAccess(access.hasAccess);
      setReason(access.reason || '');
    };

    verifyAccess();
  }, []);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying region access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">{reason}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-cyan-600 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FranchiseRegionGuard;

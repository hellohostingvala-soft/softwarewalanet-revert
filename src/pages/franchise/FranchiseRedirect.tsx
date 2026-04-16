// Franchise Redirect Component
// Redirects legacy franchise routes to unified dashboard

import { Navigate } from 'react-router-dom';

interface FranchiseRedirectProps {
  section?: string;
}

const FranchiseRedirect = ({ section }: FranchiseRedirectProps) => {
  const hash = section ? `#${section}` : '';
  return <Navigate to={`/franchise-dashboard${hash}`} replace />;
};

export default FranchiseRedirect;

// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ allowedRoles, children }) => {
//   const role = localStorage.getItem('role');
//   if (!role || !allowedRoles.includes(role)) {
//     console.log('ProtectedRoute: Redirecting to login (missing or invalid role)');
//     return <Navigate to='/login' />;
//   }
//   return children;
// };

// export default ProtectedRoute;
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3 text-blue-600">
          <svg
            className="animate-spin h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    console.log(`ProtectedRoute: Redirecting to login (role: ${role})`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
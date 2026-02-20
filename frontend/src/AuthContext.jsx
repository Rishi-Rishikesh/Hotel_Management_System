// // // AuthContext.jsx
// // import { createContext, useState, useEffect } from "react";
// // import { auth } from "./firebaseConfig";

// // export const AuthContext = createContext();

// // export function AuthProvider({ children }) {
// //   const [token, setToken] = useState(localStorage.getItem("token"));
// //   const [role, setRole] = useState(localStorage.getItem("role"));

// //   useEffect(() => {
// //     const unsubscribe = auth.onAuthStateChanged(async (user) => {
// //       if (user) {
// //         const idToken = await user.getIdToken();
// //         setToken(idToken);
// //         localStorage.setItem("token", idToken);
// //         // Fetch role from backend or token claims
// //         setRole("Admin"); // Replace with actual role fetching
// //         localStorage.setItem("role", "Admin");
// //       } else {
// //         setToken(null);
// //         setRole(null);
// //         localStorage.removeItem("token");
// //         localStorage.removeItem("role");
// //       }
// //     });
// //     return () => unsubscribe();
// //   }, []);

// //   return (
// //     <AuthContext.Provider value={{ token, role, setToken, setRole }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }



// // AuthContext.jsx
// import { createContext, useContext, useState, useEffect } from 'react';
// import { auth } from './firebaseConfig';
// import axios from 'axios';

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(localStorage.getItem('token') || null);
//   const [role, setRole] = useState(localStorage.getItem('role') || null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       if (user) {
//         try {
//           // Get the ID token
//           const idToken = await user.getIdToken(true); // Force refresh
//           // Call backend to get user role
//           const response = await axios.post('http://localhost:4000/api/guests/login', {
//             idToken,
//           });
//           const userRole = response.data.role; // Backend returns 'Staff', 'Admin', or 'User'

//           setToken(idToken);
//           setRole(userRole);
//           localStorage.setItem('token', idToken);
//           localStorage.setItem('role', userRole);
//         } catch (error) {
//           console.error('Error fetching token or role:', error);
//           setToken(null);
//           setRole(null);
//           localStorage.removeItem('token');
//           localStorage.removeItem('role');
//         }
//       } else {
//         setToken(null);
//         setRole(null);
//         localStorage.removeItem('token');
//         localStorage.removeItem('role');
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ token, role, setToken, setRole, loading }}>
//       {loading ? (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//           <div className="flex items-center gap-3 text-blue-600">
//             <svg
//               className="animate-spin h-6 w-6"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               />
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               />
//             </svg>
//             <span>Loading...</span>
//           </div>
//         </div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };



import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Try to get token with retry logic for network issues
          let idTokenResult;
          let retries = 3;

          while (retries > 0) {
            try {
              idTokenResult = await user.getIdTokenResult(true);
              break; // Success, exit retry loop
            } catch (tokenError) {
              retries--;
              if (retries === 0) throw tokenError;
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
            }
          }

          const idToken = idTokenResult.token;
          let userRole = idTokenResult.claims.role;

          if (!userRole) {
            try {
              const response = await axios.post('http://localhost:4000/api/guests/login', {
                idToken,
              }, {
                timeout: 5000 // 5 second timeout
              });
              userRole = response.data.role;
            } catch (apiError) {
              console.warn('Could not fetch role from backend, using default:', apiError.message);
              // Fallback to a default role or use what's in localStorage
              userRole = localStorage.getItem('role') || 'User';
            }
          }

          setToken(idToken);
          setRole(userRole);
          localStorage.setItem('token', idToken);
          localStorage.setItem('role', userRole);
        } catch (error) {
          console.error('Error fetching token or role:', error);

          // If it's a network error, try to use cached credentials
          if (error.code === 'auth/network-request-failed') {
            const cachedToken = localStorage.getItem('token');
            const cachedRole = localStorage.getItem('role');

            if (cachedToken && cachedRole) {
              console.warn('Using cached credentials due to network error');
              setToken(cachedToken);
              setRole(cachedRole);
              setLoading(false);
              return;
            }
          }

          setToken(null);
          setRole(null);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      } else {
        setToken(null);
        setRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, setToken, setRole, loading }}>
      {loading ? (
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
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
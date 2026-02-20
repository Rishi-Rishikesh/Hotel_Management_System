import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Login from '../pages/Login';

const DashboardGate = () => {
    const { token, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Experience</p>
                </div>
            </div>
        );
    }

    if (!token) {
        // Show login page if not authenticated
        return <Login />;
    }

    // Redirect based on role if already authenticated
    if (role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'Staff') return <Navigate to="/staff-dashboard" replace />;

    return <Navigate to="/guestdashboard" replace />;
};

export default DashboardGate;

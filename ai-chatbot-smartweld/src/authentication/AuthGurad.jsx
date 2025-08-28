import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

const AuthGuard = ({ children, requiredRoles = [], requiredPath }) => {
  const { auth, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  // Check if user is logged in
  if (!isAuthenticated()) {
    // Redirect to login page and save attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For path-based permission check
  if (requiredPath && !auth.permissions?.links.includes(requiredPath)) {
    return <Navigate to="/unauthorizedAccess" replace />;
  }

  // For role-based access control
  if (requiredRoles.length > 0 && !requiredRoles.includes(auth.role)) {
    return <Navigate to="/unauthorizedAccess" replace />;
  }

  // If all checks pass, render the protected content
  return children;
};

export default AuthGuard;

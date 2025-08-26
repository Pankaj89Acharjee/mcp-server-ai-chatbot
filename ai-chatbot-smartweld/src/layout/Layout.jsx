import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Import pages
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import SignupPage from "../pages/SignupPage";
import SessionWarn from "../pages/SessionWarn";
import UnAuthorizedPage from "../pages/UnAuthorizedPage";
import NotFound from "../pages/NotFound";
import { useAuth } from "../contexts/AuthProvider";
import AuthGuard from "../authentication/AuthGurad";
import { Spin } from "antd";

// Lazy load the dashboard layout for better performance
const DashboardLayout = React.lazy(() =>
  import("../components/Dashboard/DashboardLayout")
);

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <Spin tip="Loading application..." />
    <p className="ml-2 text-lg">Loading application...</p>
  </div>
);

const Layout = () => {
  const { loading } = useAuth();

  // Show loading screen while authentication state is being determined
  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/sessionwarning" element={<SessionWarn />} />
        <Route path="/unauthorizedAccess" element={<UnAuthorizedPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/*"
          element={
            <AuthGuard
              requiredRoles={[
                "ADMIN",
                "SUPERADMIN",
                "ADMINISTRATOR",
                "SUPERVISOR",
                "OPERATOR",
                "ORGADMIN",
              ]}
            >
              <Suspense fallback={<LoadingFallback />}>
                <DashboardLayout />
              </Suspense>
            </AuthGuard>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;

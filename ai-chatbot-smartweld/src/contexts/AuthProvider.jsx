import { createContext, useState, useEffect, useContext, useCallback } from "react";
import Cookies from "js-cookie";
import rolesPermissions from "../data/roles&Permissions";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check for existing auth on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = Cookies.get("_smartweld_Cookie");
        const userData = sessionStorage.getItem("_smartWeldUser");
        const expireTime = sessionStorage.getItem("sessionExpire");

        if (token && userData && expireTime) {
          // Check if session is expired
          const expirationTime = new Date(parseInt(expireTime));
          const now = new Date();

          if (now >= expirationTime) {
            console.log("Session expired, logging out");
            logout();
          } else {
            try {
              const cookieData = JSON.parse(userData);
              const roleName = cookieData.roleName?.toUpperCase() || "USER";

              setAuth({
                accessToken: token,
                ...cookieData,
                role: roleName,
                permissions: rolesPermissions[roleName] || {
                  titles: [],
                  links: [],
                },
              });
            } catch (error) {
              console.error("Error parsing stored user data:", error);
              logout();
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkExistingAuth();

    // Listen for auth errors from axios interceptor
    const handleAuthError = (event) => {
      console.log("Auth error event received:", event.detail);
      logout();
    };

    window.addEventListener("authError", handleAuthError);

    return () => {
      window.removeEventListener("authError", handleAuthError);
    };
  }, []);

  const userLogin = useCallback((accessToken, cookieData, expirationTime) => {
    try {
      // Validate inputs
      if (!accessToken || !cookieData || !expirationTime) {
        throw new Error("Invalid login data");
      }

      // Store auth data
      Cookies.set("_smartweld_Cookie", accessToken, {
        expires: expirationTime,
      });

      sessionStorage.setItem("_smartWeldUser", JSON.stringify(cookieData));
      sessionStorage.setItem("sessionExpire", expirationTime.toString());

      const roleName = cookieData.roleName?.toUpperCase() || "USER";

      setAuth({
        accessToken,
        ...cookieData,
        role: roleName,
        permissions: rolesPermissions[roleName] || { titles: [], links: [] },
      });

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("_smartweld_Cookie");
    sessionStorage.removeItem("_smartWeldUser");
    sessionStorage.removeItem("sessionExpire");
    queryClient.clear();
    setAuth({});
  }, []);

  const hasPermission = useCallback(
    (requiredPath) => {
      if (!auth.permissions) return false;
      return auth.permissions.links.includes(requiredPath);
    },
    [auth.permissions]
  );

  const isAuthenticated = useCallback(() => {
    return !!auth?.accessToken;
  }, [auth?.accessToken]);

  // Calculate remaining session time in seconds
  const getSessionTimeRemaining = useCallback(() => {
    const expireTime = sessionStorage.getItem("sessionExpire");
    if (!expireTime) return 0;

    const expirationTime = new Date(parseInt(expireTime));
    const now = new Date();

    return Math.max(0, Math.floor((expirationTime - now) / 1000));
  }, []);

  const value = {
    auth,
    setAuth,
    loading,
    userLogin,
    logout,
    hasPermission,
    isAuthenticated,
    getSessionTimeRemaining,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
